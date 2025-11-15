// app/api/chats/[chatId]/select_slot/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

type SelectSlotRequest = {
  slotId: string;
};

export async function POST(
  req: Request,
  context: { params: Promise<{ chatId: string }> }
) {
  // In newer Next.js, params is a Promise
  const { chatId } = await context.params;
  const body = (await req.json()) as SelectSlotRequest;
  const { slotId } = body;

  if (!chatId || !slotId) {
    return NextResponse.json(
      { error: "chatId and slotId are required" },
      { status: 400 }
    );
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Generate Jitsi Meet room URL using chatId as room name
      const roomName = `matchfoundry-${chatId}`;
      const meetingLink = `https://meet.jit.si/${roomName}`;

      const chat = await tx.coffeeChat.update({
        where: { id: chatId },
        data: {
          chosenSlotId: slotId,
          status: "scheduled",
          meetingLink,
        },
        include: {
          proposedSlots: true,
          need: true,
          requester: true,
          expert: true,
        },
      });

      await tx.proposedSlot.update({
        where: { id: slotId },
        data: { status: "selected" },
      });

      await tx.proposedSlot.updateMany({
        where: {
          coffeeChatId: chatId,
          id: { not: slotId },
        },
        data: { status: "expired" },
      });

      return chat;
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Failed to select slot", err);
    return NextResponse.json(
      { error: "Failed to select slot", detail: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
