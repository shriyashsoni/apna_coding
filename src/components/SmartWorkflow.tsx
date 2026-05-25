import { motion } from "framer-motion";
import { Plus, Shield, Coins, Globe } from "lucide-react";

export function SmartWorkflow() {
  return (
    <section className="py-24 bg-[#0A0A0A] relative overflow-hidden">
      {/* Header Area */}
      <div className="max-w-[1400px] mx-auto px-6 mb-16 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight mb-4 text-white">
              Decentralized Workflow.
            </h2>
            <h3 className="text-2xl md:text-4xl font-medium tracking-tight text-white/50 mb-2">
              From Idea to <span className="font-serif italic">On-Chain</span> Reality.
            </h3>
            <p className="text-lg text-white/40 max-w-xl">
              Experience the most secure and transparent way to share opportunities in the Web3 ecosystem.
            </p>
          </div>
          <button className="rounded-full px-6 py-3 border border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-md text-white transition-all text-sm font-medium shrink-0">
            Start Using Apna Coding
          </button>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:grid-rows-[350px_350px]">
          
          {/* Box 1 (Left Vertical) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-1 md:row-span-2 rounded-3xl p-8 relative overflow-hidden group flex flex-col justify-between border border-white/10 bg-[#121212] hover:border-white/20 transition-all min-h-[500px] md:min-h-0"
          >
            {/* Background Media Placeholder */}
            <video src="/videos/8675541-hd_1920_1080_30fps.mp4" autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-700 group-hover:scale-105 opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40 z-0" />
            
            {/* Top Row */}
            <div className="flex justify-between items-start relative z-10 w-full">
              <span className="text-xs font-mono text-white/60">01/</span>
              <span className="text-xs text-white/60 tracking-wider">Phase 1</span>
            </div>

            {/* Bottom Content */}
            <div className="relative z-10 mt-auto">
              <div className="mb-6 p-3 rounded-2xl bg-white/10 w-fit backdrop-blur-md border border-white/5">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-3xl md:text-4xl font-bold mb-6 text-white leading-tight">
                Draft &<br />Submit
              </h3>
              <p className="text-white/60 text-sm leading-relaxed max-w-sm">
                Create your event, job or hackathon with rich metadata and AI-enhanced descriptions.
                <br /><br />
                Start your journey with purpose today.
              </p>
            </div>
          </motion.div>

          {/* Box 2 (Top Horizontal) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="md:col-span-2 md:row-span-1 rounded-3xl p-8 relative overflow-hidden group flex flex-col justify-between border border-white/10 bg-[#121212] hover:border-white/20 transition-all min-h-[300px] md:min-h-0"
          >
            {/* Background Media Placeholder */}
            <video src="/videos/14630687_1920_1080_30fps.mp4" autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-700 group-hover:scale-105 opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40 z-0" />

            <div className="flex justify-between items-start relative z-10 w-full">
              <h3 className="text-2xl md:text-3xl font-bold text-white max-w-md">Ethereum Smart Contract Staking</h3>
              <span className="text-xs font-mono text-white/60">02/</span>
            </div>
            
            <div className="relative z-10 mt-auto flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="mb-4 md:mb-0 p-3 rounded-2xl bg-white/10 w-fit backdrop-blur-md border border-white/5">
                <Coins className="w-6 h-6 text-white" />
              </div>
              <p className="text-white/60 text-sm max-w-sm md:text-right">
                A small 0.01 ETH anti-spam stake is processed through our secure Ethereum smart contract. Fully refundable.
              </p>
            </div>
          </motion.div>

          {/* Box 3 (Bottom Left Horizontal) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="md:col-span-1 md:row-span-1 rounded-3xl p-8 relative overflow-hidden group flex flex-col justify-between border border-white/10 bg-[#121212] hover:border-white/20 transition-all min-h-[300px] md:min-h-0"
          >
            {/* Background Media Placeholder */}
            <video src="/videos/11387730-hd_1920_1080_30fps.mp4" autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-700 group-hover:scale-105 opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40 z-0" />

            <div className="flex justify-between items-start relative z-10 w-full mb-8">
              <span className="text-sm font-medium text-white/80">Protocol Verification</span>
              <span className="text-xs font-mono text-white/60">03/</span>
            </div>

            <div className="relative z-10 mt-auto">
              <p className="text-white/60 text-sm leading-relaxed mb-6">
                Your data is permanently anchored to the blockchain, creating an immutable record.
              </p>
              <button className="rounded-full px-5 py-2.5 border border-white/20 bg-transparent hover:bg-white/10 text-white transition-all text-xs font-medium">
                Verify on Explorer
              </button>
            </div>
          </motion.div>

          {/* Box 4 (Bottom Right Horizontal) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="md:col-span-1 md:row-span-1 rounded-3xl p-8 relative overflow-hidden group flex flex-col justify-between border border-white/10 bg-[#121212] hover:border-white/20 transition-all min-h-[300px] md:min-h-0"
          >
            {/* Background Media Placeholder */}
            <video src="/videos/7782667-hd_1080_1920_25fps.mp4" autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-700 group-hover:scale-105 opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40 z-0" />

            <div className="flex justify-between items-start relative z-10 w-full">
              <span className="text-sm font-medium text-white/80">Global Distribution</span>
              <span className="text-xs font-mono text-white/60">04/</span>
            </div>

            <div className="relative z-10 mt-auto flex flex-col items-center text-center">
              <div className="mb-6 p-4 rounded-full bg-white/5 backdrop-blur-md border border-white/10">
                <Globe className="w-8 h-8 text-white/80" />
              </div>
              <p className="text-white/60 text-sm max-w-[200px] mx-auto">
                Once verified, your opportunity is broadcasted to our network of 20,000+ developers.
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
