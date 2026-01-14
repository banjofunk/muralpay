# FrogStop E-commerce Application

A full-stack e-commerce application featuring serverless backend and React frontend, built for demonstrating Mural Pay cryptocurrency payment integration.

## 🏗️ Project Structure

```
mural-test/
├── backend/          # Serverless Lambda functions
│   ├── handlers/     # Lambda function handlers
│   └── serverless.yml
└── frontend/         # React single-page application
    └── src/
        ├── components/  # React components
        └── App.jsx      # Main application
```

## 🚀 Getting Started

### Backend Setup

```bash
cd backend
npm install
npm run local     # Run locally with serverless-offline
npm run deploy    # Deploy to AWS
```

The backend provides a POST `/checkout` endpoint that accepts cart data and returns payment details.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev       # Start development server at http://localhost:3000
npm run build     # Build for production
```

## 🧩 Frontend Components

The application uses a modular component architecture:

- **Button** - Reusable button with multiple variants (primary, secondary, mural)
- **ProductCard** - Displays product information with add-to-cart functionality
- **CartDrawer** - Sliding sidebar showing cart contents and quantity controls
- **CheckoutModal** - Payment method selection with Mural Pay integration

## 🎨 Tech Stack

### Backend
- Node.js
- Serverless Framework
- AWS Lambda
- HTTP API Gateway

### Frontend
- React 18
- Vite
- TailwindCSS
- Lucide React Icons

## 💳 Mural Pay Integration

The app is ready for Mural Pay integration. The checkout flow is implemented with the following integration point:

1. User adds items to cart
2. Clicks "Proceed to Checkout"
3. Selects "Pay with Mural"
4. Backend API is called (currently mocked)
5. Payment details are returned for user to complete transaction

To enable the backend integration, uncomment the API call in `frontend/src/App.jsx` (lines 60-65) and configure your deployed Lambda endpoint URL.

## 🧪 Testing

The application has been tested with:
- ✅ Cart functionality (add, remove, update quantities)
- ✅ Checkout modal flow
- ✅ Responsive design
- ✅ Component rendering

## 📝 License

This is a demo application for demonstration purposes.
