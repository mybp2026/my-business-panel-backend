import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TenantHaciendaConfigService } from './tenant-hacienda-config.service';
import { SaveHaciendaConfigDto } from './dto/save-hacienda-config.dto';
import { AuthenticationGuard } from '@/common/guards/authentication.guard';
import { LevelAuthorizationGuard } from '@/common/guards/level_authorization.guard';
import { RequiredLevel } from '@/common/decorators/level_metadata.decorator';
import {
  getHaciendaStatusDoc,
  saveHaciendaConfigDoc,
  deactivateHaciendaConfigDoc,
} from '@/docs/contexts/general/tenant_hacienda_config';

@ApiBearerAuth()
@ApiTags('Tenant Hacienda Config')
@UseGuards(AuthenticationGuard, LevelAuthorizationGuard)
@Controller('tenant-hacienda-config')
export class TenantHaciendaConfigController {
  constructor(private readonly service: TenantHaciendaConfigService) {}

  @ApiOperation(getHaciendaStatusDoc.operation)
  @ApiResponse(getHaciendaStatusDoc.responses[200])
  @ApiResponse(getHaciendaStatusDoc.responses[401])
  @Get(':tenantId')
  @RequiredLevel(3)
  async getStatus(@Param('tenantId', ParseUUIDPipe) tenantId: string) {
    const credentials = await this.service.getCredentials(tenantId);

    if (!credentials) {
      return { configured: false };
    }

    return {
      configured: true,
      hacienda_client_id: credentials.haciendaClientId,
      has_p12: !!credentials.p12Base64,
    };
  }

  @ApiOperation(saveHaciendaConfigDoc.operation)
  @ApiResponse(saveHaciendaConfigDoc.responses[201])
  @ApiResponse(saveHaciendaConfigDoc.responses[400])
  @ApiResponse(saveHaciendaConfigDoc.responses[401])
  @Post()
  @RequiredLevel(4)
  async save(@Body() dto: SaveHaciendaConfigDto) {
    const configId = await this.service.saveCredentials(dto.tenant_id, {
      haciendaUsername: dto.hacienda_username,
      haciendaPassword: dto.hacienda_password,
      haciendaClientId: dto.hacienda_client_id,
      p12Base64: dto.p12_base64,
      p12Password: dto.p12_password,
    });

    return { tenant_hacienda_config_id: configId };
  }

  @ApiOperation(deactivateHaciendaConfigDoc.operation)
  @ApiResponse(deactivateHaciendaConfigDoc.responses[200])
  @ApiResponse(deactivateHaciendaConfigDoc.responses[401])
  @ApiResponse(deactivateHaciendaConfigDoc.responses[404])
  @Delete(':tenantId')
  @RequiredLevel(4)
  async deactivate(@Param('tenantId', ParseUUIDPipe) tenantId: string) {
    await this.service.deactivate(tenantId);
    return { deactivated: true };
  }
}
