import React, { useEffect, useRef } from "react";
import Hls from "hls.js";
import { ArrowUpRight, Play, ArrowRight } from "lucide-react";
import { Link } from "react-router";

export function Web3ShowcaseSection() {
  const videoRef1 = useRef<HTMLVideoElement>(null);
  const videoRef2 = useRef<HTMLVideoElement>(null);
  const videoRef3 = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const videoStreams = [
      {
        ref: videoRef1,
        src: "https://stream.mux.com/1RdbcBtpEUK6501pc6yaIvwo9UfSnOg02k1uHxat00xR3w.m3u8",
      },
      {
        ref: videoRef2,
        src: "https://stream.mux.com/t1TbTB8M1VYHkhxBuap4A8Vm1x015HTHyuQxqchDBago.m3u8",
      },
      {
        ref: videoRef3,
        src: "https://stream.mux.com/6yvj9SR5bjmXq9N3ak7gy427RwUs8R2ZoH4ndA7Q1018.m3u8",
      },
    ];

    const hlsInstances: Hls[] = [];

    videoStreams.forEach(({ ref, src }) => {
      const video = ref.current;
      if (!video) return;

      if (Hls.isSupported()) {
        const hls = new Hls({
          capLevelToPlayerSize: true,
          maxBufferLength: 10,
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch((e) => console.log("Play failed", e));
        });
        hlsInstances.push(hls);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // Native HLS for Safari
        video.src = src;
        video.addEventListener("loadedmetadata", () => {
          video.play().catch((e) => console.log("Play failed", e));
        });
      }
    });

    return () => {
      hlsInstances.forEach((hls) => hls.destroy());
    };
  }, []);

  return (
    <section className="min-h-screen lg:h-screen flex flex-col lg:overflow-hidden bg-[#000000] text-foreground py-16 lg:py-24 relative z-10 font-['Poppins'] border-t border-border/30">
      <div className="container mx-auto px-5 lg:px-16 flex-1 flex flex-col justify-between h-full gap-8">
        
        {/* Two-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-stretch flex-1">
          
          {/* Left Column */}
          <div className="flex flex-col justify-between h-full py-2 gap-12">
            
            {/* Top group */}
            <div className="flex flex-col gap-6">
              <h1 className="text-[2rem] sm:text-5xl lg:text-[3.5rem] xl:text-[4.5rem] leading-[1.08] tracking-tight font-normal text-white">
                <span className="flex flex-wrap items-center gap-3">
                  World-class
                  <span 
                    className="inline-block w-20 h-10 sm:w-24 sm:h-12 bg-cover bg-center rounded-full border border-white/10 shadow-sm"
                    style={{ backgroundImage: `url('https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop')` }}
                  />
                </span>
                <span className="block mt-1">builders that</span>
                <span className="flex flex-wrap items-center gap-3 mt-1">
                  empower
                  <button className="inline-flex items-center gap-2 border-2 border-white/20 hover:border-white/60 rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold transition-all group bg-transparent text-white cursor-pointer">
                    <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-black group-hover:scale-105 transition-transform">
                      <Play className="h-3 w-3 fill-current ml-0.5" />
                    </span>
                    How do we work
                  </button>
                </span>
                <span className="block mt-1">Web3 leaders.</span>
              </h1>

              {/* CTAs under headline */}
              <div className="flex items-center gap-6 pt-2">
                <Link to="/contact">
                  <button className="bg-[#b3d1ff] text-black font-semibold rounded-full px-8 py-3.5 flex items-center gap-2 hover:bg-[#9ec2f7] transition-colors hover:shadow-md cursor-pointer">
                    Contact us
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </Link>
                <Link to="/contact" className="underline font-semibold hover:text-white/70 transition-colors text-sm text-white">
                  Request a call
                </Link>
              </div>
            </div>

            {/* Bottom group */}
            <div className="hidden lg:flex flex-col gap-6">
              <p className="text-sm text-white/60 max-w-md leading-relaxed">
                Apna Coding connects world-class blockchain developers and designers with leading protocols, startups, and companies to build next-generation decentralized ecosystems.
              </p>
              <div className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-2 border-t border-white/10">
                <span className="font-bold text-lg tracking-wider text-white/30">Ethereum</span>
                <span className="font-bold text-lg tracking-wider text-white/30">Solana</span>
                <span className="font-bold text-lg tracking-wider text-white/30">Arbitrum</span>
                <span className="font-bold text-lg tracking-wider text-white/30">Polygon</span>
              </div>
            </div>

          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-4 h-full min-h-[500px] lg:min-h-0">
            
            {/* Card 1 (Top, larger) */}
            <div className="relative rounded-[1.5rem] lg:rounded-[2.5rem] liquid-glass overflow-hidden flex-1 flex flex-col justify-between p-6 lg:p-10 group shadow-xl min-h-[260px] lg:min-h-0">
              {/* Background Video */}
              <div className="absolute inset-0 z-0">
                <video
                  ref={videoRef1}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-[1.5s]"
                />
              </div>

              {/* White Heading */}
              <h3 className="relative z-10 text-white text-2xl lg:text-3xl font-semibold max-w-sm leading-tight">
                If you're ready to build your Web3 venture, let's get in touch.
              </h3>

              {/* Bottom Row */}
              <div className="relative z-10 flex items-end justify-between gap-4 mt-6">
                <p className="text-white/85 text-xs lg:text-sm max-w-xs leading-relaxed">
                  Join forces with engineers and architects built for high performance.
                </p>
                <Link to="/contact">
                  <button className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-black hover:scale-105 transition-transform shadow-md cursor-pointer flex-shrink-0">
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </Link>
              </div>
            </div>

            {/* Cards 2 & 3 (Bottom Row) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-auto lg:h-[45%] flex-shrink-0">
              
              {/* Card 2 */}
              <div className="relative rounded-[1.5rem] lg:rounded-[2.5rem] liquid-glass overflow-hidden flex flex-col justify-between p-6 lg:p-8 group shadow-lg min-h-[200px] sm:min-h-0">
                {/* Background HLS Video */}
                <div className="absolute inset-0 z-0">
                  <video
                    ref={videoRef2}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    className="absolute w-[150%] h-[150%] max-w-none object-cover opacity-45 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group-hover:scale-105 transition-transform duration-[1.5s]"
                  />
                </div>

                {/* Top Badge & Arrow */}
                <div className="relative z-10 flex justify-between items-center">
                  <span className="bg-white/90 backdrop-blur-sm text-black text-xs font-semibold px-3 py-1.5 rounded-full">
                    global reach
                  </span>
                  <Link to="/communities">
                    <button className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black hover:scale-105 transition-transform shadow-sm cursor-pointer">
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </Link>
                </div>

                {/* Bottom Text */}
                <div className="relative z-10 mt-6">
                  <h4 className="text-white text-lg lg:text-xl font-semibold leading-tight">
                    United bio-builders
                  </h4>
                  <p className="text-white/80 text-[11px] lg:text-xs mt-1 leading-normal">
                    Working across continents in synchronized teams.
                  </p>
                </div>
              </div>

              {/* Card 3 */}
              <div className="relative rounded-[1.5rem] lg:rounded-[2.5rem] liquid-glass overflow-hidden flex flex-col justify-between p-6 lg:p-8 group shadow-lg min-h-[200px] sm:min-h-0">
                {/* Background HLS Video */}
                <div className="absolute inset-0 z-0">
                  <video
                    ref={videoRef3}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    className="absolute w-[280%] h-[280%] max-w-none object-cover opacity-45 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group-hover:scale-105 transition-transform duration-[1.5s]"
                  />
                </div>

                {/* Top Badge */}
                <div className="relative z-10 flex justify-between items-center">
                  <span className="bg-white/90 backdrop-blur-sm text-black text-xs font-semibold px-3 py-1.5 rounded-full">
                    developers
                  </span>
                </div>

                {/* Bottom Content */}
                <div className="relative z-10 mt-6">
                  <div className="text-white text-4xl lg:text-5xl font-bold tracking-tight">
                    20k+
                  </div>
                  <p className="text-white/80 text-[11px] lg:text-xs mt-1 leading-normal">
                    Verified smart contract and full-stack builders.
                  </p>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
