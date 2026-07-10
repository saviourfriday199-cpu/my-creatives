import type { Extractor, ExtractionProposal, ProposedConcept, ProposedEdge } from "./types";

/**
 * Deterministic, dependency-free extractor. Parses a pasted outline/syllabus
 * into concepts and a sensible default prerequisite chain, with no network
 * call — so the workflow is fully usable (and testable) without an API key.
 * It intentionally does NOT invent difficulty/Bloom/objectives; a lecturer or
 * the Claude extractor fills those. The lecturer reviews everything either way.
 */
const HEADER_RE = /^(module|unit|week|section|part|chapter|topic area)\b/i;

function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** Strip leading bullets, numbering and week markers from a line. */
function clean(line: string): string {
  return line
    .replace(/^\s*[-*•●·]\s+/, "")
    .replace(/^\s*\d+[.)]\s+/, "")
    .replace(/^\s*(week|module|unit|topic)\s*\d+\s*[:.-]\s*/i, "")
    .trim();
}

export const heuristicExtractor: Extractor = {
  id: "heuristic",
  async extract(sourceText: string): Promise<ExtractionProposal> {
    const lines = sourceText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const concepts: ProposedConcept[] = [];
    const edges: ProposedEdge[] = [];
    const usedKeys = new Set<string>();

    let currentModule: string | undefined;
    let prevKeyInModule: string | undefined;

    const isHeader = (line: string) =>
      HEADER_RE.test(line) || (line.endsWith(":") && line.split(/\s+/).length <= 6);

    for (const raw of lines) {
      const text = clean(raw);
      if (!text) continue;

      if (isHeader(raw)) {
        currentModule = text.replace(/:$/, "").trim() || currentModule;
        prevKeyInModule = undefined;
        continue;
      }

      // Derive a unique key from the title.
      let key = slug(text) || `concept-${concepts.length + 1}`;
      let n = 2;
      while (usedKeys.has(key)) key = `${slug(text)}-${n++}`;
      usedKeys.add(key);

      concepts.push({
        key,
        title: text.slice(0, 200),
        module: currentModule,
      });

      // Default prerequisite: each concept depends on the previous one in its
      // module — a linear chain the lecturer can prune or extend.
      if (prevKeyInModule) {
        edges.push({
          fromKey: prevKeyInModule,
          toKey: key,
          strength: "hard",
          reason: "Sequential order within the module (auto-suggested).",
        });
      }
      prevKeyInModule = key;
    }

    return { concepts, edges };
  },
};
