const crypto = require('crypto');

// User provided Public Key
const MURAL_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEFr3KCQ4VY0OueX1Ow18ybB7F+trZ
uy6lhqwytx9F06daB6QEkP8YDJylVZ3UYs9ZbKspYIa0i91x+klkZ+DlOQ==
-----END PUBLIC KEY-----`;

// User provided Headers
const timestamp = '2026-01-14T13:13:00.883Z';
const signature = 'MEUCIBOFfcRpcin4REFVniQhOACYN+YtSlBZ2DthBD6ebdZ1AiEAxqA+/Xx+DICzuBJ/lR6cA7OPN9fMxpUyk2SrcIx9iP8=';

// User provided Body (stringified JSON)
const rawBody = '{"eventId":"c46be380-4d72-4e10-a272-1cd25151928f","deliveryId":"4dd4ac63-4484-4dee-9754-c471de0bd7d3","attemptNumber":0,"eventCategory":"MURAL_ACCOUNT_BALANCE_ACTIVITY","occurredAt":"2026-01-14T13:12:55.364Z","payload":{"type":"account_credited","accountId":"510d049c-4197-4f94-bef9-91666a9590f4","tokenAmount":{"blockchain":"POLYGON","tokenAmount":1,"tokenSymbol":"USDC","tokenContractAddress":"0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582"},"transactionId":"0x880186463a0b80186fcb39a4695262b99b7b8e4b2fd8cba21a326d66f485797d:log:0","organizationId":"d85af831-a3fb-4672-9e1c-b3ce1a6a0194","transactionDetails":{"blockchain":"POLYGON","transactionDate":"2026-01-14T13:12:44.000Z","transactionHash":"0x880186463a0b80186fcb39a4695262b99b7b8e4b2fd8cba21a326d66f485797d","sourceWalletAddress":"0x1fcb25fb286d9fa084c09988b64b40571446cde7","destinationWalletAddress":"0xaf7a31623017b5c82b653b2c286d12f006ec8db6"},"accountWalletAddress":"0xAf7a31623017b5c82B653b2c286D12f006EC8DB6"}}';

function verifyWebhook(rawBody, signature, timestamp) {
    console.log('Verifying signature...');
    console.log('Timestamp:', timestamp);
    console.log('Signature:', signature);

    try {
        // Construct the message to verify: timestamp + "." + rawBody
        const message = `${timestamp}.${rawBody}`;

        // Verify signature using ECDSA-SHA256
        const verify = crypto.createVerify('SHA256');
        verify.update(message);
        verify.end();

        const isValid = verify.verify(MURAL_PUBLIC_KEY, signature, 'base64');
        console.log('Is Valid:', isValid);
        return isValid;
    } catch (error) {
        console.error('Webhook verification error:', error);
        return false;
    }
}

verifyWebhook(rawBody, signature, timestamp);
