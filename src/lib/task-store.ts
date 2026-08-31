import { useCallback, useEffect, useState } from "react";
import { CATEGORIES } from "@/data/tasks";

const storageKey = (parkId: string) => `deep-maintenance-state-v3::${parkId}`;

export type Completion = { at: string; by: string };
export type Priority = "low" | "medium" | "high";
export const PRIORITY_ORDER: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
export const DEFAULT_PRIORITY: Priority = "medium";

export type CrewNote = {
  id: string;
  date: string; // YYYY-MM-DD
  text: string;
  by: string; // Crew member name
  at: string; // ISO timestamp
  isPinned?: boolean | undefined; // Pinned note visible across all dates for this park
  photo?: string | undefined; // Base64 image data URL
  photoName?: string | undefined;
};

export type StoreState = {
  /** Master task list, grouped by category. Fully editable on the Task Library page. */
  library: Record<string, string[]>;
  /** Extra tasks pinned to a specific calendar day (YYYY-MM-DD). */
  schedule: Record<string, string[]>;
  /** Completions keyed by `${date}::${task}`. */
  completed: Record<string, Completion>;
  /** Priority per task label. */
  priorities: Record<string, Priority>;
  /** Shift notes & passdown log for this park */
  notes: CrewNote[];
  crew: string;
};

export const defaultLibrary = (parkId?: string): Record<string, string[]> => {
  if (parkId && parkId !== "southford") {
    return Object.fromEntries(CATEGORIES.map((category) => [category.id, []]));
  }
  return Object.fromEntries(CATEGORIES.map((category) => [category.id, [...category.tasks]]));
};

const EMPTY: StoreState = {
  library: {},
  schedule: {},
  completed: {},
  priorities: {},
  notes: [],
  crew: "",
};

export const dateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
export const todayKey = () => dateKey(new Date());
export const completionKey = (date: string, task: string) => `${date}::${task}`;

function read(parkId: string): StoreState {
  const fallbackLibrary = defaultLibrary(parkId);
  if (typeof window === "undefined") return { ...EMPTY, library: fallbackLibrary };
  try {
    const rawV3 = window.localStorage.getItem(storageKey(parkId));
    if (rawV3) {
      const parsed = JSON.parse(rawV3) as Partial<StoreState>;
      const library = { ...(parsed.library ?? fallbackLibrary) };
      delete library["daily"];
      return {
        ...EMPTY,
        ...parsed,
        library,
        notes: Array.isArray(parsed.notes) ? parsed.notes : [],
      };
    }

    if (parkId === "southford") {
      const rawV2 = window.localStorage.getItem(`deep-maintenance-state-v2::southford`);
      if (rawV2) {
        const parsed = JSON.parse(rawV2) as Partial<StoreState>;
        const library = { ...(parsed.library ?? defaultLibrary("southford")) };
        delete library["daily"];
        return {
          ...EMPTY,
          ...parsed,
          library,
          notes: Array.isArray(parsed.notes) ? parsed.notes : [],
        };
      }
      return { ...EMPTY, library: defaultLibrary("southford"), notes: [] };
    }

    // For all non-Southford parks (including Putnam), start with a clean empty library
    window.localStorage.removeItem(`deep-maintenance-state-v2::${parkId}`);
    return { ...EMPTY, library: defaultLibrary(parkId), notes: [] };
  } catch {
    return { ...EMPTY, library: fallbackLibrary, notes: [] };
  }
}

