/**
 * Spaced-repetition engine: SM-2 scheduling with graph-weighted review priority.
 * Pure functions with no I/O — the persistence layer (lib/progress) supplies and
 * stores the cards; the UI supplies "now" so the logic stays testable.
 *
 * Self-assessment is a 1-4 scale ("How well did you understand this?"):
 *   1 = blank / couldn't recall   2 = shaky, real effort
 *   3 = solid recall              4 = effortless
 * These map onto SM-2's 0-5 quality below. Grades 1-2 are treated as a lapse.
 */
export const DEFAULT_EASINESS = 2.5;
const MIN_EASINESS = 1.3;

export type Grade = 1 | 2 | 3 | 4;

export interface ReviewCard {
  topicId: string;
  courseId: string;
  repetitions: number; // consecutive successful recalls
  easiness: number; // SM-2 easiness factor
  intervalDays: number; // current scheduling interval
  due: string; // ISO date the card is next due
  lastReviewed: string; // ISO timestamp of last review
  lastGrade: Grade;
  mastered: boolean; // has been recalled successfully at least once
}

/** Map the 1-4 self-assessment onto SM-2's 0-5 quality scale. */
function gradeToQuality(grade: Grade): number {
  return { 1: 1, 2: 3, 3: 4, 4: 5 }[grade];
}

const MS_PER_DAY = 86_400_000;

function addDays(from: Date, days: number): string {
  return new Date(from.getTime() + days * MS_PER_DAY).toISOString();
}

/**
 * Apply a review to a card (or create one on first review) and return the
 * updated card following the SM-2 recurrence.
 */
export function reviewCard(
  prev: ReviewCard | undefined,
  grade: Grade,
  topicId: string,
  courseId: string,
  now: Date = new Date(),
): ReviewCard {
  const quality = gradeToQuality(grade);
  const passed = quality >= 3;

  let easiness = prev?.easiness ?? DEFAULT_EASINESS;
  let repetitions = prev?.repetitions ?? 0;
  let intervalDays: number;

  // Update easiness factor (SM-2 formula), floored at 1.3.
  easiness = Math.max(
    MIN_EASINESS,
    easiness + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)),
  );

  if (!passed) {
    // Lapse: relearn from the start tomorrow.
    repetitions = 0;
    intervalDays = 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) intervalDays = 1;
    else if (repetitions === 2) intervalDays = 6;
    else intervalDays = Math.round((prev?.intervalDays ?? 1) * easiness);
  }

  return {
    topicId,
    courseId,
    repetitions,
    easiness: Number(easiness.toFixed(3)),
    intervalDays,
    due: addDays(now, intervalDays),
    lastReviewed: now.toISOString(),
    lastGrade: grade,
    // Once a topic has been recalled successfully it stays "mastered" for
    // unlocking purposes even if a later review lapses (it just becomes due).
    mastered: prev?.mastered || passed,
  };
}

/** Whole days a card is overdue (>= 0 means due now; negative means not yet). */
export function overdueDays(card: ReviewCard, now: Date = new Date()): number {
  return Math.floor((now.getTime() - new Date(card.due).getTime()) / MS_PER_DAY);
}

export function isDue(card: ReviewCard, now: Date = new Date()): boolean {
  return new Date(card.due).getTime() <= now.getTime();
}

/**
 * Graph-weighted review priority. Overdue-ness is the primary driver; a topic's
 * normalised downstream weight (0-1) boosts it so topics more of the tree
 * depends on resurface sooner. Higher score = review first.
 */
const WEIGHT_BOOST = 1.5;

export function reviewPriority(
  card: ReviewCard,
  graphWeight: number,
  now: Date = new Date(),
): number {
  const overdue = overdueDays(card, now);
  // +1 so a just-due card (overdue 0) still gets its full weight boost.
  return (overdue + 1) * (1 + graphWeight * WEIGHT_BOOST);
}
