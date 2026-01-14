const muralPayService = require('../services/muralPayService');

/**
 * Lambda handler for checkout endpoint
 * Integrates with Mural Pay to initiate USDC payments on Polygon
 * 
 * Process:
 * 1. Validate cart items and total amount
 * 2. Initiate payment through Mural Pay service
 * 3. Return deposit address and payment details to frontend
 */
module.exports.handler = async (event) => {
    console.log('Checkout request received:', event);

    // Parse the request body
    let body;
    try {
        body = JSON.parse(event.body || '{}');
    } catch (error) {
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
    } catch (error) {
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
