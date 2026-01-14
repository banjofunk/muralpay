"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const client = new client_dynamodb_1.DynamoDBClient({
    region: 'localhost',
    endpoint: 'http://localhost:8000',
    credentials: { accessKeyId: 'DEFAULT', secretAccessKey: 'DEFAULT' }
});
const TABLE_NAME = process.env.PAYMENTS_TABLE || 'frogstop-backend-payments-dev';
async function setup() {
    try {
        console.log(`Creating table ${TABLE_NAME}...`);
        await client.send(new client_dynamodb_1.CreateTableCommand({
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
    }
    catch (error) {
        if (error.name === 'ResourceInUseException') {
            console.log('Table already exists');
        }
        else {
            console.error('Error creating table:', error);
        }
    }
}
setup();
//# sourceMappingURL=setup-local-db.js.map