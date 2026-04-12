import { Provider } from '@nestjs/common';
import { BullMQAdapter } from './adapters/bullmq.adapter';

export const QUEUE_SERVICE = 'QUEUE_SERVICE';

export const queueProvider: Provider = {
  provide: QUEUE_SERVICE,
  useFactory: () => {
    const host = process.env.REDIS_HOST || 'localhost';
    const port = Number(process.env.REDIS_PORT) || 6379;
    const password = process.env.REDIS_PASSWORD || undefined;

    return new BullMQAdapter({ host, port, password });
  },
};
