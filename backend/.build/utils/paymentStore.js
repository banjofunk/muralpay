"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentStore = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const TABLE_NAME = process.env.PAYMENTS_TABLE || 'frogstop-backend-payments-dev';
const IS_OFFLINE = process.env.IS_OFFLINE;
// Configure DynamoDB Client
// When offline, point to local DynamoDB container
const clientConfig = IS_OFFLINE
    ? {
        region: 'localhost',
        endpoint: 'http://localhost:8000',
        credentials: { accessKeyId: 'DEFAULT', secretAccessKey: 'DEFAULT' }
    }
    : { region: process.env.AWS_REGION || 'us-east-1' };
const client = new client_dynamodb_1.DynamoDBClient(clientConfig);
const docClient = lib_dynamodb_1.DynamoDBDocumentClient.from(client);
class PaymentStore {
    /**
     * Save a new payment record
     */
    static async createPayment(payment) {
        const params = {
            TableName: TABLE_NAME,
            Item: {
                paymentId: payment.paymentId,
                accountId: payment.accountId,
                status: 'pending', // Initial status
                amountUSDC: payment.amountUSDC,
                depositAddress: payment.depositAddress,
                createdAt: new Date().toISOString(),
                expiresAt: payment.expiresAt,
                details: payment
            }
        };
        try {
            await docClient.send(new lib_dynamodb_1.PutCommand(params));
            console.log(`Payment saved to DynamoDB: ${payment.paymentId}`);
        }
        catch (error) {
            console.error('Error saving payment to DynamoDB:', error);
            throw error;
        }
    }
    /**
     * Get payment status and details
     */
    static async getPayment(paymentId) {
        const params = {
            TableName: TABLE_NAME,
            Key: { paymentId }
        };
        try {
            const { Item } = await docClient.send(new lib_dynamodb_1.GetCommand(params));
            return Item || null;
        }
        catch (error) {
            console.error('Error getting payment from DynamoDB:', error);
            throw error;
        }
    }
    /**
     * Update payment status (e.g. from webhook)
     */
    static async updateStatus(paymentId, status, transactionHash) {
        const params = {
            TableName: TABLE_NAME,
            Key: { paymentId },
            UpdateExpression: 'set #status = :status, transactionHash = :txHash, updatedAt = :updatedAt',
            ExpressionAttributeNames: {
                '#status': 'status'
            },
            ExpressionAttributeValues: {
                ':status': status,
                ':txHash': transactionHash || null,
                ':updatedAt': new Date().toISOString()
            }
        };
        try {
            await docClient.send(new lib_dynamodb_1.UpdateCommand(params));
            console.log(`Payment status updated: ${paymentId} -> ${status}`);
        }
        catch (error) {
            console.error('Error updating payment status:', error);
            throw error;
        }
    }
}
exports.PaymentStore = PaymentStore;
//# sourceMappingURL=paymentStore.js.map