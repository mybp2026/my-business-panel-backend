import { Injectable, Logger } from '@nestjs/common';
import { Queue, JobsOptions, JobType } from 'bullmq';
import {
  IQueueService,
  IQueueConfig,
  IJobData,
  IJobOptions,
  IJobResult,
} from '../interfaces';

@Injectable()
export class BullMQAdapter implements IQueueService {
  private readonly logger = new Logger(BullMQAdapter.name);
  private readonly queues = new Map<string, Queue>();

  constructor(private readonly redisConnection: { host: string; port: number; password?: string }) {}

  registerQueue(config: IQueueConfig): void {
    if (this.queues.has(config.name)) {
      this.logger.warn(`Queue "${config.name}" already registered, skipping`);
      return;
    }

    const queue = new Queue(config.name, {
      connection: this.redisConnection,
      defaultJobOptions: this.mapJobOptions(config.defaultJobOptions),
    });

    this.queues.set(config.name, queue);
    this.logger.log(`Queue "${config.name}" registered`);
  }

  async addJob<T extends IJobData>(
    queueName: string,
    jobName: string,
    data: T,
    options?: IJobOptions,
  ): Promise<IJobResult<T>> {
    const queue = this.getQueue(queueName);
    const job = await queue.add(jobName, data, this.mapJobOptions(options));

    return {
      id: job.id!,
      name: job.name,
      data: job.data as T,
      status: await job.getState(),
    };
  }

  async addBulk<T extends IJobData>(
    queueName: string,
    jobs: { name: string; data: T; options?: IJobOptions }[],
  ): Promise<IJobResult<T>[]> {
    const queue = this.getQueue(queueName);

    const bulkJobs = jobs.map((j) => ({
      name: j.name,
      data: j.data,
      opts: this.mapJobOptions(j.options),
    }));

    const results = await queue.addBulk(bulkJobs);

    return results.map((job) => ({
      id: job.id!,
      name: job.name,
      data: job.data as T,
      status: 'waiting',
    }));
  }

  async getJobs(queueName: string, statuses: JobType[]): Promise<IJobResult[]> {
    const queue = this.getQueue(queueName);
    const jobs = await queue.getJobs(statuses);

    return jobs.map((job) => ({
      id: job.id!,
      name: job.name,
      data: job.data,
      status: 'unknown',
    }));
  }

  async removeJob(queueName: string, jobId: string): Promise<void> {
    const queue = this.getQueue(queueName);
    const job = await queue.getJob(jobId);
    if (job) await job.remove();
  }

  private getQueue(name: string): Queue {
    const queue = this.queues.get(name);
    if (!queue) {
      throw new Error(`Queue "${name}" not registered. Call registerQueue() first.`);
    }
    return queue;
  }

  private mapJobOptions(options?: IJobOptions): JobsOptions | undefined {
    if (!options) return undefined;
    return {
      delay: options.delay,
      priority: options.priority,
      attempts: options.attempts,
      removeOnComplete: options.removeOnComplete,
      removeOnFail: options.removeOnFail,
    };
  }
}
