// components/PranjalChatBot/PranjalChatBot.jsx

import { useState, useRef, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "./PranjalChatBot.css"; // rename your App.css to this

const SYSTEM_PROMPT = `Tum ek helpful, friendly aur patient teacher ho jo students ke doubts solve karte ho.
Tumhara naam "Pranjal Pathshala Ka AI Assistant" hai.
- Hamesha Hinglish mein baat karo (Hindi + English mix)
- Simple aur easy language use karo
- Real-life examples do concepts samjhane ke liye
- Step-by-step explain karo jab zaroorat ho
- Encourage karte raho, kabhi discourage mat karo
- Maths, Science, Hindi, English, Social Science — sab subjects cover karo
- Responses concise rakho
- IMPORTANT: Plain text mein jawab do. Koi markdown formatting mat use karo.`;

const WELCOME = "🙏 Namaste! Main hoon Pranjal Pathshala ka AI Assistant — tumhara personal study buddy!\n\nKoi bhi subject ka doubt ho, poocho mujhse. Batao, aaj kya padhna hai? 📚";

function cleanText(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`{1,3}([^`]+)`{1,3}/g, "$1")
    .replace(/#{1,6}\s+/g, "")
    .replace(/^\s*[-•]\s+/gm, "• ")
    .trim();
}

export default function PranjalChatBot({ apiKey }) {
  const [messages, setMessages] = useState([{ role: "bot", text: WELCOME }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Use prop apiKey OR fallback to env variable
  const key = apiKey || import.meta.env.VITE_GEMINI_API_KEY || "";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    setInput("");
    const currentMessages = [...messages];
    setMessages((prev) => [...prev, { role: "user", text: msg }]);
    setLoading(true);

    try {
      if (!key) throw new Error("API key missing — VITE_GEMINI_API_KEY set karo .env mein");

      const genai = new GoogleGenerativeAI(key);
      const model = genai.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: SYSTEM_PROMPT,
      });

      const validMsgs = currentMessages.filter((m) => m.role === "user" || m.role === "bot");
      const firstUserIdx = validMsgs.findIndex((m) => m.role === "user");

      const history = firstUserIdx === -1
        ? []
        : validMsgs.slice(firstUserIdx).map((m) => ({
            role: m.role === "bot" ? "model" : "user",
            parts: [{ text: m.text }],
          }));

      const chat = model.startChat({ history });
      const result = await chat.sendMessage(msg);
      const reply = cleanText(result.response.text());

      setMessages((prev) => [...prev, { role: "bot", text: reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "error", text: "⚠️ " + (err.message || "Kuch problem aayi, dobara try karo!") },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => setMessages([{ role: "bot", text: WELCOME }]);

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="pp-chatbot-wrapper">
      <button
        className={`chat-bubble ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen((o) => !o)}
        aria-label="Toggle chat"
      >
        {!isOpen && <div className="bubble-ping" />}
        {isOpen ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>

      <div className={`chat-window ${isOpen ? "visible" : ""}`}>
        <div className="chat-header">
          <div className="bot-avatar">🤖</div>
          <div className="header-info">
            <div className="header-name">Pranjal Pathshala Ka AI Assistant</div>
            <div className="header-status">
              <div className="status-dot" /> Online • Ready to help!
            </div>
          </div>
          <button className="clear-btn" onClick={clearChat}>Clear</button>
        </div>

        <div className="messages">
          {messages.map((msg, i) => (
            <div key={i} className={`msg ${msg.role}`}>
              <div className="msg-avatar">{msg.role === "user" ? "👤" : "🤖"}</div>
              <div className={`bubble ${msg.role}`}>{msg.text}</div>
            </div>
          ))}

          {loading && (
            <div className="msg bot">
              <div className="msg-avatar">🤖</div>
              <div className="bubble bot typing"><span /><span /><span /></div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-area">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Apna doubt yahan type karo..."
            rows={1}
            disabled={loading}
          />
          <button
            className="send-btn"
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}