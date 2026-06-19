import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BullMQAdapter } from './adapters/bullmq.adapter';

export const QUEUE_SERVICE = 'QUEUE_SERVICE';

export const queueProvider: Provider = {
  provide: QUEUE_SERVICE,
  useFactory: (configService: ConfigService) => {
    const host = configService.get<string>('REDIS_HOST') || 'localhost';
    const port = configService.get<number>('REDIS_PORT') || 6379;
    const password = configService.get<string>('REDIS_PASSWORD');

    // For external providers like Upstash/RedisCloud, TLS is often required.
    // We can add a simple check or an env var REDIS_TLS=true
    const tls =
      configService.get<string>('REDIS_TLS') === 'true' ? {} : undefined;

    return new BullMQAdapter({ host, port, password, tls });
  },
  inject: [ConfigService],
};
