"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
// import fetch from 'node-fetch'; // Built-in fetch in Node 18+
const MURAL_WEBHOOK_SECRET = process.env.MURAL_PAY_WEBHOOK_SECRET || 'test_secret';
const WEBHOOK_URL = 'http://localhost:3001/webhook/muralpay';
// Use arguments or default
const paymentId = process.argv[2];
if (!paymentId) {
    console.error('Usage: ts-node scripts/simulate-webhook.ts <PAYMENT_ID>');
    process.exit(1);
}
const payload = {
    eventType: 'payment.status.updated',
    paymentId: paymentId,
    status: 'completed',
    blockchain: 'POLYGON',
    tokenSymbol: 'USDC',
    amount: '10.00',
    transactionHash: '0x' + crypto_1.default.randomBytes(32).toString('hex'),
    confirmations: 12,
    timestamp: new Date().toISOString()
};
const signature = crypto_1.default
    .createHmac('sha256', MURAL_WEBHOOK_SECRET)
    .update(JSON.stringify(payload))
    .digest('hex');
console.log(`Sending webhook for payment ${paymentId} to ${WEBHOOK_URL}...`);
async function sendWebhook() {
    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Mural-Signature': signature
            },
            body: JSON.stringify(payload)
        });
        console.log(`Status: ${response.status}`);
        const text = await response.text();
        console.log(`Response: ${text}`);
    }
    catch (error) {
        console.error('Error sending webhook:', error);
    }
}
sendWebhook();
//# sourceMappingURL=simulate-webhook.js.map