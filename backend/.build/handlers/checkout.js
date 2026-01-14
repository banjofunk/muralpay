"use strict";
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
exports.handler = void 0;
const muralPayService = __importStar(require("../services/muralPayService"));
/**
 * Lambda handler for checkout endpoint
 * Integrates with Mural Pay to initiate USDC payments on Polygon
 *
 * Process:
 * 1. Validate cart items and total amount
 * 2. Initiate payment through Mural Pay service
 * 3. Return deposit address and payment details to frontend
 */
const handler = async (event) => {
    console.log('Checkout request received:', event);
    // Parse the request body
    let body;
    try {
        body = JSON.parse(event.body || '{}');
    }
    catch (error) {
        return {
            statusCode: 400,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({
                error: 'Invalid request body',
                message: 'Request body must be valid JSON'
            })
        };
    }
    const { amount, currency = 'USD', items } = body;
    // Validate required fields
    if (!amount || amount <= 0) {
        return {
            statusCode: 400,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({
                error: 'Invalid amount',
                message: 'Amount must be a positive number'
            })
        };
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
        return {
            statusCode: 400,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({
                error: 'Invalid items',
                message: 'Items must be a non-empty array'
            })
        };
    }
    console.log(`Processing checkout for amount: $${amount}`);
    console.log(`Cart items:`, items);
    try {
        // Initiate payment through Mural Pay service
        const paymentDetails = await muralPayService.initiatePayment(amount, currency);
        console.log('Payment initiated successfully:', paymentDetails.paymentId);
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({
                success: true,
                payment: {
                    paymentId: paymentDetails.paymentId,
                    depositAddress: paymentDetails.depositAddress,
                    blockchain: paymentDetails.blockchain,
                    tokenSymbol: paymentDetails.tokenSymbol,
                    amountUSD: paymentDetails.amountUSD,
                    amountUSDC: paymentDetails.amountUSDC,
                    expiresAt: paymentDetails.expiresAt,
                    instructions: paymentDetails.instructions
                },
                order: {
                    amount,
                    currency,
                    items
                }
            })
        };
    }
    catch (error) {
        console.error('Error initiating payment:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({
                error: 'Payment initiation failed',
                message: 'Unable to initiate payment. Please try again.'
            })
        };
    }
};
exports.handler = handler;
//# sourceMappingURL=checkout.js.map