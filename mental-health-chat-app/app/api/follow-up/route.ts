import { NextResponse } from "next/server";

const TELNYX_API_KEY = process.env.TELNYX_API_KEY!;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
const TELNYX_CHAT_URL = "https://api.telnyx.com/v2/ai/chat/completions";

export async function POST(req: Request) {
  try {
    const { emotionTag, history, currentQA } = await req.json();

    if (!emotionTag || !currentQA?.question || !currentQA?.answer || !Array.isArray(history)) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const historyText = history
      .map((item, index) => `Q${index + 1}: ${item.question}\nA${index + 1}: ${item.answer}`)
      .join("\n");

    const prompt = `
You are a compassionate mental health assistant.

You are helping a user who is currently feeling: "${emotionTag}".

Here is the conversation so far:

${historyText}

Current:
Q: ${currentQA.question}
A: ${currentQA.answer}

Your task:
- Based on this full context, ask a supportive and emotionally intelligent follow-up question.
- Avoid repeating topics/questions already asked.
- Help the user reflect deeper or explore their emotions safely.

Reply with just the next follow-up question. DO NOT include anything else.
    `.trim();

    const response = await fetch(TELNYX_CHAT_URL, {
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
            content: "You generate emotionally supportive follow-up questions in a mental health conversation.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
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




