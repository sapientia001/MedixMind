import { db } from "@/db";
import { assessments } from "@/db/schema";

export async function POST(req: Request) {
  try {
    const { photoData, patientId } = await req.json();

    if (!photoData) {
      return Response.json({ error: "No photo provided" }, { status: 400 });
    }

    await db.insert(assessments).values({
      patientId,
      type: 'photo',
      rawData: 'Patient submitted a photo.',
      photoData,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Failed to save photo:", error);
    return Response.json({ error: "Failed to save" }, { status: 500 });
  }
}