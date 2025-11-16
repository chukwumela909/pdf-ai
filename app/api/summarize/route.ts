import { NextResponse } from "next/server";
import {
  Highlight,
  Summary,
  buildHighlightsFromFile,
  buildSummaryFromFile,
  defaultHighlights,
  defaultSummary,
} from "@/lib/summarizer";

const MODEL_ID = "claude-sonnet-4-20250514";
const API_URL = "https://api.anthropic.com/v1/messages";

const buildRequestBody = (base64Data: string, fileName?: string) => ({
  model: MODEL_ID,
  max_tokens: 1000,
  system:
    "You turn PDFs into concise briefings. Respond ONLY with minified JSON matching {summary:{title:string,paragraphs:string[],quote:string,quoteAttribution:string},highlights:{title:string,detail:string}[]}.",
  messages: [
    {
      role: "user" as const,
      content: [
        {
          type: "document" as const,
          source: {
            type: "base64" as const,
            media_type: "application/pdf" as const,
            data: base64Data,
          },
        },
        {
          type: "text" as const,
          text: `Summarize ${fileName ?? "this PDF"} into the JSON schema. Avoid markdown fences.`,
        },
      ],
    },
  ],
});

const sanitizeJsonText = (text?: string) => {
  if (!text) return null;
  return text
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
};

const fallbackPayload = (fileName?: string) => ({
  summary: buildSummaryFromFile(fileName) ?? defaultSummary,
  highlights: buildHighlightsFromFile(fileName) ?? defaultHighlights,
});

export async function POST(request: Request) {
  try {
    const { base64Data, fileName } = await request.json();

    if (!base64Data || typeof base64Data !== "string") {
      return NextResponse.json({ error: "Missing base64Data payload." }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Missing ANTHROPIC_API_KEY env var." }, { status: 500 });
    }

    const anthropicResponse = await fetch(API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(buildRequestBody(base64Data, fileName)),
      cache: "no-store",
    });

    const anthropicJson = await anthropicResponse.json();

    if (!anthropicResponse.ok) {
      const message = anthropicJson?.error?.message ?? "Anthropic request failed.";
      return NextResponse.json({ error: message }, { status: anthropicResponse.status });
    }

    const textBlock = Array.isArray(anthropicJson?.content)
      ? anthropicJson.content.find((block: { type?: string }) => block.type === "text")
      : null;

    const rawText = sanitizeJsonText(textBlock?.text);

    if (!rawText) {
      return NextResponse.json(fallbackPayload(fileName));
    }

    let parsed: { summary?: Summary; highlights?: Highlight[] } | null = null;

    try {
      parsed = JSON.parse(rawText);
    } catch (error) {
      console.warn("Failed to parse Anthropic response as JSON", error);
    }

    if (!parsed?.summary || !parsed?.highlights) {
      return NextResponse.json(fallbackPayload(fileName));
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unexpected error while summarizing PDF." },
      { status: 500 }
    );
  }
}
