import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { PromosService } from './promos.service';
import { NewPromoDto } from './dto/newPromo.dto';
import { UpdatePromotionDto } from './dto/updatePromo.dto';

@Controller('promos')
export class PromosController {
  constructor(private readonly promosService: PromosService) {}

  @Get(':tenantId')
  getTenantPromos(@Param('tenantId') tenantId: string) {
    return this.promosService.getPromos(tenantId);
  }

  @Get('info/:promo')
  getPromoInfo(@Param('promo') promo: string) {
    return this.promosService.getPromoInfo(promo);
  }

  @Get()
  getPromoTypes() {
    return this.promosService.getPromoTypes();
  }

  @Post()
  createPromoWithRule(@Body() newPromoDto: NewPromoDto) {
    return this.promosService.createPromoWithRule(newPromoDto);
  }

  @Patch(':id')
  updatePromotion(
    @Param('id') id: string,
    @Body() updatePromoDto: UpdatePromotionDto,
  ) {
    return this.promosService.updatePromotion(id, updatePromoDto);
  }

  @Delete(':id')
  deletePromotion(@Param('id') id: string) {
    return this.promosService.deletePromotion(id);
  }
}
