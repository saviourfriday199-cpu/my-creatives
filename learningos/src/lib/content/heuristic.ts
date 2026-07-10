import type { ContentGenerator, ContentBundle } from "./types";

/**
 * Deterministic, no-network content generator. It shapes a transcript/notes
 * blob into valid summary/notes/flashcards/quiz structures so the pipeline and
 * tests run without an API key. It is intentionally shallow — the Claude
 * generator produces real teaching quality; the lecturer reviews either way.
 */
function sentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export const heuristicGenerator: ContentGenerator = {
  id: "heuristic",
  async generate(sourceText): Promise<ContentBundle> {
    const sents = sentences(sourceText);
    const summary = sents.slice(0, 2).join(" ").slice(0, 4000);
    const notes = sents
      .slice(0, 12)
      .map((s) => `- ${s}`)
      .join("\n")
      .slice(0, 20000);

    // One flashcard per early sentence: prompt with the opening, recall the rest.
    const flashcards = sents.slice(0, 6).map((s, i) => {
      const words = s.split(" ");
      const front = words.slice(0, 6).join(" ");
      return {
        front: `Point ${i + 1}: ${front}…`.slice(0, 500),
        back: s.slice(0, 2000),
      };
    });

    // Simple recall questions with distractors drawn from other sentences.
    const quiz = sents.slice(0, 3).map((s, i) => {
      const distractors = sents
        .filter((_, j) => j !== i)
        .slice(0, 3)
        .map((d) => d.slice(0, 400));
      const options = [s.slice(0, 400), ...distractors];
      return {
        question: `Which statement was made in the lesson (${i + 1})?`,
        options: options.length >= 2 ? options : [s.slice(0, 400), "None of the above"],
        answerIndex: 0,
      };
    });

    return { summary, notes, flashcards, quiz };
  },
};
