import React, { useEffect, useState } from 'react';
import { Loader2, RefreshCw, ExternalLink } from 'lucide-react';
import { PaymentStatus } from '../types';

interface Payment {
    paymentId: string;
    status: PaymentStatus;
    amountUSDC: number;
    transactionHash?: string;
    createdAt: string;
    withdrawalStatus?: 'pending' | 'processing' | 'completed' | 'failed';
}

const MerchantDashboard: React.FC = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
            const response = await fetch(`${apiBaseUrl}/payments`);
            const data = await response.json();
            if (data.success && data.payments) {
                // Filter out invalid payments (missing amount or date)
                const validPayments = data.payments.filter((p: Payment) => p.amountUSDC && p.createdAt);
                setPayments(validPayments);
            }
        } catch (error) {
            console.error('Error fetching payments:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'text-green-600 bg-green-100';
            case 'confirmed': return 'text-blue-600 bg-blue-100';
            case 'failed': return 'text-red-600 bg-red-100';
            default: return 'text-yellow-600 bg-yellow-100'; // pending
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Merchant Dashboard</h2>
                    <p className="text-slate-500">View recent transactions and settlements</p>
                </div>
                <button
                    onClick={fetchPayments}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-800">Date</th>
                                <th className="px-6 py-4 font-semibold text-slate-800">Payment ID</th>
                                <th className="px-6 py-4 font-semibold text-slate-800">Amount (USDC)</th>
                                <th className="px-6 py-4 font-semibold text-slate-800">Payment Status</th>
                                <th className="px-6 py-4 font-semibold text-slate-800">Withdrawal (COP)</th>
                                <th className="px-6 py-4 font-semibold text-slate-800">Tx Hash</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading && payments.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                        <Loader2 className="w-8 h-8 mx-auto animate-spin mb-2" />
                                        Loading transactions...
                                    </td>
                                </tr>
                            ) : payments.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                        No transactions found.
                                    </td>
                                </tr>
                            ) : (
                                payments.map((payment) => (
                                    <tr key={payment.paymentId} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {new Date(payment.createdAt).toLocaleDateString()}
                                            <span className="block text-xs text-slate-400">
                                                {new Date(payment.createdAt).toLocaleTimeString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs">{payment.paymentId}</td>
                                        <td className="px-6 py-4 font-medium">${Number(payment.amountUSDC).toFixed(2)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                                                {payment.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {payment.withdrawalStatus ? (
                                                <div className="flex items-center gap-1.5">
                                                    <span className={`w-2 h-2 rounded-full ${payment.withdrawalStatus === 'completed' ? 'bg-green-500' :
                                                        payment.withdrawalStatus === 'failed' ? 'bg-red-500' : 'bg-blue-500' // processing
                                                        }`} />
                                                    <span className="capitalize">{payment.withdrawalStatus}</span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {payment.transactionHash ? (
                                                <a
                                                    href={`https://amoy.polygonscan.com/tx/${payment.transactionHash}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline"
                                                >
                                                    <span className="font-mono text-xs">
                                                        {payment.transactionHash.substring(0, 6)}...{payment.transactionHash.substring(payment.transactionHash.length - 4)}
                                                    </span>
                                                    <ExternalLink className="w-3 h-3" />
                                                </a>
                                            ) : (
                                                <span className="text-slate-400 text-xs">Waiting...</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MerchantDashboard;
