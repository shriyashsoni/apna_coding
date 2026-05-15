import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

const hashtags = [
  { tag: "#OpenSource", desc: "Fully open-source platform built by the community, for the community" },
  { tag: "#Web3Native", desc: "Built on Web3 principles with decentralized architecture" },
  { tag: "#CommunityFirst", desc: "Community-driven platform where everyone can contribute" },
  { tag: "#GlobalReach", desc: "Connect with developers and opportunities worldwide" },
  { tag: "#AIpowered", desc: "AI-enhanced discovery and personalized recommendations" },
  { tag: "#FreeForAll", desc: "No fees, no barriers - post hackathons, jobs, and events freely" },
  { tag: "#Verified", desc: "Community-verified content for trust and quality" },
  { tag: "#Certificates", desc: "Earn Web3 certificates and badges for achievements" },
  { tag: "#CrossChain", desc: "Support for all major blockchain ecosystems" },
  { tag: "#Decentralized", desc: "No single point of control - truly decentralized platform" },
];

export function InteractiveFeaturesSection() {
  const [selectedHashtag, setSelectedHashtag] = useState<typeof hashtags[0] | null>(null);

  return (
    <section className="py-20 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block py-2 px-4 rounded-full bg-primary/10 text-primary border border-primary/30 text-sm font-mono mb-6"
          >
            VALUES
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Open Source Web3 Opportunity layer
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-lg max-w-3xl mx-auto"
          >
            A decentralized platform where anyone can post hackathons, jobs, and events. Community-to-community support through our platform.
          </motion.p>
        </div>

        {/* Animated Hashtags Carousel */}
        <div className="mb-12 overflow-hidden">
          <div className="flex gap-4 animate-scroll-left">
            {[...hashtags, ...hashtags].map((item, index) => (
              <motion.button
                key={`hashtag-${index}`}
                onClick={() => setSelectedHashtag(item)}
                className="flex-shrink-0 px-6 py-3 rounded-full bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 hover:border-primary/50 transition-all duration-300 font-mono text-sm hover:shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {item.tag}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Hashtag Detail Modal */}
      <AnimatePresence>
        {selectedHashtag && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedHashtag(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-primary/30 rounded-2xl p-8 max-w-lg w-full relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedHashtag(null)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
              
              <div className="text-center">
                <h3 className="text-3xl font-bold mb-4 text-primary font-mono">{selectedHashtag.tag}</h3>
                <p className="text-lg text-muted-foreground leading-relaxed">{selectedHashtag.desc}</p>
              </div>

              <div className="mt-6 flex justify-center">
                <Button onClick={() => setSelectedHashtag(null)} className="bg-primary text-primary-foreground">
                  Got it
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
