import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Download, Palette, FileImage, Type, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const logos = [
  {
    id: 1,
    name: "Primary Logo - Dark",
    url: "https://harmless-tapir-303.convex.cloud/api/storage/c84f5a24-8889-4c9d-a982-72e3f3183b11",
    description: "Main logo for dark backgrounds",
    type: "PNG",
  },
  {
    id: 3,
    name: "Logo Variant - Circle",
    url: "https://harmless-tapir-303.convex.cloud/api/storage/00a81ecb-a2e9-44b9-849a-fe398a4edb35",
    description: "Circular version for social media",
    type: "PNG",
  },
  {
    id: 4,
    name: "Logo Icon",
    url: "https://harmless-tapir-303.convex.cloud/api/storage/08050e06-3275-4be1-9533-db752968dfdf",
    description: "Icon only for small spaces",
    type: "PNG",
  },
  {
    id: 5,
    name: "Full Brand Logo",
    url: "https://harmless-tapir-303.convex.cloud/api/storage/a5a88c73-c6ec-4106-a879-3904cfedef0a",
    description: "Complete branding with text",
    type: "PNG",
  },
  {
    id: 6,
    name: "Brand Logo Variant 1",
    url: "https://harmless-tapir-303.convex.cloud/api/storage/ede86b49-a5df-460e-8e19-1faae36e7d41",
    description: "Alternative brand logo design",
    type: "PNG",
  },
  {
    id: 7,
    name: "Brand Logo Variant 2",
    url: "https://harmless-tapir-303.convex.cloud/api/storage/e27408e6-de6d-4f04-a97c-a615a1c18037",
    description: "Secondary brand logo style",
    type: "PNG",
  },
  {
    id: 8,
    name: "Brand Logo Variant 3",
    url: "https://harmless-tapir-303.convex.cloud/api/storage/1ccdf67f-25ea-4fba-9442-06c3054fe2b0",
    description: "Tertiary brand logo option",
    type: "PNG",
  },
  {
    id: 9,
    name: "Brand Logo Variant 4",
    url: "https://harmless-tapir-303.convex.cloud/api/storage/acd68053-723e-4a17-9900-62a873b8e39e",
    description: "Fourth brand logo variation",
    type: "PNG",
  },
  {
    id: 10,
    name: "Brand Logo Variant 5",
    url: "https://harmless-tapir-303.convex.cloud/api/storage/751367bb-a294-4c16-8760-408c1a7c375e",
    description: "Fifth brand logo style",
    type: "PNG",
  },
  {
    id: 11,
    name: "Brand Logo Variant 6",
    url: "https://harmless-tapir-303.convex.cloud/api/storage/76964557-95eb-4e9d-ab95-80ef8b854ad2",
    description: "Sixth brand logo design",
    type: "PNG",
  },
];

const brandColors = [
  { name: "Primary", hex: "#00ffff", description: "Cyan - Main brand color" },
  { name: "Secondary", hex: "#ff00ff", description: "Magenta - Accent color" },
  { name: "Accent", hex: "#ffff00", description: "Yellow - Highlight color" },
  { name: "Background", hex: "#000000", description: "Black - Background" },
  { name: "Text", hex: "#ffffff", description: "White - Text color" },
];

const guidelines = [
  {
    icon: FileImage,
    title: "Logo Usage",
    description: "Always maintain clear space around the logo equal to the height of the 'A' in Apna. Don't distort, rotate, or alter colors.",
  },
  {
    icon: Palette,
    title: "Color Palette",
    description: "Use the official brand colors for consistency. Primary cyan (#00ffff) is the main brand color.",
  },
  {
    icon: Type,
    title: "Typography",
    description: "Primary font: Inter, Roboto, or system sans-serif. Maintain readability and hierarchy.",
  },
  {
    icon: Shield,
    title: "Do's and Don'ts",
    description: "Do use official assets. Don't modify logos. Do maintain brand consistency. Don't use outdated versions.",
  },
];

export default function BrandingKit() {
  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      toast.success("Logo downloaded successfully!");
    } catch (error) {
      toast.error("Failed to download logo");
      console.error(error);
    }
  };

  const handleDownloadAll = async () => {
    toast.info("Downloading all logos...");
    for (const logo of logos) {
      await handleDownload(logo.url, `apna-coding-${logo.name.toLowerCase().replace(/\s+/g, '-')}.png`);
      // Small delay between downloads
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    toast.success("All logos downloaded!");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold mb-3 cyber-glitch"
            data-text="Branding Kit"
          >
            Branding Kit
          </motion.h1>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            Official Apna Coding brand assets, logos, and guidelines for press, partners, and community use.
          </p>
          <Button
            onClick={handleDownloadAll}
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Download className="mr-2 h-5 w-5" />
            Download All Assets
          </Button>
        </div>

        {/* Logos Section */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <FileImage className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Logo Assets</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {logos.map((logo, index) => (
              <motion.div
                key={logo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:border-primary/30 transition-all group">
                  <CardHeader>
                    <CardTitle className="text-lg">{logo.name}</CardTitle>
                    <CardDescription>{logo.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="aspect-square bg-muted/30 rounded-lg flex items-center justify-center p-6 border border-primary/10">
                      <img
                        src={logo.url}
                        alt={logo.name}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{logo.type}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleDownload(
                            logo.url,
                            `apna-coding-${logo.name.toLowerCase().replace(/\s+/g, '-')}.png`
                          )
                        }
                        className="border-primary/50 hover:bg-primary/10"
                      >
                        <Download className="mr-1 h-3 w-3" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Brand Colors */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Palette className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Brand Colors</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {brandColors.map((color, index) => (
              <motion.div
                key={color.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:border-primary/30 transition-all">
                  <CardContent className="p-4">
                    <div
                      className="w-full h-24 rounded-lg mb-3 border-2 border-primary/20"
                      style={{ backgroundColor: color.hex }}
                    />
                    <h3 className="font-bold mb-1">{color.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{color.description}</p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(color.hex);
                        toast.success(`Copied ${color.hex}`);
                      }}
                      className="text-xs font-mono bg-muted px-2 py-1 rounded hover:bg-muted/70 transition-colors"
                    >
                      {color.hex}
                    </button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Brand Guidelines */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Brand Guidelines</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {guidelines.map((guideline, index) => (
              <motion.div
                key={guideline.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:border-primary/30 transition-all">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                        <guideline.icon className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{guideline.title}</CardTitle>
                    </div>
                    <CardDescription>{guideline.description}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Usage Info */}
        <section>
          <Card className="border-primary/20 bg-card/50">
            <CardHeader>
              <CardTitle>Usage & Licensing</CardTitle>
              <CardDescription>
                These brand assets are provided for official use by press, partners, and community members.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                <strong className="text-foreground">✓ Permitted Use:</strong> Media coverage, partnership
                announcements, community projects, educational content, and promotional materials with proper
                attribution.
              </p>
              <p>
                <strong className="text-foreground">✗ Prohibited Use:</strong> Altering logos, using for
                commercial products without permission, implying false endorsement, or creating derivative works.
              </p>
              <p className="pt-3 border-t border-primary/10">
                For custom requests or commercial licensing, contact us at{" "}
                <a
                  href="mailto:apnacoding.tech@gmail.com"
                  className="text-primary hover:underline"
                >
                  apnacoding.tech@gmail.com
                </a>
              </p>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
}
