import React, { useEffect, useRef } from "react";
import Hls from "hls.js";

interface HlsVideoProps {
  src: string;
  poster?: string;
  className?: string;
}

export function HlsVideo({ src, poster, className = "" }: HlsVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (src.endsWith(".m3u8")) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          capLevelToPlayerSize: true,
          maxBufferLength: 30,
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch((e) => console.log("Auto-play prevented", e));
        });
        return () => {
          hls.destroy();
        };
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        video.addEventListener("loadedmetadata", () => {
          video.play().catch((e) => console.log("Auto-play prevented", e));
        });
      }
    } else {
      video.src = src;
      video.load();
      video.play().catch((e) => console.log("Auto-play prevented", e));
    }
  }, [src]);

  return (
    <video
      ref={videoRef}
      className={className}
      poster={poster}
      autoPlay
      loop
      muted
      playsInline
    />
  );
}
