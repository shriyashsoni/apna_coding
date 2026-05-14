import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const baseUrl = "https://apnacoding.site";
    const staticPages = [
      "/", "/hackathons", "/events", "/jobs", "/products", "/news", 
      "/communities", "/partnerships", "/certificates", "/contact", 
      "/branding", "/profile", "/my-content", "/privacy", "/terms"
    ];

    // Fetch dynamic content
    const [
      { data: hackathons },
      { data: events },
      { data: jobs },
      { data: products },
      { data: news },
      { data: communities }
    ] = await Promise.all([
      supabaseClient.from('hackathons').select('slug, updated_at').eq('is_approved', true),
      supabaseClient.from('events').select('id, updated_at').eq('is_approved', true),
      supabaseClient.from('jobs').select('id, updated_at').eq('is_approved', true),
      supabaseClient.from('products').select('slug, updated_at').eq('status', 'approved'),
      supabaseClient.from('news').select('slug, updated_at').eq('is_approved', true).eq('is_published', true),
      supabaseClient.from('communities').select('slug, updated_at').eq('is_published', true)
    ]);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Add static pages
    for (const page of staticPages) {
      xml += `
  <url>
    <loc>${baseUrl}${page}</loc>
    <changefreq>daily</changefreq>
    <priority>${page === "/" ? "1.0" : "0.8"}</priority>
  </url>`;
    }

    // Add dynamic pages
    hackathons?.forEach(h => {
      xml += `
  <url>
    <loc>${baseUrl}/hackathons/${h.slug}</loc>
    <lastmod>${new Date(h.updated_at).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
    });

    events?.forEach(e => {
      xml += `
  <url>
    <loc>${baseUrl}/events/${e.id}</loc>
    <lastmod>${new Date(e.updated_at).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    jobs?.forEach(j => {
      xml += `
  <url>
    <loc>${baseUrl}/jobs/${j.id}</loc>
    <lastmod>${new Date(j.updated_at).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    products?.forEach(p => {
      xml += `
  <url>
    <loc>${baseUrl}/products/${p.slug}</loc>
    <lastmod>${new Date(p.updated_at).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    news?.forEach(n => {
      xml += `
  <url>
    <loc>${baseUrl}/news/${n.slug}</loc>
    <lastmod>${new Date(n.updated_at).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    });

    communities?.forEach(c => {
      xml += `
  <url>
    <loc>${baseUrl}/community/${c.slug}</loc>
    <lastmod>${new Date(c.updated_at).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    });

    xml += `
</urlset>`;

    return new Response(xml, {
      headers: { 
        ...corsHeaders, 
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600"
      },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
