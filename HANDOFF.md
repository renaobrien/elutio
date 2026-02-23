# Elutio Codebase Handoff

## Critical Issues to Fix

### 1. RECOVERABLE showing $0.00 but 58 positions
**Location:** `src/components/dashboard/SummaryCards.tsx` lines 17-37

**Problem:** 58 tokens are classified as RECOVERABLE but have no USD price data (showing "—" in table). The calculation only sums tokens with `balanceUsd > 0`, so recoverable total shows $0.00 even though there are 58 positions.

**Current Logic:**
```typescript
const recoverableWithValue = tokens.filter(t => 
  (t.classification === 'recoverable' || t.classification === 'dust') && 
  t.balanceUsd >= dustThreshold
);
const recoverableWithoutValue = tokens.filter(t => 
  t.classification === 'recoverable' && 
  (!t.balanceUsd || t.balanceUsd === 0)
);
```

**Issue:** Tokens without price data should either:
- Show an estimated value badge (e.g., "~58 unpriced tokens")
- Be displayed separately ("$0.00 + 58 unpriced positions")
- Have the card show "58 positions (pricing unavailable)" instead of $0.00

### 2. POTENTIAL EARNINGS showing $0
**Location:** `src/components/dashboard/SummaryCards.tsx` line 33

**Problem:** Calculates as `Math.floor(totalTransferableUsd * 0.07)` where `totalTransferableUsd = dustUsd + recoverableUsd`. Since recoverableUsd = $0, earnings = $0 even though there are 58 recoverable positions.

**Fix Needed:** Either estimate value for unpriced tokens or show "Unable to estimate (58 unpriced tokens)"

### 3. Lost to Entropy showing same value for Current and If consolidated
**Location:** `src/components/dashboard/OpportunityCost.tsx` and `src/screens/Overview.tsx` line 199

**Problem:** Receives `currentValue={metrics.dustUsd}` and `opportunityCost={metrics.recoverableUsd}`. Since recoverableUsd = $0, both show $3.65.

**Expected:** 
- Current: $3.65 (dust)
- If consolidated: $3.65 + value of 58 recoverable tokens
- Left behind: should show the gain

### 4. Tokens found counter not updating on scanning page
**Location:** `src/screens/Scanning.tsx` line 54

**Problem:** `setTokensFound(result.metrics.tokensCount)` but the counter shows "..." during scanning. Need to verify the scan response actually includes `tokensCount`.

## Key Files

### Frontend Structure
```
src/
├── App.tsx                          # Main app, routing, state management
├── screens/
│   ├── Landing.tsx                  # Landing page with example wallets
│   ├── Scanning.tsx                 # Wallet scanning screen
│   ├── Overview.tsx                 # Main dashboard with metrics
│   └── Deposit.tsx                  # Token transfer/deposit flow
├── components/
│   ├── dashboard/
│   │   ├── SummaryCards.tsx        # Top metric cards (CRITICAL)
│   │   ├── TokenTable.tsx          # Token list with filters
│   │   └── OpportunityCost.tsx     # "Lost to Entropy" card
│   └── ui/
│       └── CountUp.tsx              # Number animation with formatting
├── services/
│   └── walletService.ts             # API calls to Supabase functions
└── types/
    └── index.ts                     # TypeScript interfaces
```

### Backend (Supabase Edge Functions)
```
supabase/functions/
├── scan-wallet/index.ts             # Multi-chain wallet scanner
├── treasury-stats/index.ts          # Aggregate dust stats across DeFi
└── get-asset-registry/index.ts      # Token metadata/pricing
```

## Data Flow

1. **User clicks example wallet** (e.g., Gitcoin) → `Landing.tsx` calls `onViewExample(address)`
2. **App.tsx** sets `walletAddress` and navigates to `scanning` screen with `autoStart={true}`
3. **Scanning.tsx** calls `scanWalletAllChains(address)` → Supabase function `scan-wallet`
4. **scan-wallet** returns `{ scanId, metrics: { tokensCount, ... } }`
5. **Scanning.tsx** calls `onComplete(scanId)` → navigates to Overview
6. **Overview.tsx** fetches tokens with `getTokensByScanId(scanId)`
7. **SummaryCards.tsx** calculates metrics from tokens array

## Current Calculation Logic

