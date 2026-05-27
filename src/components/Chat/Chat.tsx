import React, { useEffect, useRef, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import "./Chat.css";
import { authFetch } from "../../auth/authFetch";
const API_URL = import.meta.env.VITE_API_BASE_URL;
const WS_URL = API_URL.replace(/^https/, "wss");


type Message = {
  userId: number;
  username: string;
  text: string;
  timestamp: string;
};

const Chat: React.FC = () => {
  const { loggedUser } = useAppContext();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const wsRef = useRef<WebSocket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    authFetch('/chat')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setMessages(data);
        } else {
          setMessages([]);
        }
      });
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handler = (e: Event) => {
      const msg = (e as CustomEvent).detail;
      if (msg.type === "CHAT_MESSAGE") {
        setMessages((prev) => {
          const isDuplicate = prev.some(
            (m) =>
              Number(m.userId) === Number(msg.userId) &&
              m.text === msg.text &&
              Math.abs(new Date(m.timestamp).getTime() - new Date(msg.timestamp).getTime()) < 2000
          );
          if (isDuplicate) return prev;
          return [...prev, msg];
        });
      }
    };
    window.addEventListener("ws-chat", handler as EventListener);
    return () => window.removeEventListener("ws-chat", handler as EventListener);
  }, []);


  const sendMessage = () => {
    if (!input.trim() || !loggedUser) return;

    const message = {
      type: "CHAT_MESSAGE",
      userId: loggedUser.id,
      username: loggedUser.username,
      text: input.trim(),
      timestamp: new Date().toISOString(), 
    };

    window.dispatchEvent(new CustomEvent("ws-send", { detail: message }));

    setMessages((prev) => [...prev, message]);

    setInput("");
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") sendMessage();
  };

  if (!loggedUser) return null;

  return (
    <>
      {/* Bubble button */}
      <button className="chat-bubble" onClick={() => setOpen((o) => !o)}>
        💬
      </button>

      {/* Modal */}
      {open && (
        <div className="chat-modal">
          <div className="chat-header">
            <span>Group Chat</span>
            <button className="chat-close" onClick={() => setOpen(false)}>✕</button>
          </div>

          <div className="chat-messages">
            {messages.map((m, i) => {
              const isMe = Number(m.userId) === Number(loggedUser.id);
              return (
                <div key={i} className={`chat-msg ${isMe ? "me" : "other"}`}>
                  {!isMe && <span className="chat-username">{m.username}</span>}
                  <div className="chat-bubble-msg">{m.text}</div>
                  <span className="chat-time">
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          <div className="chat-input-row">
            <input
              className="chat-input"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
            />
            <button className="chat-send" onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chat;