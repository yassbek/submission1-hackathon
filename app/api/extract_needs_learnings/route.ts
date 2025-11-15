// app/api/extract_needs_learnings/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

type ExtractRequest = {
  text: string;
};

const CATEGORY_OPTIONS = [
  "product",
  "sales",
  "fundraising",
  "branding",
  "ux",
  "marketing",
  "tech",
  "ops",
  "other",
] as const;
type Category = (typeof CATEGORY_OPTIONS)[number];

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * LLM-backed extraction:
 * - Uses JSON schema output for structured needs & learnings
 * - Falls back to simple heuristic if OPENAI_API_KEY is not set
 */
export async function POST(req: Request) {
  const body = (await req.json()) as ExtractRequest;
  const raw = (body.text ?? "").trim();

  if (!raw) {
    return NextResponse.json(
      { error: "text is required" },
      { status: 400 }
    );
  }

  // If no OpenAI key, fall back to heuristic logic
  if (!process.env.OPENAI_API_KEY) {
    return heuristicExtract(raw);
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "needs_learnings",
          schema: {
            type: "object",
            properties: {
              needs: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    label: { type: "string" },
                    category: { type: "string", enum: CATEGORY_OPTIONS as any },
                  },
                  required: ["label", "category"],
                  additionalProperties: false,
                },
              },
              learnings: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    label: { type: "string" },
                    category: { type: "string", enum: CATEGORY_OPTIONS as any },
                  },
                  required: ["label", "category"],
                  additionalProperties: false,
                },
              },
            },
            required: ["needs", "learnings"],
            additionalProperties: false,
          },
          strict: true,
        },
      },
      messages: [
        {
          role: "system",
          content:
            "You extract startup founder weekly updates into 'needs' and 'learnings'. " +
            "Each need is something they want help with. Each learning is something they can offer others.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: [
                "Given this weekly update from a founder, extract:",
                "- 1–3 'needs' (things they want help with)",
                "- 1–3 'learnings' (things they can help others with)",
                "",
                "Assign each item to ONE of these categories:",
                CATEGORY_OPTIONS.join(", "),
                "",
                "Weekly update:",
                raw,
              ].join("\n"),
            },
          ],
        },
      ],
    });

    const parsed = completion.choices[0].message.content;
    // content is guaranteed JSON per response_format
    const data = typeof parsed === "string" ? JSON.parse(parsed) : parsed;

    // Safety: limit to 3 each
    return NextResponse.json({
      needs: (data.needs ?? []).slice(0, 3),
      learnings: (data.learnings ?? []).slice(0, 3),
    });
  } catch (err: any) {
    console.error("LLM extraction failed, falling back to heuristic:", err);
    return heuristicExtract(raw);
  }
}

/**
 * Simple heuristic fallback (what you had before).
 * Used if OPENAI_API_KEY is missing or LLM call fails.
 */
function heuristicExtract(raw: string) {
  const CATEGORY_KEYWORDS: { category: Category; keywords: string[] }[] = [
    { category: "sales", keywords: ["sales", "closing", "outreach", "pipeline", "crm"] },
    { category: "fundraising", keywords: ["fundraising", "investor", "vc", "pitch", "deck", "term sheet"] },
    { category: "product", keywords: ["mvp", "product", "feature", "roadmap", "prototype"] },
    { category: "ux", keywords: ["ux", "user interview", "usability", "design", "onboarding"] },
    { category: "marketing", keywords: ["marketing", "ads", "campaign", "content", "seo", "social"] },
    { category: "branding", keywords: ["brand", "branding", "positioning", "story"] },
    { category: "tech", keywords: ["backend", "frontend", "infra", "database", "deployment", "architecture"] },
    { category: "ops", keywords: ["operations", "ops", "process", "legal", "finance", "hiring", "recruiting"] },
  ];

  const inferCategory = (text: string): Category => {
    const lower = text.toLowerCase();
    for (const entry of CATEGORY_KEYWORDS) {
      if (entry.keywords.some((k) => lower.includes(k))) {
        return entry.category;
      }
    }
    return "other";
  };

  const sentences = raw
    .split(/[\.\n\r]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const needs: { label: string; category: Category }[] = [];
  const learnings: { label: string; category: Category }[] = [];

  for (const sentence of sentences) {
    const lower = sentence.toLowerCase();
    const cat = inferCategory(sentence);

    if (
      lower.includes("need") ||
      lower.includes("help") ||
      lower.includes("stuck") ||
      lower.includes("blocker")
    ) {
      needs.push({ label: sentence, category: cat });
    } else {
      learnings.push({ label: sentence, category: cat });
    }
  }

  if (needs.length === 0 && sentences.length > 0) {
    needs.push({
      label: sentences[0],
      category: inferCategory(sentences[0]),
    });
  }
  if (learnings.length === 0 && sentences.length > 1) {
    learnings.push({
      label: sentences[1],
      category: inferCategory(sentences[1]),
    });
  }

  return NextResponse.json({
    needs: needs.slice(0, 3),
    learnings: learnings.slice(0, 3),
  });
}
