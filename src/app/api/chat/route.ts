import GigaChat from 'gigachat';
import { Agent } from 'node:https';
import { db } from '@/db';
import { users, alerts, assessments } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { sendAlertEmail } from '@/lib/send-alert-email';

const httpsAgent = new Agent({ rejectUnauthorized: false });
const giga = new GigaChat({
  credentials: process.env.GIGACHAT_AUTHORIZATION_KEY,
  model: 'GigaChat',
  httpsAgent: httpsAgent,
  timeout: 600,
});

async function checkForRisk(text: string, locale: string): Promise<boolean> {
  const systemPrompt = locale === 'ru' 
    ? `Ты — строгий медицинский классификатор. Отвечай только 'ДА' или 'НЕТ'. Содержит ли следующий текст прямые или косвенные признаки суицидальных мыслей, самоповреждения или желания умереть?`
    : `You are a strict medical classifier. Answer only 'YES' or 'NO'. Does the following text contain direct or indirect signs of suicidal thoughts, self-harm, or a desire to die?`;

  try {
    const response = await giga.chat({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text }
      ],
      stream: false, 
    });
    const answer = response.choices[0]?.message?.content?.toUpperCase() || "";
    return /\b(YES|ДА)\b/.test(answer);
  } catch (error) {
    return false; 
  }
}

export async function POST(req: Request) {
  try {
    const { messages, locale } = await req.json();

    const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop();
    const userText = lastUserMessage?.parts?.[0]?.text || "";
    const demoPatientId = '69216731-ec0a-4f4e-9cca-e017433b6917';

    let isRiskDetected = false;
    if (userText.length > 5) {
      isRiskDetected = await checkForRisk(userText, locale);
    }

    const RISK_KEYWORDS = [
      "kill myself", "killing myself", "end my life", "want to die", "not want to be here",
      "suicidal", "suicide", "self-harm", "hurt myself", "no reason to live", "better off dead",
      "убить себя", "покончить с собой", "не хочу жить", "суицид", "самоубийство"
    ];
    const userTextLower = userText.toLowerCase();
    const hasKeyword = RISK_KEYWORDS.some(k => userTextLower.includes(k));

    if (isRiskDetected || hasKeyword) {
      await db.insert(alerts).values({
        patientId: demoPatientId,
        trigger: isRiskDetected ? 'AI classified intent as high risk' : 'Keyword match',
        severity: 'MANDATORY',
      }).catch(console.error);

      await sendAlertEmail('Patient MD-12345', 'User expressed suicidal ideation or self-harm intent.');

      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          const safetyResponse = locale === 'ru' 
            ? "Я слышу, что вам очень тяжело. Пожалуйста, немедленно свяжитесь с вашим врачом или позвоните в экстренные службы. Ваша жизнь важна."
            : "I hear that you are in a lot of pain. Please reach out to your doctor or emergency services immediately. Your life matters.";
          
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'text', text: safetyResponse })}\n\n`));
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'safety_override' })}\n\n`));
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        },
      });

      return new Response(stream, {
        headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
      });
    }

    const gigaMessages = messages.map((m: any) => ({
      role: m.role,
      content: m.parts?.find((p: any) => p.type === 'text')?.text || '',
    }));

    const languageInstruction = locale === 'ru' 
      ? 'You MUST respond ONLY in Russian.' 
      : 'You MUST respond ONLY in English.';

    const systemMessage = {
      role: 'system',
      content: `You are MedixMind, a warm, empathetic clinical intake assistant. ${languageInstruction}
      
Your goal is to conduct a brief mental health assessment covering 5 key areas: Sleep, Energy, Mood, Anxiety, and Interest in Activities.

RULES:
1. Ask ONLY ONE question at a time.
2. Allow the user to express themselves freely. If they go off-topic, acknowledge their feelings empathetically, but gently guide them back.
3. Once you have gathered information on all 5 areas, transition to the CLOSING stage.
4. In the CLOSING stage, say: "Thank you for sharing all of this with me. I have recorded your responses. Is there anything else you would like your doctor to know before we finish?"
5. ONLY AFTER the user responds to this closing question, say goodbye and append the exact tag [ASSESSMENT_COMPLETE] at the very end.
6. Do NOT output hidden tags like [INTEREST IN ACTIVITIES]. Keep responses under 3 sentences.

CRITICAL BIPOLAR CHECK:
If the patient mentions symptoms of mania (e.g., "I haven't slept in 3 days but I feel amazing", "I have so much energy", "I spent all my money impulsively"), you MUST append the exact tag [BIPOLAR_FLAG] at the very end of your message.`
    };

    const responseStream = await giga.stream({
      messages: [systemMessage, ...gigaMessages],
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullText = "";
          for await (const chunk of responseStream) {
            const text = chunk.choices[0]?.delta?.content || '';
            if (text) {
              fullText += text;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'text', text })}\n\n`));
            }
          }
          
          // NEW: Check for Bipolar Flag and update the database
          if (fullText.includes("[BIPOLAR_FLAG]")) {
            console.log("Bipolar flag detected. Updating patient record.");
            await db.update(users).set({ bipolarFlag: true }).where(eq(users.id, demoPatientId));
          }
          
          const transcript = messages.map((m: any) => `${m.role}: ${m.parts?.[0]?.text}`).join("\n") + `\nassistant: ${fullText}`;
          await db.insert(assessments).values({
            patientId: demoPatientId,
            type: 'chat',
            rawData: transcript,
            phq9Score: 10,
          }).catch(console.error);

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
    });
  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: 'Failed' }), { status: 500 });
  }
}