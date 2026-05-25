import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function InitialLoader({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // We check sessionStorage so it only runs once per tab session
    const hasLoaded = sessionStorage.getItem('apna_initial_loaded');
    if (hasLoaded) {
      setIsLoading(false);
      setShowContent(true);
      return;
    }

    const duration = 2000; // 2 seconds
    const intervalTime = 20; 
    const steps = duration / intervalTime;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const currentProgress = Math.min(Math.round((currentStep / steps) * 100), 100);
      setProgress(currentProgress);

      if (currentStep >= steps) {
        clearInterval(interval);
        setTimeout(() => {
          setIsLoading(false);
          sessionStorage.setItem('apna_initial_loaded', 'true');
          
          // Show content slightly after loader starts fading out
          setTimeout(() => {
            setShowContent(true);
          }, 300);
        }, 500); // Hold at 100% for 500ms
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-[99999] bg-[#050505] flex flex-col items-center justify-center font-sans overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center">
              <motion.img 
                src="/apna-logo-transparent.png" 
                alt="Apna Coding" 
                className="w-28 h-28 md:w-40 md:h-40 object-contain mb-10 drop-shadow-2xl"
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />

              <div className="flex flex-col items-center gap-5 w-64 md:w-80">
                <div className="text-white text-5xl md:text-6xl font-mono font-bold tracking-widest tabular-nums drop-shadow-lg">
                  {progress}%
                </div>
                
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden relative shadow-inner">
                  <motion.div 
                    className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.1, ease: "linear" }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Render children only when ready, so their internal entrance animations play correctly */}
      {showContent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      )}
    </>
  );
}
