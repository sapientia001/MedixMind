import { db } from "@/db";
import { assessments } from "@/db/schema";

export async function POST(req: Request) {
  try {
    const { patientId, notes } = await req.json();

    if (!patientId || !notes) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Save the doctor's clinical interpretation to the assessments table
    await db.insert(assessments).values({
      patientId: patientId,
      type: "doctor_note",
      rawData: notes,
      phq9Score: null, // Not applicable for this record
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Failed to save clinical interpretation:", error);
    return Response.json({ error: "Failed to save" }, { status: 500 });
  }
}