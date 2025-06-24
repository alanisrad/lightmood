import { NextResponse } from "next/server";

const TELNYX_API_KEY = process.env.TELNYX_API_KEY!;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
const TELNYX_CHAT_URL = "https://api.telnyx.com/v2/ai/chat/completions";

export async function POST(req: Request) {
  try {
    const { userResponse, emotionTag } = await req.json();

    const messages = [
      {
        role: "system",
        content: `
You are a compassionate mental health assistant.

You are helping a user who is currently feeling: "${emotionTag}".

Based on their emotional tone and recent response, ask a smart follow-up question that:
- Dives further on what the user is feeling and focuses on emotional well-being.
- Feels emotionally attuned.

Respond with one gentle question (ONLY THE QUESTION).
        `,
      },
      {
        role: "user",
        content: userResponse,
      },
    ];

    const response = await fetch(TELNYX_CHAT_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TELNYX_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o",
        openai_api_key: OPENAI_API_KEY,
        messages,
      }),
    });

    const data = await response.json();
    const question = data.choices?.[0]?.message?.content?.trim();

    if (!question) {
      console.error("❌ Telnyx AI follow-up returned no question:", data);
      return NextResponse.json(
        { question: "Can you tell me more about how that made you feel?" },
        { status: 502 }
      );
    }

    return NextResponse.json({ question });
  } catch (err) {
    console.error("❌ Follow-up route error:", err);
    return NextResponse.json(
      { question: "Is there anything else you’d like to share?" },
      { status: 500 }
    );
  }
}



