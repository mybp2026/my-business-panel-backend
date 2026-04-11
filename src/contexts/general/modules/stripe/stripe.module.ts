import { Module, Provider, Global } from '@nestjs/common';
import Stripe from 'stripe';

const stripeProvider: Provider = {
    provide: 'STRIPE', 
    
    useFactory: () => {
        const apiKey = process.env.STRIPE_API_KEY; 

        if (!apiKey || apiKey.length < 50) {
            console.error("La clave API de Stripe no está cargada o es muy corta.");
            throw new Error('STRIPE API Key configuration error. Check .env file and main.ts loading.');
        }

        return new Stripe(apiKey, {
            apiVersion: "2025-11-17.clover" 
        });
    },
};


@Global()
@Module({
    controllers: [], 
    providers: [stripeProvider],
    exports: [stripeProvider], 
})
export class StripeModule {}