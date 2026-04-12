import { CustomerService } from './customer.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  Patch,
  Post,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NewClientDto } from './dto/newClient.dto';
import { UpdateClientDto } from './dto/updateClient.dto';
import {
  getAllCustomersForTenantDoc,
  getOneCustomerByIdDoc,
  getOneCustomerDoc,
  createCustomerDoc,
  updateCustomerDoc,
  deleteCustomerDoc,
} from '@/docs/contexts/general/customer';

// ? Implement AuthGuard
//UseGuards(AuthGuard)
@ApiTags('Customer')
@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @ApiOperation(getAllCustomersForTenantDoc.operation)
  @ApiResponse(getAllCustomersForTenantDoc.responses[200])
  @ApiResponse(getAllCustomersForTenantDoc.responses[401])
  @Get('tenant/:tenantId')
  async getAllCustomersForTenant(@Param('tenantId') tenantId: string) {
    return this.customerService.getAllCustomers(tenantId);
  }

  @ApiOperation(getOneCustomerByIdDoc.operation)
  @ApiResponse(getOneCustomerByIdDoc.responses[200])
  @ApiResponse(getOneCustomerByIdDoc.responses[401])
  @ApiResponse(getOneCustomerByIdDoc.responses[404])
  @Get(':id')
  async getOneCustomerById(@Param('id') id: string) {
    return this.customerService.findCustomerById(id);
  }

  @ApiOperation(getOneCustomerDoc.operation)
  @ApiResponse(getOneCustomerDoc.responses[200])
  @ApiResponse(getOneCustomerDoc.responses[401])
  @ApiResponse(getOneCustomerDoc.responses[404])
  @Get('/doc/:documentId')
  async getOneCustomer(@Param('documentId') documentId: string) {
    return this.customerService.findCustomerByDocumentId(documentId);
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
    @Body()
    request: UpdateClientDto,
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
