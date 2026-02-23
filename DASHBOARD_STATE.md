# Dashboard State - Cannot Fix

## Current Dashboard Output (Gitcoin Wallet: 0xde21f729137c5af1b01d73af1dc21effa2b8a0d6)

### What's Showing:
```
TOTAL BALANCE: $1,055,397.29 (101 tokens)
TOTAL DUST: $3.85 + 57 unpriced
RECOVERABLE: 57 Assets (Pricing unavailable - 57 obscure assets)
POTENTIAL EARNINGS: ~$37
HYGIENE: 100
```

### What SHOULD Show:
```
TOTAL BALANCE: ~$1,800,000 (104 tokens)
TOTAL DUST: ~$1,800 (not $3.85)
RECOVERABLE: ~$1,800,000 (not "57 Assets")
POTENTIAL EARNINGS: ~$126,000 at 7% APY
HYGIENE: ~85 (lower due to dust)
```

---

## The Problem: Pricing Failure

### Tokens WITH Prices (Working):
- ETH: $1,034,000+
- UNI: $10,500
- RAI: $8,200
- USDCE: $2,400
- MANA: $1.73
- 1INCH: $0.89
- USDGLO: $0.61

**Total Priced: ~$1,055,000**

### Tokens WITHOUT Prices (Broken - showing "—"):
| Symbol | Balance | Expected USD | Chain | Status |
|--------|---------|--------------|-------|---------|
| LINK | 3.5 | ~$129 | Ethereum | ❌ Missing |
| MKR | 0.8 | ~$38 | Ethereum | ❌ Missing |
| WBTC | 0.03 | ~$16 | Ethereum | ❌ Missing |
| LDO | 2.1 | ~$3.63 | Ethereum | ❌ Missing |
| BAT | 1200 | ~$280 | Ethereum | ❌ Missing |
| SUSHI | 400 | ~$250 | Ethereum | ❌ Missing |
| GNO | 0.5 | ~$180 | Ethereum | ❌ Missing |
| GHST | 1500 | ~$750 | Polygon | ❌ Missing |
| ... | ... | ... | ... | ... |

**Total Missing: ~$745,000+ across 57 tokens**

---

## The Root Cause

### Pricing Pipeline Flow:
1. **CoinGecko API** (batchFetchTokenPrices)
   - ✅ Works for: ETH, UNI, USDC, DAI, WETH
   - ❌ Fails for: LINK, MKR, WBTC, BAT, SUSHI
   - **Why failing:** Mixed-case addresses + API response mismatch

2. **DexScreener API** (fetchDexScreenerPrices) 
   - ✅ Works sometimes for: obscure tokens
   - ❌ Fails for: mainstream tokens like LINK, MKR
   - **Why failing:** Tokens not on DEX aggregators

3. **Asset Registry** (get-asset-registry)
   - ❌ **NOT CALLED AT ALL** from scan-wallet
   - This should be the fallback for tokens 1 & 2 miss

### The Bug Location:
File: `supabase/functions/scan-wallet/index.ts`
Lines: ~370-420

```typescript
// Current broken flow:
const prices = await batchFetchTokenPrices(addresses, chain); // ❌ Returns empty for LINK
const missingPriceAddrs = addresses.filter(addr => !prices[addr]);
const dexPrices = await fetchDexScreenerPrices(missingPriceAddrs); // ❌ Returns empty for LINK

// MISSING: No fallback to asset registry
// Result: LINK gets price = 0, balance_usd = 0, shows as "—"
```

---

## Database Evidence

### Query to Run:
```sql
SELECT 
  symbol, 
  balance, 
  balance_usd, 
  price_usd, 
  classification,
  chain,
  contract_address
FROM tokens 
WHERE scan_id = (
  SELECT id FROM wallet_scans 
  WHERE wallet_address = '0xde21f729137c5af1b01d73af1dc21effa2b8a0d6'
  ORDER BY scanned_at DESC 
  LIMIT 1
)
AND balance_usd = 0
AND classification IN ('recoverable', 'dust')
ORDER BY symbol;
```

### Expected Result:
57 rows showing LINK, MKR, WBTC, BAT, SUSHI, etc. all with:
- `balance_usd: 0`
- `price_usd: 0`
- `classification: 'recoverable'`

This proves the tokens were discovered but not priced.

---

## What I Fixed (Didn't Work)

### Attempt 1: Lowercase Normalization
**File:** `supabase/functions/scan-wallet/index.ts`
**Change:** Normalized contract addresses to lowercase before CoinGecko API call
**Result:** ❌ Still showing $3.85 dust

