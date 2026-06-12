import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Menu, X, Terminal } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WalletConnect } from "@/components/WalletConnect";
import { usePrivy } from "@privy-io/react-auth";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { authenticated } = usePrivy();

  const navLinks = [
    { name: "HOME", path: "/" },
    { name: "EVENTS", path: "/events" },
    { name: "HACKATHONS", path: "/hackathons" },
    { name: "JOBS", path: "/jobs" },
    { name: "PRODUCTS", path: "/products" },
    { name: "NEWS", path: "/news" },
  ];

  if (authenticated) {
    navLinks.push({ name: "HOSTING", path: "/host/dashboard" });
  }

  return (
    <nav className="fixed top-0 z-50 w-full px-6 md:px-10 py-6 md:py-8 flex justify-between items-center pointer-events-none">
      
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
      <div className="hidden md:block absolute left-1/2 -translate-x-1/2 pointer-events-auto">
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
      <div className="hidden md:flex items-center gap-4 pointer-events-auto">
        <WalletConnect />
      </div>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden p-2 text-white nav-liquid-glass rounded-full w-10 h-10 flex items-center justify-center pointer-events-auto"
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
            className="md:hidden absolute top-24 left-4 right-4 rounded-2xl nav-liquid-glass overflow-hidden pointer-events-auto shadow-2xl"
          >
            <div className="flex flex-col p-6 gap-2 bg-black/40">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
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
