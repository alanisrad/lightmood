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
            "You are a mental health assistant. Analyze this message and return the emergency level: none, mild, moderate, urgent. Respond with only the level.",
        },
        {
          role: "user",
          content: text,
        },
      ],
    }),
  });

  const data = await res.json();
  const level = data.choices[0]?.message?.content?.toLowerCase().trim() || "none";

  console.log("Emergency level:", level); 

  return NextResponse.json({ level });
}
