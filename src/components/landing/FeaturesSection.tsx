import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
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
  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

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

    const handleProgress = () => {
      if (video.duration && video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const progress = Math.min(100, Math.round((bufferedEnd / video.duration) * 100));
        setLoadProgress(progress);
      }
    };
    video.addEventListener("progress", handleProgress);

    const isMp4 = src.toLowerCase().endsWith(".mp4") || !src.includes(".m3u8");

    if (isMp4) {
      video.src = src;
    } else {
      // HLS initialization
      if (Hls.isSupported()) {
        hls = new Hls({
          maxBufferLength: 120,
          maxMaxBufferLength: 600,
          maxBufferSize: 200 * 1024 * 1024,
          startPosition: 0,
          capLevelToPlayerSize: false,
          startLevel: -1,
          autoStartLoad: true,
        });

        hls.loadSource(src);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          const maxLevel = hls!.levels.length - 1;
          hls!.currentLevel = maxLevel;
          hls!.startLevel = maxLevel;
        });

        hls.on(Hls.Events.FRAG_BUFFERED, (event, data) => {
          if (video.duration) {
            const bufferedEnd = video.buffered.length > 0 ? video.buffered.end(video.buffered.length - 1) : 0;
            const progress = Math.min(100, Math.round((bufferedEnd / video.duration) * 100));
            setLoadProgress(progress);
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // Safari native HLS support
        video.src = src;
      }
    }

    const handleCanPlay = () => {
      setIsLoaded(true);
      setLoadProgress(100);
    };

    video.addEventListener("canplay", handleCanPlay);

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
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("progress", handleProgress);
      trigger.kill();
      if (hls) {
        hls.destroy();
      }
    };
  }, [src]);

  return (
    <>
      {/* Loading Overlay */}
      {!isLoaded && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center text-white">
          <span className="text-2xl font-medium tracking-wider">
            Loading Cinematic Web3 Experience... {loadProgress}%
          </span>
        </div>
      )}

      {/* Video Container Wrapper */}
      <div 
        ref={containerRef} 
        className="absolute inset-0 z-0 scale-[1.05] origin-center pointer-events-none"
      >
        <video
          ref={videoRef}
          className="w-full h-full object-cover scale-[1.35]"
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
            className="text-center font-dirtyline text-white leading-[0.85] tracking-tight uppercase"
          >
            {words.map((word, wordIdx) => {
              const chars = Array.from(word);
              return (
                <span 
                  key={wordIdx} 
                  style={{ display: "inline-block", whiteSpace: "nowrap" }}
                  className="scroll-float-text mr-4 md:mr-8"
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
          <div className="flex-1 flex flex-col items-center justify-center px-6 md:px-12 text-center pt-8">
            <span className="font-serif italic text-white/70 text-sm md:text-base mb-2">
              Web3 Opportunity Layer
            </span>
            <h2 className="font-serif text-white text-3xl md:text-5xl lg:text-[40px] leading-[1.2] tracking-tight w-full max-w-[1000px] mx-auto mb-8">
              Apna Coding is a decentralized, public opportunity layer that gives anyone the tools to create experiences that are more like <span className="italic font-normal">growth</span> than just <span className="italic font-normal">networking</span>.
            </h2>

            {/* Sub Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-[1100px] text-left mt-2">
              {features.map((feat, idx) => {
                const Icon = feat.icon;
                return (
                  <div
                    key={idx}
                    className="p-6 rounded-2xl border border-white/5 bg-white/[0.03] backdrop-blur-md flex flex-col justify-between h-full hover:border-white/20 transition-all duration-300 group"
                  >
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-black mb-4 group-hover:scale-105 transition-transform">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">{feat.title}</h3>
                      <p className="text-white/60 text-xs leading-relaxed">{feat.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Infinite Logo Marquee */}
          <div className="border-t border-white/10 py-6 overflow-hidden w-full relative bg-black/10">
            <div className="flex w-[200%] animate-marquee whitespace-nowrap">
              {/* Duplicate 2 times for a seamless infinite loop */}
              {[1, 2].map((multiplier) => (
                <div key={multiplier} className="flex justify-around items-center w-1/2">
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
