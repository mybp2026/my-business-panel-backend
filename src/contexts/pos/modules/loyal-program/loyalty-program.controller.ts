import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoyalProgramService } from './loyalty-program.service';
import { NewLoyalProgramDto } from './dto/newLoyalProgram.dto';
import { UpdateLoyalProgramDto } from './dto/updateLoyalProgram.dto';
import {
  getLoyalProgramsByTenantDoc,
  getLoyalProgramByIdDoc,
  createLoyalProgramDoc,
  updateLoyalProgramDoc,
  deleteLoyalProgramDoc,
} from '@/docs/contexts/pos/loyal-program';

@ApiTags('Loyal Program')
@Controller('loyal-program')
export class LoyalProgramController {
  constructor(private readonly loyalService: LoyalProgramService) {}

  @ApiOperation(getLoyalProgramsByTenantDoc.operation)
  @ApiResponse(getLoyalProgramsByTenantDoc.responses[200])
  @ApiResponse(getLoyalProgramsByTenantDoc.responses[401])
  @Get(':tenant_id')
  async getLoyalProgramsByTenant(@Param('tenant_id') tenant_id: string) {
    return this.loyalService.getLoyalProgramsByTenant(tenant_id);
  }

  @ApiOperation(getLoyalProgramByIdDoc.operation)
  @ApiResponse(getLoyalProgramByIdDoc.responses[200])
  @ApiResponse(getLoyalProgramByIdDoc.responses[401])
  @ApiResponse(getLoyalProgramByIdDoc.responses[404])
  @Get('program/:id')
  async getLoyalProgramById(@Param('id') id: string) {
    return this.loyalService.getLoyalProgramById(id);
  }

  @ApiOperation(createLoyalProgramDoc.operation)
  @ApiResponse(createLoyalProgramDoc.responses[201])
  @ApiResponse(createLoyalProgramDoc.responses[400])
  @ApiResponse(createLoyalProgramDoc.responses[401])
  @Post()
  async createLoyalProgram(@Body() req: NewLoyalProgramDto) {
    return this.loyalService.createLoyalProgram(req);
  }

  @ApiOperation(updateLoyalProgramDoc.operation)
  @ApiResponse(updateLoyalProgramDoc.responses[200])
  @ApiResponse(updateLoyalProgramDoc.responses[400])
  @ApiResponse(updateLoyalProgramDoc.responses[401])
  @ApiResponse(updateLoyalProgramDoc.responses[404])
  @Patch(':id')
  async updateLoyalProgram(
    @Param('id') id: string,
    @Body() req: UpdateLoyalProgramDto,
  ) {
    return this.loyalService.updateLoyalProgram(req, id);
  }

  @ApiOperation(deleteLoyalProgramDoc.operation)
  @ApiResponse(deleteLoyalProgramDoc.responses[200])
  @ApiResponse(deleteLoyalProgramDoc.responses[401])
  @ApiResponse(deleteLoyalProgramDoc.responses[404])
  @Delete(':id')
  async deleteLoyalProgram(@Param('id') id: string) {
    return this.loyalService.deleteLoyalProgram(id);
  }
}
