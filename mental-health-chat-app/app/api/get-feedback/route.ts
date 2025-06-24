import { NextResponse } from "next/server";

const TELNYX_API_KEY = process.env.TELNYX_API_KEY!;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
const TELNYX_CHAT_URL = "https://api.telnyx.com/v2/ai/chat/completions";

export async function POST(req: Request) {
  try {
    const { summary } = await req.json();

    const systemPrompt = `
You are a compassionate mental health coach.

Given the user's emotional check-in summary, provide:
- A short empathetic reflection, including sentiment analysis.
- Offer 6 actionable and kind suggestions to help the user feel better. Format them as a numbered markdown list, using clear and gentle language.
- If user shows symptoms of: (
* Depression: Share lifeline resources by sharing link (https://uwcf.org/988-crisis-lifeline/).
* Anxiety or burnout: Share Headspace resources by sharing link (https://www.headspace.com/).)

Respond in clear natural language, well-structured and encouraging.
`;

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
          { role: "system", content: systemPrompt },
          { role: "user", content: summary },
        ],
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error("❌ Telnyx AI returned no content:", data);
      return NextResponse.json({ feedback: "Unable to generate feedback." }, { status: 502 });
    }

    return NextResponse.json({ feedback : content });

  } catch (err) {
    console.error("❌ Feedback error:", err);
    return NextResponse.json(
      { feedback: "Something went wrong generating feedback." },
      { status: 500 }
    );
  }
}
