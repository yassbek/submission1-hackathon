// app/api/chats/[chatId]/propose_slots/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

type SlotInput = {
  startTime: string; // ISO string
  endTime: string;   // ISO string
};

type ProposeSlotsRequest = {
  slots: SlotInput[];
};

export async function POST(
  req: Request,
  context: { params: Promise<{ chatId: string }> }
) {
  // In newer Next.js, params is a Promise
  const { chatId } = await context.params;
  const body = (await req.json()) as ProposeSlotsRequest;

  if (!chatId) {
    return NextResponse.json(
      { error: "chatId is required" },
      { status: 400 }
    );
  }

  if (!body.slots || body.slots.length === 0) {
    return NextResponse.json(
      { error: "slots array is required" },
      { status: 400 }
    );
  }

  try {
    // Ensure chat exists (avoid FK errors)
    const existingChat = await prisma.coffeeChat.findUnique({
      where: { id: chatId },
    });

    if (!existingChat) {
      return NextResponse.json(
        { error: `CoffeeChat with id ${chatId} not found` },
        { status: 404 }
      );
    }

    // Create proposed slots
    await prisma.proposedSlot.createMany({
      data: body.slots.map((s) => ({
        coffeeChatId: chatId,
        startTime: new Date(s.startTime),
        endTime: new Date(s.endTime),
      })),
    });

    // Return updated chat with slots
    const chat = await prisma.coffeeChat.findUnique({
      where: { id: chatId },
      include: { proposedSlots: true },
    });

    return NextResponse.json(chat);
  } catch (err: any) {
    console.error("Failed to propose slots:", err?.message ?? err);
    return NextResponse.json(
      {
        error: "Failed to propose slots",
        detail: err?.message ?? String(err),
      },
      { status: 500 }
    );
  }
}
