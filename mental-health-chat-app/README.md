# Lightmood: Mental Health Check-In Chat App

A friendly, web-based self-check app for mental health, supporting both text and voice responses. Your session is private and you receive AI-powered feedback in minutes.

https://lightmood.vercel.app/

---

## 🚀 How It Works

1. **Conversational Prompts:**  
   - You’ll be guided through **five supportive mental health questions**.  
   - Prompts are **adaptive** and change based on your emotional tone.

2. **Voice or Text Responses:**  
   - Type your answers, **or**  
   - Record your voice (works best in Chrome/Edge **(recommended)**/Android)  
   - If you record your voice, your response is transcribed automatically using **Telnyx Speech-to-Text**.

3. **Real-Time Emotion Analysis:**  
   - Each response is tagged with an **emotion label** (e.g. anxious, sad, hopeful).  
   - Tags drive **personalized follow-up prompts** and a chart in your final report.

4. **Emergency Detection & Alerts:**  
   - If an **urgent emotional trigger** is detected:  
     - The app **pauses the session**,  
     - Plays a **voice alert** encouraging professional help,  
     - And gives the user a choice to **continue or exit to support resources**.  
   - This feature ensures **compassionate, real-time safety guidance** during high-risk responses.

5. **Review & Submit:**  
   - Review and edit all your answers before submitting.  
   - Optionally enable **location detection** to receive provider suggestions near you.

6. **AI-Powered Feedback Report:**  
   - After submitting:  
     - Your session is summarized into **three sections**: intro, suggestions, and closing remarks.  
     - You’ll see a **pie chart** of emotional trends.   
     - If location access is granted, a list of **nearby providers** is also shown.

---

## 📝 Instructions

1. Open the app in your web browser.
2. Listen to each question read aloud.
3. Answer by typing or recording your voice.
4. Click “Next” to go through the prompts.
5. Click “Review All” to check/edit your responses.
6. Click “Get Results” to receive your personalized feedback summary and optional provider list.

---

## ⚠️ Limitations

- **Recording does NOT work on iPhone, iPad, or Mac Safari.**  
  (iOS devices don’t support MediaRecorder. Use Chrome/Edge/Android for voice input.)

- **Text-to-Speech (TTS) Limitations:**  
  - Telnyx TTS isn’t available for web apps, so browser-native voices are used.

- **Browser Compatibility:**  
  - Full voice: Chrome, Edge, modern Android  
  - No voice: Safari (iOS/macOS), Firefox, older browsers

---

## 🔒 Privacy

- No login or account required.  
- Responses are stored **locally during your session only**.  
- Submitted answers are sent via secure APIs to generate feedback, but not saved permanently.

---

## 🛠️ Technologies & APIs

- **Framework:** Next.js, React, TypeScript  
- **UI:** Custom responsive CSS, accessible design  
- **Browser APIs:**
  - Speech Synthesis – For natural prompt playback  
  - MediaRecorder – For voice recording (when supported)  

- **APIs & Logic (via Telnyx and OpenAI):**
  - Telnyx Speech-to-Text – Transcribes voice input  
  - OpenAI – Generates follow-up prompts and feedback  
  - Emotion Tagging – Detects mood from text  
  - Emergency Detection – Flags urgent emotional signals and triggers alerts  
  - Feedback Builder – Summarizes responses into a structured emotional report  

- **Location Services:**  
  - [ipinfo.io](https://ipinfo.io/) – Determines user's city/state for nearby provider suggestions

---

## 📦 How to Use / Run

1. Clone or download the project.
2. Run `npm install` to install dependencies.
3. Set your `.env` variables for Telnyx and OpenAI API keys.
4. Run `npm run dev` to start locally.

---



