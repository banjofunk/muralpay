"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const paymentStore_1 = require("../utils/paymentStore");
const handler = async (event) => {
    const paymentId = event.pathParameters?.id;
    if (!paymentId) {
        return {
            statusCode: 400,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: 'Missing payment ID' }),
        };
    }
    try {
        const payment = await paymentStore_1.PaymentStore.getPayment(paymentId);
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
                updatedAt: payment.updatedAt
            }),
        };
    }
    catch (error) {
        console.error('Error fetching payment status:', error);
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    }
};
exports.handler = handler;
//# sourceMappingURL=checkStatus.js.map