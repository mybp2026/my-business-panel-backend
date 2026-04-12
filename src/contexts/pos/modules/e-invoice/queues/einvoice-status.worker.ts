import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Worker, Job } from 'bullmq';
import { EINVOICE_STATUS_QUEUE } from './einvoice-status.queue';
import { EInvoiceStatusProcessor } from './einvoice-status.processor';
import { IEInvoiceJobData } from '../interface';

@Injectable()
export class EInvoiceStatusWorker implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EInvoiceStatusWorker.name);
  private worker: Worker | null = null;

  constructor(private readonly processor: EInvoiceStatusProcessor) {}

  onModuleInit() {
    const connection = {
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
    };

    this.worker = new Worker(
      EINVOICE_STATUS_QUEUE,
      async (job: Job<IEInvoiceJobData>) => {
        this.logger.debug(`Processing job ${job.id}: ${job.data.keyNumber}`);
        await this.processor.processJob(job.data);
      },
      {
        connection,
        concurrency: 1,
      },
    );

    this.worker.on('completed', (job) => {
      this.logger.debug(`Job ${job.id} completed`);
    });

    this.worker.on('failed', (job, err) => {
      this.logger.error(`Job ${job?.id} failed: ${err.message}`);
    });

    this.logger.log(`Worker listening on queue "${EINVOICE_STATUS_QUEUE}"`);
  }

  async onModuleDestroy() {
    if (this.worker) {
      await this.worker.close();
      this.logger.log('Worker closed');
    }
  }
}
