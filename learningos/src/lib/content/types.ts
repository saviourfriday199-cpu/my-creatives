import { z } from "zod";

/** Structured teaching content generated from a lesson transcript/notes. */
export const flashcardSchema = z.object({
  front: z.string().min(1).max(500),
  back: z.string().min(1).max(2000),
});

export const quizQuestionSchema = z.object({
  question: z.string().min(1).max(600),
  options: z.array(z.string().min(1).max(400)).min(2).max(6),
  answerIndex: z.number().int().min(0),
  explanation: z.string().max(1000).optional(),
});

export const contentBundleSchema = z.object({
  summary: z.string().max(4000),
  notes: z.string().max(20000),
  flashcards: z.array(flashcardSchema).max(50),
  quiz: z.array(quizQuestionSchema).max(30),
});

export type Flashcard = z.infer<typeof flashcardSchema>;
export type QuizQuestion = z.infer<typeof quizQuestionSchema>;
export type ContentBundle = z.infer<typeof contentBundleSchema>;

export interface GenerateContext {
  conceptTitle: string;
  conceptDescription?: string | null;
}

export interface ContentGenerator {
  readonly id: string; // "heuristic" or "claude:<model>"
  generate(
    sourceText: string,
    ctx: GenerateContext,
  ): Promise<ContentBundle>;
}
