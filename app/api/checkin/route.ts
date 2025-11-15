// app/api/checkin/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { NeedCategory } from "@prisma/client";

type CheckinItem = {
  label: string;
  category: NeedCategory | string;
};

type CheckinRequest = {
  userId: string;
  needs: CheckinItem[];
  learnings: CheckinItem[];
};

export async function POST(req: Request) {
  const body = (await req.json()) as CheckinRequest;

  const { userId, needs, learnings } = body;

  if (!userId) {
    return NextResponse.json(
      { error: "userId is required" },
      { status: 400 }
    );
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Mark previous entries inactive
      await tx.need.updateMany({
        where: { userId },
        data: { isActive: false },
      });
      await tx.learning.updateMany({
        where: { userId },
        data: { isActive: false },
      });

      // Create new needs
      if (needs && needs.length > 0) {
        await tx.need.createMany({
          data: needs.map((n) => ({
            userId,
            label: n.label,
            category: (n.category as NeedCategory) ?? "other",
          })),
        });
      }

      // Create new learnings
      if (learnings && learnings.length > 0) {
        await tx.learning.createMany({
          data: learnings.map((l) => ({
            userId,
            label: l.label,
            category: (l.category as NeedCategory) ?? "other",
          })),
        });
      }
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Failed to save checkin", err);
    return NextResponse.json(
      { error: "Failed to save checkin" },
      { status: 500 }
    );
  }
}
