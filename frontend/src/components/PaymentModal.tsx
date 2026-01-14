import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, AlertCircle, Loader2 } from 'lucide-react';
import { PaymentDetails, PaymentStatus } from '../types';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    paymentDetails: PaymentDetails | null;
    paymentStatus?: PaymentStatus;
    onStatusChange?: (status: PaymentStatus) => void;
}

/**
 * Payment Modal Component - Displays Mural Pay payment details
 * Shows deposit address, amount, and instructions for sending USDC on Polygon Amoy
 */
const PaymentModal: React.FC<PaymentModalProps> = ({
    isOpen,
    onClose,
    paymentDetails,
    paymentStatus = 'pending',
    onStatusChange
}) => {
    const [copied, setCopied] = useState(false);

    // Polling for payment status
    React.useEffect(() => {
        if (!isOpen || !paymentDetails || !onStatusChange || paymentStatus === 'completed' || paymentStatus === 'failed') {
            return;
        }

        const pollInterval = setInterval(async () => {
            try {
                const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
                const response = await fetch(`${apiBaseUrl}/checkout/status/${paymentDetails.paymentId}`);
                const data = await response.json();

                if (response.ok && data.success && data.status) {
                    // Only update if status has changed
                    if (data.status !== paymentStatus) {
                        console.log(`Payment status updated: ${paymentStatus} -> ${data.status}`);
                        onStatusChange(data.status as PaymentStatus);
                    }
                }
            } catch (error) {
                console.error('Error polling payment status:', error);
            }
        }, 3000); // Poll every 3 seconds

        return () => clearInterval(pollInterval);
    }, [isOpen, paymentDetails, paymentStatus, onStatusChange]);

    if (!isOpen || !paymentDetails) return null;

    const {
        depositAddress,
        amountUSDC,
        network,
        paymentId,
        instructions,
        isMock
    } = paymentDetails;

    // Handle copy to clipboard
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(depositAddress);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    // Payment complete state
    if (paymentStatus === 'completed') {
        return (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

                <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                    <div className="p-8 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Check className="w-8 h-8 text-green-600" />
                        </div>

                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Payment Confirmed!</h2>
                        <p className="text-slate-600 mb-6">
                            Your payment of {amountUSDC} USDC has been received.
                        </p>

                        <div className="bg-slate-50 rounded-xl p-4 mb-6">
                            <p className="text-sm text-slate-500 mb-2">Transaction Hash</p>
                            <p className="text-xs font-mono text-slate-700 break-all">
                                {paymentDetails.transactionHash || '0x...'}
                            </p>
                        </div>

                        <button
                            onClick={onClose}
                            className="w-full bg-emerald-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
                        >
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Payment confirmed state (detected but not completed)
    if (paymentStatus === 'confirmed') {
        return (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

                <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                    <div className="p-8 text-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                        </div>

                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Payment Detected</h2>
                        <p className="text-slate-600 mb-6">
                            We've detected your payment of {amountUSDC} USDC.
                            <br />
                            Waiting for block confirmations...
                        </p>

                        <div className="bg-slate-50 rounded-xl p-4 mb-6">
                            <p className="text-sm text-slate-500 mb-2">Transaction Hash</p>
                            <p className="text-xs font-mono text-slate-700 break-all">
                                {paymentDetails.transactionHash || 'Pending...'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Pending payment state
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex-shrink-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">Payment Details</h2>
                            <p className="text-slate-500 mt-1 flex items-center gap-2">
                                <span className="inline-block w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                                Waiting for payment
                            </p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Mock Warning */}
                    {isMock && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-amber-800">
                                <p className="font-semibold mb-1">Demo Mode</p>
                                <p>Using mock payment data. To use real Mural Pay sandbox, add your API credentials to the backend .env file.</p>
                            </div>
                        </div>
                    )}

                    {/* Amount */}
                    <div className="bg-emerald-50 rounded-xl p-6 mb-6 text-center border border-emerald-100">
                        <p className="text-sm text-emerald-700 font-medium mb-2">Send Exactly</p>
                        <p className="text-4xl font-bold text-emerald-900">{amountUSDC} USDC</p>
                        <p className="text-sm text-emerald-600 mt-2">{network || 'Polygon Amoy Testnet'}</p>
                    </div>

                    {/* Deposit Address */}
                    <div className="mb-6">
                        <label className="text-sm font-medium text-slate-700 mb-2 block">
                            Deposit Address
                        </label>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                            <p className="font-mono text-sm text-slate-800 break-all mb-3">
                                {depositAddress}
                            </p>
                            <button
                                onClick={handleCopy}
                                className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 py-2 px-4 rounded-lg transition-colors"
                            >
                                {copied ? (
                                    <>
                                        <Check className="w-4 h-4 text-green-600" />
                                        <span className="text-green-600">Copied!</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-4 h-4" />
                                        <span>Copy Address</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Payment ID */}
                    <div className="bg-slate-50 rounded-xl p-4 mb-6">
                        <p className="text-xs text-slate-500 mb-1">Payment ID</p>
                        <p className="text-sm font-mono text-slate-700">{paymentId}</p>
                    </div>

                    {/* Instructions */}
                    <div className="mb-6">
                        <h3 className="font-semibold text-slate-800 mb-3">📝 Instructions</h3>
                        <ol className="space-y-3 text-sm text-slate-700">
                            <li className="flex gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-bold">
                                    1
                                </span>
                                <span>
                                    <strong>Get testnet USDC</strong> (if you don't have any)
                                    <a
                                        href={instructions?.faucetUrl || 'https://faucet.circle.com/'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block mt-1 text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
                                    >
                                        Visit Circle Faucet <ExternalLink className="w-3 h-3" />
                                    </a>
                                </span>
                            </li>
                            <li className="flex gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-bold">
                                    2
                                </span>
                                <span>Open your crypto wallet (MetaMask, etc.)</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-bold">
                                    3
                                </span>
                                <span>Switch to <strong>Polygon Amoy Testnet</strong></span>
                            </li>
                            <li className="flex gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-bold">
                                    4
                                </span>
                                <span>Send exactly <strong>{amountUSDC} USDC</strong> to the address above</span>
                            </li>
                        </ol>
                    </div>

                    {/* Explorer Link */}
                    {instructions?.explorerUrl && (
                        <a
                            href={instructions.explorerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-center gap-2 text-slate-600 hover:text-slate-800 py-2 text-sm font-medium transition-colors"
                        >
                            View on PolygonScan <ExternalLink className="w-4 h-4" />
                        </a>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex-shrink-0">
                    <p className="text-xs text-slate-500 text-center">
                        {isMock ? 'Demo Mode - Mock Payment Data' : 'Mural Pay Sandbox Environment'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
