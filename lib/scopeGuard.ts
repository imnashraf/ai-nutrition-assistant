import type { ChatResponse } from "@/lib/schema";

// ─────────────────────────────────────────────────────────────────────────────
// Scope Guard
//
// Enforces topic boundaries in CODE, not just in the system prompt.
// Runs before the model is called — a blocked message never reaches the AI.
//
// Adding a new pattern:
//   1. Add a RegExp to BLOCKED_PATTERNS with a category comment.
//   2. Re-run all 10 failure-log questions to confirm no false positives.
//   3. Commit both the pattern and the updated failure log together.
// ─────────────────────────────────────────────────────────────────────────────

const BLOCKED_PATTERNS: RegExp[] = [
  // ── Calorie / daily intake targets ────────────────────────────────────────
  // Matches: "daily calorie goal", "calorie target", "cut 500 calories", "calorie deficit", "how many calories should I eat"
  /\b(calorie|caloric|kcal)\b.{0,40}(target|goal|limit|need|require|deficit|cut|burn)/i,
  /how (many|much) (calories|energy).{0,20}(should|do) (i|someone|a person)/i,
  /daily (calorie|caloric|energy) (intake|target|goal|need|limit)/i,
  /cut.{0,20}calorie/i,

  // ── Weight targets / BMI ──────────────────────────────────────────────────
  // Matches: "bmi", "target weight", "lose weight", "drop 5 kilos", "slim down"
  /\b(bmi|body mass index)\b/i,
  /how (much|many).{0,20}(should|do) (i|someone|a person).{0,20}weigh/i,
  /(target|ideal).{0,10}weight/i,
  /(lose|drop|shed).{0,20}(weight|fat|kilos|kg|pounds|lbs)/i,
  /slim.{0,20}down/i,
  /weight.{0,10}(loss|plan|management)/i,

  // ── Medical / condition-specific diet advice ──────────────────────────────
  // We use lookaheads/ORs to make it direction-agnostic (e.g., "diet for diabetes" or "diabetes diet")
  // Conditions: diabetes, celiac, crohn, ibd, colitis, hypertension, high blood pressure, epilepsy, cancer, kidney disease, pre-diabetic
  // Actions: diet, eat, avoid, food, nutrition, meal plan
  /(?=.*\b(diabetes|diabetic|pre-diabetic|prediabetic|hypertension|high blood pressure|celiac|crohn's|crohns|crohn|ibd|colitis|epilepsy|cancer|kidney disease)\b)(?=.*\b(diet|diet plan|eat|avoid|food|foods|nutrition|meal plan|manage|managing)\b)/i,
  
  // Explicit medical questions
  /is it safe for (me|someone) with/i,
  /medical (advice|nutrition|diet)/i,
  /what (should|can) (i|someone).{0,30}eat.{0,30}(condition|disease|disorder)/i,
];

/**
 * Returns true if the message touches a blocked topic.
 * The model is never called when this returns true.
 */
export function isScopeViolation(message: string): boolean {
  return BLOCKED_PATTERNS.some((pattern) => pattern.test(message));
}

/**
 * The decline response returned when isScopeViolation is true.
 * Shaped as a valid ChatResponse so no special frontend handling is needed.
 */
export const DECLINE_RESPONSE: ChatResponse = {
  answer:
    "That question touches on personal calorie targets, weight recommendations, or dietary advice for a medical condition — areas I'm not able to help with. For guidance tailored to your situation, please consult a registered dietitian or your doctor.",
  claims: [],
};
