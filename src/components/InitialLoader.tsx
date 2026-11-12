import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLightweightMedia } from "@/hooks/useLightweightMedia";

// Restore the original once-per-tab logo entrance, without tying it to a media
// download. Reduced-motion and repeat visits go straight to the page.
export function InitialLoader({ children }: { children: ReactNode }) {
  const lightweight = useLightweightMedia();
  const [loading, setLoading] = useState(() => {
    try { return !sessionStorage.getItem("apna_initial_loaded"); } catch { return true; }
  });
  const [showContent, setShowContent] = useState(!loading);
  useEffect(() => {
    if (lightweight || !loading) { setLoading(false); setShowContent(true); return; }
    const finish = window.setTimeout(() => {
      setLoading(false);
      try { sessionStorage.setItem("apna_initial_loaded", "true"); } catch { /* Storage can be disabled. */ }
    }, 2500);
    const reveal = window.setTimeout(() => setShowContent(true), 2800);
    return () => { window.clearTimeout(finish); window.clearTimeout(reveal); };
  }, [lightweight, loading]);
  return <>
    <AnimatePresence>
      {loading && !lightweight && <motion.div data-initial-splash initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8, ease: "easeInOut" }} className="fixed inset-0 z-[99999] bg-[#050505] flex items-center justify-center font-sans overflow-hidden" aria-label="Welcome to Apna Coding">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(400px,100vw)] h-[400px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
        <motion.img src="/apna-logo-transparent.png" alt="Apna Coding" className="relative z-10 w-28 h-28 md:w-40 md:h-40 object-contain drop-shadow-2xl" initial={{ opacity: 0, scale: 0.8, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} />
      </motion.div>}
    </AnimatePresence>
    {showContent && <motion.div initial={lightweight ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, ease: "easeOut" }}>{children}</motion.div>}
  </>;
}
