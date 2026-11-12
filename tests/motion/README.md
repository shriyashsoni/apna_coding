# Original background motion regression

Build with `node tests/mobile/build.mjs`, then run `node tests/motion/test.mjs`.

The real landing components play their original repository media. The test uses normal muted autoplay, checks advancing hero time, scroll-background frame seeking, and all eight other background video layers at phone and desktop widths. It blocks non-GET requests, never signs in or performs live writes, and verifies reduced-motion mode makes no video requests while retaining the original hero still and static content.

The local `public/video-posters/hero.jpg` is a first-frame extraction from the original hero source, not new artwork:
https://stream.mux.com/4IMYGcL01xjs7ek5ANO17JC4VQVUTsojZlnw4fXzwSxc.m3u8
The former Cloudflare thumbnail URL returned HTTP 404.

The normal responsive suite separately blocks media to confirm content and navigation stay usable during a media outage. Restored cinematic animation retains its original scroll-driven transitions; reduced-motion/data-saving preferences choose the static alternative.