### Overview.tsx (lines 44-80)
```typescript
const metrics: WalletMetrics = useMemo(() => {
  const totalBalanceUsd = dbTokens.reduce((sum, t) => sum + Number(t.balance_usd), 0);
  
  const dustTokens = dbTokens.filter(t => t.classification === 'dust');
  const dustUsd = dustTokens.reduce((sum, t) => sum + Number(t.balance_usd), 0);
  
  const recoverableTokens = dbTokens.filter(t => t.classification === 'recoverable');
  const recoverableUsd = recoverableTokens.reduce((sum, t) => sum + Number(t.balance_usd), 0);
  
  const transferableUsd = recoverableUsd + dustUsd;

  return {
    totalBalanceUsd,     // $1,034,027.43 ✓
    recoverableUsd,      // $0.00 (58 tokens have no price) ✗
    dustUsd,             // $3.82 ✓
    opportunityCostUsd: transferableUsd,  // $3.82 (should be higher) ✗
    ...
  };
}, [dbTokens, scan]);
```

### SummaryCards.tsx Dynamic Threshold (lines 17-37)
Recalculates based on `dustThreshold` dropdown:
- Dust: tokens with value < threshold
- Recoverable: tokens with value >= threshold OR classification='recoverable' with no price

**The threshold logic overrides classification!** A token marked as RECOVERABLE in the database could be moved to dust if its value < threshold.

## Token Classification System

From database scan results:
- **CORE** (5 tokens): High-value positions (ETH, UNI, RAI, USDCE)
- **RECOVERABLE** (58 tokens): Tokens without price data that can be transferred
- **DUST** (7 tokens): Small-value tokens under threshold
- **UNSAFE** (34 tokens): Scam/spam tokens

## Pricing Issue

58 tokens show "—" for USD value because:
1. CoinGecko API doesn't have pricing data for obscure tokens
2. The wallet scanner falls back to "—" when price fetch fails
3. These tokens still have `classification='recoverable'` but `balance_usd=0` or `null`

## Recommended Fixes (Priority Order)

### 1. Update SummaryCards to show unpriced token count
```typescript
const recoverableDisplay = recoverableUsd > 0 
  ? `$${recoverableUsd.toLocaleString()}` 
  : `58 positions (pricing unavailable)`;
```

### 2. Update Potential Earnings card
Show "Unable to calculate (58 unpriced tokens)" instead of $0

### 3. Fix Lost to Entropy calculation
Show message: "58 recoverable positions without pricing data - value may be significantly higher"

### 4. Debug Scanning.tsx tokens counter
Check if `result.metrics.tokensCount` is actually in the API response from scan-wallet function

## Example Wallet Data (Gitcoin: 0xde21...a0d6)

**Actual wallet contents:**
- Total: 104 tokens, $1,034,027.43
- Core: 5 tokens (~$1.03M) - ETH, UNI, RAI, USDCE, ETH on Arbitrum
- Recoverable: 58 tokens, NO PRICING DATA (MDGB, GHST, TRUMP, WYV, BAT, etc.)
- Dust: 7 tokens, $3.82 (MANA, 1INCH, USDGLO, SKYA, BASED, BENTO, TUSD)
- Unsafe: 34 tokens (scam airdrops like "Visit aaveprotocol.net", "Polygonpool.com")

## Important Notes

- **Mock data has been removed** - all data comes from real blockchain scans
- **Threshold dropdown** on TOTAL DUST card dynamically recalculates what counts as dust
- **Numbers use toLocaleString()** for comma formatting (fixed recently)
- **autoStart prop** on Scanning component hides wallet selector buttons

## Files to Review

Priority order:
1. `src/components/dashboard/SummaryCards.tsx` - Main issue
2. `src/screens/Overview.tsx` - Metrics calculation
3. `src/screens/Scanning.tsx` - Tokens found counter
4. `src/components/dashboard/OpportunityCost.tsx` - Lost to Entropy display
5. `supabase/functions/scan-wallet/index.ts` - Verify tokens count in response

## Testing

Test wallet: Gitcoin Matching Pool `0xde21f729137c5af1b01d73af1dc21effa2b8a0d6`

Expected results:
- Total Balance: $1,034,027.43 ✓
- Total Dust: $3.82 (with $20K threshold) ✓  
- Recoverable: Should show 58 positions even if $0 USD ✗
- Potential Earnings: Should acknowledge unpriced tokens ✗
- Lost to Entropy: Should show potential value of 58 tokens ✗
- Scanning page: Should count up to 104 tokens ✗
