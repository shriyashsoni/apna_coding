import { useEffect, useState } from "react";

// Prefer a fast, static page on phones, reduced-motion devices and data-saving
// connections. Re-evaluate on resize so desktop animations remain available.
export function useLightweightMedia() {
  const [lightweight, setLightweight] = useState(true);
  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px), (prefers-reduced-motion: reduce)");
    const update = () => setLightweight(query.matches || !!(navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return lightweight;
}
