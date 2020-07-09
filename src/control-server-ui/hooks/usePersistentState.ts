import { useCallback, useState } from "react";

export function usePersistentState<S>(
  key: string,
  initialState: S | (() => S)
): [S, (value: S) => void] {
  const [value, setValue] = useState<S>(() => {
    let storedValue;

    try {
      const item = localStorage.getItem(key);

      if (item !== null) {
        storedValue = JSON.parse(item);
      }
    } catch (e) {
      // Noop
    }

    return storedValue ?? initialState;
  });

  const outerSetValue = useCallback((newValue) => {
    localStorage.setItem(key, JSON.stringify(newValue));
    setValue(newValue);
  }, []);

  return [value, outerSetValue];
}
