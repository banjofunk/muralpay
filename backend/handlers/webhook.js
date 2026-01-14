const muralPayService = require('../services/muralPayService');
const { PaymentStore } = require('../utils/paymentStore');

/**
 * Handle payment pending status
 */
async function handlePaymentPending(eventData) {
    console.log('Payment pending:', eventData.paymentId);
    await PaymentStore.updateStatus(eventData.paymentId, 'pending', eventData.transactionHash);
}

/**
 * Handle payment confirmed status
 */
async function handlePaymentConfirmed(eventData) {
    console.log('Payment confirmed:', eventData.paymentId);

    // Auto-withdrawal logic
    console.log('Triggering auto-withdrawal...');
    const payout = await muralPayService.createPayout(eventData.amountUSDC || 0, eventData.tokenSymbol);

    const withdrawalStatus = payout.error ? 'failed' : 'processing';
    console.log(`Withdrawal status: ${withdrawalStatus}`);

    await PaymentStore.updateStatus(eventData.paymentId, eventData.status, eventData.transactionHash, withdrawalStatus);
}

/**
 * Handle payment completed status
 */
async function handlePaymentCompleted(eventData) {
    console.log('Payment completed:', eventData.paymentId);
    await PaymentStore.updateStatus(eventData.paymentId, 'completed', eventData.transactionHash);
}

/**
 * Handle payment failed status
 */
async function handlePaymentFailed(eventData) {
    console.log('Payment failed:', eventData.paymentId);
    await PaymentStore.updateStatus(eventData.paymentId, 'failed', eventData.transactionHash);
}

/**
 * Lambda handler for Mural Pay webhook endpoint
 * Receives payment status updates from Mural Pay
 */
module.exports.handler = async (event) => {
    console.log('Webhook received:', event);

    // Parse the request body
    let payload;
    try {
        payload = JSON.parse(event.body || '{}');
    } catch (error) {
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
    const signature = event.headers['x-mural-webhook-signature'] || event.headers['X-Mural-Webhook-Signature'];
    const timestamp = event.headers['x-mural-webhook-timestamp'] || event.headers['X-Mural-Webhook-Timestamp'];

    // We need to pass the raw body for signature verification
    const isValid = muralPayService.verifyWebhook(event.body || '{}', signature || '', timestamp || '');

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

    // If paymentId is missing but we have an amount (Deposit event), try to match it
    if (!eventData.paymentId && eventData.amountUSDC) {
        console.log(`Payment ID missing. Attempting to match pending payment for amount: ${eventData.amountUSDC}`);

        try {
            // Ensure amount is handled correctly (string/number)
            const amount = typeof eventData.amountUSDC === 'string' ? parseFloat(eventData.amountUSDC) : eventData.amountUSDC;

            // Allow matching strictly on string or number logic depending on how it's stored
            // Since PaymentStore usually stores specific types, we might need to be careful.
            // For now, let's pass it as is or formatted string if needed.
            // Assuming PaymentStore stores amountUSDC as string (since DynamoDB numbers are often strings in some SDKs, or just number)
            // But let's verify PaymentStore saves it as string: "amountUSDC: amount.toFixed(2)" -> string.
            const amountStr = amount.toFixed(2);

            const matchedPayment = await PaymentStore.findPendingPaymentByAmount(amountStr);

            if (matchedPayment) {
                console.log(`Matched payment found: ${matchedPayment.paymentId}`);
                eventData.paymentId = matchedPayment.paymentId;
                eventData.status = 'completed'; // Set to completed to trigger final success state
            } else {
                console.warn(`No pending payment found for amount: ${amountStr}`);
                // Return 200 to acknowledge webhook receiving, even if unmatched
                return {
                    statusCode: 200,
                    body: JSON.stringify({ success: true, message: 'Deposit received but no matching payment found' })
                };
            }
        } catch (err) {
            console.error('Error matching payment:', err);
        }
    }

    // Handle different payment statuses
    try {
        switch (eventData.status) {
            case 'pending':
                await handlePaymentPending(eventData);
                break;

            case 'confirmed':
            case 'completed': // Treat completed same as confirmed for payout logic
                await handlePaymentConfirmed(eventData);
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
    } catch (error) {
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
