import type { Extractor } from "./types";
import { heuristicExtractor } from "./heuristic";
import { createClaudeExtractor } from "./claude";

export type { Extractor, ExtractionProposal, ProposedConcept, ProposedEdge } from "./types";
export { extractionProposalSchema } from "./types";
export { heuristicExtractor };

/**
 * Pick the extractor for the current environment. When ANTHROPIC_API_KEY is set,
 * the AI Content Engine (Claude) drafts richer proposals with difficulty, Bloom
 * levels and objectives; otherwise the deterministic heuristic runs so the
 * workflow stays fully functional (and tests need no key/network).
 */
export function getExtractor(): Extractor {
  const key = process.env.ANTHROPIC_API_KEY;
  if (key) return createClaudeExtractor(key);
  return heuristicExtractor;
}
