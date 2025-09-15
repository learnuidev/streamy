"use client";

// ---- UI Subcomponents ----
export function ChatHeader({ onClear }: { onClear: () => void }) {
  return (
    <header className="mb-5 text-center">
      <h1 className="text-indigo-600 text-2xl font-bold mb-1">DeepSeek Chat</h1>
      <p className="text-gray-500">
        Powered by DeepSeek API with streaming responses
      </p>
      <button
        onClick={onClear}
        className="mt-3 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
      >
        Clear Chat
      </button>
    </header>
  );
}
