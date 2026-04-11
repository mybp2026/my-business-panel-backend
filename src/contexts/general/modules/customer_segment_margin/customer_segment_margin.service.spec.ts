import { Test, TestingModule } from '@nestjs/testing';
import { CustomerSegmentMarginService } from './customer_segment_margin.service';

describe('CustomerSegmentMarginService', () => {
  let service: CustomerSegmentMarginService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CustomerSegmentMarginService],
    }).compile();

    service = module.get<CustomerSegmentMarginService>(
      CustomerSegmentMarginService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
