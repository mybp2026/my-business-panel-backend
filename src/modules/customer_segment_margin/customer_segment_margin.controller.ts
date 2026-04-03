import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CustomerSegmentMarginService } from './customer_segment_margin.service';
import { NewMarginDto } from './dto/newMargin.dto';
import { Response } from 'express';
import { UpdateMarginDto } from './dto/updateMargin.dto';
import { RoleAuthorizationGuard } from '@/common/guards/role_authorization.guard';
import { LevelAuthorizationGuard } from '@/common/guards/level_authorization.guard';
import {
  getMarginsInfoDoc,
  getMarginsByTenantDoc,
  createNewMarginDoc,
  updateMarginDoc,
  deleteMarginDoc,
} from '@/docs/contexts/general/customer_segment_margin';

// ? UseGuards(AuthorizationGuard)
//Lets try to think about a better name for the route
@ApiTags('Customer Segment Margin')
@Controller('margin')
export class CustomerSegmentMarginController {
  constructor(private readonly csegmentService: CustomerSegmentMarginService) {}

  //Tomorrow ill optimize this endpoint
  @ApiOperation(getMarginsInfoDoc.operation)
  @ApiResponse(getMarginsInfoDoc.responses[200])
  @Get()
  async getMarginsInfo() {
    return this.csegmentService.getMarginInfo();
  }

  @ApiOperation(getMarginsByTenantDoc.operation)
  @ApiResponse(getMarginsByTenantDoc.responses[200])
  @Get(':tenantId')
  async getMarginsByTenant(@Param('tenantId') tenantId: string) {
    return this.csegmentService.getTenantMarginsInfo(tenantId);
  }

  @ApiOperation(createNewMarginDoc.operation)
  @ApiResponse(createNewMarginDoc.responses[201])
  @ApiResponse(createNewMarginDoc.responses[400])
  @Post()
  async createNewMargin(@Body() req: NewMarginDto) {
    return this.csegmentService.createMargins(req);
  }

  @ApiOperation(updateMarginDoc.operation)
  @ApiResponse(updateMarginDoc.responses[200])
  @ApiResponse(updateMarginDoc.responses[400])
  @ApiResponse(updateMarginDoc.responses[500])
  @Patch(':id')
  async updateMargin(@Param('id') id: string, @Body() req: UpdateMarginDto) {
    return this.csegmentService.updateMargins(id, req);
  }

  @ApiOperation(deleteMarginDoc.operation)
  @ApiResponse(deleteMarginDoc.responses[200])
  @ApiResponse(deleteMarginDoc.responses[400])
  @Delete(':id')
  async deleteMargin(@Param('id') id: string) {
    return this.csegmentService.deleteMargin(id);
  }
}
