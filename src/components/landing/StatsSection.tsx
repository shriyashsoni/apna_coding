import React from "react";
import { motion } from "framer-motion";
import { Trophy, Users, Globe, Coins, ShieldCheck, Zap } from "lucide-react";

export function StatsSection() {
  const stats = [
    {
      label: "Prizes Distributed",
      value: "$180,000+",
      icon: Trophy,
      color: "text-purple-400",
      description: "Direct smart-contract prize rewards paid out to developers globally.",
    },
    {
      label: "Active Builders",
      value: "24,500+",
      icon: Users,
      color: "text-orange-400",
      description: "Verified developers, engineers, and creators staking on outcomes.",
    },
    {
      label: "Global Communities",
      value: "80+",
      icon: Globe,
      color: "text-green-400",
      description: "Web3 developer clubs, university hubs, and DAOs actively partnered.",
    },
    {
      label: "Total Value Staked",
      value: "25.4 ETH+",
      icon: Coins,
      color: "text-blue-400",
      description: "Secured lockups ensuring high-quality proof-of-work submissions.",
    },
  ];

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <section className="py-28 relative overflow-hidden z-10 border-t border-white/5 bg-black">
      {/* Background blur glows */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header Block */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-purple-400 mb-4 block">
            Ecosystem Metrics
          </span>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">
            India's Premier Web3 Opportunity Layer
          </h2>
          <p className="text-white/60 text-base md:text-lg">
            Real-time on-chain statistics showcasing community growth, hackathon outcomes, and developer participation.
          </p>
        </div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={idx}
                variants={cardVariants}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="liquid-glass p-6 md:p-8 rounded-3xl text-left border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className={`w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <span className="text-3xl md:text-4xl font-semibold tracking-tight text-white block mb-2">
                    {stat.value}
                  </span>
                  <span className="text-sm font-medium text-white/80 block mb-3">
                    {stat.label}
                  </span>
                </div>
                <p className="text-xs text-white/45 leading-relaxed">
                  {stat.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Verification Subtext */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-16 pt-8 border-t border-white/5 text-white/40 text-xs">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-green-400" />
            <span>On-chain staking values audit compiled successfully</span>
          </div>
          <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-white/10" />
          <div className="flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-orange-400" />
            <span>Updates live every 24 hours</span>
          </div>
        </div>
      </div>
    </section>
  );
}
