import { CustomerService } from './customer.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NewClientDto } from './dto/newClient.dto';
import { UpdateClientDto } from './dto/updateClient.dto';
import { AuthenticationGuard } from '@/common/guards/authentication.guard';
// import { Session } from '@/common/decorators/session.decorator';
// import { IUserSession } from '@/common/interfaces/user_session.interface';
import { StateService } from '@/contexts/general/modules/state/state.service';
import {
  getAllCustomersForTenantDoc,
  getOneCustomerByIdDoc,
  getOneCustomerDoc,
  createCustomerDoc,
  updateCustomerDoc,
  deleteCustomerDoc,
} from '@/docs/contexts/general/customer';

@ApiTags('Customer')
@Controller('customers')
export class CustomerController {
  constructor(
    private readonly customerService: CustomerService,
    private readonly stateService: StateService,
  ) {}

  // Global list for superusers — must be declared BEFORE :tenantId
  @Get('all')
  @UseGuards(AuthenticationGuard)
  async getAllCustomersGlobal(
    @Query('page') page = '1',
    @Query('limit') limit = '100',
  ) {
    return this.customerService.getAllCustomersGlobal(
      parseInt(page),
      parseInt(limit),
    );
  }

  @ApiOperation(getAllCustomersForTenantDoc.operation)
  @ApiResponse(getAllCustomersForTenantDoc.responses[200])
  @ApiResponse(getAllCustomersForTenantDoc.responses[401])
  @Get('tenant/:tenantId')
  async getAllCustomersForTenant(
    @Param('tenantId') tenantId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '100',
  ) {
    return this.customerService.getAllCustomersPaginated(
      tenantId,
      parseInt(page),
      parseInt(limit),
    );
  }

  @ApiOperation(getOneCustomerDoc.operation)
  @ApiResponse(getOneCustomerDoc.responses[200])
  @ApiResponse(getOneCustomerDoc.responses[401])
  @ApiResponse(getOneCustomerDoc.responses[404])
  @Get('doc/:documentId')
  async getOneCustomer(@Param('documentId') documentId: string) {
    return this.customerService.findCustomerByDocumentId(documentId);
  }

  @ApiOperation(getOneCustomerByIdDoc.operation)
  @ApiResponse(getOneCustomerByIdDoc.responses[200])
  @ApiResponse(getOneCustomerByIdDoc.responses[401])
  @ApiResponse(getOneCustomerByIdDoc.responses[404])
  @Get(':id')
  async getOneCustomerById(@Param('id') id: string) {
    return this.customerService.findCustomerById(id);
  }

  @ApiOperation(createCustomerDoc.operation)
  @ApiResponse(createCustomerDoc.responses[201])
  @ApiResponse(createCustomerDoc.responses[400])
  @ApiResponse(createCustomerDoc.responses[401])
  @Post()
  async createCustomer(@Body() request: NewClientDto) {
    return this.customerService.createCustomer(request);
  }

  @ApiOperation(updateCustomerDoc.operation)
  @ApiResponse(updateCustomerDoc.responses[200])
  @ApiResponse(updateCustomerDoc.responses[400])
  @ApiResponse(updateCustomerDoc.responses[401])
  @Patch(':id')
  async updateCustomer(
    @Param('id') id: string,
    @Body() request: UpdateClientDto,
  ) {
    return this.customerService.updateCustomer(id, request);
  }

  @ApiOperation(deleteCustomerDoc.operation)
  @ApiResponse(deleteCustomerDoc.responses[200])
  @ApiResponse(deleteCustomerDoc.responses[401])
  @ApiResponse(deleteCustomerDoc.responses[404])
  @Delete(':id')
  async deleteCustomer(@Param('id') id: string) {
    return this.customerService.deleteCustomer(id);
  }
}
