import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AccountingService } from './accounting.service';
import { CreateAccountDto, UpdateAccountDto } from './dto/create-account.dto';
import {
  CreateCostCenterDto,
  UpdateCostCenterDto,
} from './dto/cost-center.dto';
import { CreateJournalEntryDto } from './dto/journal-entry.dto';
import { AuthenticationGuard } from '@/common/guards/authentication.guard';
import { Session } from '@/common/decorators/session.decorator';
import { IUserSession } from '@/common/interfaces/user_session.interface';

@UseGuards(AuthenticationGuard)
@Controller('accounting')
export class AccountingController {
  constructor(private readonly accountingService: AccountingService) {}

  // -------------------------------------------------------
  // CATALOGS
  // -------------------------------------------------------

  @Get('account-types')
  getAccountTypes() {
    return this.accountingService.getAccountTypes();
  }

  @Get('source-types')
  getSourceTypes() {
    return this.accountingService.getSourceTypes();
  }

  @Get('entry-statuses')
  getJournalEntryStatuses() {
    return this.accountingService.getJournalEntryStatuses();
  }

  // -------------------------------------------------------
  // CHART OF ACCOUNTS
  // -------------------------------------------------------

  @Get('accounts')
  getAccounts(@Session() session: IUserSession) {
    return this.accountingService.getAccountsByTenant(session.tenant_id);
  }

  @Get('accounts/:id')
  getAccountById(@Param('id') id: string, @Session() session: IUserSession) {
    return this.accountingService.getAccountById(id, session.tenant_id);
  }

  @Post('accounts')
  createAccount(
    @Body() dto: CreateAccountDto,
    @Session() session: IUserSession,
  ) {
    return this.accountingService.createAccount(session.tenant_id, dto);
  }

  @Patch('accounts/:id')
  updateAccount(
    @Param('id') id: string,
    @Body() dto: UpdateAccountDto,
    @Session() session: IUserSession,
  ) {
    return this.accountingService.updateAccount(id, session.tenant_id, dto);
  }

  @Post('accounts/provision')
  provisionAccounts(@Session() session: IUserSession) {
    return this.accountingService.provisionTenantAccounts(session.tenant_id);
  }

  // -------------------------------------------------------
  // COST CENTERS
  // -------------------------------------------------------

  @Get('cost-centers')
  getCostCenters(@Session() session: IUserSession) {
    return this.accountingService.getCostCentersByTenant(session.tenant_id);
  }

  @Get('cost-centers/:id')
  getCostCenterById(@Param('id') id: string, @Session() session: IUserSession) {
    return this.accountingService.getCostCenterById(id, session.tenant_id);
  }

  @Post('cost-centers')
  createCostCenter(
    @Body() dto: CreateCostCenterDto,
    @Session() session: IUserSession,
  ) {
    return this.accountingService.createCostCenter(session.tenant_id, dto);
  }

  @Patch('cost-centers/:id')
  updateCostCenter(
    @Param('id') id: string,
    @Body() dto: UpdateCostCenterDto,
    @Session() session: IUserSession,
  ) {
    return this.accountingService.updateCostCenter(id, session.tenant_id, dto);
  }

  // -------------------------------------------------------
  // JOURNAL ENTRIES
  // -------------------------------------------------------

  @Get('journal-entries')
  getJournalEntries(@Session() session: IUserSession) {
    return this.accountingService.getJournalEntriesByTenant(session.tenant_id);
  }

  @Get('journal-entries/:id')
  getJournalEntryById(
    @Param('id') id: string,
    @Session() session: IUserSession,
  ) {
    return this.accountingService.getJournalEntryById(id, session.tenant_id);
  }

  @Post('journal-entries')
  createJournalEntry(
    @Body() dto: CreateJournalEntryDto,
    @Session() session: IUserSession,
  ) {
    return this.accountingService.createJournalEntry(
      session.tenant_id,
      session.user_id,
      dto,
    );
  }

  @Post('journal-entries/:id/void')
  voidJournalEntry(@Param('id') id: string, @Session() session: IUserSession) {
    return this.accountingService.voidJournalEntry(
      id,
      session.tenant_id,
      session.user_id,
    );
  }
}
