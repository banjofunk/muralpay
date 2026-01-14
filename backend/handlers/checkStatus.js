const { PaymentStore } = require('../utils/paymentStore');

module.exports.handler = async (event) => {
    const paymentId = event.pathParameters?.id;

    if (!paymentId) {
        return {
            statusCode: 400,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: 'Missing payment ID' }),
        };
    }

    try {
        const payment = await PaymentStore.getPayment(paymentId);

        if (!payment) {
            return {
                statusCode: 404,
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ error: 'Payment not found' }),
            };
        }

        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({
                success: true,
                paymentId: payment.paymentId,
                status: payment.status,
                transactionHash: payment.transactionHash,
                amountUSDC: payment.amountUSDC,
                createdAt: payment.createdAt,
                updatedAt: payment.updatedAt,
                withdrawalStatus: payment.withdrawalStatus // Include withdrawal status
            }),
        };
    } catch (error) {
        console.error('Error fetching payment status:', error);
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    }
};
