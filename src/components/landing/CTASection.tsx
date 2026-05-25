import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router";
import { fadeUp } from "./HeroSection";
import { HlsVideo } from "./HlsVideo";
import { Terminal } from "lucide-react";
import { toast } from "sonner";

export function CTASection() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success("🎉 Successfully subscribed to Web3 opportunities!");
    setEmail("");
  };

  return (
    <section className="relative py-32 md:py-44 border-t border-border/30 overflow-hidden font-sans">
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <HlsVideo 
          src="https://stream.mux.com/8wrHPCX2dC3msyYU9ObwqNdm00u3ViXvOSHUMRYSEe5Q.m3u8"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-background/60 md:bg-background/45 z-[1]" />
      </div>

      <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center">
        {/* Logo Icon */}
        <motion.div 
          {...fadeUp(0.1)} 
          className="w-16 h-16 rounded-full border border-foreground/30 flex items-center justify-center mb-8 bg-background/50 backdrop-blur-md"
        >
          <div className="w-8 h-8 rounded-full border border-foreground/50 flex items-center justify-center">
            <Terminal className="h-4 w-4 text-foreground" />
          </div>
        </motion.div>

        {/* Heading */}
        <motion.h2 
          {...fadeUp(0.2)} 
          className="text-4xl sm:text-5xl md:text-7xl font-semibold tracking-tight mb-6 text-white leading-tight font-sans"
        >
          Start Your Journey
        </motion.h2>

        {/* Subtitle */}
        <motion.p 
          {...fadeUp(0.3)} 
          className="text-white/60 text-base sm:text-lg md:text-xl max-w-xl mb-12 font-sans"
        >
          Join thousands of developers who are already building the future of Web3.
        </motion.p>

        {/* Email Subscribe Pill (exactly like the photo!) */}
        <motion.div {...fadeUp(0.35)} className="w-full max-w-xl px-2 mb-12">
          <form 
            onSubmit={handleSubscribe} 
            className="w-full rounded-full bg-white/5 border border-white/10 p-1.5 flex items-center gap-2 shadow-2xl focus-within:border-white/20 transition-all backdrop-blur-md"
          >
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your favorite email?" 
              className="bg-transparent text-sm sm:text-base text-white placeholder-white/30 px-6 py-2.5 flex-1 min-w-0 focus:outline-none font-sans"
              required
            />
            <button 
              type="submit" 
              className="bg-[#1b2a3a]/80 hover:bg-[#25394f] text-white/90 border border-white/10 text-[10px] sm:text-xs font-bold tracking-widest uppercase rounded-full px-6 sm:px-8 py-3.5 transition-all cursor-pointer flex-shrink-0"
            >
              STAY NOTIFIED
            </button>
          </form>
        </motion.div>

        {/* Buttons */}
        <motion.div 
          {...fadeUp(0.4)} 
          className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full"
        >
          <Link to="/events" className="w-full sm:w-auto">
            <motion.button 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto bg-white text-black font-semibold text-sm rounded-full px-8 py-3.5 shadow-md hover:bg-white/90 transition-colors cursor-pointer"
            >
              Explore Events
            </motion.button>
          </Link>
          <Link to="/jobs" className="w-full sm:w-auto">
            <motion.button 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto liquid-glass border border-white/10 text-white font-semibold text-sm rounded-full px-8 py-3.5 transition-all cursor-pointer"
            >
              Find Web3 Jobs
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
