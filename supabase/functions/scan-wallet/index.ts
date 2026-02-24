import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const CHAIN_CONFIG: any = {
  ethereum: { kind: 'evm', alchemyRpc: (k: string) => `https://eth-mainnet.g.alchemy.com/v2/${k}`, coingeckoPlatform: 'ethereum', nativeSymbol: 'ETH', nativeName: 'Ethereum', nativeCoingeckoId: 'ethereum', nativeLogo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', decimals: 18 },
  polygon: { kind: 'evm', alchemyRpc: (k: string) => `https://polygon-mainnet.g.alchemy.com/v2/${k}`, coingeckoPlatform: 'polygon-pos', nativeSymbol: 'MATIC', nativeName: 'Polygon', nativeCoingeckoId: 'matic-network', nativeLogo: 'https://cryptologos.cc/logos/polygon-matic-logo.png', decimals: 18 },
  arbitrum: { kind: 'evm', alchemyRpc: (k: string) => `https://arb-mainnet.g.alchemy.com/v2/${k}`, coingeckoPlatform: 'arbitrum-one', nativeSymbol: 'ETH', nativeName: 'Arbitrum', nativeCoingeckoId: 'ethereum', nativeLogo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', decimals: 18 },
  optimism: { kind: 'evm', alchemyRpc: (k: string) => `https://opt-mainnet.g.alchemy.com/v2/${k}`, coingeckoPlatform: 'optimistic-ethereum', nativeSymbol: 'ETH', nativeName: 'Optimism', nativeCoingeckoId: 'ethereum', nativeLogo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', decimals: 18 },
  base: { kind: 'evm', alchemyRpc: (k: string) => `https://base-mainnet.g.alchemy.com/v2/${k}`, coingeckoPlatform: 'base', nativeSymbol: 'ETH', nativeName: 'Base', nativeCoingeckoId: 'ethereum', nativeLogo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', decimals: 18 },
  worldchain: { kind: 'evm', alchemyRpc: (k: string) => `https://worldchain-mainnet.g.alchemy.com/v2/${k}`, coingeckoPlatform: 'world-chain', nativeSymbol: 'ETH', nativeName: 'World Chain', nativeCoingeckoId: 'ethereum', nativeLogo: 'https://cryptologos.cc/logos/worldcoin-wld-logo.png', decimals: 18 },
  avalanche: { kind: 'evm', alchemyRpc: (k: string) => `https://avax-mainnet.g.alchemy.com/v2/${k}`, coingeckoPlatform: 'avalanche', nativeSymbol: 'AVAX', nativeName: 'Avalanche', nativeCoingeckoId: 'avalanche-2', nativeLogo: 'https://cryptologos.cc/logos/avalanche-avax-logo.png', decimals: 18 },
  bnb: { kind: 'evm', alchemyRpc: (k: string) => `https://bnb-mainnet.g.alchemy.com/v2/${k}`, coingeckoPlatform: 'binance-smart-chain', nativeSymbol: 'BNB', nativeName: 'BNB Chain', nativeCoingeckoId: 'binancecoin', nativeLogo: 'https://cryptologos.cc/logos/bnb-bnb-logo.png', decimals: 18 },
  celo: { kind: 'evm', alchemyRpc: (k: string) => `https://celo-mainnet.g.alchemy.com/v2/${k}`, coingeckoPlatform: 'celo', nativeSymbol: 'CELO', nativeName: 'Celo', nativeCoingeckoId: 'celo', nativeLogo: 'https://cryptologos.cc/logos/celo-celo-logo.png', decimals: 18 },
  sei: { kind: 'evm', alchemyRpc: (k: string) => `https://sei-mainnet.g.alchemy.com/v2/${k}`, coingeckoPlatform: 'sei-network', nativeSymbol: 'SEI', nativeName: 'Sei', nativeCoingeckoId: 'sei-network', nativeLogo: 'https://cryptologos.cc/logos/sei-sei-logo.png', decimals: 18 },
  unichain: { kind: 'evm', alchemyRpc: (k: string) => `https://unichain-mainnet.g.alchemy.com/v2/${k}`, coingeckoPlatform: null, nativeSymbol: 'ETH', nativeName: 'Unichain', nativeCoingeckoId: 'ethereum', nativeLogo: 'https://cryptologos.cc/logos/uniswap-uni-logo.png', decimals: 18 },
  solana: { kind: 'solana', alchemyRpc: (k: string) => `https://solana-mainnet.g.alchemy.com/v2/${k}`, coingeckoPlatform: 'solana', nativeSymbol: 'SOL', nativeName: 'Solana', nativeCoingeckoId: 'solana', nativeLogo: 'https://cryptologos.cc/logos/solana-sol-logo.png', decimals: 9 },
  bitcoin: { kind: 'bitcoin', alchemyRpc: (k: string) => `https://bitcoin-mainnet.g.alchemy.com/v2/${k}`, coingeckoPlatform: null, nativeSymbol: 'BTC', nativeName: 'Bitcoin', nativeCoingeckoId: 'bitcoin', nativeLogo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png', decimals: 8 },
};

const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, Authorization" };
const SOLANA_TOKEN_PROGRAM = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';

const isValidEvmAddress = (addr: string) => /^0x[a-fA-F0-9]{40}$/.test(addr);
const isValidSolanaAddress = (addr: string) => /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(addr);
const isValidBitcoinAddress = (addr: string) => /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/.test(addr);

const CORE_SYMBOLS = ['USDC', 'USDT', 'DAI', 'WETH', 'ETH', 'WBTC'];
const UNSAFE_KEYWORDS = [
  'scam', 'airdrop', 'claim', 'bonus', 'reward', 'giveaway', 'visit', 'verify',
  'support', 'telegram', 'discord', 't.me', 'http', 'https', '.com', '.io',
  '.xyz', '.app', 'link', 'click', 'mint', 'nft', 'free'
];

const isLikelyUnsafe = (sym: string, name?: string) => {
  const text = `${sym || ''} ${name || ''}`.toLowerCase();
  return UNSAFE_KEYWORDS.some(k => text.includes(k));
};

const classifyToken = (usd: number, sym: string, name?: string, priceKnown = true, liquidityUsd?: number) => {
  if (isLikelyUnsafe(sym, name)) return 'unsafe';
  if (typeof liquidityUsd === 'number' && priceKnown && liquidityUsd > 0 && liquidityUsd < 1000) return 'unsafe';
  if (CORE_SYMBOLS.includes(sym)) return 'core';
  if (!priceKnown) return 'positions';
  if (usd >= 1000) return 'core';
  if (usd < 10) return 'dust';
  return 'positions';
};

async function fetchDexScreenerPrices(addresses: string[]) {
  try {
    if (addresses.length === 0) return {} as Record<string, { priceUsd: number; liquidityUsd?: number }>;
    const csv = addresses.join(',');
    const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${csv}`);
    const data = await res.json();
    const pairs = data?.pairs || [];

    const result: Record<string, { priceUsd: number; liquidityUsd?: number }> = {};
    for (const pair of pairs) {
      const addr = pair?.baseToken?.address?.toLowerCase();
      const priceUsd = Number(pair?.priceUsd || 0);
      const liquidityUsd = Number(pair?.liquidity?.usd || 0);
      if (!addr || !priceUsd) continue;

      const existing = result[addr];
      if (!existing || (liquidityUsd || 0) > (existing.liquidityUsd || 0)) {
        result[addr] = { priceUsd, liquidityUsd };
      }
    }
    return result;
  } catch {
    return {} as Record<string, { priceUsd: number; liquidityUsd?: number }>;
  }
}

const calcScore = (tokens: any[]) => {
  let score = 100;
  score -= Math.min(tokens.filter(t => t.classification === 'dust').length * 2, 30);
  score -= Math.min(tokens.filter(t => t.classification === 'unsafe').length * 10, 40);
  return Math.max(0, Math.min(100, score));
};

async function fetchNativeBalance(addr: string, key: string, chain: string) {
  const res = await fetch(CHAIN_CONFIG[chain].alchemyRpc(key), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_getBalance', params: [addr, 'latest'], id: 1 }),
  });
  const d = await res.json();
  return d.result || '0x0';
}

async function fetchTokenBalances(addr: string, key: string, chain: string) {
  const res = await fetch(CHAIN_CONFIG[chain].alchemyRpc(key), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', method: 'alchemy_getTokenBalances', params: [addr, 'erc20'], id: 1 }),
  });
  const d = await res.json();
  return d.result?.tokenBalances || [];
}

async function fetchTokenMetadata(addr: string, key: string, chain: string) {
  const res = await fetch(CHAIN_CONFIG[chain].alchemyRpc(key), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', method: 'alchemy_getTokenMetadata', params: [addr], id: 1 }),
  });
  const d = await res.json();
  return d.result || {};
}

async function fetchTokenPrice(addr: string, chain: string) {
  try {
    const platform = CHAIN_CONFIG[chain].coingeckoPlatform;
    if (!platform) return 0;
    const normalized = addr.toLowerCase();
    const res = await fetch(`https://api.coingecko.com/api/v3/simple/token_price/${platform}?contract_addresses=${normalized}&vs_currencies=usd`);
    const d = await res.json();
    return d[normalized]?.usd || 0;
  } catch {
    return 0;
  }
}

async function batchFetchTokenPrices(addresses: string[], chain: string) {
  try {
    const platform = CHAIN_CONFIG[chain].coingeckoPlatform;
    if (!platform) return {};
    const normalizedAddrs = addresses.map(a => a.toLowerCase());
    const csv = normalizedAddrs.join(',');
    const res = await fetch(`https://api.coingecko.com/api/v3/simple/token_price/${platform}?contract_addresses=${csv}&vs_currencies=usd`);
    const data = await res.json();
    const prices: Record<string, number> = {};
    normalizedAddrs.forEach(addr => {
      prices[addr] = data[addr]?.usd || 0;
    });
    return prices;
  } catch {
    return {};
  }
}

async function fetchNativePriceUsd(chain: string) {
  try {
    const id = CHAIN_CONFIG[chain].nativeCoingeckoId || CHAIN_CONFIG[chain].nativeName.toLowerCase();
    if (!id) return 0;
    const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`);
    const d = await res.json();
    return d[id]?.usd || 0;
  } catch {
    return 0;
  }
}

async function fetchSolanaNativeBalance(addr: string, key: string) {
  const res = await fetch(CHAIN_CONFIG.solana.alchemyRpc(key), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', method: 'getBalance', params: [addr], id: 1 }),
  });
  const d = await res.json();
  return d.result?.value || 0;
}

async function fetchSolanaTokenAccounts(addr: string, key: string) {
  const res = await fetch(CHAIN_CONFIG.solana.alchemyRpc(key), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'getTokenAccountsByOwner',
      params: [addr, { programId: SOLANA_TOKEN_PROGRAM }, { encoding: 'jsonParsed' }],
      id: 1,
    }),
  });
  const d = await res.json();
  const accounts = d.result?.value || [];
  return accounts.map((acc: any) => {
    const info = acc.account?.data?.parsed?.info;
    const amountInfo = info?.tokenAmount || {};
    const decimals = amountInfo.decimals ?? 0;
    const uiAmount = amountInfo.uiAmount ?? 0;
    const amount = uiAmount || (Number(amountInfo.amount || 0) / Math.pow(10, decimals));
    return { mint: info?.mint, amount, decimals };
  }).filter((t: any) => t.mint && t.amount > 0);
}

async function fetchBitcoinBalance(addr: string, key: string) {
  const res = await fetch(CHAIN_CONFIG.bitcoin.alchemyRpc(key), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', method: 'getBalance', params: [addr], id: 1 }),
  });
  const d = await res.json();
  return d.result?.value || d.result || 0;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });

  try {
    const body = await req.json();
    const walletAddress = (body.walletAddress || '').trim();
    
    // Support both single chain (legacy) and array of chains
    const requestedChains = body.chains 
      ? (Array.isArray(body.chains) ? body.chains : [body.chains])
      : (body.chain ? [body.chain] : ['ethereum']);
    
    const chainsToScan = requestedChains
      .map((c: string) => c.toLowerCase())
      .filter((c: string) => CHAIN_CONFIG[c]);

    if (chainsToScan.length === 0) {
      return new Response(JSON.stringify({ error: 'No valid chains specified' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (!walletAddress) {
      return new Response(JSON.stringify({ error: 'Invalid wallet address' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Validate address format based on first chain type
    const firstChainConfig = CHAIN_CONFIG[chainsToScan[0]];
    if (firstChainConfig.kind === 'evm' && !isValidEvmAddress(walletAddress)) {
      return new Response(JSON.stringify({ error: 'Invalid EVM wallet address' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (firstChainConfig.kind === 'solana' && !isValidSolanaAddress(walletAddress)) {
      return new Response(JSON.stringify({ error: 'Invalid Solana wallet address' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (firstChainConfig.kind === 'bitcoin' && !isValidBitcoinAddress(walletAddress)) {
      return new Response(JSON.stringify({ error: 'Invalid Bitcoin address' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const alchemyKey = Deno.env.get('ALCHEMY_API_KEY');
    if (!alchemyKey) {
      return new Response(JSON.stringify({ error: 'Alchemy API key not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl!, supabaseKey!);

    const processedTokens: any[] = [];

    // Process each chain
    console.log(`Starting scan for ${chainsToScan.length} chains: ${chainsToScan.join(', ')}`);
    
    for (const chain of chainsToScan) {
      const chainConfig = CHAIN_CONFIG[chain];
      console.log(`Scanning ${chain}...`);

      // Declare at loop scope to avoid bundler scope issues
      let nativeBalanceUsd = 0;
      let nativeBalance = 0;
      let nativePrice = 0;

      try {
        if (chainConfig.kind === 'solana') {
          const lamports = await fetchSolanaNativeBalance(walletAddress, alchemyKey);
          nativeBalance = lamports / Math.pow(10, chainConfig.decimals);
          nativePrice = await fetchNativePriceUsd(chain);
          nativeBalanceUsd = nativeBalance * nativePrice;

          if (nativeBalanceUsd > 0.01) {
            processedTokens.push({
              symbol: chainConfig.nativeSymbol,
              name: chainConfig.nativeName,
              contract_address: null,
              balance: nativeBalance.toString(),
              balance_usd: nativeBalanceUsd,
              classification: classifyToken(nativeBalanceUsd, chainConfig.nativeSymbol, chainConfig.nativeName, true),
              price_usd: nativePrice,
              chain,
              has_unlimited_approval: false,
              logo_url: chainConfig.nativeLogo,
            });
          }

          const tokenAccounts = await fetchSolanaTokenAccounts(walletAddress, alchemyKey);
          const addresses = tokenAccounts.map(t => t.mint);
          const prices = addresses.length > 0 ? await batchFetchTokenPrices(addresses, chain) : {};

          tokenAccounts.forEach(t => {
            const price = prices[t.mint.toLowerCase()] || 0;
            const balanceUsd = t.amount * price;
            if (balanceUsd < 0.01) return;
            const symbol = `${t.mint.slice(0, 4)}...${t.mint.slice(-4)}`;
            processedTokens.push({
              symbol,
              name: symbol,
              contract_address: t.mint,
              balance: t.amount.toString(),
              balance_usd: balanceUsd,
              classification: classifyToken(balanceUsd, symbol, symbol, price > 0),
              price_usd: price,
              chain,
              has_unlimited_approval: false,
              logo_url: null,
            });
          });
        } else if (chainConfig.kind === 'bitcoin') {
          const sats = await fetchBitcoinBalance(walletAddress, alchemyKey);
          nativeBalance = Number(sats) / Math.pow(10, chainConfig.decimals);
          nativePrice = await fetchNativePriceUsd(chain);
          nativeBalanceUsd = nativeBalance * nativePrice;

          if (nativeBalanceUsd > 0.01) {
            processedTokens.push({
              symbol: chainConfig.nativeSymbol,
              name: chainConfig.nativeName,
              contract_address: null,
              balance: nativeBalance.toString(),
              balance_usd: nativeBalanceUsd,
              classification: classifyToken(nativeBalanceUsd, chainConfig.nativeSymbol, chainConfig.nativeName, true),
              price_usd: nativePrice,
              chain,
              has_unlimited_approval: false,
              logo_url: chainConfig.nativeLogo,
            });
          }
        } else {
          // EVM chain
          console.log(`[${chain}] Starting EVM scan...`);
          const nativeBalanceHex = await fetchNativeBalance(walletAddress, alchemyKey, chain);
          console.log(`[${chain}] Native balance: ${nativeBalanceHex}`);
          nativeBalance = Number(BigInt(nativeBalanceHex)) / Math.pow(10, chainConfig.decimals);
          nativePrice = await fetchNativePriceUsd(chain);
          nativeBalanceUsd = nativeBalance * nativePrice;
          console.log(`[${chain}] Native balance USD: ${nativeBalanceUsd}`);
          
          const tokenBalances = await fetchTokenBalances(walletAddress, alchemyKey, chain);
          console.log(`[${chain}] Token balances returned: ${tokenBalances.length} tokens`);
          const validTokens = tokenBalances.filter(t => t.tokenBalance && t.tokenBalance !== '0x0' && !t.error).slice(0, 50);
          console.log(`[${chain}] Valid tokens after filter: ${validTokens.length}`);

          if (nativeBalanceUsd > 0.01) {
            processedTokens.push({
              symbol: chainConfig.nativeSymbol,
              name: chainConfig.nativeName,
              contract_address: null,
              balance: nativeBalance.toString(),
              balance_usd: nativeBalanceUsd,
              classification: classifyToken(nativeBalanceUsd, chainConfig.nativeSymbol, chainConfig.nativeName, true),
              price_usd: nativePrice,
              chain,
              has_unlimited_approval: false,
              logo_url: chainConfig.nativeLogo,
            });
          }

          const tokenPromises = validTokens.map(async (token) => {
            try {
              const metadata = await fetchTokenMetadata(token.contractAddress, alchemyKey, chain);
              if (!metadata.symbol || !metadata.decimals) return { addr: token.contractAddress, data: null };
              const balance = Number(BigInt(token.tokenBalance)) / Math.pow(10, metadata.decimals);
              if (balance === 0) return { addr: token.contractAddress, data: null };
              return { addr: token.contractAddress, data: { symbol: metadata.symbol, name: metadata.name || metadata.symbol, balance, decimals: metadata.decimals, logo: metadata.logo } };
            } catch {
              return { addr: token.contractAddress, data: null };
            }
          });

          const metadataResults = await Promise.all(tokenPromises);
          const withMetadata = metadataResults.filter(r => r.data);
          
          const addresses = withMetadata.map(r => r.addr.toLowerCase());
          const prices = addresses.length > 0 ? await batchFetchTokenPrices(addresses, chain) : {};
          const hasPrices = Object.keys(prices).length > 0;
          console.log(`[${chain}] Price map keys: ${Object.keys(prices).length} / ${addresses.length}`);
          console.log(`[${chain}] Sample addresses:`, addresses.slice(0, 3));
          console.log(`[${chain}] Sample prices:`, Object.keys(prices).slice(0, 3));

          const missingPriceAddrs = addresses.filter(addr => !prices[addr]);
          let dexPrices: Record<string, { priceUsd: number; liquidityUsd?: number }> = {};
          if (missingPriceAddrs.length > 0) {
            const chunks: string[][] = [];
            for (let i = 0; i < missingPriceAddrs.length; i += 30) {
              chunks.push(missingPriceAddrs.slice(i, i + 30));
            }
            for (const chunk of chunks) {
              const chunkPrices = await fetchDexScreenerPrices(chunk);
              dexPrices = { ...dexPrices, ...chunkPrices };
            }
          }

          // 3rd tier: asset registry fallback for tokens CoinGecko + DexScreener missed
          const stillMissingAddrs = missingPriceAddrs.filter(addr => !dexPrices[addr]);
          if (stillMissingAddrs.length > 0) {
            console.log(`[${chain}] ${stillMissingAddrs.length} still unpriced, checking registry...`);
            try {
              const { data: registryData } = await supabase
                .from('asset_registry')
                .select('token_address, usd_price, liquidity_usd')
                .eq('chain', chain)
                .in('token_address', stillMissingAddrs)
                .gt('usd_price', 0);
              if (registryData) {
                for (const asset of registryData) {
                  const addr = asset.token_address?.toLowerCase();
                  if (addr && asset.usd_price > 0) {
                    dexPrices[addr] = {
                      priceUsd: Number(asset.usd_price),
                      liquidityUsd: Number(asset.liquidity_usd || 0),
                    };
                  }
                }
                console.log(`[${chain}] Registry priced ${registryData.length} tokens`);
              }
            } catch (err: any) {
              console.error(`[${chain}] Registry fallback failed:`, err.message);
            }
          }

          const finalTokens = withMetadata.map(r => {
            const addr = r.addr.toLowerCase();
            const dex = dexPrices[addr];
            const price = prices[addr] || dex?.priceUsd || 0;
            const liquidityUsd = dex?.liquidityUsd;
            const balanceUsd = r.data!.balance * price;

            // If no prices returned, keep token with 0 USD valuation instead of dropping
            if ((!hasPrices && !dex?.priceUsd) || price === 0) {
              return {
                symbol: r.data!.symbol,
                name: r.data!.name,
                contract_address: r.addr,
                balance: r.data!.balance.toString(),
                balance_usd: 0,
                classification: classifyToken(0, r.data!.symbol, r.data!.name, false),
                price_usd: 0,
                chain,
                has_unlimited_approval: false,
                logo_url: r.data!.logo || null,
              };
            }

            // Only filter by USD if we have valid pricing
            if (balanceUsd < 0.01) return null;
            return {
              symbol: r.data!.symbol,
              name: r.data!.name,
              contract_address: r.addr,
              balance: r.data!.balance.toString(),
              balance_usd: balanceUsd,
              classification: classifyToken(balanceUsd, r.data!.symbol, r.data!.name, true, liquidityUsd),
              price_usd: price,
              chain,
              has_unlimited_approval: false,
              logo_url: r.data!.logo || null,
            };
          }).filter(Boolean);

          finalTokens.forEach(t => processedTokens.push(t));
          console.log(`[${chain}] Added ${finalTokens.length} tokens to processedTokens (total now: ${processedTokens.length})`);
        }
      } catch (chainError: any) {
        console.error(`[${chain}] Error:`, chainError.message);
        console.error(`[${chain}] Stack:`, chainError.stack);
        // Continue with other chains even if one fails
      }
    }

    const totalBalanceUsd = processedTokens.reduce((sum, t) => {
      const val = parseFloat(t.balance_usd);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);
    
    const positionsUsd = processedTokens.filter(t => t.classification === 'positions' || t.classification === 'dust').reduce((sum, t) => {
      const val = parseFloat(t.balance_usd);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);
    
    const hygieneScore = calcScore(processedTokens);

    console.log(`Scan complete: ${processedTokens.length} tokens, $${totalBalanceUsd} total, $${positionsUsd} positions`);

    const { data: scan, error: scanError } = await supabase.from('wallet_scans').insert({ wallet_address: walletAddress, total_balance_usd: totalBalanceUsd, recoverable_usd: positionsUsd, hygiene_score: hygieneScore, alert_count: 0 }).select().single();

    if (scanError) throw scanError;

    const tokensToInsert = processedTokens.map(t => ({ ...t, scan_id: scan.id }));
    
    // Insert in chunks to avoid payload limits
    for (let i = 0; i < tokensToInsert.length; i += 500) {
      const chunk = tokensToInsert.slice(i, i + 500);
      const { error: tokensError } = await supabase.from('tokens').insert(chunk);
      if (tokensError) throw tokensError;
    }

    return new Response(JSON.stringify({ success: true, scanId: scan.id, metrics: { totalBalanceUsd, positionsUsd, hygieneScore, tokensCount: processedTokens.length } }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error: any) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Failed to scan wallet' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
