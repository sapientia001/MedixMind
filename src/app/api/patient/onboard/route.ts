import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { accessCode, fullName } = await req.json();

    if (!accessCode || !fullName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Find the patient by their access code
    const patient = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.accessCode, accessCode.toUpperCase())
    });

    if (!patient) {
      return NextResponse.json({ error: "Invalid access code" }, { status: 404 });
    }

    // Update their name
    await db.update(users)
      .set({ name: fullName })
      .where(eq(users.id, patient.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Onboarding Error:", error);
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
  }
}