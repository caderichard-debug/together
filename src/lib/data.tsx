import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { seedSeasons, type Season } from '../data';

const API_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');
const CACHE_KEY = 'together:seasons:v2';

type Source = 'bundled' | 'cache' | 'live';

interface DataValue {
  seasons: Season[];
  source: Source;
  updatedAt: string | null;
  refreshing: boolean;
  error: string | null;
  refresh: () => Promise<boolean>;
}

const DataContext = createContext<DataValue | null>(null);

interface Payload {
  seasons: Season[];
  generatedAt: string;
}

async function requestSeasons(): Promise<Payload> {
  const res = await fetch(`${API_URL}/api/seasons`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as Payload;
}

/**
 * Serves season data: bundled seed first, then the last cached server
 * response, then live data from EXPO_PUBLIC_API_URL when it's set.
 */
export function DataProvider({ children }: { children: ReactNode }) {
  const [seasons, setSeasons] = useState<Season[]>(seedSeasons);
  const [source, setSource] = useState<Source>('bundled');
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyLive = useCallback((body: Payload) => {
    setSeasons(body.seasons);
    setSource('live');
    setUpdatedAt(body.generatedAt);
    setError(null);
    AsyncStorage.setItem(CACHE_KEY, JSON.stringify(body)).catch(() => {});
  }, []);
  const applyError = useCallback((err: unknown) => {
    setError(err instanceof Error ? err.message : String(err));
  }, []);

  /** Pull-to-refresh. Resolves true when live data loaded. */
  const refresh = useCallback(async (): Promise<boolean> => {
    if (!API_URL) return false;
    setRefreshing(true);
    try {
      applyLive(await requestSeasons());
      return true;
    } catch (err) {
      applyError(err);
      return false;
    } finally {
      setRefreshing(false);
    }
  }, [applyLive, applyError]);

  useEffect(() => {
    let live = false;
    AsyncStorage.getItem(CACHE_KEY)
      .then((raw) => {
        if (!raw || live) return;
        const body = JSON.parse(raw) as Payload;
        setSeasons(body.seasons);
        setSource('cache');
        setUpdatedAt(body.generatedAt);
      })
      .catch(() => {});
    if (API_URL) {
      requestSeasons().then((body) => {
        live = true;
        applyLive(body);
      }, applyError);
    }
  }, [applyLive, applyError]);

  const value = useMemo(
    () => ({ seasons, source, updatedAt, refreshing, error, refresh }),
    [seasons, source, updatedAt, refreshing, error, refresh],
  );
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside DataProvider');
  return ctx;
}

export const apiConfigured = Boolean(API_URL);
