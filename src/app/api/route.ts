import { createOpenAI } from '@ai-sdk/openai';
import {
  streamText,
  createUIMessageStream,
  createUIMessageStreamResponse,
  toUIMessageStream,
  convertToModelMessages,
} from 'ai';

const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openrouter('openrouter/free'),
    system: `You are a warm, calm wellbeing companion called MedixDeck. You help patients reflect on how they are feeling before a clinician appointment.

Ask one gentle question at a time. Do not label your questions as PHQ-9 or GAD-7 or any clinical instrument. Explore sleep, energy, mood, anxiety, interest in activities, concentration, appetite, and functioning naturally through conversation.

If the user expresses any thought of self-harm, suicide, or not wanting to be here, respond with the exact tag [SAFETY_OVERRIDE] at the start of your message, followed by a calm, direct, caring message encouraging them to speak with their clinician or contact emergency services.

Keep responses short (1-3 sentences). Never diagnose. Never prescribe.`,
    messages: await convertToModelMessages(messages),
  });

  const stream = createUIMessageStream({
    execute: ({ writer }) => {
      writer.merge(toUIMessageStream({ stream: result.stream }));
    },
  });

  return createUIMessageStreamResponse({ stream });
}