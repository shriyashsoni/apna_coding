import { motion } from "framer-motion";
import { Plus, Shield, Coins, CheckCircle, ArrowRight } from "lucide-react";

export function OnChainFlow() {
  const steps = [
    {
      icon: Plus,
      title: "Submit",
      desc: "Event, Job or Hackathon",
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      glow: "group-hover:shadow-blue-500/50",
    },
    {
      icon: Coins,
      title: "Stake",
      desc: "0.01 ETH Anti-Spam",
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      glow: "group-hover:shadow-amber-500/50",
    },
    {
      icon: Shield,
      title: "Verify",
      desc: "Immutable On-Chain",
      color: "text-primary",
      bg: "bg-primary/10",
      glow: "group-hover:shadow-primary/50",
    },
    {
      icon: CheckCircle,
      title: "Publish",
      desc: "Global Visibility",
      color: "text-green-500",
      bg: "bg-green-500/10",
      glow: "group-hover:shadow-green-500/50",
    },
  ];

  return (
    <div className="w-full py-16 px-4">
      <div className="max-w-5xl mx-auto relative">
        <div className="text-center mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block py-2 px-4 rounded-full bg-primary/10 text-primary border border-primary/30 text-xs font-mono mb-4 tracking-widest uppercase"
          >
            Powered by Ethereum Ecosystem
          </motion.div>
        </div>
        
        <div className="relative pt-8">
          {/* Animated Connecting Line (Desktop) - Fixed vertical alignment to EXACT center (64px) */}
          <div className="absolute top-[64px] left-[32px] right-[32px] h-0.5 hidden md:block z-0">
            <svg className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="33%" stopColor="#f59e0b" />
                  <stop offset="66%" stopColor="#78c8ff" />
                  <stop offset="100%" stopColor="#22c55e" />
                </linearGradient>
              </defs>
              <motion.line
                x1="0"
                y1="0"
                x2="100%"
                y2="0"
                stroke="url(#lineGradient)"
                strokeWidth="2"
                strokeDasharray="8 12"
                animate={{
                  strokeDashoffset: [-100, 0],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
              
              {/* Animated Flow Arrow - Fast "Step-to-Step" Movement */}
              <motion.g
                animate={{
                  x: ["0%", "0%", "33.3%", "33.3%", "66.6%", "66.6%", "100%", "100%"],
                  opacity: [0, 1, 1, 1, 1, 1, 1, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  times: [0, 0.1, 0.25, 0.4, 0.55, 0.7, 0.85, 1],
                  ease: "easeInOut",
                }}
              >
                <path
                  d="M -10 -8 L 4 0 L -10 8"
                  stroke="#fff"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  className="drop-shadow-[0_0_12px_rgba(255,255,255,0.9)]"
                />
              </motion.g>
            </svg>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-12 md:gap-4 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="flex flex-col items-center text-center group"
              >
                <motion.div
                  whileHover={{ scale: 1.15, rotate: [0, -5, 5, 0] }}
                  className={`w-16 h-16 rounded-2xl ${step.bg} flex items-center justify-center border border-white/5 backdrop-blur-md shadow-2xl ${step.glow} transition-all duration-500 relative overflow-hidden`}
                >
                  {/* Internal Glow Effect */}
                  <motion.div 
                    className="absolute inset-0 bg-white/5"
                    animate={{
                      opacity: [0.1, 0.3, 0.1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.5,
                    }}
                  />
                  <step.icon className={`w-8 h-8 ${step.icon.name === 'Shield' ? 'animate-pulse' : ''} ${step.color} relative z-10`} />
                </motion.div>
                
                <div className="mt-6">
                  <motion.h4 
                    className="text-sm font-black uppercase tracking-[0.2em] text-foreground/90 group-hover:text-primary transition-colors"
                  >
                    {step.title}
                  </motion.h4>
                  <p className="text-xs text-muted-foreground mt-2 max-w-[140px] leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                {/* Mobile Arrows */}
                {index < steps.length - 1 && (
                  <motion.div 
                    className="md:hidden mt-8 text-primary/40"
                    animate={{ y: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="rotate-90 w-6 h-6" />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
