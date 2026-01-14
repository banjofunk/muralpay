const { DynamoDBClient, CreateTableCommand } = require('@aws-sdk/client-dynamodb');

const client = new DynamoDBClient({
    region: 'localhost',
    endpoint: 'http://localhost:8000',
    credentials: { accessKeyId: 'DEFAULT', secretAccessKey: 'DEFAULT' }
});

const TABLE_NAME = process.env.PAYMENTS_TABLE || 'frogstop-backend-payments-dev';

async function setup() {
    try {
        console.log(`Creating table ${TABLE_NAME}...`);
        await client.send(new CreateTableCommand({
            TableName: TABLE_NAME,
            AttributeDefinitions: [
                { AttributeName: 'paymentId', AttributeType: 'S' }
            ],
            KeySchema: [
                { AttributeName: 'paymentId', KeyType: 'HASH' }
            ],
            BillingMode: 'PAY_PER_REQUEST'
        }));
        console.log('Valid Table created successfully');
    } catch (error) {
        if (error.name === 'ResourceInUseException') {
            console.log('Table already exists');
        } else {
            console.error('Error creating table:', error);
        }
    }
}

setup();
