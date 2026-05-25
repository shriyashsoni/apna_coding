import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, BookOpen, Users, Rocket, ArrowRight, ShieldCheck, Cpu, Code2, Globe } from "lucide-react";
import { Link } from "react-router";

export function StellarShowcase() {
  const [activeTab, setActiveTab] = useState<"analyse" | "train" | "testing" | "deploy">("analyse");

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTab((prev) => {
        if (prev === "analyse") return "train";
        if (prev === "train") return "testing";
        if (prev === "testing") return "deploy";
        return "analyse";
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: "analyse", name: "Analyse Events", icon: BarChart3, color: "from-purple-500 to-indigo-500" },
    { id: "train", name: "Train Communities", icon: BookOpen, color: "from-orange-500 to-red-500" },
    { id: "testing", name: "Test Hackathons", icon: Users, color: "from-green-500 to-emerald-500" },
    { id: "deploy", name: "Deploy Careers", icon: Rocket, color: "from-blue-500 to-cyan-500" },
  ];

  return (
    <section className="py-24 relative overflow-hidden font-sans z-10 border-t border-white/5">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Rating Badge */}
        <div className="flex justify-center mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md"
          >
            <div className="w-5 h-5 border border-white/20 rounded flex items-center justify-center bg-white/5">
              <span className="text-[10px] text-white">⭐</span>
            </div>
            <span className="text-xs font-medium text-white/80">4.9 rating from 18.3K+ Web3 builders</span>
          </motion.div>
        </div>

        {/* Heading & Subheading */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-semibold tracking-tight text-white mb-6 leading-tight"
          >
            Work Smarter. Move Faster. <br />
            <span className="bg-gradient-to-r from-white via-white/70 to-white/40 bg-clip-text text-transparent">
              AI Powers Your Web3 Journey.
            </span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-white/60 text-base md:text-lg"
          >
            Intelligent automation syncs with the Web3 tools you love to streamline hackathons, coordinate global events, and power up community growth.
          </motion.p>
        </div>

        {/* Tab Bar Selector */}
        <div className="flex justify-center mb-10 w-full">
          {/* Mobile Tabs Container */}
          <div className="md:hidden grid grid-cols-2 gap-2 w-full max-w-sm p-1.5 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center justify-center gap-2 py-3 px-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    isActive ? "bg-white text-black shadow-lg" : "text-white/60 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.name.split(" ")[1]}</span>
                </button>
              );
            })}
          </div>

          {/* Desktop Tabs Container */}
          <div className="hidden md:flex items-center gap-2 p-1.5 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
            {tabs.map((tab, idx) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <React.Fragment key={tab.id}>
                  {idx > 0 && <div className="w-px h-5 bg-white/15" />}
                  <button
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2.5 py-2.5 px-6 rounded-full text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer ${
                      isActive ? "bg-white text-black shadow-lg" : "text-white/60 hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.name}</span>
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Video + Interactive Overlays Box */}
        <div className="relative rounded-3xl overflow-hidden h-[450px] md:h-[550px] border border-white/10 shadow-2xl bg-black">
          {/* Background Loop Video */}
          <video 
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260319_165750_358b1e72-c921-48b7-aaac-f200994f32fb.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover z-0 opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent z-[1]" />

          {/* Dynamic Card Display overlay */}
          <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
            <AnimatePresence mode="wait">
              {activeTab === "analyse" && (
                <motion.div 
                  key="analyse"
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -15 }}
                  transition={{ duration: 0.4 }}
                  className="liquid-glass max-w-md w-full p-6 md:p-8 rounded-2xl text-left border border-white/10 backdrop-blur-xl"
                >
                  <span className="text-[10px] font-bold tracking-widest text-purple-400 uppercase mb-2 block">Set Up Your AI Workspace</span>
                  <h3 className="text-xl md:text-2xl font-semibold text-white mb-4">Event Tracking Analytics</h3>
                  
                  {/* Custom Wizard steps as in Stellar prompt */}
                  <div className="space-y-4 mb-6">
                    <div>
                      <div className="flex justify-between text-xs text-white/50 mb-1">
                        <span>Workspace Setup Progress</span>
                        <span>25%</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="w-1/4 h-full bg-purple-500 rounded-full" />
                      </div>
                    </div>
                    
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2.5 text-xs text-white/80">
                        <span className="w-4 h-4 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-[10px] font-bold">1</span>
                        <span>Connect Web3 wallet authorization</span>
                      </li>
                      <li className="flex items-center gap-2.5 text-xs text-white/40">
                        <span className="w-4 h-4 rounded-full bg-white/5 text-white/40 flex items-center justify-center text-[10px] font-bold">2</span>
                        <span>Aggregate global developer hackathons</span>
                      </li>
                      <li className="flex items-center gap-2.5 text-xs text-white/40">
                        <span className="w-4 h-4 rounded-full bg-white/5 text-white/40 flex items-center justify-center text-[10px] font-bold">3</span>
                        <span>Enable instant Discord & Telegram hooks</span>
                      </li>
                    </ul>
                  </div>

                  <Link to="/events" className="inline-flex items-center gap-2 bg-white text-black font-semibold text-xs rounded-full px-5 py-2.5 hover:bg-white/90 transition-all">
                    <span>Explore Web3 Events</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </motion.div>
              )}

              {activeTab === "train" && (
                <motion.div 
                  key="train"
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -15 }}
                  transition={{ duration: 0.4 }}
                  className="liquid-glass max-w-md w-full p-6 md:p-8 rounded-2xl text-left border border-white/10 backdrop-blur-xl"
                >
                  <span className="text-[10px] font-bold tracking-widest text-orange-400 uppercase mb-2 block">AI Model Training</span>
                  <h3 className="text-xl md:text-2xl font-semibold text-white mb-4">India Community Growth</h3>

                  {/* 4 metrics as specified in Stellar prompt */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                      <span className="text-[10px] text-white/40 uppercase tracking-wider block">Training Speed</span>
                      <span className="text-base font-semibold text-orange-400">67% Complete</span>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                      <span className="text-[10px] text-white/40 uppercase tracking-wider block">Active Hubs</span>
                      <span className="text-base font-semibold text-white">80+ Globally</span>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                      <span className="text-[10px] text-white/40 uppercase tracking-wider block">Loss Rate</span>
                      <span className="text-base font-semibold text-green-400">0.0024</span>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                      <span className="text-[10px] text-white/40 uppercase tracking-wider block">Coordinated Events</span>
                      <span className="text-base font-semibold text-white">240+ Live</span>
                    </div>
                  </div>

                  <Link to="/communities" className="inline-flex items-center gap-2 bg-white text-black font-semibold text-xs rounded-full px-5 py-2.5 hover:bg-white/90 transition-all">
                    <span>Join Partner Communities</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </motion.div>
              )}

              {activeTab === "testing" && (
                <motion.div 
                  key="testing"
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -15 }}
                  transition={{ duration: 0.4 }}
                  className="liquid-glass max-w-md w-full p-6 md:p-8 rounded-2xl text-left border border-white/10 backdrop-blur-xl"
                >
                  <span className="text-[10px] font-bold tracking-widest text-green-400 uppercase mb-2 block">Test Suite Results</span>
                  <h3 className="text-xl md:text-2xl font-semibold text-white mb-4">Hackathon Testing Arena</h3>

                  {/* 127/127 tests successfully compiled */}
                  <div className="space-y-4 mb-6">
                    <div className="bg-green-500/10 border border-green-500/25 rounded-xl p-4 flex items-center gap-3">
                      <ShieldCheck className="h-6 w-6 text-green-400 flex-shrink-0" />
                      <div>
                        <span className="text-xs text-white/50 block">Compilation Staking Status</span>
                        <span className="text-sm font-bold text-green-400">127 / 127 Tests Passed</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-white/80">
                        <span>Submission Hash verified</span>
                        <span className="text-green-400">SUCCESS</span>
                      </div>
                      <div className="flex justify-between text-xs text-white/80">
                        <span>On-Chain Staking Lockups</span>
                        <span className="text-green-400">0.05 cUSD Approved</span>
                      </div>
                    </div>
                  </div>

                  <Link to="/hackathons" className="inline-flex items-center gap-2 bg-white text-black font-semibold text-xs rounded-full px-5 py-2.5 hover:bg-white/90 transition-all">
                    <span>Launch Hackathon Staker</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </motion.div>
              )}

              {activeTab === "deploy" && (
                <motion.div 
                  key="deploy"
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -15 }}
                  transition={{ duration: 0.4 }}
                  className="liquid-glass max-w-md w-full p-6 md:p-8 rounded-2xl text-left border border-white/10 backdrop-blur-xl"
                >
                  <span className="text-[10px] font-bold tracking-widest text-blue-400 uppercase mb-2 block">Deploy to Production</span>
                  <h3 className="text-xl md:text-2xl font-semibold text-white mb-4">Web3 Career Deployment</h3>

                  {/* 4 checklist items + Deploy button */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2.5 text-xs text-white/80">
                      <Cpu className="h-4 w-4 text-blue-400" />
                      <span>Configure decentralized AI nodes</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-white/80">
                      <Code2 className="h-4 w-4 text-blue-400" />
                      <span>Sync GitHub portfolio pipelines</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs text-white/80">
                      <Globe className="h-4 w-4 text-blue-400" />
                      <span>Verify smart-contract security audit</span>
                    </div>
                  </div>

                  <Link to="/jobs" className="inline-flex items-center gap-2 bg-white text-black font-semibold text-xs rounded-full px-5 py-2.5 hover:bg-white/90 transition-all w-full justify-center">
                    <span>Deploy Now</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Company Logos Segment */}
        <div className="mt-24">
          <p className="text-center text-[10px] uppercase tracking-[0.25em] text-white/35 mb-8">
            Empowering Builders Across Leading Networks
          </p>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-8 items-center opacity-40 hover:opacity-60 transition-opacity duration-300">
            <span className="text-center text-sm font-bold tracking-widest text-white">INTERSCOPE</span>
            <span className="text-center text-sm font-bold tracking-widest text-white">SPOTIFY</span>
            <span className="text-center text-sm font-bold tracking-widest text-white">NEXERA</span>
            <span className="text-center text-sm font-bold tracking-widest text-white italic">M3</span>
            <span className="text-center text-sm font-bold tracking-widest text-white">LAURA COLE</span>
            <span className="text-center text-sm font-bold tracking-widest text-white">VERTEX</span>
          </div>
        </div>

      </div>
    </section>
  );
}
