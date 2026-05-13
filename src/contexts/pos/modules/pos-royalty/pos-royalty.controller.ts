import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PosRoyaltyService } from './pos-royalty.service';
import {
  CreateRoyaltyOptionDto,
  CreateRoyaltyRuleDto,
  SetOptionProductsDto,
  UpdateRoyaltyOptionDto,
  UpdateRoyaltyRuleDto,
} from './dto/pos-royalty.dto';
import { AuthenticationGuard } from '@/common/guards/authentication.guard';

@ApiTags('POS Royalty')
@UseGuards(AuthenticationGuard)
@Controller('pos-royalty')
export class PosRoyaltyController {
  constructor(private readonly service: PosRoyaltyService) {}

  // ── Rules ──────────────────────────────────────────────────────────────────

  @Get('rules/:tenantId')
  listRules(
    @Param('tenantId') tenantId: string,
    @Query('type_id') typeId?: string,
  ) {
    return this.service.listRules(tenantId, typeId);
  }

  @Get('rules/detail/:royaltyRuleId')
  getRule(@Param('royaltyRuleId') royaltyRuleId: string) {
    return this.service.getRule(royaltyRuleId);
  }

  @Post('rules')
  createRule(@Body() dto: CreateRoyaltyRuleDto) {
    return this.service.createRule(dto);
  }

  @Put('rules/:royaltyRuleId')
  updateRule(
    @Param('royaltyRuleId') royaltyRuleId: string,
    @Body() dto: UpdateRoyaltyRuleDto,
  ) {
    return this.service.updateRule(royaltyRuleId, dto);
  }

  @Delete('rules/:royaltyRuleId')
  deleteRule(@Param('royaltyRuleId') royaltyRuleId: string) {
    return this.service.deleteRule(royaltyRuleId);
  }

  // ── Options ────────────────────────────────────────────────────────────────

  @Post('options')
  createOption(@Body() dto: CreateRoyaltyOptionDto) {
    return this.service.createOption(dto);
  }

  @Put('options/:royaltyOptionId')
  updateOption(
    @Param('royaltyOptionId') royaltyOptionId: string,
    @Body() dto: UpdateRoyaltyOptionDto,
  ) {
    return this.service.updateOption(royaltyOptionId, dto);
  }

  @Delete('options/:royaltyOptionId')
  deleteOption(@Param('royaltyOptionId') royaltyOptionId: string) {
    return this.service.deleteOption(royaltyOptionId);
  }

  // ── Option products ────────────────────────────────────────────────────────

  @Put('options/:royaltyOptionId/products')
  setOptionProducts(
    @Param('royaltyOptionId') royaltyOptionId: string,
    @Body() dto: SetOptionProductsDto,
  ) {
    return this.service.setOptionProducts(royaltyOptionId, dto);
  }

  // ── POS integration ────────────────────────────────────────────────────────

  @Get('applicable')
  getApplicableRules(
    @Query('tenant_id') tenantId: string,
    @Query('amount') amount: string,
  ) {
    return this.service.getApplicableRules(tenantId, parseFloat(amount));
  }

  @Get('giftable-products/:tenantProductGroupId')
  getGiftableProducts(
    @Param('tenantProductGroupId') tenantProductGroupId: string,
  ) {
    return this.service.getGiftableProductsByGroup(tenantProductGroupId);
  }
}
