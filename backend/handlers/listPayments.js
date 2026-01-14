const { PaymentStore } = require('../utils/paymentStore');

module.exports.handler = async (event) => {
    try {
        const payments = await PaymentStore.scanPayments();

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({
                success: true,
                count: payments.length,
                payments: payments
            })
        };
    } catch (error) {
        console.error('Error listing payments:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({
                error: 'Internal Server Error',
                message: 'Unable to list payments'
            })
        };
    }
};
