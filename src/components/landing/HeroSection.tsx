import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight, Terminal } from "lucide-react";
import { HlsVideo } from "./HlsVideo";

export const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.6, delay, ease: "easeOut" as const },
});

export function HeroSection() {
  return (
    <section className="relative min-h-[100vh] flex flex-col items-center justify-center overflow-hidden pt-28 pb-16">
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <HlsVideo 
          src="https://stream.mux.com/4IMYGcL01xjs7ek5ANO17JC4VQVUTsojZlnw4fXzwSxc.m3u8"
          poster="https://customer-cbeadsgr09pnsezs.cloudflarestream.com/257c7359efd4b4aaebcc03aa8fc78a36/thumbnails/thumbnail.jpg"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-background/80 md:bg-background/60" />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-background to-transparent z-[1]" />
      </div>

      <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center max-w-5xl">
        {/* Avatars Row - adapted from Mindloop */}
        <motion.div {...fadeUp(0.1)} className="flex items-center gap-4 mb-8">
          <div className="flex -space-x-2.5">
            <img 
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80" 
              alt="Builder Avatar" 
              className="w-8 h-8 rounded-full border-2 border-background object-cover"
            />
            <img 
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80" 
              alt="Builder Avatar" 
              className="w-8 h-8 rounded-full border-2 border-background object-cover"
            />
            <img 
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80" 
              alt="Builder Avatar" 
              className="w-8 h-8 rounded-full border-2 border-background object-cover"
            />
          </div>
          <span className="text-muted-foreground text-sm">20,000+ people already building</span>
        </motion.div>

        {/* Badge - adapted from Datacore */}
        <motion.div {...fadeUp(0.2)} className="liquid-glass rounded-full p-1 pl-1.5 pr-4 flex items-center gap-3 mb-10">
          <span className="bg-foreground text-background text-xs font-semibold px-2 py-0.5 rounded-full">New</span>
          <span className="text-sm font-medium">Open Source Web3 Opportunity Layer</span>
        </motion.div>

        {/* Headline */}
        <motion.h1 {...fadeUp(0.3)} className="text-5xl md:text-7xl lg:text-[5.5rem] font-medium tracking-tight mb-8 leading-[1.1]">
          Build the <span style={{ fontFamily: "Instrument Serif, serif", fontStyle: "italic", fontWeight: "normal" }}>Future</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p {...fadeUp(0.4)} className="text-lg md:text-xl text-hero-subtitle max-w-2xl mx-auto mb-12">
          A decentralized platform where anyone can post hackathons, jobs, and events. 
          Community-to-community support — powered by the people, for the people.
        </motion.p>

        {/* CTAs */}
        <motion.div {...fadeUp(0.5)} className="flex flex-col sm:flex-row gap-4 items-center w-full max-w-md mx-auto sm:max-w-none justify-center">
          <Link to="/hackathons" className="w-full sm:w-auto">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Button size="lg" className="w-full bg-foreground text-background hover:bg-foreground/90 text-base h-14 px-8 rounded-full shadow-lg font-medium border-0">
                Explore Hackathons <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </Link>
          
          <Link to="/products" className="w-full sm:w-auto">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="liquid-glass rounded-full h-14 px-8 flex items-center justify-center">
              <span className="font-medium text-base">Discover Products</span>
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
