import type { DisplayMessage } from "@/types/chat";

export default function MessageBubble({ message }: { message: DisplayMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-prose px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? "bg-blue-600 text-white"
            : message.declined
            ? "bg-amber-50 border border-amber-200 text-amber-900"
            : "bg-white border text-gray-800"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}
