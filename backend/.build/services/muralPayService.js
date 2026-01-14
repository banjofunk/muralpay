"use strict";
/**
 * Mural Pay Service - Sandbox API Integration
 *
 * This service integrates with the Mural Pay sandbox API to process
 * real USDC payments on Polygon Amoy testnet.
 *
 * API Documentation: https://developers.muralpay.com/
 * Sandbox API: https://api-staging.muralpay.com
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.initiatePayment = initiatePayment;
exports.getPaymentStatus = getPaymentStatus;
exports.verifyWebhook = verifyWebhook;
exports.parseWebhookEvent = parseWebhookEvent;
const crypto = __importStar(require("crypto"));
const paymentStore_1 = require("../utils/paymentStore");
// Mural Pay Sandbox API Configuration (always sandbox for this project)
const MURAL_API_BASE = 'https://api-staging.muralpay.com';
const MURAL_API_KEY = process.env.MURAL_PAY_API_KEY;
console.log('MURAL_API_KEY', MURAL_API_KEY);
const MURAL_ACCOUNT_ID = process.env.MURAL_PAY_ACCOUNT_ID;
const MURAL_WEBHOOK_SECRET = process.env.MURAL_PAY_WEBHOOK_SECRET;
// Check if we're in mock mode (no API key provided)
const IS_MOCK_MODE = !MURAL_API_KEY || MURAL_API_KEY.trim() === '';
/**
 * Generate a mock Polygon wallet address (for fallback)
 */
function generateMockWalletAddress() {
    const randomHex = crypto.randomBytes(20).toString('hex');
    return `0x${randomHex}`;
}
/**
 * Generate a mock payment ID (for fallback)
 */
function generatePaymentId() {
    const timestamp = Date.now();
    const random = crypto.randomBytes(4).toString('hex');
    return `pay_${process.env.MURAL_PAY_ENV || 'sandbox'}_${timestamp}_${random}`;
}
/**
 * Generate mock payment data (fallback when API is unavailable)
 */
function generateMockPayment(amount, currency) {
    const paymentId = generatePaymentId();
    const walletAddress = generateMockWalletAddress();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    return {
        success: true,
        paymentId,
        accountId: MURAL_ACCOUNT_ID || 'acc_sandbox_mock',
        depositAddress: walletAddress,
        blockchain: 'POLYGON',
        network: 'Amoy Testnet',
        tokenSymbol: 'USDC',
        amountUSD: amount,
        amountUSDC: amount.toFixed(2),
        currency,
        status: 'pending',
        expiresAt,
        createdAt: new Date().toISOString(),
        isMock: true, // Flag to indicate this is mock data
        instructions: {
            message: 'Send USDC on Polygon Amoy network to the deposit address below',
            network: 'Polygon Amoy Testnet',
            token: 'USDC',
            address: walletAddress,
            amount: amount.toFixed(2),
            faucetUrl: 'https://faucet.circle.com/',
            explorerUrl: `https://amoy.polygonscan.com/address/${walletAddress}`
        }
    };
}
/**
 * Initiate a payment request
 *
 * @param {number} amount - Payment amount in USD
 * @param {string} currency - Currency code (default: 'USD')
 * @returns {Promise<PaymentResponse>} Payment details including deposit address
 */
