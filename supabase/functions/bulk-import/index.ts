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
    const { contentType, importMethod, urlList, excelData, wallet_address, eventGroupId } = await req.json();

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const results = [];

    if (importMethod === "urls") {
      const urls = urlList.split('\n').filter(url => url.trim() !== "");
      
      for (const url of urls) {
        try {
          // In a real scenario, you would trigger an AI extraction for each URL
          // For now, we'll just create a pending item
          const newItem = {
            status: 'pending_approval',
            wallet_address: wallet_address,
            // Add group if events
            ...(contentType === 'events' && eventGroupId ? { group_id: eventGroupId } : {})
          };

          // Simple logic based on contentType
          let data;
          if (contentType === 'events') {
            data = await supabaseClient.from('events').insert({ ...newItem, title: "Imported from " + url, registration_link: url }).select().single();
          } else if (contentType === 'hackathons') {
            data = await supabaseClient.from('hackathons').insert({ ...newItem, title: "Imported from " + url, external_url: url }).select().single();
          } else if (contentType === 'jobs') {
            data = await supabaseClient.from('jobs').insert({ ...newItem, title: "Imported from " + url, source_url: url }).select().single();
          } else if (contentType === 'news') {
            data = await supabaseClient.from('news').insert({ ...newItem, title: "Imported from " + url }).select().single();
          } else if (contentType === 'products') {
            data = await supabaseClient.from('products').insert({ ...newItem, name: "Imported from " + url, website_url: url }).select().single();
          } else if (contentType === 'communities') {
            data = await supabaseClient.from('communities').insert({ ...newItem, name: "Imported from " + url, website: url }).select().single();
          }

          if (data?.error) throw data.error;
          results.push({ url, status: "success", message: "Item imported successfully" });
        } catch (err) {
          results.push({ url, status: "error", message: err.message });
        }
      }
    } else {
      // Process Excel data (TSV)
      const lines = excelData.split('\n').filter(line => line.trim() !== "");
      const headers = lines[0].split('\t');
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split('\t');
        const item: any = {};
        headers.forEach((header, index) => {
          item[header.toLowerCase().replace(/\s+/g, '_')] = values[index];
        });

        try {
          const { error } = await supabaseClient.from(contentType).insert({
            ...item,
            status: 'pending_approval',
            wallet_address: wallet_address,
            ...(contentType === 'events' && eventGroupId ? { group_id: eventGroupId } : {})
          });

          if (error) throw error;
          results.push({ url: item.title || item.name || `Row ${i}`, status: "success", message: "Item imported successfully" });
        } catch (err) {
          results.push({ url: item.title || item.name || `Row ${i}`, status: "error", message: err.message });
        }
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
