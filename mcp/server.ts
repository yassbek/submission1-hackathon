// mcp/server.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "founder-match-mcp",
  version: "0.1.0",
});

/**
 * Tool: extract_needs_learnings
 *
 * Input:
 *   { text: string }
 *
 * Output:
 *   {
 *     needs: [{ label: string, category: string }],
 *     learnings: [{ label: string, category: string }]
 *   }
 *
 * Implementation:
 *   Calls your Next.js API route /api/extract_needs_learnings,
 *   which is backed by real LLM logic (OpenAI) with a heuristic fallback.
 */
server.tool(
  "extract_needs_learnings",
  {
    text: z
      .string()
      .min(1)
      .describe("Weekly note or transcript from a founder."),
  },
  async ({ text }) => {
    const res = await fetch("http://localhost:3000/api/extract_needs_learnings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!res.ok) {
      throw new Error(`extract_needs_learnings failed: ${res.status}`);
    }

    const data = await res.json(); // { needs, learnings }

    return {
      // Human-readable for debugging
      content: [
        {
          type: "text",
          text: JSON.stringify(data, null, 2),
        },
      ],
      // MCP doesn’t require structuredContent; this is extra information
      structuredContent: data as any,
    };
  }
);

/**
 * Tool: compute_matches
 *
 * Input:
 *   {}
 *
 * Output:
 *   [
 *     {
 *       need_id: string,
 *       expert_user_id: string,
 *       score: number,
 *       reason: string
 *     }
 *   ]
 *
 * Implementation:
 *   Calls /api/compute_matches which uses DB needs + learnings.
 */
server.tool(
  "compute_matches",
  {},
  async () => {
    const res = await fetch("http://localhost:3000/api/compute_matches", {
      method: "POST",
    });

    if (!res.ok) {
      throw new Error(`compute_matches failed: ${res.status}`);
    }

    const raw = (await res.json()) as {
      needId: string;
      expertUserId: string;
      score: number;
      reason: string;
    }[];

    const mapped = raw.map((m) => ({
      need_id: m.needId,
      expert_user_id: m.expertUserId,
      score: m.score,
      reason: m.reason,
    }));

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(mapped, null, 2),
        },
      ],
      structuredContent: mapped as any,
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("MCP server failed:", err);
  process.exit(1);
});
