"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import EmotionChart from "@/components/ui/emotion-chart";
import { extractSuggestions } from "../utils";
import ReactMarkdown from "react-markdown";

type Provider = {
  name: string;
  address: string;
  type: string;
  website: string;
};

export default function FeedbackPage() {
  const [intro, setIntro] = useState("");
  const [closing, setClosing] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [intensity, setIntensity] = useState<Record<string, number>>({});
  const [providers, setProviders] = useState<Provider[]>([]);
  const [location, setLocation] = useState("");
  const [viewProviders, setViewProviders] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem("ai_feedback");
    if (!saved) {
      router.push("/");
      return;
    }

    const paragraphs = saved
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter((p) => p);

    if (paragraphs.length > 1) {
      setIntro(paragraphs[0]);
      setClosing(paragraphs[paragraphs.length - 1]);
    } else {
      setIntro(saved);
      setClosing("");
    }

    const extracted = extractSuggestions(saved);
    setSuggestions(extracted);
    console.log("Extracted Suggestions:", extracted);

    const intensityData = localStorage.getItem("emotion_intensity");
    if (intensityData) {
      try {
        setIntensity(JSON.parse(intensityData));
      } catch (err) {
        console.error("Failed to parse emotion_intensity from localStorage", err);
      }
    }

    const allowLocation = localStorage.getItem("allow_location");
    if (allowLocation === "true") {
      fetch("/api/location-suggested-providers")
        .then((res) => res.json())
        .then((data) => {
          setProviders(data.providers || []);
          setLocation(data.location || "your area");
        })
        .catch((err) => {
          console.error("Error fetching providers:", err);
        });
    }
  }, [router]);

  return (
    <div className="feedback-card">
      {!viewProviders ? (
        <>
          <h2 className="feedback-title">Your Session Results</h2>

          {intro && <p className="feedback-intro">{intro}</p>}

          {Object.keys(intensity).length > 0 && (
            <EmotionChart data={intensity} />
          )}

          {suggestions.length > 0 && (
            <div className="suggestion-section">
              <h3 className="suggestion-title">🌟 Suggestions for You</h3>
              <div className="suggestion-cards">
                {suggestions.map((s, i) => {
                  const match = s.match(/\*\*(.+?)\*\*:?\s*(.*)/);
                  const title = match?.[1] || `Suggestion ${i + 1}`;
                  const content = match?.[2] || s;

                  return (
                    <div key={i} className="suggestion-card">
                      <h4 className="suggestion-number">{title}</h4>
                      <div className="suggestion-text">
                        <ReactMarkdown>{content}</ReactMarkdown>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {closing && <p className="feedback-closing">{closing}</p>}

          {providers.length > 0 && (
            <button className="feedback-btn center" onClick={() => setViewProviders(true)}>
              📍 View Providers Near You
            </button>
          )}

          <button className="feedback-btn" onClick={() => router.push("/")}>⬅️ Back</button>
        </>
      ) : (
        <>
          <h2 className="feedback-title">Suggested Providers Near {location}</h2>
          <div className="providers-card">
            <ul className="providers-list">
              {providers.map((p, i) => (
                <li key={i} className="provider-item">
                  <strong>{p.name}</strong> – <em>{p.type}</em>
                  <br />
                  {p.address}
                  <br />
                  <a href={p.website} target="_blank" rel="noopener noreferrer">
                    {p.website}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <button className="feedback-btn" onClick={() => setViewProviders(false)}>
            🔙 Back to Feedback
          </button>
        </>
      )}
    </div>
  );
}









