# 0x API Key - Quick Setup Guide

## What is the 0x API Key?

The 0x API fetches live swap prices from decentralized exchanges. Without it, the "Get Quotes" button on the Consolidate screen won't work - it needs real-time pricing to show you how much USDC you'll receive for each dust token.

## Where to Get It

1. Go to: **https://0x.org/**
2. Click on **"Docs"** or **"API"** (top right)
3. Create a free account
4. Get your API key (usually on a dashboard or keys page)
5. Copy the key

## How to Set It Up

### Option A: Local Testing (Development)
If you want to test on your machine:

```bash
# Edit the file .env.local in the project folder
REACT_APP_ZERO_EX_API_KEY=your_actual_key_here
```

Then run: `npm run dev`

### Option B: Production (Netlify)
If you want it to work on the live site:

1. Go to: **https://app.netlify.com/sites/elutio** (or your Netlify dashboard)
2. Click **"Site settings"** → **"Build & Deploy"** → **"Environment"**
3. Click **"Edit variables"** (or the + button)
4. Add new variable:
   - **Key**: `REACT_APP_ZERO_EX_API_KEY`
   - **Value**: `paste_your_key_here`
5. Click **Save**
6. Netlify will automatically redeploy (or trigger manually)

## What Happens After You Set It?

Once the key is configured:

1. Go to the Consolidate screen
2. Select some dust tokens
3. Click "Get Quotes"
4. Instead of nothing happening, you'll see:
   - Real-time USDC prices for each token
   - Total amount you'll receive
   - Continue button becomes active

## If It's Not Working

### Issue: "Get Quotes" button does nothing
- **Check 1**: Did you actually set the env var?
- **Check 2**: Did you redeploy after setting it?
- **Check 3**: Did you refresh the browser (hard refresh: Cmd+Shift+R)?

### Issue: See an error about "0x API"
- **Check**: Is your API key correct? (copy-paste it again to verify)
- **Check**: Does it need to be activated? (some APIs require enabling)

### Issue: Quotes show but say "Failed"
- **Possible**: Token address issue or chain not supported
- **Solution**: Try a different token or chain

## Rate Limits

The free tier of 0x API has:
- 100 requests per minute
- Sufficient for normal usage
- Upgrade to premium if you hit limits

## Next Steps

Once you set the 0x API key:
- The Consolidate flow will show real prices ✅
- Phase 2 next: Actually execute the swaps (requires wallet signing)
- Phase 3+: Deposit to Aave for yield

---

**That's it!** Just get the key and add it to Netlify environment variables. Takes 2 minutes.
