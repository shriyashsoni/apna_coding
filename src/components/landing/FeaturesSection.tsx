import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { useLightweightMedia } from "@/hooks/useLightweightMedia";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Trophy, Briefcase, Package } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ----------------------------------------------------
// ScrollVideo Layer Component
// ----------------------------------------------------
function ScrollVideo({ src }: { src: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);


  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;
    let targetTime = 0;
    let seekPending = false;

    const doSeek = () => {
      if (video.seeking) {
        seekPending = true;
      } else {
        video.currentTime = targetTime;
        seekPending = false;
      }
    };

    const handleSeeked = () => {
      if (seekPending) {
        doSeek();
      }
    };

    video.addEventListener("seeked", handleSeeked);

    const isMp4 = src.toLowerCase().endsWith(".mp4") || !src.includes(".m3u8");

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      if (isMp4 || video.canPlayType("application/vnd.apple.mpegurl")) {
        video.preload = "auto";
        video.src = src;
        video.load();
      } else if (Hls.isSupported()) {
        hls = new Hls({ maxBufferLength: 10, capLevelToPlayerSize: true });
        hls.loadSource(src);
        hls.attachMedia(video);
      }
    }, { rootMargin: "200px" });
    if (containerRef.current) observer.observe(containerRef.current);

    // Scroll seek setup
    const trigger = ScrollTrigger.create({
      trigger: "#scroll-sequence-container",
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        if (video.duration) {
          targetTime = self.progress * video.duration;
          doSeek();
        }
      },
    });

    // Mouse parallax movement
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const moveX = (clientX / window.innerWidth) * 2 - 1;
      const moveY = (clientY / window.innerHeight) * 2 - 1;

      gsap.to(containerRef.current, {
        x: moveX * -30,
        y: moveY * -30,
        duration: 1.5,
        ease: "power2.out",
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      video.removeEventListener("seeked", handleSeeked);
      observer.disconnect();
      trigger.kill();
      if (hls) {
        hls.destroy();
      }
    };
  }, [src]);

  return (
    <>
      {/* Video Container Wrapper */}
      <div 
        ref={containerRef} 
        className="absolute inset-0 z-0 scale-[1.05] origin-center pointer-events-none"
      >
        <video
          ref={videoRef}
          className="w-full h-full object-cover scale-[1.35]"
          preload="none"
          aria-hidden="true"
          muted
          playsInline
          crossOrigin="anonymous"
        />
        <div className="absolute inset-0 bg-black/40 z-[1]" />
      </div>
    </>
  );
}

// ----------------------------------------------------
// ScrollFloat Layer Component
// ----------------------------------------------------
function ScrollFloat({ children }: { children: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const chars = containerRef.current?.querySelectorAll(".char");
    if (!chars || chars.length === 0) return;

    const anim = gsap.fromTo(
      chars,
      {
        opacity: 1,
        yPercent: 0,
        scaleY: 1,
        scaleX: 1,
        transformOrigin: "50% 0%",
      },
      {
        opacity: 0,
        yPercent: 250,
        scaleY: 1.2,
        scaleX: 0.9,
        stagger: 0.05,
        ease: "power2.inOut",
        duration: 1,
        scrollTrigger: {
          trigger: "#scroll-sequence-container",
          start: "top top",
          end: "+=1200",
          scrub: 1.5,
        },
      }
    );

    return () => {
      anim.scrollTrigger?.kill();
      anim.kill();
    };
  }, [children]);

  // Transform text string into letters/chars beautifully
  const lines = children.split("\n");

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 z-10 flex flex-col justify-end p-4 md:p-12 pb-24 md:pb-36 pointer-events-none select-none"
    >
      {lines.map((line, lineIdx) => {
        const words = line.split(" ");
        return (
          <span 
            key={lineIdx} 
            style={{ display: "block", fontSize: "clamp(3.5rem, 11vw, 220px)" }} 
            className="text-center font-dirtyline text-white leading-[1.05] tracking-tight uppercase overflow-hidden"
          >
            {words.map((word, wordIdx) => {
              const chars = Array.from(word);
              return (
                <span 
                  key={wordIdx} 
                  style={{ display: "inline-block", whiteSpace: "nowrap" }}
                  className="scroll-float-text mr-4 md:mr-8 last:mr-0"
                >
                  {chars.map((char, charIdx) => (
                    <span key={charIdx} className="char">
                      {char}
                    </span>
                  ))}
                </span>
              );
            })}
          </span>
        );
      })}
    </div>
  );
}

