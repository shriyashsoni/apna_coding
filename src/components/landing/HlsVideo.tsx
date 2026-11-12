import React, { useEffect, useRef } from "react";
import Hls from "hls.js";
import { useLightweightMedia } from "@/hooks/useLightweightMedia";

interface HlsVideoProps {
  src: string;
  poster?: string;
  className?: string;
}

export function HlsVideo({ src, poster, className = "" }: HlsVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const lightweight = useLightweightMedia();
  useEffect(() => {
    const video = videoRef.current;
    if (!video || lightweight) return;
    let hls: Hls | undefined;
    const play = () => { video.play().catch(() => { /* Decorative media is optional. */ }); };
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) { video.pause(); return; }
      if (hls || video.getAttribute("src")) { play(); return; }
      if (src.endsWith(".m3u8") && Hls.isSupported()) {
        hls = new Hls({ capLevelToPlayerSize: true, maxBufferLength: 10 });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, play);
      } else {
        video.preload = "auto";
        video.src = src;
        video.addEventListener("loadedmetadata", play);
        video.load();
        play();
      }
    }, { rootMargin: "100px" });
    observer.observe(video);
    return () => {
      observer.disconnect();
      video.removeEventListener("loadedmetadata", play);
      video.pause();
      hls?.destroy();
      video.removeAttribute("src");
      video.load();
    };
  }, [src, lightweight]);

  return (
    <video
      ref={videoRef}
      className={className}
      poster={poster}
      aria-hidden="true"
      preload="none"
      loop
      muted
      playsInline
    />
  );
}
