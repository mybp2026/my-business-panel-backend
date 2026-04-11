import { LevelAuthorizationGuard } from '@/common/guards/level_authorization.guard';
import { DocumentTypeService } from './document-type.service';
import { Controller, Delete, Get, Param, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  getAllDocumentTypesDoc,
  getOneDocumentTypeDoc,
  deleteDocumentTypeDoc,
} from '@/docs/contexts/general/document_type';

// @UseGuards(AuthorizationGuard)
@ApiTags('Document Type')
@Controller('document')
export class DocumentTypeController {
  constructor(private readonly documentTypeService: DocumentTypeService) {}

  @ApiOperation(getAllDocumentTypesDoc.operation)
  @ApiResponse(getAllDocumentTypesDoc.responses[200])
  @Get()
  getAll() {
    return this.documentTypeService.getAll();
  }

  @ApiOperation(getOneDocumentTypeDoc.operation)
  @ApiResponse(getOneDocumentTypeDoc.responses[200])
  @ApiResponse(getOneDocumentTypeDoc.responses[400])
  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.documentTypeService.getById(id);
  }

  @ApiOperation(deleteDocumentTypeDoc.operation)
  @ApiResponse(deleteDocumentTypeDoc.responses[200])
  @ApiResponse(deleteDocumentTypeDoc.responses[400])
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.documentTypeService.delete(id);
  }
}
