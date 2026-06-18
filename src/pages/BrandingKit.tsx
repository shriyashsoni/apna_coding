import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Download, Palette, FileImage, Type, Shield, Copy, Check, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useState } from "react";

const logos = [
  {
    id: 1,
    name: "Primary Logo — White (Transparent)",
    url: "/branding/apna coding logo white bground remove.png",
    description: "Main logo with transparent background, ideal for dark themes and overlays.",
    type: "PNG",
    bg: "bg-black",
  },
  {
    id: 2,
    name: "Logo — White on Solid",
    url: "/branding/apna coding logo white (2).png",
    description: "White logo on a solid background for social media and profile pictures.",
    type: "PNG",
    bg: "bg-neutral-900",
  },
  {
    id: 3,
    name: "Logo — Black on White",
    url: "/branding/Apna Coding logo black.png",
    description: "Dark logo for light backgrounds, print, and documents.",
    type: "PNG",
    bg: "bg-white",
  },
  {
    id: 4,
    name: "Logo — Black (Transparent)",
    url: "/branding/Apna Coding logo black-Photoroom.png",
    description: "Dark logo with background removed for flexible placement.",
    type: "PNG",
    bg: "bg-neutral-200",
  },
  {
    id: 5,
    name: "Full Brand Lockup",
    url: "/branding/Apna Coding with name.jpg",
    description: "Complete logo with wordmark for headers, banners, and hero sections.",
    type: "JPG",
    bg: "bg-black",
  },
  {
    id: 6,
    name: "Horizontal Logo — White (Transparent)",
    url: "/branding/logo-horizontal-white-transparent.png",
    description: "Horizontal logo with white icon and text, transparent background.",
    type: "PNG",
    bg: "bg-black",
  },
  {
    id: 7,
    name: "Horizontal Logo — White on Black",
    url: "/branding/logo-horizontal-white-bg-black.png",
    description: "Horizontal logo with white icon and text on a solid black background.",
    type: "PNG",
    bg: "bg-neutral-900",
  },
  {
    id: 8,
    name: "Horizontal Logo — Black (Transparent)",
    url: "/branding/logo-horizontal-black-transparent.png",
    description: "Horizontal logo with black icon and text, transparent background.",
    type: "PNG",
    bg: "bg-neutral-200",
  },
  {
    id: 9,
    name: "Horizontal Logo — Black on White",
    url: "/branding/logo-horizontal-black-bg-white.png",
    description: "Horizontal logo with black icon and text on a solid white background.",
    type: "PNG",
    bg: "bg-white",
  },
];

const brandColors = [
  { name: "Obsidian", hex: "#0A0A0A", rgb: "10, 10, 10", description: "Primary background" },
  { name: "Pure White", hex: "#FFFFFF", rgb: "255, 255, 255", description: "Primary text & logo" },
  { name: "Smoke", hex: "#A1A1AA", rgb: "161, 161, 170", description: "Secondary text" },
  { name: "Glass Border", hex: "#27272A", rgb: "39, 39, 42", description: "Borders & dividers" },
  { name: "Card Surface", hex: "#18181B", rgb: "24, 24, 27", description: "Card backgrounds" },
  { name: "Accent Blue", hex: "#3B82F6", rgb: "59, 130, 246", description: "Links & interactive" },
  { name: "Success", hex: "#22C55E", rgb: "34, 197, 94", description: "Positive states" },
  { name: "Chain Gold", hex: "#F59E0B", rgb: "245, 158, 11", description: "Premium highlights" },
];

const typographySpecs = [
  { name: "Heading 1", family: "Inter", weight: "700 Bold", size: "48–72px", tracking: "-0.02em", sample: "Build the Future" },
  { name: "Heading 2", family: "Inter", weight: "600 Semibold", size: "32–40px", tracking: "-0.01em", sample: "Featured Hackathons" },
  { name: "Body", family: "Barlow", weight: "400 Regular", size: "16–18px", tracking: "0", sample: "A decentralized platform where anyone can post hackathons, jobs, and events." },
  { name: "Caption", family: "Inter", weight: "500 Medium", size: "11–13px", tracking: "0.12em", sample: "HACKATHONS · EVENTS · JOBS" },
];

