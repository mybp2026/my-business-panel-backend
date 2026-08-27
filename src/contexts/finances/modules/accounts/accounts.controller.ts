import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AccountsService } from './accounts.service';
import { AuthenticationGuard } from '@/common/guards/authentication.guard';
import { Session } from '@/common/decorators/session.decorator';
import { IUserSession } from '@/common/interfaces/user_session.interface';

@ApiTags('Finances - Accounts')
@UseGuards(AuthenticationGuard)
@Controller('finances/accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @ApiOperation({
    summary: 'Resumen consolidado de cuentas por pagar y por cobrar',
  })
  @ApiResponse({ status: 200, description: 'Resumen de cuentas obtenido' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @Get()
  getAccountsOverview(@Session() session: IUserSession) {
    return this.accountsService.getAccountsOverview(session);
  }

  @ApiOperation({ summary: 'Lista filtrada de cuentas por pagar' })
  @ApiResponse({ status: 200, description: 'Lista obtenida' })
  @Get('payables')
  getPayablesList(
    @Query('status') status?: string,
    @Query('sort_by') sort_by?: string,
    @Query('sort_dir') sort_dir?: string,
    @Session() session?: IUserSession,
  ) {
    return this.accountsService.getPayablesList(
      { status, sort_by, sort_dir },
      session!,
    );
  }

  @ApiOperation({ summary: 'Lista filtrada de cuentas por cobrar' })
  @ApiResponse({ status: 200, description: 'Lista obtenida' })
  @Get('receivables')
  getReceivablesList(
    @Query('status') status?: string,
    @Query('sort_by') sort_by?: string,
    @Query('sort_dir') sort_dir?: string,
    @Session() session?: IUserSession,
  ) {
    return this.accountsService.getReceivablesList(
      { status, sort_by, sort_dir },
      session!,
    );
  }

  @ApiOperation({ summary: 'Pagos realizados de una cuenta por pagar' })
  @ApiResponse({ status: 200, description: 'Pagos obtenidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin acceso' })
  @ApiResponse({ status: 404, description: 'Cuenta no encontrada' })
  @Get('payable/:id/payments')
  getPayablePayments(
    @Param('id') payableId: string,
    @Session() session: IUserSession,
  ) {
    return this.accountsService.getPayablePayments(payableId, session);
  }

  @ApiOperation({ summary: 'Cobros realizados de una cuenta por cobrar' })
  @ApiResponse({ status: 200, description: 'Cobros obtenidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin acceso' })
  @ApiResponse({ status: 404, description: 'Cuenta no encontrada' })
  @Get('receivable/:id/collections')
  getReceivableCollections(
    @Param('id') receivableId: string,
    @Session() session: IUserSession,
  ) {
    return this.accountsService.getReceivableCollections(receivableId, session);
  }
}
