import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SaleItemService } from './sale-item.service';
import { Response } from 'express';
import { Item } from './interface/sale-item.interface';
import { TestDto } from './dto/test.dto';
import {
  getItemsDoc,
  createItemDoc,
  getItemDoc,
  deleteItemDoc,
} from '@/docs/contexts/pos/sale-item';

@ApiTags('Sale Item')
@Controller('items')
export class SaleItemController {
  constructor(private readonly itemService: SaleItemService) {}

  @ApiOperation(getItemsDoc.operation)
  @ApiResponse(getItemsDoc.responses[200])
  @ApiResponse(getItemsDoc.responses[401])
  @Get(":sale_id")
  async getItems(@Param('sale_id') sale_id: string) {
    return this.itemService.getAllItems(sale_id);
  }

  @ApiOperation(createItemDoc.operation)
  @ApiResponse(createItemDoc.responses[201])
  @ApiResponse(createItemDoc.responses[400])
  @ApiResponse(createItemDoc.responses[401])
  @Post()
  async createItem(@Body() req: TestDto) {
    return this.itemService.bulkInsert(req.items, req.sale_id);
  }

  @ApiOperation(getItemDoc.operation)
  @ApiResponse(getItemDoc.responses[200])
  @ApiResponse(getItemDoc.responses[401])
  @ApiResponse(getItemDoc.responses[404])
  @Get(':id')
  async getItem(@Param('id') id: string) {
    return this.itemService.getItemById(id);
  }

  @ApiOperation(deleteItemDoc.operation)
  @ApiResponse(deleteItemDoc.responses[200])
  @ApiResponse(deleteItemDoc.responses[401])
  @ApiResponse(deleteItemDoc.responses[404])
  @Delete(':id')
  async deleteItem(@Param('id') id: string) {
    return this.itemService.deleteItem(id);
  }
}
