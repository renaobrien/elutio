import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};

interface DepositValidationRequest {
  chain: string;
  tokenAddress: string;
  tokenSymbol: string;
  amount: string;
  walletAddress: string;
}

interface DepositValidationResponse {
  valid: boolean;
  reason?: string;
  supportedChains?: string[];
  supportedTokens?: string[];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body: DepositValidationRequest = await req.json();
    const { chain, tokenAddress, tokenSymbol, amount, walletAddress } = body;

    if (!chain || !tokenSymbol || !amount || !walletAddress) {
      return new Response(
        JSON.stringify({
          valid: false,
          reason: "Missing required fields: chain, tokenSymbol, amount, walletAddress"
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const chainLower = chain.toLowerCase();
    
    // Query asset registry for supported tokens on this chain
    const { data: assets, error: assetsError } = await supabase
      .from('asset_registry')
      .select('token_address, token_symbol, token_name, supported')
      .eq('chain', chainLower)
      .eq('supported', true);

    if (assetsError) {
      console.error('Database query error:', assetsError);
      return new Response(
        JSON.stringify({
          valid: false,
          reason: "Failed to fetch supported assets"
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if chain has any supported assets
    if (!assets || assets.length === 0) {
      // Query all supported chains
      const { data: allChains } = await supabase
        .from('asset_registry')
        .select('chain')
        .eq('supported', true);
      
      const supportedChains = [...new Set(allChains?.map(c => c.chain) || [])];
      
      return new Response(
        JSON.stringify({
          valid: false,
          reason: `Chain '${chain}' not supported for pooled deposits`,
          supportedChains
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if token is supported on this chain
    const tokenUpper = tokenSymbol.toUpperCase();
    const matchingToken = assets.find(
      asset => asset.token_symbol.toUpperCase() === tokenUpper
    );

    if (!matchingToken) {
      const supportedTokens = assets.map(a => a.token_symbol);
      return new Response(
        JSON.stringify({
          valid: false,
          reason: `Token '${tokenSymbol}' not supported on ${chain} for pooled deposits`,
          supportedTokens
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate token address for non-native assets (ETH is native, no contract address)
    if (tokenSymbol !== 'ETH' && tokenAddress && matchingToken.token_address) {
      if (matchingToken.token_address.toLowerCase() !== tokenAddress.toLowerCase()) {
        return new Response(
          JSON.stringify({
            valid: false,
            reason: `Token address mismatch for ${tokenSymbol} on ${chain}`
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Validate amount
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return new Response(
        JSON.stringify({
          valid: false,
          reason: "Amount must be a positive number"
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Success - deposit is valid
    console.log(`[VALID] Deposit: ${walletAddress} → ${amount} ${tokenSymbol} on ${chain}`);

    return new Response(
      JSON.stringify({
        valid: true,
        assetName: matchingToken.token_name
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        valid: false,
        reason: error.message || "Validation failed"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
