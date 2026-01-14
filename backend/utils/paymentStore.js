const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

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

const client = new DynamoDBClient(clientConfig);
const docClient = DynamoDBDocumentClient.from(client);

class PaymentStore {
    /**
     * Save a new payment record
     * @param {Object} payment 
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
            await docClient.send(new PutCommand(params));
            console.log(`Payment saved to DynamoDB: ${payment.paymentId}`);
        } catch (error) {
            console.error('Error saving payment to DynamoDB:', error);
            throw error;
        }
    }

    /**
     * Get payment status and details
     * @param {string} paymentId 
     */
    static async getPayment(paymentId) {
        const params = {
            TableName: TABLE_NAME,
            Key: { paymentId }
        };

        try {
            const { Item } = await docClient.send(new GetCommand(params));
            return Item || null;
        } catch (error) {
            console.error('Error getting payment from DynamoDB:', error);
            throw error;
        }
    }

    /**
     * Update payment status (e.g. from webhook)
     * @param {string} paymentId 
     * @param {string} status 
     * @param {string} transactionHash 
     */
    static async updateStatus(paymentId, status, transactionHash, withdrawalStatus) {
        const params = {
            TableName: TABLE_NAME,
            Key: { paymentId },
            UpdateExpression: 'set #status = :status, transactionHash = :txHash, updatedAt = :updatedAt' + (withdrawalStatus ? ', withdrawalStatus = :ws' : ''),
            ConditionExpression: 'attribute_exists(paymentId)', // Prevent creating phantom records
            ExpressionAttributeNames: {
                '#status': 'status'
            },
            ExpressionAttributeValues: {
                ':status': status,
                ':txHash': transactionHash || null,
                ':updatedAt': new Date().toISOString(),
                ...(withdrawalStatus ? { ':ws': withdrawalStatus } : {})
            }
        };

        try {
            await docClient.send(new UpdateCommand(params));
            console.log(`Payment status updated: ${paymentId} -> ${status}`);
        } catch (error) {
            console.error('Error updating payment status:', error);
            throw error;
        }
    }

    /**
     * Scan all payments (for Merchant Dashboard)
     * Note: Scan is expensive in production, but acceptable for this PoC/Hackathon.
     */
    static async scanPayments() {
        // Import ScanCommand dynamically or add to top-level imports
        const { ScanCommand } = require('@aws-sdk/lib-dynamodb');

        const params = {
            TableName: TABLE_NAME
        };

        try {
            const { Items } = await docClient.send(new ScanCommand(params));
            // Sort by createdAt desc
            return (Items || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } catch (error) {
            console.error('Error scanning payments:', error);
            throw error;
        }
    }

    /**
     * Find a pending payment by amount (for matching deposits)
     * Returns the oldest pending payment with the matching amount.
     * @param {number} amount - Amount in USDC
     */
    static async findPendingPaymentByAmount(amount) {
        const { ScanCommand } = require('@aws-sdk/lib-dynamodb');

        // Scan for pending payments with matching amount
        // In production, this should be a GSI query
        const params = {
            TableName: TABLE_NAME,
            FilterExpression: '#status = :status AND amountUSDC = :amount',
            ExpressionAttributeNames: {
                '#status': 'status'
            },
            ExpressionAttributeValues: {
                ':status': 'pending',
                ':amount': amount // In DB, amountUSDC is stored as string/number depending on save, assuming it matches incoming type or string
            }
        };

        try {
            const { Items } = await docClient.send(new ScanCommand(params));
            if (!Items || Items.length === 0) return null;

            // Return the oldest one (FIFO)
            return Items.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))[0];
        } catch (error) {
            console.error('Error finding pending payment by amount:', error);
            throw error;
        }
    }
}

module.exports = { PaymentStore };
