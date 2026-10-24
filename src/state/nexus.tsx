import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AccentKey, AppState, Member, MatchRecord } from '../domain/types';
import { DEFAULT_MEMBERS, DEFAULT_TEAM, WIDGETS } from '../data/squad';
import matchesJson from '../data/matches.json';

const STORAGE_KEY = 'nexus-ai:state:v1';

function defaultState(): AppState {
  return {
    schemaVersion: 1,
    teamName: DEFAULT_TEAM.name,
    slogan: DEFAULT_TEAM.slogan,
    accent: 'cyan',
    members: DEFAULT_MEMBERS.map((m) => ({ ...m })),
    matches: matchesJson as MatchRecord[],
    widgets: { order: WIDGETS.map((w) => w.id), hidden: [] },
  };
}

function load(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as Partial<AppState>;
    if (parsed.schemaVersion !== 1) return defaultState();
    const base = defaultState();
    return {
      ...base,
      ...parsed,
      members: parsed.members?.length === 5 ? parsed.members : base.members,
      matches: parsed.matches?.length ? parsed.matches : base.matches,
      widgets: {
        order: parsed.widgets?.order?.length ? parsed.widgets.order : base.widgets.order,
        hidden: parsed.widgets?.hidden ?? [],
      },
    };
  } catch {
    return defaultState();
  }
}

interface NexusContextValue {
  state: AppState;
  accentClass: string;
  setState: (patch: Partial<AppState>) => void;
  updateMember: (id: string, patch: Partial<Member>) => void;
  addMatch: (record: MatchRecord) => void;
  removeMatch: (id: string) => void;
  setAccent: (accent: AccentKey) => void;
  toggleWidget: (id: string) => void;
  moveWidget: (id: string, dir: -1 | 1) => void;
  reset: () => void;
  storageBlocked: boolean;
}

const NexusContext = createContext<NexusContextValue | null>(null);

export function NexusProvider({ children }: { children: ReactNode }) {
  const [state, setInternal] = useState<AppState>(load);
  const [storageBlocked, setStorageBlocked] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      setStorageBlocked(true);
    }
  }, [state, tick]);

  const setState = useCallback((patch: Partial<AppState>) => {
    setInternal((prev) => ({ ...prev, ...patch }));
  }, []);

  const updateMember = useCallback((id: string, patch: Partial<Member>) => {
    setInternal((prev) => ({ ...prev, members: prev.members.map((m) => (m.id === id ? { ...m, ...patch } : m)) }));
  }, []);

  const addMatch = useCallback((record: MatchRecord) => {
    setInternal((prev) => ({ ...prev, matches: [record, ...prev.matches] }));
  }, []);

  const removeMatch = useCallback((id: string) => {
    setInternal((prev) => ({ ...prev, matches: prev.matches.filter((m) => m.id !== id) }));
  }, []);

  const setAccent = useCallback((accent: AccentKey) => setState({ accent }), [setState]);

  const toggleWidget = useCallback((id: string) => {
    setInternal((prev) => {
      const hidden = prev.widgets.hidden.includes(id)
        ? prev.widgets.hidden.filter((x) => x !== id)
        : [...prev.widgets.hidden, id];
      return { ...prev, widgets: { ...prev.widgets, hidden } };
    });
  }, []);

  const moveWidget = useCallback((id: string, dir: -1 | 1) => {
    setInternal((prev) => {
      const order = [...prev.widgets.order];
      const i = order.indexOf(id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= order.length) return prev;
      [order[i], order[j]] = [order[j], order[i]];
      return { ...prev, widgets: { ...prev.widgets, order } };
    });
  }, []);

  const reset = useCallback(() => {
    const fresh = defaultState();
    setInternal(fresh);
    setTick((t) => t + 1);
  }, []);

  const value = useMemo<NexusContextValue>(
    () => ({
      state,
      accentClass: `accent-${state.accent}`,
      setState,
      updateMember,
      addMatch,
      removeMatch,
      setAccent,
      toggleWidget,
      moveWidget,
      reset,
      storageBlocked,
    }),
    [state, setState, updateMember, addMatch, removeMatch, setAccent, toggleWidget, moveWidget, reset, storageBlocked],
  );

  return <NexusContext.Provider value={value}>{children}</NexusContext.Provider>;
}

export function useNexus(): NexusContextValue {
  const ctx = useContext(NexusContext);
  if (!ctx) throw new Error('useNexus 必须在 NexusProvider 内使用');
  return ctx;
}
