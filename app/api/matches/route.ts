// app/api/matches/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

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

  if (role === "founder") {
    // Matches for needs owned by this founder
    const matches = await prisma.matchSuggestion.findMany({
      where: {
        need: {
          userId,
        },
      },
      include: {
        need: true,
        expert: true,
      },
      orderBy: {
        score: "desc",
      },
    });

    const result = matches.map((m) => ({
      id: m.id,
      score: m.score,
      reason: m.reason,
      status: m.status,
      need: {
        id: m.need.id,
        label: m.need.label,
        category: m.need.category,
      },
      expert: {
        id: m.expert.id,
        name: m.expert.name,
        role: m.expert.role,
      },
    }));

    return NextResponse.json(result);
  }

  if (role === "expert") {
    // Incoming matches where this user is the suggested expert
    const matches = await prisma.matchSuggestion.findMany({
      where: {
        expertUserId: userId,
      },
      include: {
        need: {
          include: {
            user: true, // founder who has the need
          },
        },
        expert: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const result = matches.map((m) => ({
      id: m.id,
      score: m.score,
      reason: m.reason,
      status: m.status,
      need: {
        id: m.need.id,
        label: m.need.label,
        category: m.need.category,
      },
      requester: {
        id: m.need.user.id,
        name: m.need.user.name,
        role: m.need.user.role,
      },
    }));

    return NextResponse.json(result);
  }

  // For admin we could add a separate view later
  return NextResponse.json(
    { error: "Unsupported role for matches" },
    { status: 400 }
  );
}
