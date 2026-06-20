import { NextResponse } from "next/server";
import { getFallbackTrial } from "@/lib/fallbackTrial";
import { TRIAL_SYSTEM_PROMPT } from "@/lib/trialPrompt";
import type { TrialGenerationResponse, TrialScript } from "@/lib/trialTypes";
import { isTrialScript } from "@/lib/trialValidation";

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const MAX_TOPIC_LENGTH = 120;

interface GroqChatResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

function fallbackResponse(topic: string, reason: string) {
  console.error(`[generate-trial] Falling back: ${reason}`);
  return NextResponse.json<TrialGenerationResponse>({
    trial: {
      ...getFallbackTrial(topic),
      isFallback: true,
    },
  });
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const topicValue = typeof body === "object" && body !== null && "topic" in body
    ? body.topic
    : undefined;
  const topic = typeof topicValue === "string" ? topicValue.trim() : "";

  if (!topic) {
    return NextResponse.json({ error: "A topic is required." }, { status: 400 });
  }

  if (topic.length > MAX_TOPIC_LENGTH) {
    return NextResponse.json(
      { error: `Topic must be ${MAX_TOPIC_LENGTH} characters or fewer.` },
      { status: 400 },
    );
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error("[generate-trial] Missing GROQ_API_KEY in .env.local.");
    return fallbackResponse(topic, "GROQ_API_KEY is not configured");
  }

  try {
    const groqResponse = await fetch(GROQ_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: TRIAL_SYSTEM_PROMPT },
          { role: "user", content: topic },
        ],
        response_format: { type: "json_object" },
        temperature: 0.85,
        max_tokens: 4_500,
      }),
      signal: AbortSignal.timeout(35_000),
      cache: "no-store",
    });

    const rawGroqResponse = await groqResponse.text();
    console.error("[generate-trial] Raw Groq response:", rawGroqResponse);

    if (!groqResponse.ok) {
      console.error(
        `[generate-trial] Groq non-200 response: ${groqResponse.status} ${groqResponse.statusText}`,
        rawGroqResponse,
      );
      return fallbackResponse(topic, `Groq returned HTTP ${groqResponse.status}`);
    }

    let data: GroqChatResponse;
    try {
      data = JSON.parse(rawGroqResponse) as GroqChatResponse;
    } catch (error) {
      console.error("[generate-trial] Failed to parse the raw Groq response as JSON:", error);
      return fallbackResponse(topic, "Groq response envelope was malformed JSON");
    }

    const content = data.choices?.[0]?.message?.content;
    if (!content) return fallbackResponse(topic, "Groq returned no message content");

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch (error) {
      console.error("[generate-trial] JSON parse failure for choices[0].message.content:", error);
      console.error("[generate-trial] Unparseable Groq message content:", content);
      return fallbackResponse(topic, "Groq returned malformed JSON");
    }

    if (!isTrialScript(parsed)) {
      return fallbackResponse(topic, "Groq JSON did not match the TrialScript schema");
    }

    const trial: TrialScript = {
      ...parsed,
      topic,
      isFallback: false,
    };

    return NextResponse.json<TrialGenerationResponse>({
      trial,
    });
  } catch (error) {
    console.error("[generate-trial] Groq request failed:", error);
    const reason = error instanceof Error ? error.message : "Unknown Groq request failure";
    return fallbackResponse(topic, reason);
  }
}
