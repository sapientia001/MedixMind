import { db } from "@/db";
import { messages } from "@/db/schema";
import { eq, or, and, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

// Send a message
export async function POST(req: Request) {
  try {
    const { senderId, receiverId, content } = await req.json();

    if (!senderId || !receiverId || !content) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await db.insert(messages).values({
      senderId,
      receiverId,
      content,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Message Error:", error);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}

// Get conversation
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const otherId = searchParams.get("otherId");

    if (!userId || !otherId) {
      return NextResponse.json({ error: "Missing IDs" }, { status: 400 });
    }

    const chatHistory = await db.select().from(messages).where(
      or(
        and(eq(messages.senderId, userId), eq(messages.receiverId, otherId)),
        and(eq(messages.senderId, otherId), eq(messages.receiverId, userId))
      )
    ).orderBy(messages.createdAt);

    return NextResponse.json({ messages: chatHistory });
  } catch (error) {
    console.error("Get Messages Error:", error);
    return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  }
}