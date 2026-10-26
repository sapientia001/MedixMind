import { db } from "@/db";
import { assessments } from "@/db/schema";

export async function POST(req: Request) {
  try {
    const { messages, patientId } = await req.json();

    if (!messages || !patientId) {
      return Response.json({ error: "Missing data" }, { status: 400 });
    }

    // Convert the message array into a readable string format
    const transcript = messages.map((m: any) => `${m.role}: ${m.content}`).join("\n");

    // Save to database
    await db.insert(assessments).values({
      patientId,
      type: 'chat',
      rawData: transcript,
      phq9Score: 10, 
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Save Chat Error:", error);
    return Response.json({ error: "Failed to save" }, { status: 500 });
  }
}