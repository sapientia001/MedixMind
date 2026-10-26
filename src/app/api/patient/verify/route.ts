import { db } from "@/db";
import { users } from "@/db/schema";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { accessCode } = await req.json();

    if (!accessCode) {
      return NextResponse.json({ error: "Access code required" }, { status: 400 });
    }

    const patient = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.accessCode, accessCode.toUpperCase())
    });

    if (!patient) {
      return NextResponse.json({ error: "Invalid access code" }, { status: 404 });
    }

    // Check if they need onboarding (if name is null or empty)
    const needsOnboarding = !patient.name || patient.name.trim() === "";

    return NextResponse.json({ success: true, needsOnboarding });
  } catch (error) {
    console.error("Verify Error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}