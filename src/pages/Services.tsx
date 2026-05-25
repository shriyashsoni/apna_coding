import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
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
  Award
} from "lucide-react";

export default function Services() {
  const packages = [
    {
      name: "Starter Boost",
      price: "$300",
      color: "from-blue-500 to-cyan-500",
      icon: Zap,
      duration: "3 Days Promotion",
      bestFor: "Small events, online meetups, single hackathon promo",
      features: [
        "1 Event/Hackathon posting",
        "Website listing (basic)",
        "1 X (Twitter) post",
        "1 LinkedIn post",
        "1 WhatsApp community blast",
        "1 Reminder message (before deadline)",
        "Basic engagement support (repost + comments)"
      ]
    },
    {
      name: "Growth Campaign",
      price: "$600",
      color: "from-purple-500 to-pink-500",
      icon: TrendingUp,
      duration: "7 Days Promotion",
      bestFor: "Hackathons, community launches, product updates",
      featured: true,
      features: [
        "2 Event/Hackathon postings",
        "Website listing + 'Featured Event' tag",
        "2 X posts + 2 Reminder tweets",
        "1 Instagram story + 1 Instagram post",
        "2 WhatsApp community blasts",
        "1 Telegram distribution (optional)",
        "1 News-style article (300–500 words)",
        "Medium engagement support (committee repost + comments)"
      ]
    },
    {
      name: "Premium Ecosystem Push",
      price: "$1200",
      color: "from-yellow-500 to-orange-500",
      icon: Award,
      duration: "14 Days Promotion",
      bestFor: "Ecosystems, major hackathons, IRL conferences, high registration goals",
      features: [
        "3–5 Event/Hackathon promotions",
        "Website feature + Top highlight placement",
        "5 X posts + daily reminders + pinned thread support",
        "2 LinkedIn posts",
        "1 Instagram post + 3 stories",
        "Distribution in multiple communities + local chapter groups",
        "2 Articles: 1 SEO blog (800–1200 words) + 1 short news update",
        "High engagement boost: committee reposts + daily comments + thread engagement"
      ]
    }
  ];

  const services = [
    {
      icon: Calendar,
      title: "Hackathon & Event Promotion",
      description: "Complete event promotion with posting, features, speaker spotlights, and registration CTAs"
    },
    {
      icon: Globe,
      title: "Multi-Community Distribution",
      description: "Your event shared across WhatsApp groups, Telegram, Discord, and local chapters"
    },
    {
      icon: Share2,
      title: "Social Media Marketing",
      description: "Promotion across X (Twitter), Instagram, LinkedIn with ecosystem partner tagging"
    },
    {
      icon: Newspaper,
      title: "Web3 News & Articles",
      description: "SEO-friendly articles and blog publishing on Apna Coding website"
    },
    {
      icon: MessageSquare,
      title: "Engagement Support",
      description: "Committee retweets, comments, daily pushes, and viral reach support"
    },
    {
      icon: Target,
      title: "Website Feature Listing",
      description: "Official listing in 'Upcoming Events/Hackathons' and Web3 events feed"
    }
  ];

  const addons = [
    { name: "Promo reel/script writing", price: "$80" },
    { name: "Viral Twitter thread writing", price: "$60" },
    { name: "Region-specific targeted posting (London/Dubai/Paris/NYC)", price: "$120" },
    { name: "Poster/Banner design", price: "$90" },
    { name: "Email newsletter listing", price: "$150" }
  ];

  const handleContactUs = (packageName?: string) => {
    const subject = packageName
      ? `Inquiry about ${packageName} Package`
      : "Inquiry about Apna Coding Services";

    const body = packageName
      ? `Hi Apna Coding Team,\n\nI'm interested in the ${packageName} package.\n\nEvent Details:\n- Event Name: \n- Date + Deadline: \n- Location/Link: \n- Description: \n\nPlease let me know the next steps.\n\nBest regards`
      : `Hi Apna Coding Team,\n\nI'm interested in your promotion services.\n\nEvent Details:\n- Event Name: \n- Date + Deadline: \n- Location/Link: \n- Description: \n\nPlease let me know more.\n\nBest regards`;

    window.location.href = `mailto:apnacoding.tech@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground pt-24">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="container mx-auto max-w-7xl relative z-10"
          >
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-primary/20 text-primary border-primary/40">
                <Sparkles className="h-3 w-3 mr-1" />
                Web3 Promotion Services
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Apna Coding Web3 Promotion Services
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                Grow your Web3 event, hackathon, product launch, or community with guaranteed visibility across multiple platforms, communities & developer networks.
              </p>
              <div className="flex flex-wrap gap-4 justify-center text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span>Global Web3 Community</span>
                </div>
                <div className="flex items-center gap-2">
                  <Rocket className="h-4 w-4 text-secondary" />
                  <span>Guaranteed Visibility</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-accent" />
                  <span>Proven Results</span>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Services Features Section */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
                What We Provide
              </h2>
              <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
                Comprehensive promotion services designed to maximize your reach and engagement
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card className="border-primary/20 bg-card/50 hover:bg-card/80 transition-all h-full">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <service.icon className="h-6 w-6 text-primary" />
                          </div>
                          <CardTitle className="text-lg">{service.title}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground text-sm">{service.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Pricing Packages Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
                Choose Your Plan
              </h2>
              <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
                Select the perfect package for your promotion needs
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {packages.map((pkg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.15 }}
                    viewport={{ once: true }}
                    className="relative"
                  >
                    {pkg.featured && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none">
                          <Star className="h-3 w-3 mr-1" />
                          Most Popular
                        </Badge>
                      </div>
                    )}
                    <Card className={`border-2 ${pkg.featured ? 'border-purple-500/50 shadow-2xl scale-105' : 'border-primary/20'} bg-card/50 hover:bg-card/80 transition-all h-full`}>
                      <CardHeader>
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${pkg.color} flex items-center justify-center mb-4`}>
                          <pkg.icon className="h-6 w-6 text-white" />
                        </div>
                        <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                        <div className="flex items-baseline gap-2">
                          <span className={`text-4xl font-bold bg-gradient-to-r ${pkg.color} bg-clip-text text-transparent`}>
                            {pkg.price}
                          </span>
                        </div>
                        <CardDescription className="text-sm mt-2">
                          <span className="font-semibold text-foreground">📌 {pkg.duration}</span>
                          <br />
                          ✅ Best for: {pkg.bestFor}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          {pkg.features.map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                              <span className="text-sm text-muted-foreground">{feature}</span>
                            </div>
                          ))}
                        </div>
                        <Button
                          onClick={() => handleContactUs(pkg.name)}
                          className={`w-full bg-gradient-to-r ${pkg.color} hover:opacity-90 text-white`}
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Get Started
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Add-ons Section */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
                Additional Add-ons
              </h2>
              <p className="text-center text-muted-foreground mb-12">
                Enhance your package with optional extras
              </p>

              <Card className="border-primary/20 bg-card/50">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addons.map((addon, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-primary/10"
                      >
                        <span className="text-sm font-medium">{addon.name}</span>
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/40">
                          {addon.price}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                How It Works
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { step: "1", title: "Send Details", desc: "Share your event/hackathon information with us" },
                  { step: "2", title: "Finalize Package", desc: "We confirm package & promotion timeline" },
                  { step: "3", title: "We Promote", desc: "Committee posts across all channels" },
                  { step: "4", title: "Get Report", desc: "Receive promotion proof & analytics" }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="text-center"
                  >
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl font-bold text-white">
                      {item.step}
                    </div>
                    <h3 className="font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Boost Your Event?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Let's make your hackathon/event go viral 🚀
              </p>

              <Card className="border-primary/20 bg-card/80 max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle>What We Need From You</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-left">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Event name</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Date + deadline</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Location / online link</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Poster (if available)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Registration link</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Short description</span>
                  </div>

                  <div className="pt-4 space-y-3">
                    <Button
                      onClick={() => handleContactUs()}
                      className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                      size="lg"
                    >
                      <Mail className="h-5 w-5 mr-2" />
                      Contact Us Now
                    </Button>
                    <div className="text-center space-y-1">
                      <p className="text-sm text-muted-foreground">
                        📧 Email: <a href="mailto:apnacoding.tech@gmail.com" className="text-primary hover:underline">apnacoding.tech@gmail.com</a>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        🌐 Website: <a href="https://www.apnacoding.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.apnacoding.com</a>
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
