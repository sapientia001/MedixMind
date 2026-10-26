import { db } from "@/db";
import { prescriptions } from "@/db/schema";

export async function POST(req: Request) {
  try {
    const { patientId, doctorId, medication } = await req.json();

    if (!patientId || !doctorId || !medication) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Save the prescription to the database
    await db.insert(prescriptions).values({
      patientId,
      doctorId,
      medication,
      status: "Prescribed",
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Failed to save prescription:", error);
    return Response.json({ error: "Failed to save" }, { status: 500 });
  }
}