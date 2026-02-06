import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const chain = url.searchParams.get('chain');
    const search = url.searchParams.get('search');
    const supportedOnly = url.searchParams.get('supported') !== 'false';

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl!, supabaseKey!);

    let query = supabase
      .from('asset_registry')
      .select('*')
      .order('token_symbol');

    if (supportedOnly) {
      query = query.eq('supported', true);
    }

    if (chain) {
      query = query.eq('chain', chain.toLowerCase());
    }

    if (search) {
      query = query.or(`token_symbol.ilike.%${search}%,token_name.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;

    return new Response(
      JSON.stringify({ assets: data || [] }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to fetch assets" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