const guidelines = [
  {
    icon: FileImage,
    title: "Logo Clear Space",
    description: "Always maintain clear space around the logo equal to the height of the connector element. Never crop, distort, rotate, or add effects to the logo.",
  },
  {
    icon: Palette,
    title: "Color Usage",
    description: "Use Obsidian (#0A0A0A) as the primary background. White for text and logos on dark. The chain-link mark should always be rendered in pure white or pure black — never in color.",
  },
  {
    icon: Type,
    title: "Typography",
    description: "Primary font: Inter for headings. Barlow for body text. Always use proper weight hierarchy. Navigation uses 11px uppercase tracking at 0.12em.",
  },
  {
    icon: Shield,
    title: "Do's & Don'ts",
    rules: {
      dos: [
        "Use official assets from this page",
        "Maintain minimum clear space",
        "Use approved color combinations",
        "Credit 'Apna Coding' when referencing",
      ],
      donts: [
        "Add shadows, gradients, or effects to the logo",
        "Change logo colors or proportions",
        "Place logo on busy backgrounds without contrast",
        "Use outdated or unofficial logo versions",
      ],
    },
  },
];

function ColorSwatch({ color, index }: { color: typeof brandColors[0]; index: number }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(color.hex);
    setCopied(true);
    toast.success(`Copied ${color.hex}`);
    setTimeout(() => setCopied(false), 2000);
  };

  const isLight = ["#FFFFFF", "#A1A1AA", "#F59E0B", "#22C55E", "#3B82F6"].includes(color.hex);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group"
    >
      <div className="liquid-glass rounded-xl overflow-hidden hover:border-white/20 transition-all">
        <div
          className="h-28 w-full relative"
          style={{ backgroundColor: color.hex }}
        >
          <span className={`absolute bottom-2 left-3 text-[10px] font-mono tracking-wider ${isLight ? "text-black/60" : "text-white/60"}`}>
            {color.hex}
          </span>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-sm text-white">{color.name}</h3>
            <button
              onClick={handleCopy}
              className="text-white/40 hover:text-white transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
          <p className="text-[11px] text-white/40 mb-2">{color.description}</p>
          <span className="text-[10px] font-mono text-white/30">rgb({color.rgb})</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function BrandingKit() {
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      toast.success("Asset downloaded!");
    } catch (error) {
      toast.error("Failed to download");
      console.error(error);
    }
  };

  const handleDownloadAll = async () => {
    toast.info("Downloading all assets...");
    for (const logo of logos) {
      const ext = logo.type.toLowerCase();
      await handleDownload(
        logo.url,
        `apna-coding-${logo.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.${ext}`
      );
      await new Promise((r) => setTimeout(r, 500));
    }
    toast.success("All assets downloaded!");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 pt-32 pb-16 max-w-6xl">

        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 liquid-glass rounded-full px-4 py-2 mb-8">
            <Palette className="h-4 w-4 text-white/60" />
            <span className="text-xs font-medium tracking-wider uppercase text-white/60">Brand Identity</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            Branding Kit
          </h1>
          <p className="text-white/50 max-w-2xl mx-auto text-lg leading-relaxed mb-10">
            Official Apna Coding brand assets, color palette, typography, and usage guidelines 
            for press, partners, and community.
          </p>
          <Button
            onClick={handleDownloadAll}
            size="lg"
            className="bg-white text-black hover:bg-white/90 font-semibold px-8 py-3 rounded-xl"
          >
            <Download className="mr-2 h-5 w-5" />
            Download All Assets
          </Button>
        </motion.div>

        {/* ─── Logo Assets ─── */}
        <section className="mb-24">
          <div className="flex items-center gap-3 mb-2">
            <FileImage className="h-5 w-5 text-white/40" />
            <h2 className="text-2xl font-bold tracking-tight">Logo Assets</h2>
          </div>
          <p className="text-white/40 text-sm mb-8">Click any logo to preview full-size. Download individual files or all at once.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {logos.map((logo, index) => (
              <motion.div
                key={logo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="group"
              >
                <div className="liquid-glass rounded-2xl overflow-hidden hover:border-white/20 transition-all h-full flex flex-col">
                  {/* Preview Area */}
                  <div
                    className={`aspect-[4/3] ${logo.bg} flex items-center justify-center p-8 relative cursor-pointer`}
                    onClick={() => setPreviewLogo(logo.url)}
                  >
                    <img
                      src={logo.url}
                      alt={logo.name}
                      className="max-w-full max-h-full object-contain"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-semibold text-sm mb-1 text-white">{logo.name}</h3>
                    <p className="text-[12px] text-white/40 mb-4 flex-1">{logo.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-white/25 tracking-wider">{logo.type}</span>
                      <button
                        onClick={() =>
                          handleDownload(
                            logo.url,
                            `apna-coding-${logo.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.${logo.type.toLowerCase()}`
                          )
                        }
                        className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium px-3 py-1.5 rounded-lg transition-all text-xs"
                      >
                        <Download className="h-3 w-3" />
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ─── Brand Colors ─── */}
        <section className="mb-24">
          <div className="flex items-center gap-3 mb-2">
            <Palette className="h-5 w-5 text-white/40" />
            <h2 className="text-2xl font-bold tracking-tight">Color Palette</h2>
          </div>
          <p className="text-white/40 text-sm mb-8">
            Our palette is built around monochrome clarity with selective accent colors. Click any swatch to copy its hex code.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {brandColors.map((color, index) => (
              <ColorSwatch key={color.name} color={color} index={index} />
            ))}
          </div>
        </section>

        {/* ─── Typography ─── */}
        <section className="mb-24">
          <div className="flex items-center gap-3 mb-2">
            <Type className="h-5 w-5 text-white/40" />
            <h2 className="text-2xl font-bold tracking-tight">Typography</h2>
          </div>
          <p className="text-white/40 text-sm mb-8">
            We use Inter for headings and Barlow for body text. Navigation labels use uppercase Inter with wide tracking.
          </p>

          <div className="space-y-4">
            {typographySpecs.map((spec, index) => (
              <motion.div
                key={spec.name}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 }}
                className="liquid-glass rounded-xl p-6 flex flex-col md:flex-row md:items-center gap-4 md:gap-8"
              >
                <div className="shrink-0 w-32">
                  <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">{spec.name}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-white truncate"
                    style={{
                      fontFamily: spec.family === "Inter" ? "Inter, sans-serif" : "Barlow, sans-serif",
                      fontWeight: parseInt(spec.weight),
                      fontSize: spec.name === "Heading 1" ? "32px" : spec.name === "Heading 2" ? "24px" : spec.name === "Caption" ? "11px" : "16px",
                      letterSpacing: spec.tracking,
                      textTransform: spec.name === "Caption" ? "uppercase" : "none",
                    }}
                  >
                    {spec.sample}
                  </p>
                </div>
                <div className="shrink-0 flex flex-wrap gap-3 text-[11px] text-white/30 font-mono">
                  <span>{spec.family}</span>
                  <span>·</span>
                  <span>{spec.weight}</span>
                  <span>·</span>
                  <span>{spec.size}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ─── Brand Guidelines ─── */}
        <section className="mb-24">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-5 w-5 text-white/40" />
            <h2 className="text-2xl font-bold tracking-tight">Brand Guidelines</h2>
          </div>
          <p className="text-white/40 text-sm mb-8">
            Follow these rules to maintain consistency across all touchpoints.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {guidelines.map((g, index) => (
              <motion.div
                key={g.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="liquid-glass rounded-2xl p-6 hover:border-white/20 transition-all"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <g.icon className="h-5 w-5 text-white/50" />
                  </div>
                  <h3 className="font-semibold text-white">{g.title}</h3>
                </div>

                {g.description && (
                  <p className="text-sm text-white/40 leading-relaxed">{g.description}</p>
                )}

                {"rules" in g && g.rules && (
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <span className="text-[10px] font-mono text-green-400/60 uppercase tracking-widest mb-2 block">Do</span>
                      <ul className="space-y-2">
                        {g.rules.dos.map((rule) => (
                          <li key={rule} className="text-xs text-white/40 flex items-start gap-2">
                            <span className="text-green-400 mt-0.5">✓</span>
                            {rule}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-red-400/60 uppercase tracking-widest mb-2 block">Don't</span>
                      <ul className="space-y-2">
                        {g.rules.donts.map((rule) => (
                          <li key={rule} className="text-xs text-white/40 flex items-start gap-2">
                            <span className="text-red-400 mt-0.5">✗</span>
                            {rule}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </section>

        {/* ─── Usage & Licensing ─── */}
        <section className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="liquid-glass rounded-2xl p-8"
          >
            <h2 className="text-xl font-bold mb-4">Usage & Licensing</h2>
            <div className="space-y-4 text-sm text-white/50 leading-relaxed">
              <p>
                <strong className="text-white">✓ Permitted:</strong> Media coverage, partnership
                announcements, community projects, educational content, and promotional materials with proper attribution.
              </p>
              <p>
                <strong className="text-white">✗ Prohibited:</strong> Altering logos, using for
                commercial products without permission, implying false endorsement, or creating derivative works.
              </p>
              <div className="pt-4 border-t border-white/10">
                <p>
                  For custom requests or commercial licensing, contact{" "}
                  <a href="mailto:apnacoding.tech@gmail.com" className="text-blue-400 hover:text-blue-300 transition-colors underline underline-offset-2">
                    apnacoding.tech@gmail.com
                  </a>
                </p>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />

      {/* ─── Fullscreen Preview Modal ─── */}
      {previewLogo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-8 cursor-pointer"
          onClick={() => setPreviewLogo(null)}
        >
          <motion.img
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 25 }}
            src={previewLogo}
            alt="Logo preview"
            className="max-w-full max-h-full object-contain"
          />
          <span className="absolute top-6 right-6 text-white/40 text-sm">Click anywhere to close</span>
        </motion.div>
      )}
    </div>
  );
}
