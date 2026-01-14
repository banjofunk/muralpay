import React from 'react';
import { ShoppingBag, X, Plus, Minus } from 'lucide-react';
import Button from './Button';
import { CartItem } from '../data/products';

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    cart: CartItem[];
    updateQty: (id: number, delta: number) => void;
    total: number;
    onCheckout: () => void;
}

/**
 * Cart drawer component - sliding sidebar showing cart contents
 */
const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, cart, updateQty, total, onCheckout }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={onClose} />

            {/* Drawer */}
            <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center">
                        <ShoppingBag className="w-5 h-5 mr-2 text-emerald-600" />
                        Your Pond
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                            <span className="text-6xl grayscale">🐸</span>
                            <p className="text-lg font-medium">Your pond is empty.</p>
                            <button onClick={onClose} className="text-emerald-600 font-medium hover:underline">Start collecting frogs</button>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className="flex gap-4">
                                <div className={`w-20 h-20 rounded-lg ${item.color} flex items-center justify-center overflow-hidden flex-shrink-0`}>
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-800">{item.name}</h4>
                                    <p className="text-slate-500 text-sm">${item.price.toFixed(2)}</p>

                                    <div className="flex items-center mt-3 gap-3">
                                        <button
                                            onClick={() => updateQty(item.id, -1)}
                                            className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-600"
                                        >
                                            <Minus className="w-3 h-3" />
                                        </button>
                                        <span className="font-medium w-4 text-center">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQty(item.id, 1)}
                                            className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-600"
                                        >
                                            <Plus className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                                <div className="font-bold text-slate-900">
                                    ${(item.price * item.quantity).toFixed(2)}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {cart.length > 0 && (
                    <div className="p-6 bg-slate-50 border-t border-slate-100">
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-slate-500">Subtotal</span>
                            <span className="text-2xl font-bold text-slate-900">${total.toFixed(2)}</span>
                        </div>
                        <Button onClick={onCheckout} className="w-full">
                            Proceed to Checkout
                        </Button>
                        <p className="text-center text-xs text-slate-400 mt-4">
                            Shipping & taxes calculated at next step
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartDrawer;
