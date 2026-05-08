import { IQueueConfig, IJobOptions } from '../interfaces';

const DEFAULT_JOB_OPTIONS: IJobOptions = {
  attempts: 3,
  removeOnComplete: 100,
  removeOnFail: 50,
};

const DEFAULT_LIMITER = {
  max: 12,
  duration: 60_000,
};

export class QueueConfigPrototype {
  private constructor(private readonly config: IQueueConfig) {}

  static create(): QueueConfigPrototype {
    return new QueueConfigPrototype({
      name: '',
      limiter: { ...DEFAULT_LIMITER },
      defaultJobOptions: { ...DEFAULT_JOB_OPTIONS },
    });
  }

  clone(overrides: Partial<IQueueConfig> & { name: string }): IQueueConfig {
    return {
      name: overrides.name,
      limiter: overrides.limiter ?? { ...this.config.limiter! },
      defaultJobOptions: {
        ...this.config.defaultJobOptions,
        ...overrides.defaultJobOptions,
      },
    };
  }
}
