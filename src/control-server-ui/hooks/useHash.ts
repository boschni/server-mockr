import { useEffect, useState } from "react";

export function useHash(): string {
  const [hash, setHash] = useState(document.location.hash);

  useEffect(() => {
    window.addEventListener(
      "hashchange",
      () => setHash(document.location.hash),
      false
    );
  }, []);

  return hash;
}
