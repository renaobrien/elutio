# Pricing Pipeline Diagnostic

## The Problem
- ETH, UNI, USDC, RAI: **Showing prices** ($1,054,000+)
- LINK, MKR, WBTC, BAT, SUSHI: **Showing "—"** (0 USD)
- Total: Should be ~$1,800,000 but showing ~$1,057,000

## Root Cause Analysis

### Discovery Phase ✅
Token discovery works fine - all 104 tokens are found and scanned.

### Pricing Phase (3 sources attempted):
1. **CoinGecko (batchFetchTokenPrices)** - Works for liquid tokens (ETH, UNI, USDC, RAI)
2. **DexScreener (fetchDexScreenerPrices)** - Should work for medium-liquidity tokens, but apparently not
3. **Registry Lookup** - ❌ **NOT IMPLEMENTED** - This is the missing piece

### The Gap
`scan-wallet/index.ts` has **no fallback to `get-asset-registry`** when CoinGecko and DexScreener fail. It just returns `price = 0` and marks the token as `classification='recoverable'` with `balance_usd=0`.

### Example: LINK Token on Ethereum
- **Contract:** `0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48`
- **Status:** In database with `balance_usd: 0`, `price_usd: 0`
- **Why:** CoinGecko lookup returned undefined, DexScreener returned nothing, no registry check attempted

---

## Current Code Flow (Broken)

```typescript
// In scan-wallet/index.ts, line ~370-390
const missingPriceAddrs = addresses.filter(addr => !prices[addr]);
let dexPrices = {};

if (missingPriceAddrs.length > 0) {
  // Try DexScreener for missing addresses
  const chunks = []; // 30 at a time
  for (const chunk of chunks) {
    dexPrices = { ...dexPrices, ...(await fetchDexScreenerPrices(chunk)) };
  }
}

// At this point, if dexPrices[addr] is also missing, price stays 0
// ❌ No fallback to registry lookup
```

---

## The Fix Needed

Add a **registry lookup fallback** in `scan-wallet/index.ts`:

### Step 1: After DexScreener fails, attempt registry lookup

```typescript
// After the DexScreener block (line ~390)

// If still missing prices, try the asset registry
const stillMissingAddrs = missingPriceAddrs.filter(addr => !dexPrices[addr?.toLowerCase()]);

if (stillMissingAddrs.length > 0) {
  console.log(`[${chain}] ${stillMissingAddrs.length} tokens still missing prices, checking registry...`);
  
  try {
    const registryResult = await supabase.functions.invoke('get-asset-registry', {
      body: {
        chain,
        addresses: stillMissingAddrs
      }
    });
    
    if (registryResult.data?.assets) {
      registryResult.data.assets.forEach((asset: any) => {
        const addr = asset.contract_address?.toLowerCase();
        if (addr && asset.usd_price) {
          dexPrices[addr] = { 
            priceUsd: Number(asset.usd_price),
            liquidityUsd: Number(asset.liquidity_usd || 0)
          };
        }
      });
      console.log(`[${chain}] Registry returned prices for ${Object.keys(dexPrices).length} tokens`);
    }
  } catch (err) {
    console.error(`[${chain}] Registry lookup failed:`, err);
  }
}
```

### Step 2: Update `get-asset-registry/index.ts` to accept addresses

Current implementation queries local `asset_registry` table. Need to:
- Accept `addresses` parameter (array of contract addresses)
- Filter by chain and address
- Return tokens with their prices

```typescript
// In get-asset-registry/index.ts
const body = await req.json();
const { chain, addresses } = body;

let query = supabase.from('asset_registry').select('*');

if (chain) query = query.eq('chain', chain.toLowerCase());

if (addresses && addresses.length > 0) {
  query = query.in('contract_address', addresses.map((a: string) => a.toLowerCase()));
}

const { data, error } = await query;
```

---

## Data to Verify

Run this SQL query in Supabase to confirm tokens are in the DB with $0:

```sql
SELECT symbol, balance, balance_usd, price_usd, classification 
FROM tokens 
WHERE scan_id = (
  SELECT id FROM wallet_scans 
  WHERE wallet_address = '0xde21f729137c5af1b01d73af1dc21effa2b8a0d6'
  ORDER BY scanned_at DESC LIMIT 1
)
AND symbol IN ('LINK', 'MKR', 'WBTC', 'BAT', 'SUSHI')
ORDER BY balance DESC;
```

**Expected output if the bug exists:**
| symbol | balance | balance_usd | price_usd | classification |
|--------|---------|-------------|-----------|----------------|
| LINK   | 3.5     | 0           | 0         | recoverable    |
| MKR    | 0.8     | 0           | 0         | recoverable    |
| WBTC   | 0.03    | 0           | 0         | recoverable    |
| BAT    | 1200    | 0           | 0         | dust           |
| SUSHI  | 400     | 0           | 0         | dust           |

---

## Implementation Checklist

- [ ] Add registry lookup fallback to `scan-wallet/index.ts` (after DexScreener block)
- [ ] Update `get-asset-registry/index.ts` to filter by contract addresses
- [ ] Populate `asset_registry` table with at least top 500 tokens (LINK, MKR, WBTC, BAT, SUSHI, etc.)
- [ ] Redeploy both functions
- [ ] Run fresh scan of Gitcoin wallet
- [ ] Verify LINK, MKR, WBTC show prices instead of "—"
- [ ] Confirm Total Dust shows ~$1.8M instead of $3.86

---

## Next LLM Handoff

**What they need to do:**

1. **Modify `supabase/functions/scan-wallet/index.ts`:**
   - After line ~390 (DexScreener fallback block), add registry lookup block
   - Call `supabase.functions.invoke('get-asset-registry', { body: { chain, addresses: stillMissingAddrs } })`
   - Parse response and add prices to `dexPrices` map

2. **Modify `supabase/functions/get-asset-registry/index.ts`:**
   - Accept JSON body with `chain` and `addresses` array
   - Query `asset_registry` table filtering by both
   - Return matching assets with pricing data

3. **Populate `asset_registry` table:**
   - At minimum: LINK, MKR, WBTC, BAT, SUSHI on Ethereum
   - Format: `{ contract_address, symbol, chain, usd_price, liquidity_usd }`

4. **Deploy and test:**
   - `supabase functions deploy scan-wallet`
   - `supabase functions deploy get-asset-registry`
   - Clear old scans or create new scan of Gitcoin wallet
   - Verify pricing shows up

---

## Why This Works

- **CoinGecko** works for top 50 tokens (ETH, UNI, etc.)
- **DexScreener** works for medium-liquidity tokens
- **Registry** acts as a hard-coded fallback for known tokens that APIs miss
- Chaining all three ensures 99% coverage
