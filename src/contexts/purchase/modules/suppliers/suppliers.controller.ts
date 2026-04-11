import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { AuthenticationGuard } from '@/common/guards/authentication.guard';
import { IUserSession } from '@/common/interfaces/user_session.interface';
import { Session } from '@/common/decorators/session.decorator';

@UseGuards(AuthenticationGuard)
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  createSupplier(
    @Body() createSupplierDto: CreateSupplierDto,
    @Session() userSession: IUserSession,
  ) {
    return this.suppliersService.createSupplier(createSupplierDto, userSession);
  }

  @Post('bulk')
  createSuppliersBulk(
    @Body() createSuppliersDto: CreateSupplierDto[],
    @Session() userSession: IUserSession,
  ) {
    return this.suppliersService.createSuppliersBulk(
      createSuppliersDto,
      userSession,
    );
  }

  @Get()
  getAllSuppliers(@Session() userSession: IUserSession) {
    return this.suppliersService.getAllSuppliersByTenant(userSession.tenant_id);
  }

  @Get(':id')
  getSupplierById(@Param('id') id: string) {
    return this.suppliersService.getSupplierById(id);
  }

  @Patch(':id')
  updateSupplier(
    @Param('id') id: string,
    @Body() updateSupplierDto: UpdateSupplierDto,
  ) {
    return this.suppliersService.updateSupplier(id, updateSupplierDto);
  }

  @Delete(':id')
  deleteSupplier(@Param('id') id: string) {
    return this.suppliersService.deleteSupplier(id);
  }
}
