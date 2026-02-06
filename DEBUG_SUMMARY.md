# Multi-Chain Scanning Bug - Debug Summary

## Problem
Backend scans all 11 chains and finds hundreds of tokens (verified in logs), but only 2 tokens end up in the database (Ethereum ETH and Arbitrum ETH).

## What We Know From Logs
```
Starting scan for 11 chains: ethereum, polygon, arbitrum, optimism, base, avalanche, bnb, celo, worldchain, sei, unichain

[ethereum] - 100 tokens found, 50 valid → ERROR: nativeBalanceUsd is not defined
[polygon] - 99 tokens found, 50 valid → ERROR
[arbitrum] - 99 tokens found, 50 valid → NO ERROR (only chain that works!)
[optimism] - 99 tokens found, 50 valid → ERROR  
[base] - 100 tokens found, 50 valid → ERROR
[avalanche] - 45 tokens found, 45 valid → ERROR
[bnb] - 100 tokens found, 50 valid → ERROR
[celo] - 8 tokens found → ERROR
[worldchain] - 50 tokens found → ERROR
[sei] - 0 tokens found → ERROR
[unichain] - 17 tokens found → ERROR

Final result: "Scan complete: 2 tokens"
```

## The Error
```
ReferenceError: nativeBalanceUsd is not defined
    at Object.handler (file:///var/tmp/sb-compile-edge-runtime/scan-wallet/index.ts:562:76)
```

**Line 562 in compiled code** - but source code is only 380 lines, so this is after bundling/transpilation.

## Code Structure (Lines 274-343)
```typescript
} else {
  // EVM chain
  const nativeBalanceHex = await fetchNativeBalance(walletAddress, alchemyKey, chain);
  const nativeBalance = parseInt(nativeBalanceHex, 16) / Math.pow(10, chainConfig.decimals);
  const nativePrice = await fetchNativePriceUsd(chain);
  const nativeBalanceUsd = nativeBalance * nativePrice; // DEFINED HERE (line 281)
  
  const tokenBalances = await fetchTokenBalances(walletAddress, alchemyKey, chain);
  const validTokens = tokenBalances.filter(...).slice(0, 50);

  if (nativeBalanceUsd > 0.01) { // USED HERE - OK
    processedTokens.push({ ... });
  }

  const tokenPromises = validTokens.map(async (token) => {
    try {
      const metadata = await fetchTokenMetadata(token.contractAddress, alchemyKey, chain);
      if (!metadata.symbol || !metadata.decimals) return { addr: token.contractAddress, data: null };
      const balance = parseInt(token.tokenBalance, 16) / Math.pow(10, metadata.decimals);
      if (balance * 0.01 < 0.01) return { addr: token.contractAddress, data: null }; // LINE 307 - SUSPICIOUS
      return { addr: token.contractAddress, data: { ... } };
    } catch {
      return { addr: token.contractAddress, data: null };
    }
  });

  const metadataResults = await Promise.all(tokenPromises);
  const withMetadata = metadataResults.filter(r => r.data);
  
  const addresses = withMetadata.map(r => r.addr);
  const prices = addresses.length > 0 ? await batchFetchTokenPrices(addresses, chain) : {};

  const finalTokens = withMetadata.map(r => {
    const price = prices[r.addr.toLowerCase()] || 0;
    const balanceUsd = r.data!.balance * price;
    if (balanceUsd < 0.01) return null;
    return { ... };
  }).filter(t => t !== null);

  finalTokens.forEach(t => processedTokens.push(t));
  console.log(`[${chain}] Added ${finalTokens.length} tokens`); // LOGGING - should be OK
}
```

## Suspicious Line 307
```typescript
if (balance * 0.01 < 0.01) return { addr: token.contractAddress, data: null };
```

**This makes no sense mathematically!** `balance * 0.01 < 0.01` means `balance < 1`. This is probably meant to be a minimum balance filter but the logic is wrong.

## Why Only Arbitrum Works?
Unknown. All chains use identical code path. Arbitrum is the only one not throwing the error.

