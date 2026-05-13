import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WalletConnect } from "@/components/WalletConnect";
import { LogoDropdown } from "@/components/LogoDropdown";
import { usePrivy } from "@privy-io/react-auth";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { authenticated } = usePrivy();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Events", path: "/events" },
    { name: "Hackathons", path: "/hackathons" },
    { name: "Products", path: "/products" },
    { name: "News", path: "/news" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-primary/30 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <img 
            src="https://harmless-tapir-303.convex.cloud/api/storage/1afb27dd-9d64-48c2-be2e-ada93b76526a" 
            alt="Apna Coding Logo" 
            className="h-10 w-auto"
          />
          <span className="font-bold text-xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
            Apna Coding
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
            Home
          </Link>
          <Link to="/events" className="text-sm font-medium hover:text-primary transition-colors">
            Events
          </Link>
          <Link to="/hackathons" className="text-sm font-medium hover:text-primary transition-colors">
            Hackathons
          </Link>
          <Link to="/products" className="text-sm font-medium hover:text-primary transition-colors">
            Products
          </Link>
          <Link to="/news" className="text-sm font-medium hover:text-primary transition-colors">
            News
          </Link>
          {authenticated && <LogoDropdown />}
          <WalletConnect />
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-primary"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-b border-primary/30 bg-background"
          >
            <div className="flex flex-col p-4 gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-sm font-medium text-foreground hover:text-primary"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}

              <div className="pt-2 border-t border-primary/20">
              </div>

              {authenticated && (
                <div className="pt-2 border-t border-primary/20">
                  <LogoDropdown />
                </div>
              )}

              <WalletConnect />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}