import React, { useEffect, useState, useRef } from "react";
import { sendMessageToBot } from "../api/chatbot";
import botIcon from "../assets/unimart-bot.png";
import "./ChatbotWidget.css";

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "I am UniMart Assistant. I can help you find groceries, offers, and order support.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const chatBodyRef = useRef(null);

  /* ✅ Auto scroll to bottom */
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, loading]);

  /* ✅ Tooltip every 5 seconds (auto-hide) */
  useEffect(() => {
    if (open) return;

    const interval = setInterval(() => {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 2500);
    }, 5000);

    return () => clearInterval(interval);
  }, [open]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput("");

    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setLoading(true);

    try {
      const res = await sendMessageToBot(userText);

      if (!res || typeof res.response !== "string") {
        throw new Error("Invalid chatbot response");
      }

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
          text: "Sorry, UniMart Assistant is currently unavailable. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ✅ Tooltip */}
      {!open && showTooltip && (
        <div className="chatbot-tooltip">
          Hi! I'm UniMart Assistant.<br />
          How can I help?
        </div>
      )}

      {/* ✅ Floating Button */}
      {!open && (
        <div className="chatbot-fab" onClick={() => setOpen(true)}>
          <img src={botIcon} alt="UniMart Bot" />
        </div>
      )}

      {/* ✅ Chat Window */}
      {open && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="header-left">
              <img src={botIcon} className="bot-avatar" alt="Bot" />
              <div>
                <strong>UniMart Assistant</strong>
                <div className="sub">Grocery AI Support</div>
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
              placeholder="Ask about groceries, offers, orders..."
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              disabled={loading}
            />
            <button onClick={sendMessage} disabled={loading}>
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
