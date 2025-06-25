import { NextResponse } from "next/server";

const TELNYX_API_KEY = process.env.TELNYX_API_KEY!;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
const TELNYX_CHAT_URL = "https://api.telnyx.com/v2/ai/chat/completions";

export async function POST(req: Request) {
  const { prompt, response } = await req.json();

  if (!prompt || !response) {
    return NextResponse.json({ tag: "unknown", error: "Missing prompt or response" }, { status: 400 });
  }

  const fullText = `${prompt.trim()} ${response.trim()}`;

  const res = await fetch(TELNYX_CHAT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TELNYX_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openai/gpt-4o",
      openai_api_key: OPENAI_API_KEY,
      messages: [
        {
          role: "system",
          content:
            "You are an emotion detection assistant. Given a user statement, return a tag for the emotion: happy, sad, angry, stressed, anxious, tired. If a statement doesn't contain enough information or an emotion is not detectable, categorize as unknown. Return only one word.",
        },
        {
          role: "user",
          content: fullText,
        },
      ],
    }),
  });

  const data = await res.json();
  let tag = data.choices?.[0]?.message?.content?.toLowerCase().trim() || "unknown";

  const allowedTags = ["happy", "sad", "angry", "stressed", "anxious", "tired"];
  if (!allowedTags.includes(tag)) {
    tag = "unknown";
  }

  console.log("Emotion tag:", tag);

  return NextResponse.json({ tag });
}