## Hypothesis
The error "nativeBalanceUsd is not defined at line 562" might be coming from:
1. A closure issue in the async map function
2. The compiled/bundled code has different scope than expected
3. Some weird TypeScript transpilation issue

## Recommended Fixes to Try

### Fix 1: Simplify the token processing (remove confusing logic)
```typescript
const tokenPromises = validTokens.map(async (token) => {
  try {
    const metadata = await fetchTokenMetadata(token.contractAddress, alchemyKey, chain);
    if (!metadata.symbol || !metadata.decimals) return null;
    const balance = parseInt(token.tokenBalance, 16) / Math.pow(10, metadata.decimals);
    if (balance === 0) return null; // SIMPLIFIED - just check if zero
    return {
      addr: token.contractAddress,
      symbol: metadata.symbol,
      name: metadata.name || metadata.symbol,
      balance,
      decimals: metadata.decimals,
      logo: metadata.logo
    };
  } catch {
    return null;
  }
});

const metadataResults = await Promise.all(tokenPromises);
const withMetadata = metadataResults.filter(r => r !== null);

const addresses = withMetadata.map(r => r.addr);
const prices = addresses.length > 0 ? await batchFetchTokenPrices(addresses, chain) : {};

const finalTokens = withMetadata.map(token => {
  const price = prices[token.addr.toLowerCase()] || 0;
  const balanceUsd = token.balance * price;
  if (balanceUsd < 0.01) return null; // Minimum $0.01 value
  return {
    symbol: token.symbol,
    name: token.name,
    contract_address: token.addr,
    balance: token.balance.toString(),
    balance_usd: balanceUsd,
    classification: classifyToken(balanceUsd, token.symbol),
    price_usd: price,
    chain,
    has_unlimited_approval: false,
    logo_url: token.logo || null,
  };
}).filter(t => t !== null);
```

### Fix 2: Move nativeBalanceUsd to outer scope
```typescript
for (const chain of chainsToScan) {
  const chainConfig = CHAIN_CONFIG[chain];
  let nativeBalanceUsd = 0; // DECLARE HERE, at function scope
  
  try {
    if (chainConfig.kind === 'solana') {
      // ... solana code
    } else if (chainConfig.kind === 'bitcoin') {
      // ... bitcoin code  
    } else {
      // EVM chain
      const nativeBalanceHex = await fetchNativeBalance(walletAddress, alchemyKey, chain);
      const nativeBalance = parseInt(nativeBalanceHex, 16) / Math.pow(10, chainConfig.decimals);
      const nativePrice = await fetchNativePriceUsd(chain);
      nativeBalanceUsd = nativeBalance * nativePrice; // ASSIGN to outer variable
      // ... rest of EVM code
    }
  } catch (chainError: any) {
    console.error(`[${chain}] Error:`, chainError.message);
  }
}
```

### Fix 3: Don't use try-catch, let errors bubble
Remove the try-catch around chain processing to see the real error:
```typescript
for (const chain of chainsToScan) {
  const chainConfig = CHAIN_CONFIG[chain];
  console.log(`Scanning ${chain}...`);
  
  // NO TRY-CATCH - let errors fail loudly
  if (chainConfig.kind === 'solana') {
    // ...
  } else {
    // ...
  }
}
```

## Files Needed

**Backend**: `/Users/renaobrien/Desktop/Elut/supabase/functions/scan-wallet/index.ts` (380 lines)  
**Frontend service**: `/Users/renaobrien/Desktop/Elut/src/services/walletService.ts`  
**Overview screen**: `/Users/renaobrien/Desktop/Elut/src/screens/Overview.tsx`

## Deploy Commands
```bash
# Backend
cd /Users/renaobrien/Desktop/Elut && supabase functions deploy scan-wallet

# Frontend  
cd /Users/renaobrien/Desktop/Elut && npm run build && netlify deploy --prod
```

## Test Wallet
**Vitalik**: `0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045`  
Should have 47+ tokens across 11 chains, currently only showing 2.
