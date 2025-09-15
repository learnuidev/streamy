"use client";

import { ChatHeader } from "./components/chat-header";
import { ChatInput } from "./components/chat-input";
import { ChatMessages } from "./components/chat-messages";
import { useDeepSeekChat } from "./hooks/use-deepseek-chat";

// ---- Main Composition ----
export function DeepSeekChat() {
  const { messages, isLoading, sendMessage, clearChat, messagesEndRef } =
    useDeepSeekChat();

  return (
    <div className="max-w-3xl mx-auto p-5 font-sans h-screen flex flex-col">
      <ChatHeader onClear={clearChat} />

      <div className="flex-1 border border-gray-200 rounded-lg p-4 mb-5 overflow-y-auto bg-gray-50 flex flex-col">
        <ChatMessages messages={messages} endRef={messagesEndRef} />
      </div>

      <ChatInput onSend={sendMessage} isLoading={isLoading} />
    </div>
  );
}
