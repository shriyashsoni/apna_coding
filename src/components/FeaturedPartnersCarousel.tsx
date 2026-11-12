import { useEffect, useState } from "react";
import { Link } from "react-router";
import { supabase } from "@/lib/supabase";

function CommunityMark({ name, logo }: { name: string; logo?: string }) {
  const [failed, setFailed] = useState(false);
  return <div className="h-14 w-14 shrink-0 rounded-xl bg-white text-black flex items-center justify-center p-2" aria-hidden="true">
    {logo && !failed ? <img src={logo} alt="" loading="lazy" className="w-full h-full object-contain" onError={() => setFailed(true)} /> : <span className="text-xl font-bold">{name.slice(0, 2).toUpperCase()}</span>}
  </div>;
}

// Featured directory entries do not establish a sponsorship or partnership.
export function FeaturedPartnersCarousel() {
  const [communities, setCommunities] = useState<any[]>([]);
  useEffect(() => {
    let active = true;
    supabase.from("communities").select("id,name,slug,logo").eq("is_featured", true).eq("is_published", true)
      .order("name", { ascending: true }).then(({ data, error }) => {
        if (active && !error) setCommunities(data || []);
      });
    return () => { active = false; };
  }, []);
  if (!communities.length) return null;
  return <section aria-labelledby="featured-communities-heading" className="py-16 border-y border-white/10 bg-background">
    <div className="max-w-6xl mx-auto px-4">
      <h2 id="featured-communities-heading" className="text-2xl md:text-3xl font-bold text-center mb-3">Explore Web3 Communities</h2>
      <p className="text-muted-foreground text-center mb-8">Browse featured entries in our community directory.</p>
      <div className="grid grid-cols-1 min-[360px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {communities.map(community => <Link key={community.id} to={`/community/${community.slug}`} className="flex min-w-0 items-center gap-3 p-3 rounded-2xl border border-white/10 bg-white/[0.03] hover:border-white/40 focus-visible:outline-2 focus-visible:outline-white">
          <CommunityMark name={community.name} logo={community.logo} />
          <span className="text-sm font-medium text-white break-words min-w-0">{community.name}</span>
        </Link>)}
      </div>
    </div>
  </section>;
}
