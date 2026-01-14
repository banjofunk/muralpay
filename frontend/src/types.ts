export interface PaymentDetails {
    depositAddress: string;
    amountUSDC: string;
    blockchain: string;
    network?: string;
    paymentId: string;
    instructions?: {
        message?: string;
        network?: string;
        token?: string;
        address?: string;
        amount?: string;
        faucetUrl?: string;
        explorerUrl?: string;
    };
    isMock?: boolean;
    transactionHash?: string;
}

export type PaymentStatus = 'pending' | 'confirmed' | 'completed' | 'failed';
