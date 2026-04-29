import { useState, useCallback } from "react";
import { apiGet } from "@/lib/api";

interface UseApiQueryResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for API GET requests with loading, error, and retry states.
 * Automatically fetches on mount if `immediate` is true (default).
 */
export function useApiQuery<T>(path: string, immediate = true): UseApiQueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiGet<T>(path);
      setData(result);
    } catch (err: any) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [path]);

  // Auto-fetch on mount
  useState(() => {
    if (immediate) {
      fetchData();
    }
  });

  return { data, loading, error, refetch: fetchData };
}
