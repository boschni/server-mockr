import { useCallback, useEffect, useState } from "react";

interface UseFetchResult<T> {
  data?: T;
  error?: any;
  refetch: () => Promise<void>;
}

export function useFetch<T>(
  url: string,
  init?: RequestInit
): UseFetchResult<T> {
  const [response, setResponse] = useState<T>();
  const [error, setError] = useState();

  async function fetchData() {
    try {
      const res = await fetch(url, init);
      const json = await res.json();
      setResponse(json);
    } catch (error) {
      setError(error);
    }
  }

  const refetch = useCallback(fetchData, [url]);

  useEffect(() => {
    fetchData();
  }, [url]);

  return { data: response, error, refetch };
}
