import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SegmentService } from './segment.service';
import { NewSegmentDto } from './dto/newSegment.dto';
import {
  getSegmentsDoc,
  newSegmentDoc,
  deleteSegmentDoc,
} from '@/docs/contexts/general/segment';

@ApiTags('Segment')
@Controller('segment')
export class SegmentController {
  constructor(private readonly segmentService: SegmentService) {}

  @ApiOperation(getSegmentsDoc.operation)
  @ApiResponse(getSegmentsDoc.responses[200])
  @ApiResponse(getSegmentsDoc.responses[401])
  @Get()
  async getSegments() {
    return this.segmentService.getSegments();
  }

  @ApiOperation(newSegmentDoc.operation)
  @ApiResponse(newSegmentDoc.responses[201])
  @ApiResponse(newSegmentDoc.responses[400])
  @ApiResponse(newSegmentDoc.responses[401])
  @Post()
  async newSegment(@Body() req: NewSegmentDto) {
    return this.segmentService.newSegment(req);
  }

  @ApiOperation(deleteSegmentDoc.operation)
  @ApiResponse(deleteSegmentDoc.responses[200])
  @ApiResponse(deleteSegmentDoc.responses[401])
  @ApiResponse(deleteSegmentDoc.responses[404])
  @Delete(':id')
  async deleteSegment(@Param('id') id: number) {
    return this.segmentService.deleteSegment(id);
  }
}
