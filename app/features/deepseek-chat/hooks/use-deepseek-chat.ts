"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChatMessage } from "../deepseek-chat.types";
import { generateId } from "../utils/generate-id";

// ---- Hook ----
export function useDeepSeekChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const clearChat = useCallback(() => setMessages([]), []);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      setIsLoading(true);

      const userMsg: ChatMessage = {
        id: generateId(),
        role: "user",
        content: content.trim(),
      };
      setMessages((prev) => [...prev, userMsg]);

      const assistantId = generateId();
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "" },
      ]);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: userMsg.content,
            history: messages.slice(-6).map(({ role, content }) => ({
              role,
              content,
            })),
          }),
        });

        if (!response.ok || !response.body) throw new Error("Bad response");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullResponse = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullResponse += decoder.decode(value);

          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: fullResponse } : m
            )
          );
        }
      } catch (err) {
        console.error(err);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content: "Sorry, there was an error processing your request.",
                }
              : m
          )
        );
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, messages]
  );

  return {
    messages,
    isLoading,
    sendMessage,
    clearChat,
    messagesEndRef,
  };
}
