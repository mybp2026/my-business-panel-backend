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
import { SaleItemService } from './sale-item.service';
import { Response } from 'express';
import { Item } from './interface/sale-item.interface';
import { TestDto } from './dto/test.dto';

@Controller('items')
export class SaleItemController {
  constructor(private readonly itemService: SaleItemService) {}

  @Get(":sale_id")
  async getItems(@Param('sale_id') sale_id: string) {
    return this.itemService.getAllItems(sale_id);
  }

  @Post()
  async createItem(@Body() req: TestDto) {
    return this.itemService.bulkInsert(req.items, req.sale_id);
  }

  @Get(':id')
  async getItem(@Param('id') id: string) {
    return this.itemService.getItemById(id);
  }

  @Delete(':id')
  async deleteItem(@Param('id') id: string) {
    return this.itemService.deleteItem(id);
  }
}
