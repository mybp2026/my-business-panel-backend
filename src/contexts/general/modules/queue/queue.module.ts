import { Global, Module } from '@nestjs/common';
import { queueProvider } from './queue.provider';
import { QueueFacade } from './facade/queue.facade';
import { QueueConfigPrototype } from './prototype/queue-config.prototype';

const queuePrototypeProvider = {
  provide: QueueConfigPrototype,
  useFactory: () => QueueConfigPrototype.create(),
};

@Global()
@Module({
  providers: [queueProvider, QueueFacade, queuePrototypeProvider],
  exports: [queueProvider, QueueFacade, QueueConfigPrototype],
})
export class QueueModule {}
