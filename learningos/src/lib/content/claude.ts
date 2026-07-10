import Anthropic from "@anthropic-ai/sdk";
import {
  contentBundleSchema,
  type ContentGenerator,
  type ContentBundle,
  type GenerateContext,
} from "./types";

const MODEL = "claude-opus-4-8";

const SYSTEM = `You are the study-content generator for LearningOS. Given the transcript or notes of a short lecture video about a specific concept, produce study material for students.

Return: a concise "summary" (2-4 sentences); "notes" as clear markdown-style study notes; "flashcards" (front = a prompt/question, back = the answer) covering the key ideas; and a "quiz" of multiple-choice questions, each with 3-5 "options", a 0-based "answerIndex" pointing at the correct option, and a brief "explanation".

Ground everything in the supplied material — do not invent facts not present. You are drafting for a lecturer who will review and edit before publishing to students.`;

const FORMAT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["summary", "notes", "flashcards", "quiz"],
  properties: {
    summary: { type: "string" },
    notes: { type: "string" },
    flashcards: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["front", "back"],
        properties: { front: { type: "string" }, back: { type: "string" } },
      },
    },
    quiz: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["question", "options", "answerIndex", "explanation"],
        properties: {
          question: { type: "string" },
          options: { type: "array", items: { type: "string" } },
          answerIndex: { type: "integer" },
          explanation: { type: ["string", "null"] },
        },
      },
    },
  },
} as const;

export function createClaudeGenerator(apiKey: string): ContentGenerator {
  const client = new Anthropic({ apiKey });
  return {
    id: `claude:${MODEL}`,
    async generate(
      sourceText: string,
      ctx: GenerateContext,
    ): Promise<ContentBundle> {
      const response = await client.messages.create({
        model: MODEL,
        max_tokens: 16000,
        system: SYSTEM,
        output_config: { format: { type: "json_schema", schema: FORMAT_SCHEMA } },
        messages: [
          {
            role: "user",
            content: `Concept: ${ctx.conceptTitle}${
              ctx.conceptDescription ? `\n${ctx.conceptDescription}` : ""
            }\n\nLesson transcript / notes:\n"""\n${sourceText}\n"""`,
          },
        ],
      });
      const text = response.content.find((b) => b.type === "text");
      if (!text || text.type !== "text") {
        throw new Error("Generator returned no structured output");
      }
      const raw = JSON.parse(text.text) as {
        quiz?: { explanation?: string | null }[];
      };
      // Normalise explanation: null -> undefined so the optional field validates.
      for (const q of raw.quiz ?? []) {
        if (q.explanation === null) delete q.explanation;
      }
      return contentBundleSchema.parse(raw);
    },
  };
}
