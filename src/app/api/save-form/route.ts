import { db } from "@/db";
import { assessments } from "@/db/schema";

export async function POST(req: Request) {
  try {
    const { patientId, score, answers } = await req.json();

    if (!patientId || score === undefined) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Save the PHQ-9 score to the assessments table
    await db.insert(assessments).values({
      patientId: patientId,
      type: "form_phq9",
      phq9Score: score,
      rawData: JSON.stringify(answers), // Store the specific answers as JSON
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Failed to save PHQ-9 form:", error);
    return Response.json({ error: "Failed to save" }, { status: 500 });
  }
}