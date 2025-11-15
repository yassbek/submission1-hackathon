// app/api/chats/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

type CreateChatRequest = {
  needId: string;
  requesterId: string;
  expertId: string;
};

export async function POST(req: Request) {
  const body = (await req.json()) as CreateChatRequest;
  const { needId, requesterId, expertId } = body;

  if (!needId || !requesterId || !expertId) {
    return NextResponse.json(
      { error: "needId, requesterId and expertId are required" },
      { status: 400 }
    );
  }

  try {
    const chat = await prisma.coffeeChat.create({
      data: {
        needId,
        requesterId,
        expertId,
        status: "proposed",
      },
    });

    return NextResponse.json(chat);
  } catch (err) {
    console.error("Failed to create chat", err);
    return NextResponse.json(
      { error: "Failed to create chat" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");
  const role = url.searchParams.get("role");

  if (!userId || !role) {
    return NextResponse.json(
      { error: "userId and role are required" },
      { status: 400 }
    );
  }

  try {
    const chats = await prisma.coffeeChat.findMany({
      where:
        role === "founder"
          ? { requesterId: userId }
          : role === "expert"
          ? { expertId: userId }
          : // admin will see nothing for now
            { id: "" },
      include: {
        need: true,
        requester: true,
        expert: true,
        proposedSlots: true,
        chosenSlot: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const result = chats.map((c) => ({
      id: c.id,
      status: c.status,
      meetingLink: c.meetingLink,
      chosenSlotId: c.chosenSlotId,
      need: {
        id: c.need.id,
        label: c.need.label,
        category: c.need.category,
      },
      requester: {
        id: c.requester.id,
        name: c.requester.name,
        role: c.requester.role,
      },
      expert: {
        id: c.expert.id,
        name: c.expert.name,
        role: c.expert.role,
      },
      proposedSlots: c.proposedSlots.map((s) => ({
        id: s.id,
        startTime: s.startTime.toISOString(),
        endTime: s.endTime.toISOString(),
        status: s.status,
      })),
    }));

    return NextResponse.json(result);
  } catch (err) {
    console.error("Failed to load chats", err);
    return NextResponse.json(
      { error: "Failed to load chats" },
      { status: 500 }
    );
  }
}
