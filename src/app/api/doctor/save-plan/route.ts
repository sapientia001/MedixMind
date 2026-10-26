import { db } from "@/db";
import { assessments } from "@/db/schema";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { patientId, diagnosis, plan } = await req.json();

    if (!patientId || !diagnosis || !plan) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // We save this as a specific assessment type: 'clinical_plan'
    await db.insert(assessments).values({
      patientId: patientId,
      type: "clinical_plan",
      rawData: JSON.stringify({ diagnosis, plan }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save clinical plan:", error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}