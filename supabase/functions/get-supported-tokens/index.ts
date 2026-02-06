import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};

interface TokenInfo {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  assetClass: 'core' | 'non_core';
}

interface ChainTokens {
  [chain: string]: TokenInfo[];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Query all supported tokens from asset registry
    const { data: assets, error } = await supabase
      .from('asset_registry')
      .select('chain, token_symbol, token_name, token_address, decimals, asset_class')
      .eq('supported', true)
      .order('chain')
      .order('token_symbol');

    if (error) {
      console.error('Database query error:', error);
      return new Response(
        JSON.stringify({
          error: "Failed to fetch supported tokens"
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Group tokens by chain
    const tokensByChain: ChainTokens = {};
    
    if (assets) {
      for (const asset of assets) {
        if (!tokensByChain[asset.chain]) {
          tokensByChain[asset.chain] = [];
        }
        
        tokensByChain[asset.chain].push({
          symbol: asset.token_symbol,
          name: asset.token_name,
          address: asset.token_address,
          decimals: asset.decimals || 18,
          assetClass: asset.asset_class || 'non_core'
        });
      }
    }

    return new Response(
      JSON.stringify({
        chains: Object.keys(tokensByChain),
        tokensByChain
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to fetch supported tokens"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
