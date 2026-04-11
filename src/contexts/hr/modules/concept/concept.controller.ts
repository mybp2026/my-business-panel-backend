import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ConceptService } from './concept.service';
import { NewConceptDto } from './dto/newConcept.dto';
import { UpdateConceptDto } from './dto/updateConcept.dto';

@Controller('concept')
export class ConceptController {
  constructor(private readonly conceptService: ConceptService) {}

  @Get(':tenantId')
  async getConceptsByTenant(@Param('tenantId') tenantId: string) {
    return this.conceptService.getAllConceptsByTenant(tenantId);
  }

  @Post()
  async createConcept(@Body() body: NewConceptDto) {
    return this.conceptService.createNewConcept(body);
  }

  @Patch(':conceptId')
  async updateConcept(
    @Param('conceptId') conceptId: number,
    @Body() body: UpdateConceptDto,
  ) {
    return this.conceptService.updateConcept(body, conceptId);
  }

  @Patch(':conceptId/soft-delete')
  async softDeleteConcept(@Param('conceptId') conceptId: number) {
    return this.conceptService.softDeleteConcept(conceptId);
  }

  @Delete(':conceptId')
  async deleteConcept(@Param('conceptId') conceptId: number) {
    return this.conceptService.deleteConcept(conceptId);
  }
}