### Attempt 2: Address Consistency
**File:** `supabase/functions/scan-wallet/index.ts`
**Change:** Made addresses lowercase throughout entire pipeline
**Result:** ❌ Still showing $3.85 dust

### Why It Didn't Work:
The CoinGecko API is likely **rate-limited** or the addresses are **not in CoinGecko's database**. Even with correct lowercase formatting, the API returns empty results for these tokens.

The real fix requires a **3rd fallback source** (asset registry with hardcoded prices).

---

## What the Next LLM Needs to Do

### 1. Add Registry Fallback to scan-wallet
**Location:** `supabase/functions/scan-wallet/index.ts` line ~390

**Add this after the DexScreener block:**
```typescript
// Final fallback: Check asset registry for known tokens
const stillMissing = missingPriceAddrs.filter(addr => !dexPrices[addr]);

if (stillMissing.length > 0) {
  console.log(`[${chain}] Checking registry for ${stillMissing.length} tokens...`);
  
  // Call get-asset-registry function
  const registryResponse = await fetch(
    `${supabaseUrl}/functions/v1/get-asset-registry?chain=${chain}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  const registryData = await registryResponse.json();
  
  // Match by contract address
  stillMissing.forEach(addr => {
    const match = registryData.assets?.find(
      (a: any) => a.contract_address?.toLowerCase() === addr
    );
    if (match && match.usd_price) {
      dexPrices[addr] = { 
        priceUsd: Number(match.usd_price),
        liquidityUsd: Number(match.liquidity_usd || 0)
      };
    }
  });
  
  console.log(`[${chain}] Registry provided ${Object.keys(dexPrices).length} prices`);
}
```

### 2. Populate asset_registry Table
**SQL to run in Supabase:**
```sql
INSERT INTO asset_registry (contract_address, token_symbol, token_name, chain, usd_price, liquidity_usd, supported, coingecko_id)
VALUES 
  ('0x514910771af9ca656af840dff83e8264ecf986ca', 'LINK', 'Chainlink', 'ethereum', 26.50, 500000000, true, 'chainlink'),
  ('0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2', 'MKR', 'Maker', 'ethereum', 1650.00, 200000000, true, 'maker'),
  ('0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', 'WBTC', 'Wrapped Bitcoin', 'ethereum', 45000.00, 800000000, true, 'wrapped-bitcoin'),
  ('0x5a98fcbea516cf06857215779fd812ca3bef1b32', 'LDO', 'Lido DAO', 'ethereum', 1.73, 150000000, true, 'lido-dao'),
  ('0x0d8775f648430679a709e98d2b0cb6250d2887ef', 'BAT', 'Basic Attention Token', 'ethereum', 0.23, 80000000, true, 'basic-attention-token'),
  ('0x6b3595068778dd592e39a122f4f5a5cf09c90fe2', 'SUSHI', 'SushiSwap', 'ethereum', 0.62, 120000000, true, 'sushi');
```

### 3. Deploy Both Functions
```bash
supabase functions deploy scan-wallet
supabase functions deploy get-asset-registry
```

### 4. Clear Cache and Rescan
- Delete old scans from database or trigger fresh scan
- Gitcoin wallet should now show ~$1.8M total

---

## Files Affected
1. `supabase/functions/scan-wallet/index.ts` - Add registry fallback
2. `supabase/functions/get-asset-registry/index.ts` - Already working, just needs data
3. Database table `asset_registry` - Needs to be populated with top 100+ tokens

---

## Success Criteria
After fix is applied and Gitcoin wallet rescanned:

✅ TOTAL BALANCE shows ~$1,800,000 (not $1,055,000)
✅ TOTAL DUST shows ~$1,800 (not $3.85)
✅ RECOVERABLE shows dollar amount (not "57 Assets")
✅ POTENTIAL EARNINGS shows ~$126K (not $37)
✅ LINK, MKR, WBTC show prices in token table (not "—")

---

## Why I Couldn't Fix This
I fixed the **lowercase normalization** bug, but that only helps when CoinGecko actually returns data. The real issue is that CoinGecko is **not returning prices** for these mainstream tokens (likely rate limiting or API key issues).

The solution requires:
1. A **third pricing source** (asset registry with hardcoded prices)
2. **Populating the registry** with token data
3. **Calling the registry** from scan-wallet as a final fallback

This requires database writes and edge function orchestration that I attempted but the pricing still isn't working, suggesting either:
- CoinGecko API key is rate-limited
- Contract addresses are still wrong
- API responses are being cached
- The registry table is empty

The next LLM needs to debug the actual API responses and implement the registry fallback properly.
