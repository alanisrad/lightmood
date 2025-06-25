"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getPreferredVoice } from "./utils";
import { calculateEmotionIntensity } from "./utils";

export default function MentalHealthChat() {
  const [step, setStep] = useState(0);
  const [prompts, setPrompts] = useState<string[]>([]);
  const [responses, setResponses] = useState<string[]>([]);
  const [emotionTags, setEmotionTags] = useState<string[]>([]);
  const [showReview, setShowReview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [preferredVoice, setPreferredVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [allowLocation, setAllowLocation] = useState(false);
  const [isNextDisabled, setIsNextDisabled] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const router = useRouter();

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      const selected = getPreferredVoice(voices);
      setPreferredVoice(selected || null);
    };
    if (typeof window !== "undefined" && window.speechSynthesis) {
      if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      } else {
        loadVoices();
      }
    }
  }, []);

  useEffect(() => {
    if (prompts.length === 0) {
      const welcomeMessages = [
        "Hi there, I'm glad you're checking in today. How are you feeling right now?",
        "It's good to see you here. What emotions have been showing up for you recently?",
        "Thanks for showing up for yourself today. Would you like to share how you're feeling?",
        "Let's take a few minutes to check in. How would you describe your mood today?",
      ];
      const firstPrompt = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
      setPrompts([firstPrompt]);
      setResponses([""]);
    }
  }, [prompts]);

  useEffect(() => {
    if (!showReview && preferredVoice && prompts[step]) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(prompts[step]);
      utterance.lang = "en-US";
      utterance.voice = preferredVoice;
      window.speechSynthesis.speak(utterance);
    }
  }, [step, showReview, preferredVoice, prompts]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    chunksRef.current = [];
    setRecording(true);

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = async () => {
      setRecording(false);
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const formData = new FormData();
      formData.append("file", blob);
      formData.append("question", prompts[step]);

      const res = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      handleResponseChange(step, data.text);
    };

    mediaRecorder.start();
  };

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
    const stream = streamRef.current;
    if (stream) {
      stream.getTracks().forEach((track) => {
        if (track.readyState === "live") {
          track.stop();
        }
      });
      streamRef.current = null;
    }
  };

  const handleResponseChange = (i: number, value: string) => {
    const newResponses = [...responses];
    newResponses[i] = value;
    setResponses(newResponses);
  };

  const handleNext = async () => {
    if (isNextDisabled) return; // prevent multiple clicks

    const userResponse = responses[step].trim();
    if (!userResponse) {
      alert("Please type or record a response before continuing.");
      return;
    }

    setIsNextDisabled(true); // disable button to prevent double submission

    try {
      // Check for emergencies
      const emergencyRes = await fetch("/api/emergency-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: userResponse }),
      });
      const emergencyData = await emergencyRes.json();

      if (emergencyData.level === "urgent") {
        speak("Your response may indicate an emergency. Please consider reaching out to a mental health professional or calling a crisis line near you.");
        const proceed = window.confirm("⚠️ Would you like to continue with the check-in, or stop here and seek professional help?\n\nClick OK to continue or CANCEL to stop.");
        if (!proceed) {
          window.open("https://988lifeline.org", "_blank");
          return;
        }
        alert("Please remember this check-in does not replace professional support.");
      }

      // Get emotion tag
      const emotionRes = await fetch("/api/emotion-tag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompts[step],
          response: userResponse,
        }),
      });
      const emotionData = await emotionRes.json();
      const emotionTag = emotionData.tag;

      setEmotionTags((prev) => [...prev, emotionTag]);

      // Generate follow-up question
      const history = prompts.slice(0, step).map((q, i) => ({
        question: q,
        answer: responses[i],
      }));

      const followUpRes = await fetch("/api/follow-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emotionTag,
          history,
          currentQA: {
            question: prompts[step],
            answer: userResponse,
          },
        }),
      });

      const { question: nextPrompt } = await followUpRes.json();

      if (step < 4) {
        setPrompts((prev) => [...prev, nextPrompt]);
        setResponses((prev) => [...prev, ""]);
        setStep(step + 1);
      } else {
        setShowReview(true);
      }
    } catch (err) {
      console.error("❌ Error during next step logic:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsNextDisabled(false); // Re-enable the button
    }
  };

  const generateFeedback = async () => {
    setLoading(true);
    const summary = prompts.map((q, i) => `Q: ${q}\nA: ${responses[i]}`).join("\n\n");

    const res = await fetch("/api/get-feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ summary }),
    });

    const data = await res.json();
    const intensity = calculateEmotionIntensity(emotionTags);

    localStorage.setItem("ai_feedback", data.feedback);
    localStorage.setItem("emotion_intensity", JSON.stringify(intensity));
    localStorage.setItem("allow_location", allowLocation.toString());

    setLoading(false);
    router.push("/feedback");
  };

  if (showReview) {
    return (
      <div className="review-bg">
        <div className="review-card">
          <h1 className="main-title">Review and Edit Your Responses</h1>
          <div className="review-list">
            {prompts.map((prompt, i) => (
              <div key={i} className="review-item">
                <div className="prompt">{prompt}</div>
                <Textarea
                  value={responses[i]}
                  onChange={(e) => handleResponseChange(i, e.target.value)}
                  className="main-textarea"
                />
              </div>
            ))}
          </div>
          <div className="mt-4">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={allowLocation}
                onChange={(e) => setAllowLocation(e.target.checked)}
              />
              <span className="checkbox-text">
                Show nearby providers based on my location
              </span>
            </label>
          </div>

          <Button
            onClick={generateFeedback}
            disabled={loading}
            className="main-btn"
          >
            {loading ? "Generating Results..." : "Get Results"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="header">lightmood</header>
      <div className="app-center">
        <div className="card">
          <CardContent>
            {step === 0 && prompts[0] && (
              <h1 className="main-title">{prompts[0].split(". ")[0]}.</h1>
            )}
            <div className="prompt centered-prompt">
              {step === 0 && prompts[0] ? (
                <div>{prompts[0].split(". ")[1]}</div>
              ) : (
                <div>{prompts[step]}</div>
              )}
            </div>

            <div className="button-row">
              <Button onClick={() => speak(prompts[step])} className="main-btn">🔊 Read</Button>
              <Button onClick={startRecording} disabled={recording} className="main-btn">🎙️ Record</Button>
              <Button onClick={stopRecording} disabled={!recording} className="main-btn">⏹️ Stop</Button>
            </div>

            <Textarea
              placeholder="Record or type your response..."
              value={responses[step] || ""}
              onChange={(e) => handleResponseChange(step, e.target.value)}
              className="main-textarea"
            />

            <div style={{ textAlign: "right" }}>
              <Button
                onClick={handleNext}
                className={step < 4 ? "main-btn" : "main-btn green"}
              >
                {step < 4 ? "Next" : "Review All"}
              </Button>
            </div>
          </CardContent>
        </div>
      </div>
    </>
  );
}
















