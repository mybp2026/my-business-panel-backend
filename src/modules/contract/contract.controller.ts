import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { ContractService } from './contract.service';
import { ContractDto } from '../employee/dto/newEmployeeDto.dto';

@Controller('contract')
export class ContractController {
  constructor(private readonly contractService: ContractService) {}

  @Get(':id')
  async getContractById(@Param('id') id: string) {
    return this.contractService.getContractById(id);
  }

  @Patch(':id')
  async updateContractTerms(
    @Param('id') id: string,
    @Body() data: ContractDto,
  ) {
    return this.contractService.updateContract(id, data);
  }
}
