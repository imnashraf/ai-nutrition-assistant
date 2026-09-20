"use client";

import { useState, useRef, useEffect } from "react";
import type { ChatApiRequest, ChatApiResponse, DisplayMessage } from "@/types/chat";
import MessageBubble from "@/components/MessageBubble";
import SourcesPanel from "@/components/SourcesPanel";
import { v4 as uuidv4 } from "uuid";

export default function ChatPage() {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: DisplayMessage = {
      id: uuidv4(),
      role: "user",
      content: input.trim(),
      claims: [],
      declined: false,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const body: ChatApiRequest = {
        message: userMessage.content,
        conversation_id: conversationId,
      };

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);

      const data: ChatApiResponse = await res.json();

      if (!conversationId) setConversationId(data.conversation_id);

      const assistantMessage: DisplayMessage = {
        id: uuidv4(),
        role: "assistant",
        content: data.response.answer,
        claims: data.response.claims,
        declined: data.declined,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          role: "assistant",
          content: "Something went wrong. Please try again.",
          claims: [],
          declined: false,
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  const lastAssistantMessage = [...messages].reverse().find((m) => m.role === "assistant");

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <h1 className="text-lg font-semibold text-gray-800">Nutrition Assistant</h1>
        <p className="text-sm text-gray-500">Food, nutrition & food safety questions</p>
      </header>

      {/* Main */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chat Panel */}
        <main className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
            {messages.length === 0 && (
              <p className="text-center text-gray-400 text-sm mt-16">
                Ask a question about food, nutrition, or food safety.
              </p>
            )}
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border rounded-2xl px-4 py-3 text-sm text-gray-400 animate-pulse">
                  Thinking…
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="border-t bg-white px-4 py-4 flex gap-3">
            <input
              id="chat-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about food, nutrition, or food safety…"
              className="flex-1 border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              id="send-button"
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              Send
            </button>
          </form>
        </main>

        {/* Sources Panel */}
        <aside className="w-72 border-l bg-white hidden md:block">
          <SourcesPanel claims={lastAssistantMessage?.claims ?? []} />
        </aside>
      </div>
    </div>
  );
}
