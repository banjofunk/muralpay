import React from 'react';
import { X, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    total: number;
    onPay: () => void;
    isProcessing: boolean;
}

/**
 * Checkout modal component - displays payment options
 */
const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, total, onPay, isProcessing }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">Checkout</h2>
                            <p className="text-slate-500 mt-1">Select your payment method</p>
                        </div>
                        <button onClick={onClose} className="p-2 -mr-2 hover:bg-slate-100 rounded-full text-slate-400">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4 mb-8 border border-slate-100">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-slate-600">Order Total</span>
                            <span className="text-3xl font-bold text-emerald-600">${total.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded w-fit">
                            <ShieldCheck className="w-3 h-3 mr-1" />
                            Secure Encrypted Connection
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* Mural Pay Button */}
                        <button
                            onClick={onPay}
                            disabled={isProcessing}
                            className="w-full group relative flex items-center justify-between p-4 border-2 border-slate-200 hover:border-slate-800 rounded-xl transition-all hover:shadow-lg bg-white"
                        >
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-white mr-4">
                                    {/* Abstract M icon for Mural */}
                                    <span className="font-bold text-xl tracking-tighter">M</span>
                                </div>
                                <div className="text-left">
                                    <span className="block font-bold text-slate-800">Pay with Mural</span>
                                    <span className="block text-xs text-slate-500">USDC on Polygon</span>
                                </div>
                            </div>
                            <div className="text-slate-300 group-hover:text-emerald-500 transition-colors">
                                {isProcessing ? <Loader2 className="animate-spin w-6 h-6" /> : <ArrowRight className="w-6 h-6" />}
                            </div>
                        </button>

                        {/* Disabled Option for visual contrast */}
                        <button disabled={true} className="w-full flex items-center p-4 border border-slate-100 rounded-xl opacity-50 cursor-not-allowed">
                            <div className="w-10 h-10 bg-slate-200 rounded-lg mr-4"></div>
                            <div className="text-left">
                                <span className="block font-medium text-slate-400">Credit Card</span>
                                <span className="block text-xs text-slate-400">Not available in demo</span>
                            </div>
                        </button>
                    </div>
                </div>

                <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
                    <p className="text-xs text-slate-400">Powered by Mural Pay Sandbox Environment</p>
                </div>
            </div>
        </div>
    );
};

export default CheckoutModal;
