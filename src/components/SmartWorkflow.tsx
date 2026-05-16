import { motion, useScroll, useTransform } from "framer-motion";
import { Plus, Shield, Coins, CheckCircle, ArrowRight, Zap, Globe, Lock } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";

const steps = [
  {
    title: "Draft & Submit",
    desc: "Create your event, job or hackathon with rich metadata and AI-enhanced descriptions.",
    icon: Plus,
    color: "#3b82f6",
    tag: "Phase 1"
  },
    {
    title: "Ethereum Smart Contract Staking",
    desc: "A small 0.01 ETH anti-spam stake is processed through our secure Ethereum smart contract. Fully refundable.",
    icon: Coins,
    color: "#f59e0b",
    tag: "Phase 2"
  },
  {
    title: "Protocol Verification",
    desc: "Your data is permanently anchored to the blockchain, creating an immutable record.",
    icon: Shield,
    color: "#78c8ff",
    tag: "Phase 3"
  },
  {
    title: "Global Distribution",
    desc: "Once verified, your opportunity is broadcasted to our network of 20,000+ developers.",
    icon: Globe,
    color: "#22c55e",
    tag: "Final"
  }
];

export function SmartWorkflow() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  return (
    <div className="w-full py-24 px-4 bg-background/50 relative overflow-hidden" ref={containerRef}>
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 blur-[100px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-secondary/5 blur-[100px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 py-2 px-4 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-mono mb-6 uppercase tracking-widest"
          >
            <Zap className="w-3 h-3 animate-pulse" />
            Decentralized Workflow
          </motion.div>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            From Idea to <span className="text-primary italic">On-Chain</span> Reality
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Experience the most secure and transparent way to share opportunities in the Web3 ecosystem.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          {/* Steps */}

          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: index * 0.2 }}
              className="relative group"
            >
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-8">
                  {/* Outer Rings */}
                  <div className="absolute inset-0 -m-4 rounded-full border border-white/5 group-hover:border-primary/20 transition-colors duration-500" />
                  <div className="absolute inset-0 -m-8 rounded-full border border-white/5 group-hover:border-primary/10 transition-colors duration-500 animate-spin-slow" />
                  
                  {/* Icon Container */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-20 h-20 rounded-2xl bg-card border border-white/10 flex items-center justify-center relative z-10 shadow-xl group-hover:shadow-primary/20 group-hover:border-primary/30 transition-all duration-500"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl" />
                    <step.icon className="w-10 h-10 text-primary group-hover:text-white transition-colors duration-500" />
                    
                    {/* Badge */}
                    <div className="absolute -top-3 -right-3 px-2 py-0.5 rounded-md bg-primary text-[10px] font-bold text-primary-foreground shadow-lg">
                      {step.tag}
                    </div>
                  </motion.div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {step.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}
