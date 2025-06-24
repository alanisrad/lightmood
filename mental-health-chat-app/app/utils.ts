export function getPreferredVoice(voices: SpeechSynthesisVoice[]) {
  return (
    voices.find(v => v.name.includes("Google") && v.lang === "en-US") ||
    voices.find(v => v.name.includes("Microsoft") && v.name.includes("Natural") && v.lang === "en-US") ||
    voices.find(v => v.name === "Samantha" && v.lang === "en-US") ||
    voices.find(v => v.lang === "en-US") ||
    voices[0] || null
  );
}

export function calculateEmotionIntensity(tags: string[]): Record<string, number> {
  const total = tags.length;
  const counts: Record<string, number> = {};

  for (const tag of tags) {
    counts[tag] = (counts[tag] || 0) + 1;
  }

  const percentages: Record<string, number> = {};
  for (const tag in counts) {
    percentages[tag] = Math.round((counts[tag] / total) * 100);
  }

  return percentages;
}

export function extractSuggestions(feedback: string): string[] {
  const lines = feedback.split("\n");

  const suggestions: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (/^\d+\.\s/.test(trimmed)) {
      suggestions.push(trimmed.replace(/^\d+\.\s*/, ""));
    }
  }

  return suggestions;
}
