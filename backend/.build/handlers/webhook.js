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
const paymentStore_1 = require("../utils/paymentStore");
/**
 * Handle payment pending status
 */
async function handlePaymentPending(eventData) {
    console.log('Payment pending:', eventData.paymentId);
    await paymentStore_1.PaymentStore.updateStatus(eventData.paymentId, 'pending', eventData.transactionHash);
}
/**
 * Handle payment confirmed status
 */
async function handlePaymentConfirmed(eventData) {
    console.log('Payment confirmed:', eventData.paymentId);
    await paymentStore_1.PaymentStore.updateStatus(eventData.paymentId, 'confirmed', eventData.transactionHash);
}
/**
 * Handle payment completed status
 */
async function handlePaymentCompleted(eventData) {
    console.log('Payment completed:', eventData.paymentId);
    await paymentStore_1.PaymentStore.updateStatus(eventData.paymentId, 'completed', eventData.transactionHash);
}
/**
 * Handle payment failed status
 */
async function handlePaymentFailed(eventData) {
    console.log('Payment failed:', eventData.paymentId);
    await paymentStore_1.PaymentStore.updateStatus(eventData.paymentId, 'failed', eventData.transactionHash);
}
/**
 * Lambda handler for Mural Pay webhook endpoint
 * Receives payment status updates from Mural Pay
 *
 * Events handled:
 * - payment.pending - Payment initiated, waiting for USDC transfer
 * - payment.confirmed - USDC received, waiting for confirmations
 * - payment.completed - Payment fully confirmed and processed
 * - payment.failed - Payment failed or expired
 */
const handler = async (event) => {
    console.log('Webhook received:', event);
    // Parse the request body
    let payload;
    try {
        payload = JSON.parse(event.body || '{}');
    }
    catch (error) {
        console.error('Invalid webhook payload:', error);
        return {
            statusCode: 400,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                error: 'Invalid payload',
                message: 'Webhook payload must be valid JSON'
            })
        };
    }
    // Verify webhook signature (mocked in sandbox)
    const signature = event.headers['x-mural-signature'] || event.headers['X-Mural-Signature'];
    if (!signature && !process.env.IS_MOCK_MODE) { // Allow missing signature if explicitly mocking? Logic in service handles this, but good to check presence if strict.
        // Service handles fallback if mock mode, but if not mock mode and signature is missing, service.verifyWebhook might fail or return false.
        // Let's pass undefined if missing, service handles it.
    }
    const isValid = muralPayService.verifyWebhook(payload, signature || '');
    if (!isValid) {
        console.error('Invalid webhook signature');
        return {
            statusCode: 401,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                error: 'Unauthorized',
                message: 'Invalid webhook signature'
            })
        };
    }
    // Parse webhook event
    const eventData = muralPayService.parseWebhookEvent(payload);
    console.log('Webhook event parsed:', {
        eventType: eventData.eventType,
        paymentId: eventData.paymentId,
        status: eventData.status
    });
    // Handle different payment statuses
    try {
        switch (eventData.status) {
            case 'pending':
                await handlePaymentPending(eventData);
                break;
            case 'confirmed':
                await handlePaymentConfirmed(eventData);
                break;
            case 'completed':
                await handlePaymentCompleted(eventData);
                break;
            case 'failed':
                await handlePaymentFailed(eventData);
                break;
            default:
                console.log('Unknown payment status:', eventData.status);
        }
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                success: true,
                message: 'Webhook processed successfully'
            })
        };
    }
    catch (error) {
        console.error('Error processing webhook:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                error: 'Processing failed',
                message: 'Unable to process webhook event'
            })
        };
    }
};
exports.handler = handler;
//# sourceMappingURL=webhook.js.map