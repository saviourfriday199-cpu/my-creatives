import type { Topic, Dependency } from "./types";

/**
 * Prerequisite-graph logic. Pure and isomorphic (no server/browser deps) so the
 * same functions drive server-rendered lock states and client-side review math.
 */
export class TopicGraph {
  readonly topics: Topic[];
  readonly deps: Dependency[];
  private byId: Map<string, Topic>;
  /** incoming[to] = edges whose `to` is this topic (its prerequisites) */
  private incoming: Map<string, Dependency[]>;
  /** outgoing[from] = edges whose `from` is this topic (its dependents) */
  private outgoing: Map<string, Dependency[]>;

  constructor(topics: Topic[], deps: Dependency[]) {
    this.topics = topics;
    this.deps = deps;
    this.byId = new Map(topics.map((t) => [t.id, t]));
    this.incoming = new Map(topics.map((t) => [t.id, []]));
    this.outgoing = new Map(topics.map((t) => [t.id, []]));
    for (const d of deps) {
      this.incoming.get(d.to)?.push(d);
      this.outgoing.get(d.from)?.push(d);
    }
  }

  get(id: string): Topic | undefined {
    return this.byId.get(id);
  }

  /** Direct prerequisites of a topic (the `from` side of its incoming edges). */
  prerequisites(id: string): Dependency[] {
    return this.incoming.get(id) ?? [];
  }

  hardPrerequisites(id: string): Dependency[] {
    return this.prerequisites(id).filter((d) => d.strength === "hard");
  }

  softPrerequisites(id: string): Dependency[] {
    return this.prerequisites(id).filter((d) => d.strength === "soft");
  }

  /** Direct dependents: topics that list this one as a prerequisite. */
  dependents(id: string): Dependency[] {
    return this.outgoing.get(id) ?? [];
  }

  /**
   * A topic is unlocked when every HARD prerequisite is mastered. Soft
   * prerequisites never block — they only surface an advisory warning.
   */
  isUnlocked(id: string, mastered: ReadonlySet<string>): boolean {
    return this.hardPrerequisites(id).every((d) => mastered.has(d.from));
  }

  /** Soft prerequisites that are not yet mastered (shown as a gentle warning). */
  softWarnings(id: string, mastered: ReadonlySet<string>): Dependency[] {
    return this.softPrerequisites(id).filter((d) => !mastered.has(d.from));
  }

  /** Hard prerequisites still missing — the reason a topic is locked. */
  missingHard(id: string, mastered: ReadonlySet<string>): Dependency[] {
    return this.hardPrerequisites(id).filter((d) => !mastered.has(d.from));
  }

  /**
   * Number of topics that transitively depend on this one: everything reachable
   * by following outgoing (from -> to) edges. This is the graph weight used to
   * boost review priority — forgetting a high-weight topic blocks more of the
   * tree. Counts both hard and soft downstream links.
   */
  downstreamDependentCount(id: string): number {
    const seen = new Set<string>();
    const stack = [...this.dependents(id).map((d) => d.to)];
    while (stack.length) {
      const cur = stack.pop()!;
      if (seen.has(cur)) continue;
      seen.add(cur);
      for (const d of this.dependents(cur)) stack.push(d.to);
    }
    return seen.size;
  }

  /** Direct out-degree — immediate dependents only. */
  directDependentCount(id: string): number {
    return this.dependents(id).length;
  }

  /**
   * Normalised graph weight in [0, 1]: this topic's downstream reach relative to
   * the most-depended-on topic in the course. Multiplies review priority.
   */
  graphWeights(): Map<string, number> {
    const raw = new Map(
      this.topics.map((t) => [t.id, this.downstreamDependentCount(t.id)]),
    );
    const max = Math.max(1, ...raw.values());
    return new Map([...raw].map(([id, v]) => [id, v / max]));
  }
}

/** Convenience factory. */
export function buildGraph(topics: Topic[], deps: Dependency[]): TopicGraph {
  return new TopicGraph(topics, deps);
}
