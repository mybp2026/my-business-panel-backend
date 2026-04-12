import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RegionService } from './region.service';
import { getAllRegionsDoc } from '@/docs/contexts/general/region';

@ApiTags('Region')
@Controller('region')
export class RegionController {
  constructor(private readonly regionService: RegionService) {}

  @ApiOperation(getAllRegionsDoc.operation)
  @ApiResponse(getAllRegionsDoc.responses[200])
  @ApiResponse(getAllRegionsDoc.responses[401])
  @Get()
  async getAllRegions() {
    return this.regionService.getAllRegions();
  }
}
