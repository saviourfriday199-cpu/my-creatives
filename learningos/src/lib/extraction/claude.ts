import Anthropic from "@anthropic-ai/sdk";
import {
  extractionProposalSchema,
  type Extractor,
  type ExtractionProposal,
  type ExtractContext,
} from "./types";

const MODEL = "claude-opus-4-8";

const SYSTEM = `You are the content-extraction engine for LearningOS, a platform that turns university curricula into a prerequisite knowledge graph.

From the provided course material (an outline, syllabus, or lecture notes), extract a set of teachable "concepts" (micro-topics — one idea each) and the prerequisite relationships between them.

For each concept provide: a short stable "key" (kebab-case slug, unique), a concise "title", an optional plain-language "description", the "module"/unit it belongs to if discernible, an estimated "difficulty" from 1 (easy) to 5 (hard), a Bloom's taxonomy level (one of: remember, understand, apply, analyze, evaluate, create), and a one-sentence "learningObjective" stated as something the student can do.

For each prerequisite, output an edge from the prerequisite concept's key to the dependent concept's key, with "strength" "hard" (must be mastered first) or "soft" (recommended), and a short "reason". The edges must form a directed acyclic graph — never create a cycle.

You are drafting for a human lecturer who will review and edit everything before it is published. Prefer precision over recall; only include concepts and links clearly supported by the material.`;

/** JSON Schema for output_config.format. Optional fields use nullable types
 *  (strict structured-output friendly); nulls are normalised to undefined below. */
const FORMAT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["concepts", "edges"],
  properties: {
    concepts: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["key", "title", "description", "module", "difficulty", "bloomLevel", "learningObjective"],
        properties: {
          key: { type: "string" },
          title: { type: "string" },
          description: { type: ["string", "null"] },
          module: { type: ["string", "null"] },
          difficulty: { type: ["integer", "null"] },
          bloomLevel: { type: ["string", "null"] },
          learningObjective: { type: ["string", "null"] },
        },
      },
    },
    edges: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["fromKey", "toKey", "strength", "reason"],
        properties: {
          fromKey: { type: "string" },
          toKey: { type: "string" },
          strength: { type: "string", enum: ["hard", "soft"] },
          reason: { type: ["string", "null"] },
        },
      },
    },
  },
} as const;

const nullToUndef = <T extends Record<string, unknown>>(o: T) =>
  Object.fromEntries(
    Object.entries(o).filter(([, v]) => v !== null),
  ) as Record<string, unknown>;

/**
 * Claude-backed extractor. Only constructed when ANTHROPIC_API_KEY is set (see
 * factory in ./index). Uses structured JSON output so the response validates
 * against the proposal schema; anything malformed is caught and surfaced.
 */
export function createClaudeExtractor(apiKey: string): Extractor {
  const client = new Anthropic({ apiKey });
  return {
    id: `claude:${MODEL}`,
    async extract(
      sourceText: string,
      ctx: ExtractContext,
    ): Promise<ExtractionProposal> {
      const response = await client.messages.create({
        model: MODEL,
        max_tokens: 16000,
        system: SYSTEM,
        output_config: { format: { type: "json_schema", schema: FORMAT_SCHEMA } },
        messages: [
          {
            role: "user",
            content: `Course: ${ctx.courseCode} — ${ctx.courseTitle}\n\nCourse material:\n"""\n${sourceText}\n"""`,
          },
        ],
      });

      const text = response.content.find((b) => b.type === "text");
      if (!text || text.type !== "text") {
        throw new Error("Extractor returned no structured output");
      }
      const raw = JSON.parse(text.text) as {
        concepts: Record<string, unknown>[];
        edges: Record<string, unknown>[];
      };
      // Drop nulls so optional fields validate, then enforce the proposal schema.
      return extractionProposalSchema.parse({
        concepts: (raw.concepts ?? []).map(nullToUndef),
        edges: (raw.edges ?? []).map(nullToUndef),
      });
    },
  };
}
