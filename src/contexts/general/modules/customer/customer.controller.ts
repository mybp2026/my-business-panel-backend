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
import { NewClientDto } from './dto/newClient.dto';
import { UpdateClientDto } from './dto/updateClient.dto';

// ? Implement AuthGuard
//UseGuards(AuthGuard)
@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get('tenant/:tenantId')
  async getAllCustomersForTenant(@Param('tenantId') tenantId: string) {
    return this.customerService.getAllCustomers(tenantId);
  }

  @Get(':id')
  async getOneCustomerById(@Param('id') id: string) {
    return this.customerService.findCustomerById(id);
  }

  @Get('/doc/:documentId')
  async getOneCustomer(@Param('documentId') documentId: string) {
    return this.customerService.findCustomerByDocumentId(documentId);
  }

  @Post()
  async createCustomer(@Body() request: NewClientDto) {
    return this.customerService.createCustomer(request);
  }

  @Patch(':id')
  async updateCustomer(
    @Param('id') id: string,
    @Body()
    request: UpdateClientDto,
  ) {
    return this.customerService.updateCustomer(id, request);
  }

  @Delete(':id')
  async deleteCustomer(@Param('id') id: string) {
    return this.customerService.deleteCustomer(id);
  }
}
