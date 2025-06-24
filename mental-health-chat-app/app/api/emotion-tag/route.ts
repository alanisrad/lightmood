import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { text } = await req.json();

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are an emotion detection assistant. Given a user statement, return a tag for the emotion: happy, sad, angry, stressed, anxious, tired. If an statement doesn't contain enough information or an emotion is not detectable, categorize as unknown.",
        },
        {
          role: "user",
          content: text,
        },
      ],
    }),
  });

  const data = await res.json();
  const tag = data.choices[0]?.message?.content?.toLowerCase().trim() || "unknown";

  console.log("Emotion tag:", tag); 

  return NextResponse.json({ tag });
}
