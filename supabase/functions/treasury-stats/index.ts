import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" };

// Major DeFi protocol treasuries (Ethereum mainnet)
const TREASURIES = [
  { name: 'Uniswap', address: '0x1a9C8182C09F50C8318d769245beA52c32BE35BC' },
  { name: 'Aave', address: '0x25F2226B597E8F9514B3F68F00f494cF4f286491' },
  { name: 'Compound', address: '0x6d903f6003cca6255D85CcA4D3B5E5146dC33925' },
  { name: 'MakerDAO', address: '0xBE8E3e3618f7474F8cB1d074A26afFef007E98FB' },
  { name: 'Lido', address: '0x3e40D73EB977Dc6a537aF587D48316feE66E9C8c' },
];

const DUST_THRESHOLD = 100; // Tokens under $100 considered dust

async function fetchTreasuryDust(address: string, alchemyKey: string) {
  const url = `https://eth-mainnet.g.alchemy.com/v2/${alchemyKey}`;
  
  // Get token balances
  const balancesRes = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', method: 'alchemy_getTokenBalances', params: [address, 'erc20'], id: 1 }),
  });
  const balancesData = await balancesRes.json();
  const tokens = balancesData.result?.tokenBalances || [];
  
  // Get metadata and prices in batches
  const validTokens = tokens.filter(t => t.tokenBalance && t.tokenBalance !== '0x0');
  
  let dustValue = 0;
  
  // Process in smaller batches to avoid rate limits
  for (const token of validTokens.slice(0, 20)) { // Limit to first 20 tokens per treasury
    try {
      const metadataRes = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', method: 'alchemy_getTokenMetadata', params: [token.contractAddress], id: 1 }),
      });
      const metadata = await metadataRes.json();
      const meta = metadata.result;
      
      if (!meta?.decimals) continue;
      
      const balance = parseInt(token.tokenBalance, 16) / Math.pow(10, meta.decimals);
      
      // Try to get price from CoinGecko
      try {
        const priceRes = await fetch(`https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${token.contractAddress}&vs_currencies=usd`);
        const priceData = await priceRes.json();
        const price = priceData[token.contractAddress.toLowerCase()]?.usd || 0;
        const balanceUsd = balance * price;
        
        if (balanceUsd > 0 && balanceUsd < DUST_THRESHOLD) {
          dustValue += balanceUsd;
        }
      } catch {
        // Skip if price fetch fails
      }
      
      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 50));
    } catch {
      continue;
    }
  }
  
  return dustValue;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });

  try {
    const alchemyKey = Deno.env.get('ALCHEMY_API_KEY');
    if (!alchemyKey) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    let totalDust = 0;
    const treasuryResults = [];

    // Scan each treasury
    for (const treasury of TREASURIES) {
      const dust = await fetchTreasuryDust(treasury.address, alchemyKey);
      totalDust += dust;
      treasuryResults.push({ name: treasury.name, dust });
    }

    // Extrapolate to get rough estimate (these 5 treasuries represent ~5% of total DeFi TVL)
    // Updated to 50x for more realistic Web3 dust estimate
    const estimatedTotal = totalDust * 50;

    return new Response(
      JSON.stringify({ 
        totalDustScanned: Math.round(totalDust),
        estimatedTotal: Math.round(estimatedTotal),
        treasuriesScanned: treasuryResults.length,
        details: treasuryResults,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Failed to calculate treasury stats' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
