import { NextResponse } from "next/server";
import { FormData } from "undici";

const TELNYX_API_KEY = process.env.TELNYX_API_KEY!;
const TELNYX_TRANSCRIBE_URL = "https://api.telnyx.com/v2/ai/audio/transcriptions";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const blob = Buffer.from(await file.arrayBuffer());
  const telnyxForm = new FormData();
  telnyxForm.append("file", new Blob([blob]), "audio.webm");

  telnyxForm.append("model", "distil-whisper/distil-large-v2");

  try {
    const response = await fetch(TELNYX_TRANSCRIBE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TELNYX_API_KEY}`,
      },
      // @ts-expect-error: undici FormData is not fully typed yet
      body: telnyxForm,
    });

    const result = await response.json();
    console.log("🧠 Telnyx raw response:", result);
    const text = result.text || result.output?.text || "Transcription failed";

    return NextResponse.json({ text });
  } catch (err) {
    console.error("❌ Transcription error:", err);
    return NextResponse.json({ error: "Failed to transcribe" }, { status: 500 });
  }
}

