import { Link, useLocation } from "react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WalletConnect } from "@/components/WalletConnect";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const menuButton = useRef<HTMLButtonElement>(null);
  useEffect(() => { setIsOpen(false); }, [location.pathname]);
  useEffect(() => {
    if (!isOpen) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setIsOpen(false); menuButton.current?.focus(); }
    };
    const resize = () => { if (window.innerWidth >= 1280) setIsOpen(false); };
    document.addEventListener("keydown", close);
    window.addEventListener("resize", resize);
    return () => { document.removeEventListener("keydown", close); window.removeEventListener("resize", resize); };
  }, [isOpen]);

  const navLinks = [
    { name: "HOME", path: "/" },
    { name: "EVENTS", path: "/events" },
    { name: "HACKATHONS", path: "/hackathons" },
    { name: "JOBS", path: "/jobs" },
    { name: "PRODUCTS", path: "/products" },
    { name: "NEWS", path: "/news" },
  ];

  return (
    <nav aria-label="Main navigation" className="fixed top-0 inset-x-0 z-50 w-full px-4 sm:px-6 xl:px-10 py-4 xl:py-6 flex justify-between items-center bg-black/90 backdrop-blur-md border-b border-white/10 pointer-events-none">
      
      {/* Left: Original Logo */}
      <div className="pointer-events-auto">
        <Link to="/" className="flex items-center gap-3 group">
          <img src="/apna-logo-transparent.png" alt="Apna Coding Logo" className="h-10 w-auto object-contain drop-shadow-md" />
          <span className="font-semibold text-[17px] tracking-tight text-white flex items-start gap-0.5">
            Apna Coding<sup className="text-[10px] mt-1">TM</sup>
          </span>
        </Link>
      </div>

      {/* Center: Desktop Nav Links */}
      <div className="hidden xl:block absolute left-1/2 -translate-x-1/2 pointer-events-auto">
        <nav className="nav-liquid-glass rounded-full px-2 py-2 flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="text-[11px] font-medium tracking-[0.12em] text-white/90 hover:text-white hover:bg-white/10 px-4 py-1.5 rounded-full transition-colors duration-200"
            >
              {link.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Right: Actions */}
      <div className="hidden xl:flex items-center gap-4 pointer-events-auto">
        <WalletConnect />
      </div>

      {/* Mobile Menu Button */}
      <button
        ref={menuButton}
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
        aria-controls="mobile-navigation"
        className="xl:hidden p-2 text-white nav-liquid-glass rounded-full w-11 h-11 flex items-center justify-center pointer-events-auto"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            id="mobile-navigation"
            className="xl:hidden absolute top-20 left-4 right-4 rounded-2xl border border-white/15 bg-black/95 backdrop-blur-xl max-h-[calc(100dvh-6rem)] overflow-y-auto pointer-events-auto shadow-2xl"
          >
            <div className="flex flex-col p-6 gap-2 bg-black/40">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  aria-current={location.pathname === link.path ? "page" : undefined}
                  className="text-sm font-medium tracking-[0.12em] text-white/90 hover:text-white py-3 border-b border-white/10 last:border-0"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}

              <div className="pt-4 flex justify-end items-center">
                <WalletConnect />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