// ----------------------------------------------------
// GlassPanel Layer Component ( frosted, 3D mouse parallax )
// ----------------------------------------------------
function GlassPanel() {
  const panelWrapperRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // ScrollTrigger to slide the panel up from 100% to 0%
    const anim = gsap.fromTo(
      panelWrapperRef.current,
      { y: "100%" },
      {
        y: "0%",
        ease: "none",
        scrollTrigger: {
          trigger: "#scroll-sequence-container",
          start: "top bottom",
          end: "bottom bottom",
          scrub: 1.5,
        },
      }
    );

    // Mouse movement 3D tilt interaction on panel itself
    const handleMouseMove = (e: MouseEvent) => {
      if (!panelRef.current) return;
      const { clientX, clientY } = e;
      const moveX = (clientX / window.innerWidth) * 2 - 1;
      const moveY = (clientY / window.innerHeight) * 2 - 1;

      gsap.to(panelRef.current, {
        x: moveX * 20,
        y: moveY * 20,
        rotationY: moveX * 4,
        rotationX: -moveY * 4,
        ease: "power3.out",
        duration: 1,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      anim.scrollTrigger?.kill();
      anim.kill();
    };
  }, []);

  const features = [
    {
      icon: Trophy,
      title: "Epic Hackathons",
      desc: "Compete globally, build innovative projects, and win huge prizes in leading Web3 ecosystems.",
    },
    {
      icon: Briefcase,
      title: "Career Opportunities",
      desc: "Connect with top Web3 companies. Our AI-powered platform matches you with your dream job.",
    },
    {
      icon: Package,
      title: "Discover Products",
      desc: "Explore cutting-edge Web3 applications and tools built by the community.",
    },
  ];

  const marqueeBrands = ["ETHEREUM", "SOLANA", "ARBITRUM", "POLYGON", "BASE", "SUI", "OPTIMISM", "AVALANCHE"];

  return (
    <div 
      ref={panelWrapperRef}
      className="absolute bottom-0 left-0 w-full h-screen flex items-end justify-center pb-8 px-4 z-20 pointer-events-none"
    >
      <div 
        style={{ perspective: "1000px" }}
        className="w-full max-w-[1250px] h-[900px] max-h-[85vh] pointer-events-auto"
      >
        <div
          ref={panelRef}
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.25)",
            backdropFilter: "blur(80px)",
            WebkitBackdropFilter: "blur(80px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            transformStyle: "preserve-3d",
            willChange: "transform",
          }}
          className="w-full h-full flex flex-col justify-between rounded-3xl relative overflow-hidden"
        >
          {/* Main Frosted Glass Content */}
          <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-12 text-center py-2 md:py-8 overflow-y-auto overflow-x-hidden no-scrollbar">
            <span className="font-serif italic text-white/70 text-[10px] md:text-base mb-1 md:mb-2">
              Web3 Opportunity Layer
            </span>
            <h2 className="font-serif text-white text-[17px] sm:text-3xl md:text-5xl lg:text-[40px] leading-[1.2] md:leading-[1.3] tracking-tight w-full max-w-[1000px] mx-auto mb-3 md:mb-8">
              Apna Coding is a decentralized, public opportunity layer that gives anyone the tools to create experiences that are more like <span className="italic font-normal">growth</span> than just <span className="italic font-normal">networking</span>.
            </h2>

            {/* Sub Feature Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-6 w-full max-w-[1100px] text-left mt-1 md:mt-2">
              {features.map((feat, idx) => {
                const Icon = feat.icon;
                return (
                  <div
                    key={idx}
                    className="p-2.5 md:p-6 rounded-xl md:rounded-2xl border border-white/5 bg-white/[0.03] backdrop-blur-md flex flex-row sm:flex-col items-center sm:items-start gap-3 md:gap-0 justify-start sm:justify-between hover:border-white/20 transition-all duration-300 group"
                  >
                    <div className="w-8 h-8 min-w-[32px] md:w-12 md:h-12 md:min-w-[48px] rounded-lg md:rounded-xl bg-white flex items-center justify-center text-black mb-0 md:mb-4 group-hover:scale-105 transition-transform">
                      <Icon className="h-4 w-4 md:h-6 md:w-6" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="text-[13px] md:text-lg font-bold text-white mb-0.5 md:mb-2 leading-tight">{feat.title}</h3>
                      <p className="text-white/60 text-[10px] md:text-xs leading-snug md:leading-relaxed">{feat.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Infinite Logo Marquee */}
          <div className="border-t border-white/10 py-3 md:py-6 overflow-hidden w-full relative bg-black/10">
            <div className="flex w-max animate-marquee whitespace-nowrap">
              {/* Duplicate 2 times for a seamless infinite loop */}
              {[1, 2].map((multiplier) => (
                <div key={multiplier} className="flex items-center justify-around gap-8 md:gap-16 px-4 md:px-8">
                  {marqueeBrands.map((brand, bIdx) => (
                    <span 
                      key={bIdx}
                      className="text-white/40 hover:text-white transition-opacity duration-300 font-sans font-semibold text-[10px] md:text-xs tracking-[0.2em]"
                    >
                      {brand}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// Master Assembly Container
// ----------------------------------------------------
export function FeaturesSection() {
  const lightweight = useLightweightMedia();
  if (lightweight) return (
    <section className="px-4 py-16 border-y border-white/10 bg-black" aria-label="Web3 opportunities">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-medium mb-8">Web3 Opportunity Layer</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { Icon: Trophy, title: "Epic Hackathons", desc: "Compete globally, build innovative projects, and win prizes in Web3 ecosystems." },
            { Icon: Briefcase, title: "Career Opportunities", desc: "Connect with Web3 companies and explore career opportunities." },
            { Icon: Package, title: "Discover Products", desc: "Explore Web3 applications and tools shared by the community." },
          ].map(({ Icon, title, desc }) => <div key={title} className="liquid-glass rounded-2xl p-6"><Icon className="h-6 w-6 mb-4" /><h3 className="text-lg font-semibold mb-2">{title}</h3><p className="text-sm text-muted-foreground">{desc}</p></div>)}
        </div>
      </div>
    </section>
  );
  return (
    <section 
      id="scroll-sequence-container" 
      className="relative w-full h-[500vh] bg-black text-white"
    >
      {/* Sticky viewport content container */}
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden">
        {/* Layer 1: HLS Scrubbing Video Background */}
        <ScrollVideo src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260306_074215_04640ca7-042c-45d6-bb56-58b1e8a42489.mp4" />

        {/* Layer 2: GSAP Animated Floating Text */}
        <ScrollFloat>{`Web3 Has Changed.\nHave You?`}</ScrollFloat>
      </div>

      {/* Layer 3: frosted liquid glass interactive panel */}
      <GlassPanel />
    </section>
  );
}
