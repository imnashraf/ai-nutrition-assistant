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
  /\b(calorie|caloric|kcal)\b.{0,40}(target|goal|limit|need|require)/i,
  /how many calories (should|do) (i|someone|a person)/i,
  /daily (calorie|caloric|energy) (intake|target|goal|need)/i,
  /daily (calorie|caloric|energy) (intake|target|goal|need)/i,
  /cut.{0,20}calorie/i,
  /calorie.{0,20}deficit/i,

  // ── Weight targets / BMI ──────────────────────────────────────────────────
  /\b(bmi|body mass index)\b/i,
  /how (much|many).{0,20}(should|do) (i|someone|a person).{0,20}weigh/i,
  /target.{0,10}weight/i,
  /lose.{0,20}weight/i,
  /lose.{0,20}fat/i,
  /slim.{0,20}down/i,
  /weight.{0,10}(loss|loss plan|management)/i,
  /daily.{0,20}energy.{0,20}(target|goal)/i,

  // ── Medical / condition-specific diet advice ──────────────────────────────
  /what (should|can) (i|someone|a person) (eat|avoid|not eat).{0,30}(with|for|due to|because of).{0,30}(condition|disease|disorder|diabetes|celiac|ibd|crohn|colitis|hypertension|allerg)/i,
  /\b(diabetes|hypertension|celiac|crohn|ibd|epilepsy|cancer|kidney disease|pre-diabetic|prediabetic)\b.{0,30}(diet|eat|food|avoid|nutrition)/i,
  /is it safe for (me|someone) with/i,
  /diet (for|to treat|to manage)/i,
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
