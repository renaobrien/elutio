# Testing Guide - Dust Consolidation Feature

## Prerequisites
1. MetaMask or compatible Web3 wallet installed
2. Testnet wallet with some test tokens (optional for UI testing)
3. 0x API key set in Netlify environment (for quote fetching)

## Testing the Consolidate Flow

### Test 1: Navigation
1. Connect wallet via Landing page
2. Wait for scan to complete
3. Click "Overview" in sidebar
4. Verify you see the "Consolidate → USDC" button if dust tokens exist
5. Click the button - should navigate to Consolidate screen
6. Alternatively: Click "Consolidate" in sidebar directly

**Expected**: Consolidate screen loads with token list

### Test 2: Token Selection
1. On Consolidate screen, verify dust/recoverable tokens load
2. Click checkbox to select a token
3. Click "Select All" button
4. Verify all tokens are selected
5. Click "Deselect All" button
6. Verify all tokens are deselected

**Expected**: Token selection state updates, total value recalculates

### Test 3: Quote Fetching (Requires 0x API Key)
1. Select 1-3 dust tokens
2. Click "Get Quotes" button
3. Watch for loading state with spinner
4. Wait for quotes to load

**Expected**: 
- Loading spinner appears
- Each token shows buyAmount (USDC) and price
- Total USDC amount displays at bottom
- Continue button becomes enabled

### Test 4: Quote Failure Handling
1. If 0x API key not set:
   - Should see error message in quote fetch attempt
   - "Failed" status on quote items
   - Continue button remains disabled

**Expected**: Graceful error message, no crash

### Test 5: Step Navigation
1. Start from Review step
2. Select tokens → "Get Quotes"
3. Should move to Quotes step
4. Click "Back" button → returns to Review
5. Select tokens again → "Get Quotes"
6. From Quotes step → "Continue"
7. Should move to Approve step

**Expected**: Step navigation works in sequence

### Test 6: Responsive Design
1. View Consolidate screen on different window sizes
2. Test on mobile (narrow viewport)
3. Verify buttons remain accessible
4. Verify tables don't overflow

**Expected**: UI adapts to screen size

### Test 7: Empty State
1. Use a wallet with no dust tokens
2. Navigate to Consolidate
3. Should show message: "No dust tokens found in this wallet"
4. Should show "Back to Overview" link

**Expected**: Graceful handling of empty state

### Test 8: Wallet Integration
1. Connect with EOA wallet (standard MetaMask)
2. Verify consolidation flow available
3. Switch to Safe multi-sig wallet (if available)
4. Verify consolidation flow available

**Expected**: Works with both EOA and Safe wallets (flow is same in Phase 1)

### Test 9: Persistence
1. Complete flow through all steps
2. Refresh page during consolidation
3. Navigate away and back to Consolidate

**Expected**: 
- Token selections persist in session
- Quotes clear after navigation (expected - will cache in Phase 2)
- No data loss

### Test 10: Accessibility
1. Use keyboard Tab to navigate between inputs
2. Use Space/Enter to select tokens
3. Use Tab to reach buttons
4. Use Enter to activate buttons

**Expected**: All interactive elements keyboard accessible

## Integration Testing Checklist

### Phase 1 Validation (No 0x API key needed)
- [ ] Consolidate screen renders
- [ ] Token selection works
- [ ] Steps navigate correctly
- [ ] UI responsive on mobile
- [ ] Empty state handled
- [ ] Navigation from Overview works
- [ ] Sidebar button works

### Phase 2 Validation (Requires 0x API key)
- [ ] 0x API key configured in Netlify
- [ ] Quote fetching succeeds
- [ ] Quote display is accurate
- [ ] Gas estimates shown (if available)
- [ ] Error handling for API failures
- [ ] Rate limiting respected

### Phase 2+ Validation (Requires wallet signing)
- [ ] Approve step requests wallet signature
- [ ] Execute step broadcasts transaction
- [ ] Confirmation shows transaction hash
- [ ] Transaction confirms on chain

## Environment Setup

### Local Testing
```bash
# Copy .env.local.example to .env.local
cp .env.local .env.local

# Edit and add your keys:
# REACT_APP_ZERO_EX_API_KEY=your_key
# REACT_APP_ALCHEMY_API_KEY=your_key

# Run dev server
npm run dev
```

### Staging Testing (Netlify)
1. Go to Netlify dashboard
2. Settings → Build & Deploy → Environment
3. Add environment variable:
   - Name: `REACT_APP_ZERO_EX_API_KEY`
   - Value: `your_0x_api_key`
4. Trigger new deploy via Git push or manual deploy

## Testnet Addresses

### Sepolia (Recommended for testing)
- USDC (Sepolia): `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`
- 0x Router: Used via 0x API

### Polygon Mumbai
- USDC (Mumbai): `0x0FA8781a83E46826621b3BC400C6E7793F58cDA9`
- 0x Router: Used via 0x API

## Debugging

### Browser Console Errors
1. Open DevTools (F12)
2. Go to Console tab
3. Look for errors related to:
   - Token loading
   - Quote fetching
   - 0x API errors

### Network Tab
1. Open Network tab in DevTools
2. Perform consolidation flow
3. Look for requests to:
   - `api.0x.org` - swap quotes
   - `api.alchemy.com` - token data

### Redux DevTools (if added later)
- Timeline of state changes
- Action dispatch history
- State snapshots

## Common Issues & Solutions

### Issue: "No dust tokens found"
**Cause**: Wallet hasn't been scanned or has no dust
**Solution**: 
1. Run wallet scan from Scanning screen
2. Wait for scan to complete
3. Tokens will populate once scan is done

### Issue: "0x API key not set"
**Cause**: Environment variable missing
**Solution**:
1. Set `REACT_APP_ZERO_EX_API_KEY` in environment
2. Redeploy or restart dev server
3. Clear browser cache

### Issue: Quote fetching fails with 400 error
**Cause**: Invalid token address or chain mismatch
**Solution**:
1. Verify token address is correct for chain
2. Check token has liquidity on 0x
3. Try different token or chain

### Issue: Page doesn't update after selection
**Cause**: State not updating properly
**Solution**:
1. Hard refresh (Cmd+Shift+R / Ctrl+Shift+R)
2. Clear localStorage: `localStorage.clear()`
3. Try different browser

## Performance Benchmarks

### Expected Load Times
- Consolidate screen load: < 500ms
- Quote fetch (single token): 500-1000ms
- Quote fetch (5 tokens): 1-2 seconds
- All steps complete: < 5 minutes (including user wallet signing)

### Expected File Sizes
- Consolidate screen bundle: + 15 KB (combined with others)
- Full app with features: 347 KB (98 KB gzip)
- Token data (scan): 50-100 KB depending on holdings

## Monitoring & Metrics

### What to Track
- Quote fetch success rate
- Average quote response time
- Number of selected tokens per consolidation
- Total value consolidated
- User drop-off rate by step

### Error Scenarios to Log
- 0x API failures
- Token not found errors
- Quote calculation errors
- Transaction failures
- User cancellations

---

**Last Updated**: Phase 1 Completion
**Status**: Ready for testing
**Next Phase**: Integration & Signing (Phase 2)
