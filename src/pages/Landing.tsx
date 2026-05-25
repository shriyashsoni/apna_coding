import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { SEO } from "@/components/SEO";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

// New Mindloop-styled sections
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { CTASection } from "@/components/landing/CTASection";
import { EcosystemSection } from "@/components/landing/EcosystemSection";
import { Web3ShowcaseSection } from "@/components/landing/Web3ShowcaseSection";

// Existing sections to keep
import { FeaturedPartnersCarousel } from "@/components/FeaturedPartnersCarousel";
import { InteractiveFeaturesSection } from "@/components/InteractiveFeaturesSection";
import { SmartWorkflow } from "@/components/SmartWorkflow";
import { useSupabaseQuery } from "@/hooks/useSupabase";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, Trophy, Users } from "lucide-react";
import { fadeUp } from "@/components/landing/HeroSection";

export default function Landing() {
  const [searchParams] = useSearchParams();
  const { user: authUser } = useAuth();

  const { data: featuredHackathons } = useSupabaseQuery('hackathons', (q) => q.eq('is_featured', true).limit(3));
  const { data: featuredEvents } = useSupabaseQuery('events', (q) => q.eq('is_featured', true).limit(3));
  const { data: featuredCommunities } = useSupabaseQuery('communities', (q) => q.eq('is_featured', true).limit(3));

  // Detect and apply referral code
  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode && authUser && !authUser.referred_by_code) {
      supabase.rpc('apply_referral_code', { p_referral_code: refCode })
        .then(({ error }) => {
          if (!error) toast.success(`🎉 Welcome! Referral code applied.`);
        });
    }
  }, [authUser, searchParams]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-foreground selection:text-background">
      <SEO
        title="Build the Future of Web3"
        description="India's Premier Web3 Opportunity Layer. Join hackathons, find Web3 jobs, build products, discover events."
        keywords={["web3 community India", "blockchain hackathons", "web3 jobs India", "crypto developer community"]}
        url="/"
        type="website"
      />
      
      {/* Navbar overlaying the Hero */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>

      <HeroSection />
      
      <FeaturesSection />

      {/* Dynamic Data Sections Restyled */}
      <section className="py-24 bg-background relative z-10">
        <div className="container mx-auto px-4 max-w-6xl">
          
          {/* Featured Hackathons Section */}
          <motion.div {...fadeUp(0.1)} className="mb-12">
            <h2 className="text-4xl font-medium tracking-tight mb-4">Featured Hackathons</h2>
            <p className="text-muted-foreground text-lg">Join the most exciting coding competitions globally.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
            {featuredHackathons && featuredHackathons.length > 0 ? (
              featuredHackathons.map((hackathon: any, idx: number) => (
                <motion.div key={hackathon.id} {...fadeUp(0.2 + idx * 0.1)}>
                  <Link to={`/hackathons/${hackathon.slug}`} className="block h-full group">
                    <div className="liquid-glass rounded-2xl overflow-hidden h-full flex flex-col">
                      <div className="h-48 relative bg-muted/30">
                        {hackathon.image ? (
                          <img src={hackathon.image} alt={hackathon.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><Trophy className="h-10 w-10 text-muted-foreground/30" /></div>
                        )}
                      </div>
                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-xl font-semibold mb-2 group-hover:text-white transition-colors line-clamp-2" title={hackathon.title}>{hackathon.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{hackathon.description}</p>
                        </div>
                        <div className="flex flex-col gap-3 pt-4 border-t border-white/5 mt-auto">
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3 mr-2 text-primary" />
                            {hackathon.start_date ? new Date(Number(hackathon.start_date)).toLocaleDateString() : 'TBA'}
                          </div>
                          <div className="flex justify-between items-center text-xs text-muted-foreground">
                            <span className="font-semibold text-white/80">{hackathon.prizes || "Prizes TBA"}</span>
                            <span className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium px-3 py-1.5 rounded-lg transition-all text-xs shrink-0">Details <ArrowRight className="h-3 w-3" /></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            ) : (
              <div className="col-span-3 text-center py-12 text-muted-foreground">No featured hackathons found.</div>
            )}
          </div>

          {/* Featured Events Section (RECOVERED) */}
          <motion.div {...fadeUp(0.1)} className="mb-12">
            <h2 className="text-4xl font-medium tracking-tight mb-4">Featured Events</h2>
            <p className="text-muted-foreground text-lg">Discover high-end Web3 events, meetups, and workshops in India and globally.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredEvents && featuredEvents.length > 0 ? (
              featuredEvents.map((event: any, idx: number) => (
                <motion.div key={event.id} {...fadeUp(0.2 + idx * 0.1)}>
                  <Link to={`/events/${event.slug || event.id}`} className="block h-full group">
                    <div className="liquid-glass rounded-2xl overflow-hidden h-full flex flex-col">
                      <div className="h-48 relative bg-muted/30">
                        {event.image ? (
                          <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><Calendar className="h-10 w-10 text-muted-foreground/30" /></div>
                        )}
                        <div className="absolute top-2 left-2 bg-black/95 text-white/90 text-[10px] font-bold tracking-wider px-2.5 py-1 rounded border border-white/10 uppercase backdrop-blur-sm">
                          {event.type}
                        </div>
                      </div>
                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-xl font-semibold mb-2 group-hover:text-white transition-colors line-clamp-2" title={event.title}>{event.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{event.description}</p>
                        </div>
                        <div className="flex flex-col gap-3 pt-4 border-t border-white/5 mt-auto">
                          <div className="flex items-center text-xs text-muted-foreground justify-between">
                            <span className="flex items-center gap-1 shrink-0 mr-4"><Calendar className="h-3 w-3" /> {event.date ? new Date(Number(event.date)).toLocaleDateString() : "TBA"}</span>
                            <span className="truncate" title={event.location}>{event.location}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs text-muted-foreground">
                            <span className="font-semibold text-white/80"></span>
                            <span className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium px-3 py-1.5 rounded-lg transition-all text-xs shrink-0">Details <ArrowRight className="h-3 w-3" /></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            ) : (
              <div className="col-span-3 text-center py-12 text-muted-foreground">No featured events found.</div>
            )}
          </div>

        </div>
      </section>

      <Web3ShowcaseSection />

      <EcosystemSection />

      <InteractiveFeaturesSection />
      
      <SmartWorkflow />
      
      <FeaturedPartnersCarousel />

      <CTASection />

      <Footer />
    </div>
  );
}
