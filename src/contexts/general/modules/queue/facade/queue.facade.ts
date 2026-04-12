import { Inject, Injectable } from '@nestjs/common';
import {
  IQueueService,
  IQueueConfig,
  IJobData,
  IJobOptions,
  IJobResult,
} from '../interfaces';
import { QUEUE_SERVICE } from '../queue.provider';

@Injectable()
export class QueueFacade {
  constructor(
    @Inject(QUEUE_SERVICE) private readonly queueService: IQueueService,
  ) {}

  registerQueue(config: IQueueConfig): void {
    this.queueService.registerQueue(config);
  }

  async enqueue<T extends IJobData>(
    queueName: string,
    jobName: string,
    data: T,
    options?: IJobOptions,
  ): Promise<IJobResult<T>> {
    return this.queueService.addJob(queueName, jobName, data, options);
  }

  async enqueueBulk<T extends IJobData>(
    queueName: string,
    jobs: { name: string; data: T; options?: IJobOptions }[],
  ): Promise<IJobResult<T>[]> {
    return this.queueService.addBulk(queueName, jobs);
  }

  async getActiveJobs(queueName: string): Promise<IJobResult[]> {
    return this.queueService.getJobs(queueName, [
      'waiting',
      'delayed',
      'active',
    ]);
  }

  async removeJob(queueName: string, jobId: string): Promise<void> {
    return this.queueService.removeJob(queueName, jobId);
  }
}
