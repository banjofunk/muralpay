import React, { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import ProductCard from './components/ProductCard';
import CheckoutModal from './components/CheckoutModal';
import PaymentModal from './components/PaymentModal';
import ImageModal from './components/ImageModal';
import CartDrawer from './components/CartDrawer';
import MerchantDashboard from './components/MerchantDashboard';
import { PRODUCTS, Product, CartItem } from './data/products';
import { PaymentDetails, PaymentStatus } from './types';

interface CheckoutResponse {
    success: boolean;
    payment?: PaymentDetails;
    order?: any;
}

export default function App() {
    const [viewMode, setViewMode] = useState<'customer' | 'merchant'>('customer');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedImage, setSelectedImage] = useState<Product | null>(null);

    // Payment Modal state
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pending');

    // Cart Logic
    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(p => p.id === product.id);
            if (existing) {
                return prev.map(p => p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p);
            }
            return [...prev, { ...product, quantity: 1 }];
        });
        setIsCartOpen(true);
    };

    const updateQuantity = (id: number, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                return { ...item, quantity: Math.max(0, item.quantity + delta) };
            }
            return item;
        }).filter(item => item.quantity > 0));
    };

    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    // Checkout Handler - Integration with backend API
    const handleMuralPayment = async () => {
        setIsProcessing(true);

        try {
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
            const response = await fetch(`${apiBaseUrl}/checkout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: cartTotal,
                    currency: 'USD',
                    items: cart.map(item => ({
                        id: item.id,
                        name: item.name,
                        quantity: item.quantity,
                        price: item.price
                    }))
                })
            });

            const data = await response.json() as CheckoutResponse;
            console.log('Payment response:', data);

            setIsProcessing(false);

            if (data.success && data.payment) {
                // Store payment details and open payment modal
                setPaymentDetails(data.payment);
                setPaymentStatus('pending');
                setIsCheckoutOpen(false);
                setIsPaymentModalOpen(true);
            } else {
                alert('Payment initiation failed. Please try again.');
            }
        } catch (error) {
            console.error('Payment error:', error);
            setIsProcessing(false);
            alert('Network error. Please check your connection and try again.');
        }
    };

    // Handle payment modal close
    const handlePaymentModalClose = () => {
        setIsPaymentModalOpen(false);
        if (paymentStatus === 'completed') {
            // Clear cart on successful payment
            setCart([]);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-emerald-100 flex flex-col">

            {/* Navigation */}
            <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => setViewMode('customer')}>
                        <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white text-lg">🐸</div>
                        <span className="font-bold text-xl tracking-tight text-emerald-950">FrogStop</span>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* View Switcher */}
                        <div className="bg-slate-100 p-1 rounded-lg flex items-center">
                            <button
                                onClick={() => setViewMode('customer')}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'customer'
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                Customer
                            </button>
                            <button
                                onClick={() => setViewMode('merchant')}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'merchant'
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                Merchant
                            </button>
                        </div>

                        {viewMode === 'customer' && (
                            <button
                                onClick={() => setIsCartOpen(true)}
                                className="relative p-2 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <ShoppingBag className="w-6 h-6 text-slate-700" />
                                {cartCount > 0 && (
                                    <span className="absolute top-0 right-0 w-5 h-5 bg-emerald-500 text-white text-xs font-bold flex items-center justify-center rounded-full ring-2 ring-white">
                                        {cartCount}
                                    </span>
                                )}
                            </button>
                        )}

                        {viewMode === 'merchant' && (
                            <div
                                className="relative p-2 rounded-full"
                            >
                                <div className="w-6 h-6" />
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* Main Content - flex-grow pushes footer to bottom */}
            <div className="flex-grow">
                {viewMode === 'customer' ? (
                    <>
                        {/* Hero Section */}
                        <header className="bg-white border-b border-slate-200">
                            <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center">
                                <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
                                    Amphibious Companions for <span className="text-emerald-600">Every Occasion</span>
                                </h1>
                                <p className="max-w-xl mx-auto text-lg text-slate-500 mb-8">
                                    Ethically sourced rubber frogs. 100% waterproof. 100% charming.
                                    Now accepting crypto payments via Mural.
                                </p>
                            </div>
                        </header>

                        {/* Product Grid */}
                        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                {PRODUCTS.map(product => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        onAddToCart={addToCart}
                                        onImageClick={(product) => setSelectedImage(product)}
                                    />
                                ))}
                            </div>
                        </main>
                    </>
                ) : (
                    <MerchantDashboard />
                )}
            </div>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-400 py-12">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p>© 2026 FrogStop Inc. Powered by Mural Pay.</p>
                </div>
            </footer>

            {/* Overlay Components */}
            <CartDrawer
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                cart={cart}
                updateQty={updateQuantity}
                total={cartTotal}
                onCheckout={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                }}
            />

            <CheckoutModal
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                total={cartTotal}
                onPay={handleMuralPayment}
                isProcessing={isProcessing}
            />

            {/* Payment Modal */}
            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={handlePaymentModalClose}
                paymentDetails={paymentDetails}
                paymentStatus={paymentStatus}
                onStatusChange={setPaymentStatus}
            />

            {/* Image Modal */}
            {selectedImage && (
                <ImageModal
                    image={selectedImage.image}
                    name={selectedImage.name}
                    onClose={() => setSelectedImage(null)}
                />
            )}

        </div>
    );
}
