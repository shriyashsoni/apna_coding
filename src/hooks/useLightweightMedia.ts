import { useEffect, useState } from "react";

// Keep the original background motion on phones and desktop. Only explicit
// reduced-motion or data-saving preferences select the static alternative.
export function useLightweightMedia() {
  const [lightweight, setLightweight] = useState(() =>
    typeof window === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    !!(navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData
  );
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setLightweight(query.matches || !!(navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return lightweight;
}
