const crypto = require('crypto');
// const fetch = require('node-fetch'); // Native fetch in Node 18+

const MURAL_WEBHOOK_SECRET = process.env.MURAL_PAY_WEBHOOK_SECRET || 'test_secret';
const WEBHOOK_URL = 'http://localhost:3001/webhook/muralpay';
// const WEBHOOK_URL = 'https://krfvl0md2b.execute-api.us-east-1.amazonaws.com/webhook/muralpay';

// Use arguments or default
const paymentId = process.argv[2];

if (!paymentId) {
    console.error('Usage: node scripts/simulate-webhook.js <PAYMENT_ID>');
    process.exit(1);
}

const payload = {
    eventType: 'payment.status.updated',
    paymentId: paymentId,
    status: 'completed',
    blockchain: 'POLYGON',
    tokenSymbol: 'USDC',
    amount: '10.00',
    transactionHash: '0x' + crypto.randomBytes(32).toString('hex'),
    confirmations: 12,
    timestamp: new Date().toISOString()
};

const signature = crypto
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
    } catch (error) {
        console.error('Error sending webhook:', error);
    }
}

sendWebhook();
