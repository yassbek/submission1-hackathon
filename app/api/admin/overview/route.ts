// app/api/admin/overview/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const [
      activeNeedsCount,
      activeLearningsCount,
      matchSuggestionsCount,
      scheduledChatsCount,
      needsByCategory,
      learningsByCategory,
    ] = await Promise.all([
      prisma.need.count({
        where: { isActive: true },
      }),
      prisma.learning.count({
        where: { isActive: true },
      }),
      prisma.matchSuggestion.count(),
      prisma.coffeeChat.count({
        where: { status: "scheduled" },
      }),
      prisma.need.groupBy({
        by: ["category"],
        _count: { _all: true },
        where: { isActive: true },
      }),
      prisma.learning.groupBy({
        by: ["category"],
        _count: { _all: true },
        where: { isActive: true },
      }),
    ]);

    const overview = {
      activeNeedsCount,
      activeLearningsCount,
      matchSuggestionsCount,
      scheduledChatsCount,
      needsByCategory: needsByCategory.map((n) => ({
        category: n.category,
        count: n._count._all,
      })),
      learningsByCategory: learningsByCategory.map((l) => ({
        category: l.category,
        count: l._count._all,
      })),
    };

    return NextResponse.json(overview);
  } catch (err: any) {
    console.error("Failed to load admin overview", err);
    return NextResponse.json(
      { error: "Failed to load admin overview" },
      { status: 500 }
    );
  }
}
