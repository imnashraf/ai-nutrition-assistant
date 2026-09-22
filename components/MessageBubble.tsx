import type { DisplayMessage } from "@/types/chat";

export default function MessageBubble({ message }: { message: DisplayMessage & { nutritional_info?: { calories?: number, protein?: number, carbs?: number, fat?: number, vitamins?: string[] } } }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex flex-col gap-2 ${isUser ? "items-end" : "items-start"}`}>
      <div
        className={`max-w-prose px-5 py-3.5 rounded-2xl font-body-md text-body-md leading-relaxed ${
          isUser
            ? "bg-primary text-on-primary shadow-sm rounded-br-sm"
            : message.declined
            ? "bg-error-container text-on-error-container border border-error-container rounded-bl-sm"
            : "bg-surface-container-high border border-outline-variant text-on-surface shadow-sm rounded-bl-sm"
        }`}
      >
        {message.content}
      </div>

      {/* Render Nutrition Card only if data is present */}
      {!isUser && message.nutritional_info && (
        <div className="max-w-sm w-full bg-surface-container border border-outline-variant rounded-xl p-4 shadow-sm mt-1">
          <div className="flex items-center gap-2 mb-3 border-b border-outline-variant pb-2">
            <span className="material-symbols-outlined text-primary text-[18px]">nutrition</span>
            <h4 className="font-headline-md text-sm font-semibold text-on-surface">Nutritional Information</h4>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-3">
            {message.nutritional_info.calories !== undefined && (
              <div className="flex flex-col">
                <span className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">Calories</span>
                <span className="font-semibold text-on-surface">{message.nutritional_info.calories} kcal</span>
              </div>
            )}
            {message.nutritional_info.protein !== undefined && (
              <div className="flex flex-col">
                <span className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">Protein</span>
                <span className="font-semibold text-on-surface">{message.nutritional_info.protein}g</span>
              </div>
            )}
            {message.nutritional_info.carbs !== undefined && (
              <div className="flex flex-col">
                <span className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">Carbs</span>
                <span className="font-semibold text-on-surface">{message.nutritional_info.carbs}g</span>
              </div>
            )}
            {message.nutritional_info.fat !== undefined && (
              <div className="flex flex-col">
                <span className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">Fat</span>
                <span className="font-semibold text-on-surface">{message.nutritional_info.fat}g</span>
              </div>
            )}
          </div>
          
          {message.nutritional_info.vitamins && message.nutritional_info.vitamins.length > 0 && (
            <div className="flex flex-col border-t border-outline-variant pt-2 mt-1">
              <span className="text-xs text-on-surface-variant font-medium uppercase tracking-wider mb-1">Key Vitamins & Minerals</span>
              <div className="flex flex-wrap gap-1">
                {message.nutritional_info.vitamins.map(v => (
                  <span key={v} className="text-[11px] bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-md font-medium">
                    {v}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
