import { useEffect, useRef, useState } from "react";

/**
 * Persist a form state object to localStorage so users don't lose progress.
 * - Loads any saved draft on mount.
 * - Saves (debounced) on every change.
 * - Returns `hasDraft` so the UI can show a "rascunho restaurado" banner.
 */
export function useFormDraft<T extends Record<string, unknown>>(
  key: string,
  initial: T,
  options: { debounceMs?: number } = {},
): {
  value: T;
  setValue: React.Dispatch<React.SetStateAction<T>>;
  hasDraft: boolean;
  clearDraft: () => void;
} {
  const storageKey = `draft:${key}`;
  const { debounceMs = 600 } = options;

  const [value, setValue] = useState<T>(initial);
  const [hasDraft, setHasDraft] = useState(false);
  const loaded = useRef(false);

  // Load on mount
  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(storageKey) : null;
      if (raw) {
        const parsed = JSON.parse(raw) as T;
        setValue({ ...initial, ...parsed });
        setHasDraft(true);
      }
    } catch {
      /* ignore */
    }
    loaded.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  // Save (debounced)
  useEffect(() => {
    if (!loaded.current) return;
    const t = setTimeout(() => {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(value));
      } catch {
        /* ignore */
      }
    }, debounceMs);
    return () => clearTimeout(t);
  }, [value, storageKey, debounceMs]);

  function clearDraft() {
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      /* ignore */
    }
    setHasDraft(false);
  }

  return { value, setValue, hasDraft, clearDraft };
}