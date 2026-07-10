import type { Concept, ConceptEdge } from "@/db/schema";

/**
 * Prerequisite-graph logic for a single course. Pure and isomorphic (no db / no
 * server-only) so it runs in services, server components, tests, and — later —
 * the browser. This is the core of the platform: the same edge set powers
 * unlocking now and mastery/adaptive review later.
 */
export class ConceptGraph {
  readonly concepts: Concept[];
  readonly edges: ConceptEdge[];
  private ids: Set<string>;
  private incoming: Map<string, ConceptEdge[]>;
  private outgoing: Map<string, ConceptEdge[]>;

  constructor(concepts: Concept[], edges: ConceptEdge[]) {
    this.concepts = concepts;
    this.edges = edges;
    this.ids = new Set(concepts.map((c) => c.id));
    this.incoming = new Map(concepts.map((c) => [c.id, []]));
    this.outgoing = new Map(concepts.map((c) => [c.id, []]));
    for (const e of edges) {
      this.incoming.get(e.toConceptId)?.push(e);
      this.outgoing.get(e.fromConceptId)?.push(e);
    }
  }

  has(id: string): boolean {
    return this.ids.has(id);
  }

  /** Direct prerequisites (incoming edges) of a concept. */
  prerequisites(id: string): ConceptEdge[] {
    return this.incoming.get(id) ?? [];
  }

  hardPrerequisites(id: string): ConceptEdge[] {
    return this.prerequisites(id).filter((e) => e.strength === "hard");
  }

  /** Direct dependents (outgoing edges). */
  dependents(id: string): ConceptEdge[] {
    return this.outgoing.get(id) ?? [];
  }

  /** Unlocked when every hard prerequisite is mastered; soft never blocks. */
  isUnlocked(id: string, mastered: ReadonlySet<string>): boolean {
    return this.hardPrerequisites(id).every((e) => mastered.has(e.fromConceptId));
  }

  /**
   * Transitive downstream reach: how many concepts depend (directly or
   * indirectly) on this one. Used as the graph weight that will boost review
   * priority — forgetting a load-bearing concept blocks more of the tree.
   */
  downstreamCount(id: string): number {
    const seen = new Set<string>();
    const stack = this.dependents(id).map((e) => e.toConceptId);
    while (stack.length) {
      const cur = stack.pop()!;
      if (seen.has(cur)) continue;
      seen.add(cur);
      for (const e of this.dependents(cur)) stack.push(e.toConceptId);
    }
    return seen.size;
  }
}

/**
 * Would adding edge from→to introduce a cycle? True if `to` can already reach
 * `from` by following existing edges (so the new edge would close a loop), or if
 * from === to. Runs before inserting an edge to keep the graph a DAG.
 */
export function wouldCreateCycle(
  edges: Pick<ConceptEdge, "fromConceptId" | "toConceptId">[],
  from: string,
  to: string,
): boolean {
  if (from === to) return true;
  const adj = new Map<string, string[]>();
  for (const e of edges) {
    const list = adj.get(e.fromConceptId) ?? [];
    list.push(e.toConceptId);
    adj.set(e.fromConceptId, list);
  }
  // Can we reach `from` starting at `to`? If so, from→to closes a cycle.
  const stack = [to];
  const seen = new Set<string>();
  while (stack.length) {
    const cur = stack.pop()!;
    if (cur === from) return true;
    if (seen.has(cur)) continue;
    seen.add(cur);
    for (const next of adj.get(cur) ?? []) stack.push(next);
  }
  return false;
}
