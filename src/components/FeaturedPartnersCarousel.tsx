import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const CATEGORIES = ["Communities", "Conferences", "Workshops", "Media Partners", "Sponsors", "Organizations"];

export function FeaturedPartnersCarousel() {
  const [allCommunities, setAllCommunities] = useState<any[] | null>(null);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const { data, error } = await supabase
          .from('communities')
          .select('*')
          .eq('is_featured', true);
        
        if (error) throw error;
        setAllCommunities(data || []);
      } catch (err) {
        console.error("Error fetching communities:", err);
        setAllCommunities([]);
      }
    };
    fetchCommunities();

    const interval = setInterval(() => {
      setCurrentCategoryIndex((prev) => (prev + 1) % CATEGORIES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Don't show if loading or no communities
  if (!allCommunities) {
    return null;
  }

  // Filter only featured partners
  const featuredPartners = allCommunities;

  // Don't show if no featured partners
  if (featuredPartners.length === 0) {
    return null;
  }

  // Group partners by category (include partners without category in community by default)
  const mediaPartners = featuredPartners.filter((p: any) => p.partner_category === "media");
  const communityPartners = featuredPartners.filter((p: any) => !p.partner_category || p.partner_category === "community");
  const conferencePartners = featuredPartners.filter((p: any) => p.partner_category === "conference");
  const sponsorPartners = featuredPartners.filter((p: any) => p.partner_category === "sponsor");

  // Check if we have at least one row with partners
  const hasAnyPartners = mediaPartners.length > 0 || communityPartners.length > 0 ||
                         conferencePartners.length > 0 || sponsorPartners.length > 0;

  if (!hasAnyPartners) {
    return null;
  }

  // Partner row component with seamless infinite scroll LEFT TO RIGHT
  const PartnerRow = ({ partners, category }: { partners: any[]; category: string }) => {
    if (partners.length === 0) return null;

    // Duplicate partners array multiple times for seamless infinite scroll
    const duplicatedPartners = [...partners, ...partners, ...partners, ...partners];

    return (
      <div className="mb-6">
        <div className="relative">
          <div className="overflow-hidden">
            <motion.div
              className="flex gap-6 items-center will-change-transform"
              animate={{
                x: ["-100%", "0%"],
              }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: partners.length * 5,
                  ease: "linear",
                },
              }}
            >
              {duplicatedPartners.map((partner: any, index: number) => (
                <div
                  key={`${partner.id}-${index}`}
                  className="flex-shrink-0"
                >
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg bg-white flex items-center justify-center p-3 shadow-md border border-primary/20 hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                    {partner.logo ? (
                      <img
                        src={partner.logo}
                        alt={partner.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="text-xl font-bold text-primary">
                        {partner.name.charAt(0)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Gradient Overlays for fade effect */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
        </div>
      </div>
    );
  };

  return (
    <section className="py-16 relative overflow-hidden bg-gradient-to-b from-background via-primary/5 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6 flex-wrap">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground">
              Partnership with Web3
            </h3>
            <AnimatePresence mode="wait">
              <motion.span
                key={currentCategoryIndex}
                initial={{ y: 20, opacity: 0, rotateX: 90 }}
                animate={{ y: 0, opacity: 1, rotateX: 0 }}
                exit={{ y: -20, opacity: 0, rotateX: -90 }}
                transition={{
                  duration: 0.5,
                  ease: "easeInOut",
                }}
                className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-secondary"
                style={{ transformStyle: "preserve-3d" }}
              >
                {CATEGORIES[currentCategoryIndex]}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

        {/* Multiple Partner Rows - All scrolling right to left */}
        <div className="space-y-6">
          {mediaPartners.length > 0 && <PartnerRow partners={mediaPartners} category="Media Partners" />}
          {communityPartners.length > 0 && <PartnerRow partners={communityPartners} category="Community Partners" />}
          {conferencePartners.length > 0 && <PartnerRow partners={conferencePartners} category="Conference Partners" />}
          {sponsorPartners.length > 0 && <PartnerRow partners={sponsorPartners} category="Sponsors" />}
        </div>
      </div>
    </section>
  );
}
