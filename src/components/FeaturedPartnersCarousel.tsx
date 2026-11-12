import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { supabase } from "@/lib/supabase";
import { useLightweightMedia } from "@/hooks/useLightweightMedia";

const CATEGORIES = ["Communities", "Conferences", "Workshops", "Organizations"];
function CommunityMark({ name, logo }: { name: string; logo?: string }) {
  const [failed, setFailed] = useState(false);
  return <div className="h-16 w-16 md:h-20 md:w-20 shrink-0 rounded-lg bg-white text-black flex items-center justify-center p-3 shadow-md border border-primary/20" aria-hidden="true">
    {logo && !failed ? <img src={logo} alt="" className="w-full h-full object-contain" onError={() => setFailed(true)} /> : <span className="text-xl font-bold">{name.slice(0, 2).toUpperCase()}</span>}
  </div>;
}

// Preserve the original moving logo rows and rotating title, without treating
// featured directory entries as evidence of sponsorship or partnership.
export function FeaturedPartnersCarousel() {
  const [communities, setCommunities] = useState<any[]>([]);
  const [category, setCategory] = useState(0);
  const [paused, setPaused] = useState(false);
  const lightweight = useLightweightMedia();
  useEffect(() => {
    let active = true;
    supabase.from("communities").select("id,name,slug,logo,partner_category").eq("is_featured", true).eq("is_published", true)
      .order("name", { ascending: true }).then(({ data, error }) => { if (active && !error) setCommunities(data || []); });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (lightweight || paused) return;
    const timer = window.setInterval(() => setCategory(index => (index + 1) % CATEGORIES.length), 2500);
    return () => window.clearInterval(timer);
  }, [lightweight, paused]);
  if (!communities.length) return null;
  const rows = [
    communities.filter(c => c.partner_category === "media"),
    communities.filter(c => !c.partner_category || !["media", "conference", "sponsor"].includes(c.partner_category)),
    communities.filter(c => c.partner_category === "conference"),
    communities.filter(c => c.partner_category === "sponsor"),
  ].filter(row => row.length);
  const card = (community: any) => <><CommunityMark name={community.name} logo={community.logo} /><span className="text-xs text-white text-center w-28 break-words leading-relaxed">{community.name}</span></>;
  return <section aria-labelledby="featured-communities-heading" className="py-16 relative overflow-hidden bg-gradient-to-b from-background via-primary/5 to-background">
    <div className="container mx-auto px-4">
      <div className="text-center mb-10">
        <h2 id="featured-communities-heading" className="sr-only">Explore Web3 Communities</h2>
        <div aria-hidden="true" className="flex items-center justify-center gap-x-3 gap-y-1 mb-4 flex-wrap min-h-20 sm:min-h-12">
          <span className="text-2xl md:text-3xl font-bold">Explore Web3</span>
          <span className="inline-flex justify-center min-w-[220px]">
            <AnimatePresence mode="wait"><motion.span key={lightweight ? "static" : category} data-community-rotating-title initial={lightweight ? false : { y: 20, opacity: 0, rotateX: 90 }} animate={{ y: 0, opacity: 1, rotateX: 0 }} exit={{ y: -20, opacity: 0, rotateX: -90 }} transition={{ duration: 0.5, ease: "easeInOut" }} className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-300 to-zinc-100" style={{ transformStyle: "preserve-3d" }}>{CATEGORIES[lightweight ? 0 : category]}</motion.span></AnimatePresence>
          </span>
        </div>
        <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto">Browse featured entries in our community directory. Listing does not imply sponsorship, endorsement or partnership.</p>
        {!lightweight && <button type="button" onClick={() => setPaused(value => !value)} aria-pressed={paused} className="mt-4 rounded-full border border-white/20 px-4 py-2 text-sm hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white">{paused ? "Resume community animation" : "Pause community animation"}</button>}
      </div>
      <div className="space-y-6">
        {rows.map((row, index) => <div key={index} className="relative community-motion-row" data-community-motion-row>
          {lightweight ? <div className="flex flex-wrap justify-center gap-6">{row.map(c => <Link key={c.id} to={`/community/${c.slug}`} className="flex flex-col items-center gap-2 w-28">{card(c)}</Link>)}</div> : <div className="overflow-hidden py-2">
            <div className="community-motion-track flex w-max" data-community-motion-track style={{ animationDuration: `${Math.max(12, row.length * 5)}s`, animationPlayState: paused ? "paused" : "running" }}>
              {[0, 1].map(copy => <div key={copy} className="flex gap-6 shrink-0 pr-6" aria-hidden={copy ? true : undefined} inert={copy ? true : undefined}>{[...row, ...row].map((c, item) => <Link key={`${c.id}-${item}`} to={`/community/${c.slug}`} tabIndex={copy || item >= row.length ? -1 : undefined} aria-hidden={item >= row.length ? true : undefined} className="flex flex-col items-center gap-2 w-28 shrink-0 rounded-lg hover:scale-105 transition-transform focus-visible:outline-2 focus-visible:outline-white">{card(c)}</Link>)}</div>)}
            </div>
          </div>}
          {!lightweight && <><div className="absolute left-0 inset-y-0 w-6 md:w-16 bg-gradient-to-r from-background to-transparent pointer-events-none" /><div className="absolute right-0 inset-y-0 w-6 md:w-16 bg-gradient-to-l from-background to-transparent pointer-events-none" /></>}
        </div>)}
      </div>
    </div>
  </section>;
}
