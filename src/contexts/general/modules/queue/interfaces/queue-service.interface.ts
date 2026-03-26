export interface IJobOptions {
  delay?: number;
  priority?: number;
  attempts?: number;
  removeOnComplete?: boolean | number;
  removeOnFail?: boolean | number;
}

export interface IJobData {
  [key: string]: any;
}

export interface IJobResult<T = any> {
  id: string;
  name: string;
  data: T;
  status: string;
}

export interface IQueueConfig {
  name: string;
  limiter?: {
    max: number;
    duration: number;
  };
  defaultJobOptions?: IJobOptions;
}

export interface IQueueService {
  addJob<T extends IJobData>(
    queueName: string,
    jobName: string,
    data: T,
    options?: IJobOptions,
  ): Promise<IJobResult<T>>;

  addBulk<T extends IJobData>(
    queueName: string,
    jobs: { name: string; data: T; options?: IJobOptions }[],
  ): Promise<IJobResult<T>[]>;

  getJobs(
    queueName: string,
    statuses: string[],
  ): Promise<IJobResult[]>;

  removeJob(queueName: string, jobId: string): Promise<void>;

  registerQueue(config: IQueueConfig): void;
}
