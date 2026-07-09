"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Grade, ReviewCard } from "./sr";
import { reviewCard } from "./sr";

/**
 * Per-user progress persistence for the MVP. Everything lives in localStorage —
 * no backend, no auth — but the shape mirrors what a `user_review_state` table
 * would hold, so this is a thin swap away from server persistence later.
 */
const STORAGE_KEY = "threadline.progress.v1";

interface ProgressState {
  cards: Record<string, ReviewCard>;
  /** ISO dates (YYYY-MM-DD) on which at least one review happened — for streaks. */
  reviewDays: string[];
}

const EMPTY: ProgressState = { cards: {}, reviewDays: [] };

interface ProgressContextValue {
  hydrated: boolean;
  cards: Record<string, ReviewCard>;
  masteredIds: Set<string>;
  recordReview: (topicId: string, courseId: string, grade: Grade) => void;
  resetAll: () => void;
  streak: number;
  reviewDays: string[];
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Consecutive-day streak counting back from today (or yesterday). */
function computeStreak(days: string[]): number {
  if (!days.length) return 0;
  const set = new Set(days);
  const cursor = new Date();
  // If nothing today, the streak can still be alive through yesterday.
  if (!set.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (set.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ProgressState>(EMPTY);
  const [hydrated, setHydrated] = useState(false);
  const loaded = useRef(false);

  // Load once on mount (client only).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<ProgressState>;
        setState({
          cards: parsed.cards ?? {},
          reviewDays: parsed.reviewDays ?? [],
        });
      }
    } catch {
      /* ignore corrupt storage */
    }
    loaded.current = true;
    setHydrated(true);
  }, []);

  // Persist on change (after initial load).
  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage full / disabled — degrade silently */
    }
  }, [state]);

  const recordReview = useCallback(
    (topicId: string, courseId: string, grade: Grade) => {
      setState((prev) => {
        const now = new Date();
        const nextCard = reviewCard(
          prev.cards[topicId],
          grade,
          topicId,
          courseId,
          now,
        );
        const today = dayKey(now);
        const reviewDays = prev.reviewDays.includes(today)
          ? prev.reviewDays
          : [...prev.reviewDays, today];
        return {
          cards: { ...prev.cards, [topicId]: nextCard },
          reviewDays,
        };
      });
    },
    [],
  );

  const resetAll = useCallback(() => setState(EMPTY), []);

  const masteredIds = useMemo(() => {
    const s = new Set<string>();
    for (const card of Object.values(state.cards)) {
      if (card.mastered) s.add(card.topicId);
    }
    return s;
  }, [state.cards]);

  const streak = useMemo(
    () => computeStreak(state.reviewDays),
    [state.reviewDays],
  );

  const value: ProgressContextValue = {
    hydrated,
    cards: state.cards,
    masteredIds,
    recordReview,
    resetAll,
    streak,
    reviewDays: state.reviewDays,
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used within a ProgressProvider");
  return ctx;
}
