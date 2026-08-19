import { useCallback, useEffect, useState } from "react";
import { PARKS, type Park } from "@/data/parks";

const PARKS_KEY = "deep-parks-v1";
const SELECTED_KEY = "deep-selected-park-v1";

export const slugify = (name: string) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

function readParks(): Park[] {
  if (typeof window === "undefined") return PARKS;
  try {
    const raw = window.localStorage.getItem(PARKS_KEY);
    if (!raw) return PARKS;
    const parsed = JSON.parse(raw) as Park[];
    return Array.isArray(parsed) && parsed.length ? parsed : PARKS;
  } catch {
    return PARKS;
  }
}

export function useParks() {
  const [parks, setParks] = useState<Park[]>(PARKS);
  const [selected, setSelected] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const list = readParks();
    setParks(list);
    const stored = window.localStorage.getItem(SELECTED_KEY);
    setSelected(stored && list.some((park) => park.id === stored) ? stored : null);
    setHydrated(true);
  }, []);

  const persist = useCallback((list: Park[]) => {
    setParks(list);
    window.localStorage.setItem(PARKS_KEY, JSON.stringify(list));
  }, []);

  const select = useCallback((id: string | null) => {
    setSelected(id);
    if (id) window.localStorage.setItem(SELECTED_KEY, id);
    else window.localStorage.removeItem(SELECTED_KEY);
  }, []);

  const addPark = useCallback(
    (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return null;
      const id = slugify(trimmed) || `park-${Date.now()}`;
      const list = readParks();
      if (list.some((park) => park.id === id)) return id;
      persist([...list, { id, name: trimmed }]);
      return id;
    },
    [persist],
  );

  const removePark = useCallback(
    (id: string) => {
      const list = readParks().filter((park) => park.id !== id);
      persist(list.length ? list : PARKS);
      if (selected === id) select(null);
    },
    [persist, select, selected],
  );

  const nameFor = useCallback(
    (id: string) => parks.find((park) => park.id === id)?.name ?? id,
    [parks],
  );

  return { parks, selected, hydrated, select, addPark, removePark, nameFor };
}
