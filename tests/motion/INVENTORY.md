# Whole-site original visual inventory

Baseline: repository49fd073, before assistant repair commits, compared against all subsequent source changes. This is broader than the ten-media regression.

Restored removals:
- First-tab logo entrance, blue background glow, splash fade and page reveal. The original2.5second hold is retained, once per tab, independent of media loading. Explicit reduced motion skips it.
- Featured community logo rows, continuous horizontal movement, category title's3Dflip, gradient/glass styling. Retains visible names, official logos, fallback marks, published/featured filtering and truthful directory wording. Pause/resume, hover/focus pause and reduced-motion layout remain available.
- Original transparent floating navigation surface, keeping functional responsive breakpoint, escape and route-closing fixes.
- News title gradient treatment restored with readable light gradient stops.
- Removed save-data suppression of original motion. Only explicit reduced-motion accessibility setting substitutes static media.

Original behaviors retained and compared:
- Hero entrance staggering, button scale/tap, glass badges and original video.
- Scroll text character reveal/exit, mouse parallax, scroll frame seeking and3Dglass panel entrance. The line mask/spacing fix prevents characters colliding on phones.
- All three showcase video layers and hover transforms.
- Four workflow backgrounds, original motion-card entrances and hover transformations.
- Ecosystem's three continuously scrolling logo rows, header reveal and pulse badge.
- CTA background, staggered entrances and button hover/tap.
- Featured content carousel sliding/automatic advance (only explicit reduced motion disables automatic advance), content tabs/cards, route page reveals and community card hovers.
- Existing CSS hero orb/grid/shimmer/pulse/spin/glitch definitions unchanged.

Functional fixes and source-backed copy remain. No backend, payment, publication-state or account edits. The former infinite full-screen media-loading blocker is not restored: restored welcome splash owns the entrance, and a failed video must not trap the site.

Regression: `node tests/mobile/build.mjs`, `PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node tests/motion/whole-site.mjs`, mobile outage suite and real-media suite. Set PUBLIC_URL to test deployed whole-site motion.
