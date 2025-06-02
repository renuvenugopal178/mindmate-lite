import React, { useState, useEffect, useRef } from "react";
import "./MindMate.css";

const MindMate: React.FC = () => {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [mood, setMood] = useState("neutral");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Sorry, your browser does not support speech recognition.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
      handleSend(transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  const detectMood = (text: string): string => {
    const lower = text.toLowerCase();
    if (lower.includes("happy") || lower.includes("good") || lower.includes("great") || lower.includes("awesome"))
      return "happy";
    if (lower.includes("sad") || lower.includes("down") || lower.includes("unhappy") || lower.includes("depressed"))
      return "sad";
    if (lower.includes("angry") || lower.includes("mad") || lower.includes("frustrated") || lower.includes("upset"))
      return "angry";
    return "neutral";
  };

  const repliesByMood = {
    happy: [
      "I'm so happy to hear that! Keep shining bright! ✨",
      "That's wonderful! Your happiness is contagious 😊",
      "Yay! Keep spreading those good vibes!",
      "Awesome! Stay cheerful and keep smiling 😄"
    ],
    sad: [
      "I'm here for you. Remember, tough times don’t last, but tough people do.",
      "It’s okay to feel sad sometimes. Sending you a virtual hug 🤗",
      "I understand, but brighter days are coming your way.",
      "Don’t give up. You’ve got this!"
    ],
    angry: [
      "Take a deep breath. Let's try to calm down together. 🧘‍♀️",
      "I know it’s frustrating. Sometimes a short walk helps clear the mind.",
      "Anger is natural. Try counting to ten slowly.",
      "I'm here with you — let's find a way to relax."
    ],
    neutral: [
      "Thanks for sharing! How can I assist you further?",
      "I'm here whenever you want to talk.",
      "Tell me more!",
      "Let's chat. What’s on your mind?"
    ],
  };

  const getRandomReply = (mood: string): string => {
    const replies = repliesByMood[mood as keyof typeof repliesByMood];
    return replies[Math.floor(Math.random() * replies.length)];
  };

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    const currentMood = detectMood(text);
    setMood(currentMood);

    const reply = getRandomReply(currentMood);
    setResponse(reply);
    speakText(reply);
  };

  const speakText = (text: string) => {
    if (!window.speechSynthesis) {
      console.warn("Speech Synthesis not supported");
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const femaleVoice =
      voices.find((voice) =>
        voice.name.toLowerCase().includes("female") ||
        voice.name.toLowerCase().includes("woman") ||
        voice.name.toLowerCase().includes("zira") ||
        voice.gender === "female"
      ) || voices[0];
    utterance.voice = femaleVoice;
    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setResponse("");
      setInput("");
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  return (
    <div className="mindmate-container">
      <h1>MindMate Lite</h1>

      <textarea
        rows={4}
        placeholder="Type your message here or use voice input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="input-box"
      />

      <div className="buttons">
        <button onClick={() => handleSend(input)} disabled={!input.trim()} className="send-btn">
          Send
        </button>

        <button onClick={toggleListening} className={`mic-btn ${isListening ? "listening" : ""}`}>
          {isListening ? "🎙️ Listening..." : "🎤 Start Voice Input"}
        </button>
      </div>

      <div className={`response-box mood-${mood}`}>
        <h3>Mood: {mood.charAt(0).toUpperCase() + mood.slice(1)}</h3>
        <p>{response}</p>
      </div>
    </div>
  );
};

export default MindMate;
