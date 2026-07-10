import type { ContentGenerator } from "./types";
import { heuristicGenerator } from "./heuristic";
import { createClaudeGenerator } from "./claude";

export type { ContentGenerator, ContentBundle, Flashcard, QuizQuestion } from "./types";
export { contentBundleSchema } from "./types";
export { heuristicGenerator };

/** Claude generator when ANTHROPIC_API_KEY is set, else the deterministic heuristic. */
export function getContentGenerator(): ContentGenerator {
  const key = process.env.ANTHROPIC_API_KEY;
  return key ? createClaudeGenerator(key) : heuristicGenerator;
}
