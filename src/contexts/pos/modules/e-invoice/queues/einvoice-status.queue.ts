import { QueueConfigPrototype } from '@/contexts/general/modules/queue/prototype/queue-config.prototype';

export const EINVOICE_STATUS_QUEUE = 'einvoice-status';

const prototype = QueueConfigPrototype.create();

export const einvoiceStatusQueueConfig = prototype.clone({
  name: EINVOICE_STATUS_QUEUE,
  limiter: {
    max: 12,
    duration: 60_000,
  },
  defaultJobOptions: {
    attempts: 1,
    removeOnComplete: 200,
    removeOnFail: 100,
  },
});
