import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  Rocket,
  Globe,
  Share2,
  Newspaper,
  MessageSquare,
  TrendingUp,
  CheckCircle,
  Sparkles,
  Users,
  Mail,
  Calendar,
  Target,
  Zap,
  Star,
  Award,
  DollarSign,
  Calculator,
  ArrowRight,
  Shield,
  Layers,
  ArrowUpRight,
  TrendingDown,
  Coins,
  Smile
} from "lucide-react";

export default function Services() {
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [basePackage, setBasePackage] = useState<string>("Growth Campaign");
  const [isYearlyBilling, setIsYearlyBilling] = useState(false);

  const basePriceMap: Record<string, number> = {
    "Starter Boost": 300,
    "Growth Campaign": 600,
    "Premium Ecosystem Push": 1200
  };

  const packages = [
    {
      name: "Starter Boost",
      price: 300,
      color: "from-blue-600/30 via-cyan-500/10 to-blue-500/20",
      border: "border-blue-500/30",
      accent: "text-blue-400",
      icon: Zap,
      duration: "3 Days Promotion",
      bestFor: "Small events, online meetups, single hackathon launch",
      features: [
        "1 Event/Hackathon listing on Apna Coding",
        "Ecosystem website directory placement",
        "1 Targeted X (Twitter) promotional blast",
        "1 LinkedIn professional community post",
        "1 WhatsApp builder community blast",
        "1 Strategic deadline reminder blast",
        "Engagement boost (reposts + comments)"
      ]
    },
    {
      name: "Growth Campaign",
      price: 600,
      color: "from-purple-600/30 via-pink-500/10 to-purple-500/20",
      border: "border-purple-500/40",
      accent: "text-purple-400",
      icon: TrendingUp,
      duration: "7 Days Promotion",
      bestFor: "Major hackathons, community launches, product updates",
      featured: true,
      features: [
        "2 Structured Event/Hackathon postings",
        "Website Homepage Feature listing + Badge",
        "2 X Promotional posts + 2 reminder threads",
        "1 Custom Instagram story + 1 visual feed post",
        "2 Dedicated WhatsApp community blasts",
        "1 Telegram ecosystem channel distribution",
        "1 Custom-written News/Feature article (400 words)",
        "Premium support with daily comment engagement boost"
      ]
    },
    {
      name: "Premium Ecosystem Push",
      price: 1200,
      color: "from-yellow-600/30 via-orange-500/10 to-yellow-500/20",
      border: "border-yellow-500/30",
      accent: "text-yellow-400",
      icon: Award,
      duration: "14 Days Promotion",
      bestFor: "L1/L2 ecosystems, global hackathons, IRL Web3 summits",
      features: [
        "3–5 Dynamic Event & side-event guides",
        "Website banner marquee + Top index highlights",
        "5 Premium X posts + daily custom scheduling",
        "2 Custom LinkedIn high-retention articles",
        "1 Instagram package (3 stories + 1 static)",
        "Cross-channel syndicate distribution",
        "2 Features: 1 SEO blog (1000 words) + 1 news brief",
        "Max engagement boost: daily thread activity support"
      ]
    }
  ];

  const services = [
    {
      icon: Calendar,
      title: "Hackathon & Event Boost",
      description: "Aggressive, conversion-optimized campaigns to secure maximum developer registrations."
    },
    {
      icon: Globe,
      title: "Syndicated Distribution",
      description: "Direct alerts across local chapters, WhatsApp clusters, Telegram channels, and Discord servers."
    },
    {
      icon: Share2,
      title: "Social Amplification",
      description: "Tailored threads, posts, and visual reels tagged with co-hosts and ecosystem partners."
    },
    {
      icon: Newspaper,
      title: "Editorial Blog Features",
      description: "Permanent SEO-optimized article publishing explaining your challenge tracks or platform utility."
    },
    {
      icon: MessageSquare,
      title: "Developer Engagement",
      description: "Direct community conversation starters, QA responses, and viral reach multipliers."
    },
    {
      icon: Target,
      title: "Ecosystem Spotlights",
      description: "Strategic placement on our event directories to capture developer attention."
    }
  ];

  const addonsList = [
    { id: "reel", name: "Promo Reel / Script Writing", price: 80, desc: "Professional script & high-engaging video guides editing." },
    { id: "thread", name: "Viral X Narrative Thread", price: 60, desc: "A narrative-driven, high-retention technical Twitter thread." },
    { id: "targeted", name: "Targeted Geo-Push (Paris/Dubai/NYC)", price: 120, desc: "Exclusive geo-targeted community blasts & local hub coordination." },
    { id: "design", name: "Brand Banner Graphics Design", price: 90, desc: "Custom designed visual assets adhering to your brand kit guidelines." },
    { id: "newsletter", name: "Weekly Dev Newsletter Banner", price: 150, desc: "Featured top banner placement in our weekly developer digest (5k+ builders)." }
  ];

  const toggleAddon = (id: string) => {
    if (selectedAddons.includes(id)) {
      setSelectedAddons(selectedAddons.filter(a => a !== id));
    } else {
      setSelectedAddons([...selectedAddons, id]);
    }
  };

  const calculateTotal = () => {
    const base = basePriceMap[basePackage] || 0;
    const addonsTotal = selectedAddons.reduce((sum, id) => {
      const addon = addonsList.find(a => a.id === id);
      return sum + (addon ? addon.price : 0);
    }, 0);
    return base + addonsTotal;
  };

  const handleContactUs = (packageName?: string, customQuotePrice?: number) => {
    const subject = packageName
      ? `Inquiry: ${packageName} Package - Apna Coding`
      : "Inquiry: Custom Campaign Quote - Apna Coding";

    const selectedAddonNames = selectedAddons
      .map(id => addonsList.find(a => a.id === id)?.name)
      .filter(Boolean)
      .join(", ");

    const body = customQuotePrice
      ? `Hi Apna Coding Team,\n\nI used the campaign calculator and would like to request a quote for:\n\n- Base Package: ${basePackage}\n- Add-ons Selected: ${selectedAddonNames || "None"}\n- Estimated Price: $${customQuotePrice} USD\n\nEvent details:\n- Event Name: \n- Registration URL: \n- Date & Time: \n\nPlease get in touch to kickstart this campaign!\n\nBest regards`
      : `Hi Apna Coding Team,\n\nI'm interested in the ${packageName} package ($${basePriceMap[packageName || ""]} USD).\n\nEvent details:\n- Event Name: \n- Registration URL: \n- Date & Time: \n\nPlease let me know the next steps.\n\nBest regards`;

    window.location.href = `mailto:apnacoding.tech@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground pt-24">
      <Navbar />

      <main className="flex-1">
        {/* Dynamic Glowing Hero */}
        <section className="relative py-24 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.15),transparent_60%)]" />
          <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="container mx-auto max-w-7xl relative z-10"
          >
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 px-3 py-1 text-xs tracking-wider uppercase font-semibold">
                <Sparkles className="h-3 w-3 mr-1 text-primary animate-pulse" />
                Premium Web3 Marketing & Growth
              </Badge>
              
              <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
                Supercharge Your <br />
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Web3 Developer Reach
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
                Guaranteed high-impact visibility, developer acquisition, and event registrations across our curated networks, syndicates, and custom media channels.
              </p>

              {/* Currency Stability Badge */}
              <div className="inline-flex items-center gap-2 bg-card/60 backdrop-blur-md px-4 py-2 rounded-full border border-primary/15 mb-10 text-sm">
                <Coins className="h-4 w-4 text-emerald-400" />
                <span className="text-muted-foreground">All Pricing processed in</span>
                <strong className="text-foreground">USD ($) / stablecoins (USDC/USDT)</strong>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto border-t border-primary/10 pt-10">
                <div className="space-y-1">
                  <div className="text-3xl md:text-4xl font-extrabold text-blue-400">15,000+</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Devs Reached</div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl md:text-4xl font-extrabold text-purple-400">5.8x</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Avg Reg Boost</div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl md:text-4xl font-extrabold text-pink-400">50+</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Events Powered</div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl md:text-4xl font-extrabold text-yellow-400">100%</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Stablecoin Friendly</div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Partners Marquee Grid */}
        <section className="py-8 bg-muted/20 border-y border-primary/10 overflow-hidden">
          <div className="container mx-auto max-w-7xl px-4">
            <p className="text-center text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-6">
              Supporting Projects & Ecosystems Across Major Networks
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-75 grayscale hover:grayscale-0 transition-all duration-300">
              {["Ethereum", "Celo", "Solana", "Flow", "Polygon", "Arbitrum", "Optimism"].map((eco) => (
                <div key={eco} className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span className="font-bold tracking-wider text-sm">{eco}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Dynamic Pricing Cards */}
        <section className="py-24 px-4 relative">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-extrabold mb-4">Pricing Packages</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                Transparent campaign solutions with flat rates listed strictly in **US Dollars**. No hidden transaction fees.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
              {packages.map((pkg, index) => {
                const Icon = pkg.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.15 }}
                    viewport={{ once: true }}
                    className="relative flex"
                  >
                    {pkg.featured && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none py-1 px-3 shadow-lg shadow-purple-500/20 text-xs">
                          <Star className="h-3 w-3 mr-1 fill-white" />
                          Most Popular
                        </Badge>
                      </div>
                    )}
                    <Card className={`border-2 flex flex-col justify-between overflow-hidden w-full transition-all duration-300 hover:shadow-2xl ${
                      pkg.featured 
                        ? `${pkg.border} bg-card/85 shadow-purple-500/5 lg:scale-105 z-10` 
                        : "border-primary/10 bg-card/40"
                    }`}>
                      <CardHeader className="relative">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                          <Icon className="h-24 w-24" />
                        </div>
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${pkg.color} border ${pkg.border} flex items-center justify-center mb-6 shadow-inner`}>
                          <Icon className={`h-6 w-6 ${pkg.accent}`} />
                        </div>
                        <CardTitle className="text-2xl font-bold">{pkg.name}</CardTitle>
                        <div className="flex items-baseline gap-1 mt-2">
                          <span className="text-sm font-semibold text-muted-foreground">$</span>
                          <span className="text-5xl font-extrabold text-foreground tracking-tight">
                            {pkg.price}
                          </span>
                          <span className="text-sm font-semibold text-muted-foreground ml-1">USD</span>
                        </div>
                        
                        <div className="space-y-1.5 mt-4">
                          <div className="text-xs font-bold text-primary uppercase tracking-wider">{pkg.duration}</div>
                          <div className="text-xs text-muted-foreground leading-relaxed">
                            <span className="font-semibold text-foreground">Best for:</span> {pkg.bestFor}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-8 flex-grow flex flex-col justify-between">
                        <div className="space-y-3 pt-4 border-t border-primary/5">
                          {pkg.features.map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-2.5">
                              <CheckCircle className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-muted-foreground leading-snug">{feature}</span>
                            </div>
                          ))}
                        </div>
                        
                        <Button
                          onClick={() => handleContactUs(pkg.name)}
                          className={`w-full py-6 font-bold shadow-lg transition-all ${
                            pkg.featured
                              ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-95 text-white shadow-purple-500/10"
                              : "bg-primary hover:bg-primary/95 text-white"
                          }`}
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Order Package
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Interactive Dynamic Calculator */}
        <section className="py-24 px-4 bg-muted/20 border-y border-primary/5">
          <div className="container mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-12"
            >
              <div className="text-center max-w-2xl mx-auto space-y-3">
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  <Calculator className="h-3.5 w-3.5 mr-1" />
                  Dynamic Quote Tool
                </Badge>
                <h2 className="text-3xl md:text-5xl font-extrabold">Build Your Custom Campaign</h2>
                <p className="text-muted-foreground">
                  Select your core plan and bundle tailored add-on upgrades to calculate your precise marketing quote in real-time.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Selector Side */}
                <div className="lg:col-span-7 space-y-8">
                  {/* Step 1: Base Plan Selector */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">1</span>
                      Select Base Plan
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {Object.keys(basePriceMap).map((name) => (
                        <button
                          key={name}
                          onClick={() => setBasePackage(name)}
                          className={`p-4 rounded-xl border text-left transition-all duration-300 flex flex-col justify-between gap-4 ${
                            basePackage === name
                              ? "border-primary bg-primary/5 ring-1 ring-primary shadow-lg shadow-primary/5"
                              : "border-primary/10 bg-card/50 hover:bg-card"
                          }`}
                        >
                          <span className="text-xs font-bold text-muted-foreground uppercase">{name.split(" ")[0]}</span>
                          <div>
                            <div className="font-bold text-sm leading-tight">{name}</div>
                            <div className="text-lg font-extrabold mt-1 text-foreground">${basePriceMap[name]}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Step 2: Add-on Picker */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">2</span>
                      Choose Modular Add-Ons
                    </h3>
                    <div className="space-y-3">
                      {addonsList.map((addon) => {
                        const isSelected = selectedAddons.includes(addon.id);
                        return (
                          <div
                            key={addon.id}
                            onClick={() => toggleAddon(addon.id)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                              isSelected
                                ? "border-primary bg-primary/5 shadow-md shadow-primary/5"
                                : "border-primary/10 bg-card/40 hover:bg-card/70"
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                                  isSelected ? "bg-primary border-primary text-white" : "border-primary/30"
                                }`}>
                                  {isSelected && <CheckCircle className="h-3 w-3 fill-current text-primary-foreground" />}
                                </div>
                                <span className="font-bold text-sm">{addon.name}</span>
                              </div>
                              <p className="text-xs text-muted-foreground pl-6 leading-relaxed max-w-md">{addon.desc}</p>
                            </div>
                            <Badge variant="outline" className={`font-bold md:self-center self-start ml-6 md:ml-0 bg-background/50 border-primary/20 text-foreground`}>
                              +${addon.price} USD
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Estimate Calculator Summary Card */}
                <div className="lg:col-span-5 lg:sticky lg:top-28">
                  <Card className="border-2 border-primary/20 bg-card/60 backdrop-blur-md shadow-xl overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5 text-primary" />
                        Campaign Summary
                      </CardTitle>
                      <CardDescription>Estimated campaign pricing parameters.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Base: {basePackage}</span>
                          <span className="font-semibold">${basePriceMap[basePackage]} USD</span>
                        </div>
                        
                        {selectedAddons.length > 0 && (
                          <div className="space-y-1.5 pt-3 border-t border-primary/5">
                            <span className="text-xs font-bold text-primary uppercase block">Add-ons Bundle</span>
                            {selectedAddons.map(id => {
                              const ad = addonsList.find(a => a.id === id);
                              return (
                                <div key={id} className="flex justify-between text-xs">
                                  <span className="text-muted-foreground truncate max-w-[200px]">{ad?.name}</span>
                                  <span className="font-semibold text-foreground">+${ad?.price} USD</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      <div className="pt-4 border-t border-primary/10 flex items-baseline justify-between">
                        <span className="font-bold text-base">Total Quote Estimate</span>
                        <div className="text-right">
                          <div className="flex items-baseline justify-end gap-1">
                            <span className="text-xs font-bold text-muted-foreground">$</span>
                            <span className="text-4xl font-extrabold text-foreground tracking-tight">
                              {calculateTotal()}
                            </span>
                            <span className="text-xs font-bold text-muted-foreground">USD</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground block mt-0.5">Stablecoins accepted: USDC / USDT</span>
                        </div>
                      </div>

                      <Button
                        onClick={() => handleContactUs(undefined, calculateTotal())}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-95 text-white font-bold py-6 shadow-md"
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Lock in Estimate Quote
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Feature Grid Highlights */}
        <section className="py-24 px-4 bg-muted/10">
          <div className="container mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="text-center mb-16 space-y-3">
                <h2 className="text-3xl md:text-5xl font-extrabold">Campaign Execution Modules</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  What we execute during your marketing campaign duration to guarantee growth metrics.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service, index) => {
                  const Icon = service.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <Card className="border border-primary/10 bg-card/55 hover:bg-card/85 transition-all duration-300 hover:border-primary/30 h-full flex flex-col">
                        <CardHeader>
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/10 flex items-center justify-center">
                              <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <CardTitle className="text-lg font-bold">{service.title}</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="flex-grow">
                          <p className="text-muted-foreground text-sm leading-relaxed">{service.description}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </section>

        {/* How It Works Dynamic Steps */}
        <section className="py-24 px-4">
          <div className="container mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-5xl font-extrabold text-center mb-16">
                Workflow Timeline
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
                {[
                  { step: "01", title: "Submit Request", desc: "Select a package or lock in your estimate calculator blueprint" },
                  { step: "02", title: "Timeline Alignment", desc: "We map out scheduling matrices matching your milestones" },
                  { step: "03", title: "Campaign Blast", desc: "Omni-channel launches go live with high-impact designer assets" },
                  { step: "04", title: "Analytics Recap", desc: "Receive comprehensive proof-of-posting logs and metrics dashboards" }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="text-center relative group"
                  >
                    <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/15 border border-primary/20 flex items-center justify-center text-xl font-black text-primary transition-all duration-300 group-hover:scale-110 shadow-lg">
                      {item.step}
                    </div>
                    <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed px-2">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Conversion Box */}
        <section className="py-24 px-4 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/15">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center space-y-8"
            >
              <div className="space-y-3">
                <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight">
                  Launch Your Web3 Campaign
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Partner with Apna Coding to connect directly with targeted builders, founders, and Web3 developers globally.
                </p>
              </div>

              <Card className="border-2 border-primary/25 bg-card/90 max-w-2xl mx-auto shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600" />
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center justify-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Campaign Onboarding Checkroom
                  </CardTitle>
                  <CardDescription>Please have these materials prepared when launching your promotion campaign:</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-left">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    {[
                      "Event / Hackathon Name",
                      "Ecosystem Tracks / Prize Pool details",
                      "Target Registration Deadline",
                      "On-chain Registration URL",
                      "Brand Poster Graphics / Vector Logos",
                      "Brief Pitch / Developer Mission Statement"
                    ].map((bullet, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 p-2 bg-muted/40 rounded border border-primary/5">
                        <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                        <span className="text-xs text-muted-foreground font-medium">{bullet}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-6 space-y-4">
                    <Button
                      onClick={() => handleContactUs()}
                      className="w-full bg-gradient-to-r from-blue-500 via-primary to-purple-600 hover:opacity-95 text-white font-bold py-6 text-base shadow-xl shadow-primary/10"
                      size="lg"
                    >
                      <Mail className="h-5 w-5 mr-2 animate-bounce" />
                      Contact Marketing Desk
                    </Button>
                    
                    <div className="text-center space-y-1.5 border-t border-primary/5 pt-4">
                      <p className="text-xs text-muted-foreground">
                        📧 Contact Email: <a href="mailto:apnacoding.tech@gmail.com" className="text-primary hover:underline font-semibold">apnacoding.tech@gmail.com</a>
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        💳 Standard billing processes in **USD ($)**. Invoices generated globally in Web3 native stablecoins (USDC / USDT) or bank transfer.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
