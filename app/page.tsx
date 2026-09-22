"use client";

import { useState, useRef, useEffect } from "react";
import type { ChatApiRequest, ChatApiResponse, DisplayMessage } from "@/types/chat";
import MessageBubble from "@/components/MessageBubble";
import SourcesPanel from "@/components/SourcesPanel";
import NutriAILogo from "@/components/NutriAILogo";
import { v4 as uuidv4 } from "uuid";

const SUGGESTIONS = [
  "What foods are high in protein?",
  "How much iron do I need?",
  "Is air frying healthier than deep frying?",
  "How long can cooked chicken stay in the fridge?"
];

export default function ChatPage() {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(content: string) {
    if (!content.trim() || isLoading) return;

    const userMessage: DisplayMessage = {
      id: uuidv4(),
      role: "user",
      content: content.trim(),
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
        sources: data.response.sources,
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

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  const assistantMessages = messages.filter((m) => m.role === "assistant");
  const currentResponse = assistantMessages.length > 0 ? assistantMessages[assistantMessages.length - 1] : null;
  const previousResponses = assistantMessages.slice(0, -1).filter((m) => (m.claims && m.claims.length > 0) || (m.sources && m.sources.length > 0)).reverse();
  const hasSources = (currentResponse?.claims && currentResponse.claims.length > 0) || (currentResponse?.sources && currentResponse.sources.length > 0) || previousResponses.length > 0;

  return (
    <div className={`flex flex-col w-full h-full lg:flex-row overflow-hidden mx-auto ${messages.length > 0 ? "max-w-6xl xl:max-w-7xl" : "w-full"}`}>
      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col h-[calc(100vh-4rem)] bg-surface ${hasSources ? "lg:border-r border-outline-variant" : ""}`}>
        
        {/* Chat Header / Welcome */}
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center w-full max-w-4xl mx-auto">
            <NutriAILogo variant="full" className="mb-8" />
            <h2 className="font-headline-sm text-xl font-medium text-on-surface mb-3 tracking-tight">How can I help you eat healthier today?</h2>
            <p className="text-on-surface-variant max-w-lg font-body-md mb-10 text-base">
              Ask me about food nutrition, dietary facts, and food safety. My answers are evidence-backed.
            </p>
            
            {/* Suggested Questions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(s)}
                  disabled={isLoading}
                  className="px-5 py-4 bg-surface-container text-sm font-medium text-on-surface-variant border border-outline-variant rounded-xl hover:bg-surface-container-high hover:text-primary transition-colors text-left shadow-sm flex items-center justify-between group disabled:opacity-50"
                >
                  <span className="flex-1 pr-2">{s}</span>
                  <span className="material-symbols-outlined text-[18px] opacity-0 group-hover:opacity-100 transition-opacity">arrow_forward</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Stream */}
        {messages.length > 0 && (
          <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto w-full">
            {messages.map((msg, idx) => (
              <div key={msg.id} className="flex flex-col">
                <MessageBubble message={msg} />
                
                {/* On mobile, render sources right below EVERY assistant answer that has claims (history is naturally preserved) */}
                {msg.role === "assistant" && ((msg.claims && msg.claims.length > 0) || (msg.sources && msg.sources.length > 0)) && (
                  <div className="mt-4 lg:hidden">
                    <div className="bg-surface-container-high rounded-xl border border-outline-variant overflow-hidden">
                      <div className="p-3 border-b border-outline-variant bg-surface-container">
                        <h3 className="font-headline-md text-sm font-semibold flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px] text-primary">policy</span>
                          Sources & Evidence
                        </h3>
                      </div>
                      <div className="p-4 bg-surface-container-lowest/50">
                        <SourcesPanel claims={msg.claims || []} sources={msg.sources} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-surface-container-high rounded-2xl px-5 py-3 text-sm text-on-surface-variant animate-pulse font-body-md shadow-sm">
                  Analyzing evidence...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}

        {/* Chat Input */}
        <div className="p-4 md:p-6 bg-surface border-t border-outline-variant w-full">
          <div className="max-w-3xl mx-auto relative flex items-center">
            <input
              id="chat-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about nutrition..."
              className="w-full bg-surface-container text-on-surface border border-outline rounded-full pl-6 pr-14 py-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm text-base"
              disabled={isLoading}
            />
            <button
              id="send-button"
              type="button"
              onClick={() => sendMessage(input)}
              disabled={isLoading || !input.trim()}
              className="absolute right-2 w-10 h-10 bg-primary text-on-primary rounded-full flex items-center justify-center hover:bg-secondary disabled:opacity-50 transition-colors shadow-sm"
              aria-label="Send message"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_upward</span>
            </button>
          </div>
          <div className="text-center mt-3 text-xs text-on-surface-variant">
            NutriAI provides evidence-backed nutrition information.
          </div>
        </div>
      </div>

      {/* Desktop Sidebar: Sources & Evidence (Persistent History) */}
      {hasSources && (
        <div className="hidden lg:flex w-80 xl:w-96 flex-col h-[calc(100vh-4rem)] bg-surface-container-low overflow-hidden shadow-inner">
          <div className="p-5 border-b border-outline-variant bg-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-primary">policy</span>
            <h2 className="font-headline-md text-base font-semibold text-on-surface">Sources & Evidence</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-8">
            
            {/* CURRENT RESPONSE */}
            {currentResponse && ((currentResponse.claims && currentResponse.claims.length > 0) || (currentResponse.sources && currentResponse.sources.length > 0)) && (
              <div>
                <h3 className="text-[11px] font-bold text-outline uppercase tracking-widest mb-3">Current Response</h3>
                <SourcesPanel claims={currentResponse.claims || []} sources={currentResponse.sources} />
              </div>
            )}
            
            {/* PREVIOUS RESPONSES */}
            {previousResponses.length > 0 && (
              <div>
                <h3 className="text-[11px] font-bold text-outline uppercase tracking-widest mb-3">Previous Responses</h3>
                <div className="space-y-6">
                  {previousResponses.map((msg) => (
                    <div key={msg.id} className="opacity-80 hover:opacity-100 transition-opacity">
                      <div className="text-xs text-on-surface-variant italic mb-2 line-clamp-2 pl-2 border-l-2 border-outline">
                        "{msg.content}"
                      </div>
                      <SourcesPanel claims={msg.claims || []} sources={msg.sources} />
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
