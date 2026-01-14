# Mural Pay Integration - Setup Guide

This project demonstrates a complete Mural Pay integration for accepting USDC payments on Polygon Amoy testnet.

## Quick Start (Mock Mode)

The application works out-of-the-box in mock mode without any configuration:

```bash
# Terminal 1 - Backend
cd backend
npm install
npm run local

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

The app will use simulated payment data. You can test the complete checkout flow immediately!

## Real Mural Pay Sandbox Setup

To use the real Mural Pay sandbox with Polygon Amoy testnet:

### 1. Create Mural Pay Sandbox Account

1. Visit [Mural Pay Sandbox Dashboard](https://dashboard-staging.muralpay.com)
2. Create an account
3. Complete KYC (auto-approved after ~5 minutes in sandbox)

### 2. Get API Credentials

1. Navigate to **Settings → API Keys**
2. Generate a new sandbox API key
3. Copy the key

4. Navigate to **Accounts**
5. Copy your Account ID

6. Navigate to **Settings → Webhooks**
7. For local testing, you'll need ngrok (see step 4)
8. Add webhook URL and copy the webhook secret

### 3. Configure Backend

Create `/backend/.env` file (use `.env.example` as template):

```bash
MURAL_PAY_API_KEY=your_sandbox_api_key_here
MURAL_PAY_ACCOUNT_ID=your_account_id_here
MURAL_PAY_ENV=sandbox
MURAL_PAY_WEBHOOK_SECRET=your_webhook_secret_here
```

### 4. Set Up Webhook (for local testing)

Install ngrok to expose your local backend:

``bash
npm install -g ngrok
ngrok http 3001
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`) and:
1. Go to Mural Pay Dashboard → Settings → Webhooks
2. Add webhook URL: `https://abc123.ngrok.io/webhook/muralpay`
3. Save the webhook secret to your `.env` file

### 5. Fund Your Account with Testnet USDC

1. Visit [Circle USDC Faucet](https://faucet.circle.com/)
2. Connect your wallet
3. Select Polygon Amoy network
4. Get 10 testnet USDC (can request every hour)
5. Send some to your Mural Pay account wallet address

### 6. Test the Complete Flow

With real credentials configured:

**Terminal 1 - Backend:**
```bash
cd backend
npm run local
```

**Terminal 2 - Ngrok (for webhooks):**
```bash
ngrok http 3001
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
```

**Browser:**
1. Add products to cart
2. Click "Proceed to Checkout"
3. Click "Pay with Mural"
4. Payment modal will show real Polygon Amoy deposit address
5. Open MetaMask, switch to Polygon Amoy
6. Send the exact USDC amount shown
7. Wait for blockchain confirmation
8. Mural Pay will detect the payment and trigger your webhook
9. Order confirmation will appear!

## Features

### Backend
- Real Mural Pay API integration with automatic fallback to mock data
- Webhook signature verification
- USDC payment tracking
- Polygon Amoy testnet support

### Frontend  
- Beautiful payment modal with instructions
- Copy-to-clipboard for deposit addresses
- Links to PolygonScan explorer
- Links to Circle faucet for testnet USDC
- Responsive design
- Demo mode indicator when using mock data

## Architecture

```
Frontend (React + Vite)
    ↓
Backend (Serverless + AWS Lambda)
    ↓
Mural Pay API (Sandbox)
    ↓
Polygon Amoy Testnet (Blockchain)
```

## Environment Variables

### Backend (`/backend/.env`)
- `MURAL_PAY_API_KEY` - Your Mural Pay API key
- `MURAL_PAY_ACCOUNT_ID` - Your account ID  
- `MURAL_PAY_ENV` - `sandbox` or `production`
- `MURAL_PAY_WEBHOOK_SECRET` - Webhook verification secret

### Frontend (`/frontend/.env`)
- `VITE_API_BASE_URL` - Backend API URL (`http://localhost:3001` for local)

## Useful Links

- [Mural Pay Documentation](https://developers.muralpay.com/)
- [Mural Pay Sandbox Dashboard](https://dashboard-staging.muralpay.com)
- [Circle USDC Faucet](https://faucet.circle.com/)
- [Polygon Amoy Explorer](https://amoy.polygonscan.com/)
- [Polygon Amoy RPC Info](https://chainlist.org/?search=amoy&testnets=true)

## Troubleshooting

**"Payment initiation failed"**
- Check backend is running on port 3001
- Check `VITE_API_BASE_URL` in frontend `.env`
- Check browser console for CORS errors

**"No Polygon USDC wallet found"**
- Verify your Mural Pay API key is correct
- Ensure your account is KYC approved
- Check account has a Polygon wallet configured

**"Webhook not received"**
- Ensure ngrok is running and URL is correct in Mural Pay dashboard
- Check webhook secret matches in both places
- Review backend terminal for webhook logs

**"Mock mode" warning in payment modal**
- This means backend is using simulated data
- Add real Mural Pay credentials to backend `.env` to use real API

## Production Deployment

To deploy to production:

1. Change `MURAL_PAY_ENV=production` in backend `.env`
2. Use production API credentials from Mural Pay dashboard
3. Update webhook URL to your deployed API endpoint
4. Update `VITE_API_BASE_URL` to your production API
5. Deploy backend to AWS Lambda
6. Deploy frontend to hosting provider

## License

MIT
