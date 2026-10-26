import { db } from "@/db";
import { users } from "@/db/schema";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email)
    });

    if (existingUser) {
      return NextResponse.json({ error: "A user with this email already exists" }, { status: 400 });
    }

    // Insert the new Doctor
    await db.insert(users).values({
      email,
      password, // In a real app, you MUST hash this with bcrypt!
      role: 'doctor',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin API Error:", error);
    return NextResponse.json({ error: "Failed to create doctor" }, { status: 500 });
  }
}