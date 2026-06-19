import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DutiesTypeService } from './duties-type.service';
import {
  CreateDutiesTypeDto,
  UpdateDutiesTypeDto,
} from './dto/duties-type.dto';
import { AuthenticationGuard } from '@/common/guards/authentication.guard';

@ApiTags('DutiesType')
@Controller('duties-type')
@UseGuards(AuthenticationGuard)
export class DutiesTypeController {
  constructor(private readonly dutiesTypeService: DutiesTypeService) {}

  @Get()
  async listByTenant(@Query('tenant_id') tenantId: string) {
    return this.dutiesTypeService.listByTenant(tenantId);
  }

  @Post()
  async create(@Body() body: CreateDutiesTypeDto) {
    return this.dutiesTypeService.create(body);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateDutiesTypeDto,
  ) {
    return this.dutiesTypeService.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.dutiesTypeService.remove(id);
  }
}
