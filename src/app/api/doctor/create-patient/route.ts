import { db } from "@/db";
import { users } from "@/db/schema";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { doctorId } = await req.json();

    if (!doctorId) {
      return NextResponse.json({ error: "Doctor ID is required" }, { status: 400 });
    }

    // Generate a random 6-character access code (e.g., MD-8X4K9P)
    const generateCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = 'MD-';
      for (let i = 0; i < 5; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    let accessCode = generateCode();
    let isUnique = false;

    // Ensure the code is unique
    while (!isUnique) {
      const existing = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.accessCode, accessCode)
      });
      if (!existing) {
        isUnique = true;
      } else {
        accessCode = generateCode();
      }
    }

    // Create the patient linked to this doctor
    const newPatient = await db.insert(users).values({
      role: 'patient',
      accessCode: accessCode,
      doctorId: doctorId,
    }).returning();

    return NextResponse.json({ success: true, accessCode, patientId: newPatient[0].id });
  } catch (error) {
    console.error("Create Patient Error:", error);
    return NextResponse.json({ error: "Failed to create patient" }, { status: 500 });
  }
}