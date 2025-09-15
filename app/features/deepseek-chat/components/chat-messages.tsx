"use client";

import { ChatMessage } from "../deepseek-chat.types";

function ChatBubble({ message }: { message: ChatMessage }) {
  const base =
    "max-w-[70%] px-4 py-3 rounded-2xl shadow-sm whitespace-pre-wrap break-words";
  const styles =
    message.role === "user"
      ? "bg-indigo-600 text-white"
      : "bg-gray-200 text-gray-800";
  return (
    <div
      className={`mb-3 flex ${
        message.role === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div className={`${base} ${styles}`}>
        {message.content ||
          (message.role === "assistant" && (
            <span className="animate-pulse">...</span>
          ))}
      </div>
    </div>
  );
}

export function ChatMessages({
  messages,
  endRef,
}: {
  messages: ChatMessage[];
  endRef: React.RefObject<HTMLDivElement | null>;
}) {
  if (messages.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center text-center text-gray-400 flex-1">
        <h3 className="text-lg font-medium">Start a conversation</h3>
        <p>Type a message below to begin chatting with the AI assistant.</p>
      </div>
    );
  }
  return (
    <>
      {messages.map((m) => (
        <ChatBubble key={m.id} message={m} />
      ))}
      <div ref={endRef} />
    </>
  );
}
