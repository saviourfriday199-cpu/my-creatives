import { z } from "zod";
import { BLOOM_LEVELS, EDGE_STRENGTHS } from "@/db/schema";

/**
 * Shape an extractor proposes for lecturer review. Concepts are identified by a
 * `key` (a slug/label) that edges reference, so the proposal is self-contained
 * before anything is written to the database. Difficulty/Bloom/objective are the
 * AI Content Engine's suggestions — the lecturer edits or accepts them.
 */
export const proposedConceptSchema = z.object({
  key: z.string().min(1).max(160),
  title: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
  module: z.string().max(120).optional(),
  difficulty: z.number().int().min(1).max(5).optional(),
  bloomLevel: z.enum(BLOOM_LEVELS).optional(),
  learningObjective: z.string().max(1000).optional(),
});

export const proposedEdgeSchema = z.object({
  fromKey: z.string().min(1),
  toKey: z.string().min(1),
  strength: z.enum(EDGE_STRENGTHS).default("hard"),
  reason: z.string().max(1000).optional(),
});

export const extractionProposalSchema = z.object({
  concepts: z.array(proposedConceptSchema).max(100),
  edges: z.array(proposedEdgeSchema).max(400),
});

export type ProposedConcept = z.infer<typeof proposedConceptSchema>;
export type ProposedEdge = z.infer<typeof proposedEdgeSchema>;
export type ExtractionProposal = z.infer<typeof extractionProposalSchema>;

export interface ExtractContext {
  courseCode: string;
  courseTitle: string;
}

export interface Extractor {
  readonly id: string; // recorded on the run, e.g. "heuristic" or "claude:claude-opus-4-8"
  extract(
    sourceText: string,
    ctx: ExtractContext,
  ): Promise<ExtractionProposal>;
}