async function initiatePayment(amount, currency = 'USD') {
    // If in mock mode, return mocked data
    if (IS_MOCK_MODE) {
        console.log('Running in MOCK mode - using simulated payment data');
        return generateMockPayment(amount, currency);
    }
    console.log(`Initiating real Mural Pay payment for ${amount} ${currency}`);
    try {
        // Call real Mural Pay API to get account details including wallet address
        const response = await fetch(`${MURAL_API_BASE}/api/accounts/${MURAL_ACCOUNT_ID}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${MURAL_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('Response received:', JSON.stringify(response, null, 2));
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Mural Pay API error (${response.status}): ${errorText}`);
        }
        const accountData = await response.json();
        console.log('Account data received:', JSON.stringify(accountData, null, 2));
        // Extract wallet details from accountDetails
        // Structure: accountData.accountDetails.walletDetails = { walletAddress: '...', blockchain: 'POLYGON' }
        const walletDetails = accountData.accountDetails?.walletDetails;
        if (!walletDetails || walletDetails.blockchain !== 'POLYGON') {
            console.error('Invalid wallet details:', JSON.stringify(walletDetails));
            throw new Error('No Polygon wallet found in account details');
        }
        const polygonWallet = walletDetails;
        // Generate unique payment ID for tracking
        const paymentId = generatePaymentId();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
        const paymentResponse = {
            success: true,
            paymentId,
            accountId: MURAL_ACCOUNT_ID || '', // Fallback for strict null checks if env var missing at runtime
            depositAddress: polygonWallet.walletAddress,
            blockchain: 'POLYGON',
            network: 'Amoy Testnet',
            tokenSymbol: 'USDC',
            amountUSD: amount,
            amountUSDC: amount.toFixed(2), // 1:1 for USDC
            currency,
            status: 'pending',
            expiresAt,
            createdAt: new Date().toISOString(),
            instructions: {
                message: 'Send USDC on Polygon Amoy network to the deposit address below',
                network: 'Polygon Amoy Testnet',
                token: 'USDC',
                address: polygonWallet.walletAddress,
                amount: amount.toFixed(2),
                faucetUrl: 'https://faucet.circle.com/',
                explorerUrl: `https://amoy.polygonscan.com/address/${polygonWallet.walletAddress}`
            }
        };
        // Save to DynamoDB
        await paymentStore_1.PaymentStore.createPayment(paymentResponse);
        return paymentResponse;
    }
    catch (error) {
        console.error('Error calling Mural Pay API:', error);
        // Fallback to mock data if API call fails
        console.log('Falling back to mock payment data');
        return generateMockPayment(amount, currency);
    }
}
/**
 * Get payment status
 *
 * @param {string} paymentId - Payment ID to check
 * @returns {Promise<PaymentStatus>} Payment status
 */
async function getPaymentStatus(paymentId) {
    // In mock mode or if API key not configured, return pending
    if (IS_MOCK_MODE) {
        return {
            paymentId,
            status: 'pending',
            blockchain: 'POLYGON',
            tokenSymbol: 'USDC',
            confirmations: 0,
            requiredConfirmations: 12,
            updatedAt: new Date().toISOString()
        };
    }
    try {
        // In a real implementation, you would query the Mural Pay API
        // for the payment status. For now, we'll return pending.
        // The actual status will be updated via webhook.
        return {
            paymentId,
            status: 'pending',
            blockchain: 'POLYGON',
            tokenSymbol: 'USDC',
            confirmations: 0,
            requiredConfirmations: 12,
            updatedAt: new Date().toISOString()
        };
    }
    catch (error) {
        console.error('Error fetching payment status:', error);
        throw error;
    }
}
/**
 * Verify webhook signature
 *
 * @param {Object} payload - Webhook payload
 * @param {string} signature - Webhook signature header
 * @returns {boolean} Whether signature is valid
 */
function verifyWebhook(payload, signature) {
    // In mock mode, accept all webhooks
    if (IS_MOCK_MODE || !MURAL_WEBHOOK_SECRET) {
        console.log('Webhook verification bypassed (mock mode or no secret configured)');
        return true;
    }
    try {
        // Real webhook verification using HMAC-SHA256
        const hmac = crypto.createHmac('sha256', MURAL_WEBHOOK_SECRET);
        const expectedSignature = hmac.update(JSON.stringify(payload)).digest('hex');
        // Use timing-safe comparison
        return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
    }
    catch (error) {
        console.error('Webhook verification error:', error);
        return false;
    }
}
/**
 * Parse webhook event
 *
 * @param {Object} payload - Webhook payload
 * @returns {Object} Parsed event data
 */
function parseWebhookEvent(payload) {
    return {
        eventType: payload.eventType || payload.type || 'payment.status.updated',
        paymentId: payload.paymentId || payload.id,
        status: payload.status,
        blockchain: payload.blockchain || 'POLYGON',
        tokenSymbol: payload.tokenSymbol || 'USDC',
        amountUSDC: payload.amount || payload.amountUSDC,
        transactionHash: payload.transactionHash || payload.txHash,
        confirmations: payload.confirmations || 0,
        timestamp: payload.timestamp || new Date().toISOString()
    };
}
//# sourceMappingURL=muralPayService.js.map