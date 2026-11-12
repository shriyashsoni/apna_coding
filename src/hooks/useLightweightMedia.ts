import { useEffect, useState } from "react";

// Keep the original background motion on phones and desktop. Only an explicit
// reduced-motion accessibility preference selects the static alternative.
export function useLightweightMedia() {
  const [lightweight, setLightweight] = useState(() =>
    typeof window === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setLightweight(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return lightweight;
}
