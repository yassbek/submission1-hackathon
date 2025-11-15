// app/api/compute_matches/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import type { Need, Learning } from "@prisma/client";

const STOPWORDS = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "to",
  "of",
  "for",
  "with",
  "in",
  "on",
  "my",
  "our",
  "we",
  "is",
  "are",
  "was",
  "were",
  "this",
  "that",
  "it",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w && !STOPWORDS.has(w));
}

function computeSimilarity(need: Need, learning: Learning) {
  const needTokens = tokenize(need.label);
  const learnTokens = tokenize(learning.label);

  if (needTokens.length === 0 || learnTokens.length === 0) {
    return { score: 0, keyword: null as string | null };
  }

  const needSet = new Set(needTokens);
  const learnSet = new Set(learnTokens);

  const common: string[] = [];
  for (const t of needSet) {
    if (learnSet.has(t)) common.push(t);
  }

  const overlap = common.length / Math.max(needSet.size, learnSet.size);
  const categoryBonus = need.category === learning.category ? 0.3 : 0;

  const score = Math.min(1, overlap + categoryBonus);

  const keyword = common[0] ?? null;
  return { score, keyword };
}

export async function POST() {
  // Load all active needs and learnings with users
  const [needs, learnings] = await Promise.all([
    prisma.need.findMany({
      where: { isActive: true },
    }),
    prisma.learning.findMany({
      where: { isActive: true },
    }),
  ]);

  // Clear previous suggestions (simplest for a demo)
  await prisma.matchSuggestion.deleteMany({});

  const suggestionsData: {
    needId: string;
    expertUserId: string;
    score: number;
    reason: string;
  }[] = [];

  // For each need, find best experts based on their learnings
  for (const need of needs) {
    const candidates = learnings.filter(
      (l) => l.userId !== need.userId && l.category === need.category
    );

    const scored = candidates
      .map((l) => {
        const { score } = computeSimilarity(need, l);
        const reasonParts: string[] = [];

        // Get all common keywords for more transparency
        const needTokens = tokenize(need.label);
        const learnTokens = tokenize(l.label);
        const commonKeywords = needTokens.filter(t => learnTokens.includes(t));

        if (need.category === l.category) {
          reasonParts.push(`Both focus on ${need.category}`);
        }

        if (commonKeywords.length > 0) {
          const keywordList = commonKeywords.slice(0, 3).map(k => `"${k}"`).join(", ");
          reasonParts.push(`Related keywords: ${keywordList}`);
        }

        // Add confidence explanation
        const confidencePercent = Math.round(score * 100);
        reasonParts.push(`${confidencePercent}% match confidence`);

        const reason = reasonParts.join(" • ");

        return {
          needId: need.id,
          expertUserId: l.userId,
          score,
          reason,
        };
      })
      .filter((m) => m.score > 0.2); // threshold to avoid noise

    // Take top 3 per need
    scored.sort((a, b) => b.score - a.score);
    suggestionsData.push(...scored.slice(0, 3));
  }

  if (suggestionsData.length > 0) {
    await prisma.matchSuggestion.createMany({
      data: suggestionsData.map((s) => ({
        needId: s.needId,
        expertUserId: s.expertUserId,
        score: s.score,
        reason: s.reason,
      })),
    });
  }

  return NextResponse.json(suggestionsData);
}
