import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { LoyalProgramService } from './loyalty-program.service';
import { NewLoyalProgramDto } from './dto/newLoyalProgram.dto';
import { UpdateLoyalProgramDto } from './dto/updateLoyalProgram.dto';

@Controller('loyal-program')
export class LoyalProgramController {
  constructor(private readonly loyalService: LoyalProgramService) {}

  @Get(':tenant_id')
  async getLoyalProgramsByTenant(@Param('tenant_id') tenant_id: string) {
    return this.loyalService.getLoyalProgramsByTenant(tenant_id);
  }

  @Get('program/:id')
  async getLoyalProgramById(@Param('id') id: string) {
    return this.loyalService.getLoyalProgramById(id);
  }

  @Post()
  async createLoyalProgram(@Body() req: NewLoyalProgramDto) {
    return this.loyalService.createLoyalProgram(req);
  }

  @Patch(':id')
  async updateLoyalProgram(
    @Param('id') id: string,
    @Body() req: UpdateLoyalProgramDto,
  ) {
    return this.loyalService.updateLoyalProgram(req, id);
  }

  @Delete(':id')
  async deleteLoyalProgram(@Param('id') id: string) {
    return this.loyalService.deleteLoyalProgram(id);
  }
}
