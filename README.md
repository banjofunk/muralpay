# FrogStop - Crypto E-Commerce Demo

A full-stack e-commerce application demonstrating USDC payment integration via [Mural Pay](https://muralpay.com) on Polygon, with automatic fiat conversion to COP.

## Features

| Feature | Description |
|---------|-------------|
| 🛒 **Product Catalog** | Browse and add rubber frog products to cart |
| 💳 **Crypto Checkout** | Pay with USDC on Polygon (testnet supported) |
| 🔔 **Payment Verification** | Real-time status updates via webhooks |
| 💱 **Auto-Withdrawal** | Automatic conversion to COP on payment confirmation |
| 📊 **Merchant Dashboard** | Track payments and withdrawal status |

## Architecture

```
┌─────────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│   React Frontend    │────▶│  Serverless Backend  │────▶│   Mural Pay API │
│   (Vite + TS)       │     │  (AWS Lambda + DDB)  │     │   (Polygon)     │
└─────────────────────┘     └──────────────────────┘     └─────────────────┘
```

## Project Structure

```
mural-test/
├── backend/                    # Serverless Lambda functions (Node.js)
│   ├── handlers/
│   │   ├── checkout.js         # POST /checkout - initiate payment
│   │   ├── checkStatus.js      # GET /checkout/status/:id
│   │   ├── webhook.js          # POST /webhook/muralpay
│   │   └── listPayments.js     # GET /payments
│   ├── services/
│   │   └── muralPayService.js  # Mural Pay API integration
│   ├── utils/
│   │   └── paymentStore.js     # DynamoDB operations
│   └── serverless.yml
│
└── frontend/                   # React SPA (TypeScript + Vite)
    └── src/
        ├── components/
        │   ├── ProductCard.tsx
        │   ├── CartDrawer.tsx
        │   ├── CheckoutModal.tsx
        │   ├── PaymentModal.tsx
        │   └── MerchantDashboard.tsx
        ├── data/products.ts
        ├── types.ts
        └── App.tsx
```

## Quick Start

### Prerequisites
- Node.js 18+
- Java Runtime (for local DynamoDB)

### Run Locally

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npm run local     # Starts on http://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev       # Starts on http://localhost:5173
```

The app runs in **mock mode** by default. For real Mural Pay sandbox integration, see [MURAL_PAY_SETUP.md](./MURAL_PAY_SETUP.md).

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 18, TypeScript, Vite, TailwindCSS |
| **Backend** | Node.js, Serverless Framework, AWS Lambda |
| **Database** | DynamoDB (local for dev) |
| **Payments** | Mural Pay API, USDC on Polygon |

## Deployment

```bash
# Backend (AWS Lambda)
cd backend && npm run deploy

# Frontend (any static host)
cd frontend && npm run build
```

## License

MIT - Demo application for demonstration purposes.
