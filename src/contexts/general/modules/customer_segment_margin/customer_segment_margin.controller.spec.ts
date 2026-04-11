import { Test, TestingModule } from '@nestjs/testing';
import { CustomerSegmentTypeController } from './customer_segment_margin.controller';

describe('CustomerSegmentTypeController', () => {
  let controller: CustomerSegmentTypeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerSegmentTypeController],
    }).compile();

    controller = module.get<CustomerSegmentTypeController>(
      CustomerSegmentTypeController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
