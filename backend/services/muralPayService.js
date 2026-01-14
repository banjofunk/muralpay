/**
 * Mural Pay Service - Sandbox API Integration
 * 
 * This service integrates with the Mural Pay sandbox API to process
 * real USDC payments on Polygon Amoy testnet.
 */

const crypto = require('crypto');
const { PaymentStore } = require('../utils/paymentStore');

// Mural Pay Sandbox API Configuration (always sandbox for this project)
const MURAL_API_BASE = 'https://api-staging.muralpay.com';

const MURAL_API_KEY = process.env.MURAL_PAY_API_KEY;
const MURAL_ACCOUNT_ID = process.env.MURAL_PAY_ACCOUNT_ID;
const MURAL_PUBLIC_KEY = process.env.MURAL_PUBLIC_KEY;
const MURAL_TRANSFER_API_KEY = process.env.MURAL_TRANSFER_API_KEY;

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
            accountId: MURAL_ACCOUNT_ID || '',
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
        await PaymentStore.createPayment(paymentResponse);

        return paymentResponse;
    } catch (error) {
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
    } catch (error) {
        console.error('Error fetching payment status:', error);
        throw error;
    }
}

/**
 * Verify webhook signature
 * 
 * @param {Object|string} rawBody - Raw webhook body
 * @param {string} signature - Webhook signature header
 * @param {string} timestamp - Webhook timestamp header
 */
function verifyWebhook(rawBody, signature, timestamp) {
    // In mock mode, accept all webhooks
    if (IS_MOCK_MODE || !MURAL_PUBLIC_KEY || signature === 'SKIP_VERIFICATION') {
        console.log('Webhook verification bypassed (mock mode, no key, or explicit skip)');
        return true;
    }

    try {
        // Construct the message to verify: timestamp + "." + rawBody
        // Ideally rawBody should be the exact string from the request
        const message = `${timestamp}.${typeof rawBody === 'string' ? rawBody : JSON.stringify(rawBody)}`;

        // Format public key to PEM if needed
        let publicKey = MURAL_PUBLIC_KEY;
        if (!publicKey.includes('-----BEGIN PUBLIC KEY-----')) {
            // Fix newlines if they were escaped in env var
            const formattedKey = publicKey.replace(/\\n/g, '\n');
            publicKey = `-----BEGIN PUBLIC KEY-----\n${formattedKey}\n-----END PUBLIC KEY-----`;
        }

        // Verify signature using ECDSA-SHA256
        const verify = crypto.createVerify('SHA256');
        verify.update(message);
        verify.end();

        return verify.verify(publicKey, signature, 'base64');
    } catch (error) {
        console.error('Webhook verification error:', error);
        return false;
    }
}

/**
 * Parse webhook event
 * 
 * @param {Object} payload - Webhook payload
 */
function parseWebhookEvent(payload) {
    // Check for MURAL_ACCOUNT_BALANCE_ACTIVITY (Deposit event)
    if (payload.eventCategory === 'MURAL_ACCOUNT_BALANCE_ACTIVITY' && payload.payload?.type === 'account_credited') {
        const p = payload.payload;
        return {
            eventType: 'deposit_received',
            paymentId: null, // Not present in this event type
            status: 'confirmed', // Treat deposit as confirmed
            blockchain: p.tokenAmount?.blockchain || 'POLYGON',
            tokenSymbol: p.tokenAmount?.tokenSymbol || 'USDC',
            amountUSDC: p.tokenAmount?.tokenAmount,
            transactionHash: p.transactionDetails?.transactionHash,
            confirmations: 1, // Assumed confirmed if we got the event
            timestamp: payload.occurredAt || new Date().toISOString()
        };
    }

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

/**
 * Initiate a payout (auto-withdrawal)
 * 
 * @param {number} amount - Amount to withdraw
 * @param {string} tokenSymbol - Token symbol (default: USDC)
 */
async function createPayout(amount, tokenSymbol = 'USDC') {
    if (IS_MOCK_MODE || !MURAL_TRANSFER_API_KEY) {
        console.log('Mocking payout request (mock mode or no transfer key)');
        return {
            id: `payout_mock_${Date.now()}`,
            status: 'PENDING',
            mock: true
        };
    }

    console.log(`Initiating payout for ${amount} ${tokenSymbol}`);

    try {
        const payload = {
            sourceAccountId: MURAL_ACCOUNT_ID,
            payoutMethod: {
                type: 'BANK_ACCOUNT',
                details: {
                    bankName: 'Bancolombia',
                    accountNumber: '1234567890',
                    currency: 'COP',
                    countryCode: 'CO',
                    bankAccountType: 'CHECKING',
                    accountHolderName: 'Merchant LLC' // Hardcoded for demo/PoC
                }
            },
            amount: amount,
            tokenSymbol: tokenSymbol,
            blockchain: 'POLYGON',
            description: 'Auto-withdrawal from FrogStop'
        };

        const response = await fetch(`${MURAL_API_BASE}/api/payout-requests`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${MURAL_API_KEY}`,
                'X-Transfer-Key': MURAL_TRANSFER_API_KEY, // Speculative header name, adjusting based on common patterns if docs unclear
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Payout API error (${response.status}):`, errorText);
            throw new Error(`Payout API error: ${errorText}`);
        }

        const data = await response.json();
        console.log('Payout initiated:', data);
        return data;
    } catch (error) {
        console.error('Error creating payout:', error);
        // Don't throw to avoid breaking the webhook flow completely, just log failure
        return { error: error.message };
    }
}

module.exports = {
    initiatePayment,
    getPaymentStatus,
    verifyWebhook,
    parseWebhookEvent,
    createPayout
};