export function useTaskStore(parkId: string) {
  const [state, setState] = useState<StoreState>(EMPTY);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(false);
    setState(read(parkId));
    setHydrated(true);
  }, [parkId]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(storageKey(parkId), JSON.stringify(state));
  }, [state, hydrated, parkId]);

  const toggle = useCallback((date: string, task: string) => {
    setState((prev) => {
      const key = completionKey(date, task);
      const completed = { ...prev.completed };
      if (completed[key]) {
        delete completed[key];
      } else {
        const crewName = prev.crew.trim();
        if (!crewName) return prev;
        completed[key] = { at: new Date().toISOString(), by: crewName };
      }
      return { ...prev, completed };
    });
  }, []);

  const clearDay = useCallback((date: string) => {
    setState((prev) => ({
      ...prev,
      completed: Object.fromEntries(
        Object.entries(prev.completed).filter(([key]) => !key.startsWith(`${date}::`)),
      ),
    }));
  }, []);

  /** Pin a task to a specific day. */
  const scheduleTask = useCallback((date: string, task: string, priority?: Priority) => {
    const value = task.trim();
    if (!value) return;
    setState((prev) => {
      const existing = prev.schedule[date] ?? [];
      if (existing.includes(value)) return prev;
      return {
        ...prev,
        schedule: { ...prev.schedule, [date]: [...existing, value] },
        priorities: priority ? { ...prev.priorities, [value]: priority } : prev.priorities,
      };
    });
  }, []);

  const unscheduleTask = useCallback((date: string, task: string) => {
    setState((prev) => {
      const completed = { ...prev.completed };
      delete completed[completionKey(date, task)];
      return {
        ...prev,
        completed,
        schedule: {
          ...prev.schedule,
          [date]: (prev.schedule[date] ?? []).filter((item) => item !== task),
        },
      };
    });
  }, []);

  const setPriority = useCallback((task: string, priority: Priority) => {
    setState((prev) => ({ ...prev, priorities: { ...prev.priorities, [task]: priority } }));
  }, []);

  const priorityOf = useCallback(
    (task: string): Priority => state.priorities[task] ?? DEFAULT_PRIORITY,
    [state.priorities],
  );

  const setCrew = useCallback((crew: string) => setState((prev) => ({ ...prev, crew })), []);

  // --- Crew Shift Notes & Photo Log ----------------------------------------

  const addNote = useCallback(
    (
      date: string,
      text: string,
      options?: {
        isPinned?: boolean | undefined;
        photo?: string | undefined;
        photoName?: string | undefined;
      },
    ) => {
      const noteText = text.trim();
      const crewName = state.crew.trim();
      if (!noteText && !options?.photo) return null;
      if (!crewName) return null;

      const newNote: CrewNote = {
        id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        date,
        text: noteText,
        by: crewName,
        at: new Date().toISOString(),
        isPinned: Boolean(options?.isPinned),
        photo: options?.photo,
        photoName: options?.photoName,
      };

      setState((prev) => ({
        ...prev,
        notes: [newNote, ...(prev.notes ?? [])],
      }));

      return newNote;
    },
    [state.crew],
  );

  const deleteNote = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      notes: (prev.notes ?? []).filter((note) => note.id !== id),
    }));
  }, []);

  const togglePinNote = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      notes: (prev.notes ?? []).map((note) =>
        note.id === id ? { ...note, isPinned: !note.isPinned } : note,
      ),
    }));
  }, []);

  const notesForDay = useCallback(
    (date: string) => {
      const allNotes = state.notes ?? [];
      const pinned = allNotes.filter((n) => n.isPinned);
      const daySpecific = allNotes.filter((n) => n.date === date && !n.isPinned);
      return {
        pinned,
        daySpecific,
        allForDay: [...pinned, ...daySpecific],
      };
    },
    [state.notes],
  );

  const allPhotos = useCallback(() => {
    return (state.notes ?? [])
      .filter((n) => Boolean(n.photo))
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  }, [state.notes]);

  // --- Library editing -----------------------------------------------------

  const libraryFor = useCallback(
    (categoryId: string) => state.library[categoryId] ?? [],
    [state.library],
  );

  const addLibraryTask = useCallback((categoryId: string, task: string, priority?: Priority) => {
    const value = task.trim();
    if (!value) return;
    setState((prev) => {
      const existing = prev.library[categoryId] ?? [];
      if (existing.includes(value)) return prev;
      return {
        ...prev,
        library: { ...prev.library, [categoryId]: [...existing, value] },
        priorities: priority ? { ...prev.priorities, [value]: priority } : prev.priorities,
      };
    });
  }, []);

  const removeLibraryTask = useCallback((categoryId: string, task: string) => {
    setState((prev) => ({
      ...prev,
      library: {
        ...prev.library,
        [categoryId]: (prev.library[categoryId] ?? []).filter((item) => item !== task),
      },
    }));
  }, []);

  const renameLibraryTask = useCallback((categoryId: string, task: string, next: string) => {
    const value = next.trim();
    if (!value || value === task) return;
    setState((prev) => ({
      ...prev,
      library: {
        ...prev.library,
        [categoryId]: (prev.library[categoryId] ?? []).map((item) =>
          item === task ? value : item,
        ),
      },
      priorities: prev.priorities[task]
        ? { ...prev.priorities, [value]: prev.priorities[task]! }
        : prev.priorities,
    }));
  }, []);

  const resetLibrary = useCallback(() => {
    setState((prev) => ({ ...prev, library: defaultLibrary(parkId) }));
  }, [parkId]);

  // --- Day view ------------------------------------------------------------

  /** Tasks show on the day they are scheduled. */
  const tasksForDay = useCallback(
    (date: string) => {
      const pinned = state.schedule[date] ?? [];
      const seen = new Set<string>();
      const all = pinned.filter((task) => {
        if (seen.has(task)) return false;
        seen.add(task);
        return true;
      });
      return all.sort(
        (a, b) =>
          PRIORITY_ORDER[state.priorities[a] ?? DEFAULT_PRIORITY] -
          PRIORITY_ORDER[state.priorities[b] ?? DEFAULT_PRIORITY],
      );
    },
    [state.schedule, state.priorities],
  );

  const dayStats = useCallback(
    (date: string) => {
      const all = tasksForDay(date);
      const done = all.filter((task) => state.completed[completionKey(date, task)]).length;
      return { total: all.length, done };
    },
    [tasksForDay, state.completed],
  );

  return {
    state,
    hydrated,
    toggle,
    clearDay,
    scheduleTask,
    unscheduleTask,
    setPriority,
    priorityOf,
    setCrew,
    addNote,
    deleteNote,
    togglePinNote,
    notesForDay,
    allPhotos,
    libraryFor,
    addLibraryTask,
    removeLibraryTask,
    renameLibraryTask,
    resetLibrary,
    tasksForDay,
    dayStats,
  };
}
