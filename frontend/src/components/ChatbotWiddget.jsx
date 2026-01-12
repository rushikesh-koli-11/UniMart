import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { sendMessageToBot } from "../api/chatbot";
import botIcon from "../assets/unimart-bot.png";
import "./ChatbotWidget.css";

const BOT_BASE_URL = "https://unimart-bot.onrender.com";

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [botStatus, setBotStatus] = useState("offline");
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "I am UniMart Assistant. I help you shop groceries and assist with your orders.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const chatBodyRef = useRef(null);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (open) return;

    const interval = setInterval(() => {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 2500);
    }, 5000);

    return () => clearInterval(interval);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setBotStatus("waking");

    const waitUntilReady = async () => {
      while (!cancelled) {
        try {
          const res = await axios.get(`${BOT_BASE_URL}/health`);
          if (res.data?.status === "ok") {
            setBotStatus("online");
            return;
          }
        } catch {
          await new Promise((r) => setTimeout(r, 3000));
        }
      }
    };

    waitUntilReady();

    return () => {
      cancelled = true;
    };
  }, [open]);

  const sendMessage = async () => {
    if (!input.trim() || loading || botStatus === "offline") return;

    const userText = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setLoading(true);

    try {
      const res = await sendMessageToBot(userText);

      setMessages((prev) => [
        ...prev,
        { role: "bot", text: res.response },
      ]);
    } catch (error) {
      console.error("Chatbot error:", error);

      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "The assistant is starting up. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const statusLabel = {
    online: "🟢 Online",
    waking: "🟡 Starting…",
    offline: "🔴 Offline",
  }[botStatus];

  return (
    <>
      {!open && showTooltip && (
        <div className="chatbot-tooltip">
          Hi! I'm UniMart Assistant.
          <br />
          How can I help?
        </div>
      )}

      {!open && (
        <div className="chatbot-fab" onClick={() => setOpen(true)}>
          <img src={botIcon} alt="UniMart Bot" />
        </div>
      )}

      {open && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="header-left">
              <img src={botIcon} className="bot-avatar" alt="Bot" />
              <div>
                <strong>UniMart Assistant</strong>
                <div className="sub">Grocery AI Support</div>
                <div className={`bot-status ${botStatus}`}>
                  {statusLabel}
                </div>
              </div>
            </div>
            <span className="close" onClick={() => setOpen(false)}>
              ✕
            </span>
          </div>

          <div className="chatbot-body" ref={chatBodyRef}>
            {messages.map((m, i) => (
              <div key={i} className={`message-row ${m.role}`}>
                <div className={`bubble ${m.role}`}>{m.text}</div>
              </div>
            ))}

            {loading && (
              <div className="message-row bot">
                <div className="bubble bot">Typing…</div>
              </div>
            )}
          </div>

          <div className="chatbot-input">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                botStatus === "offline"
                  ? "Assistant is offline"
                  : "Ask about groceries, offers, orders..."
              }
              disabled={loading || botStatus === "offline"}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              disabled={loading || botStatus === "offline"}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
