import { EInvoiceStatusCron } from './einvoice-status.cron';
import { HaciendaService } from '../hacienda/hacienda.service';
import { TenantHaciendaConfigService } from '@/contexts/general/modules/tenant_hacienda_config/tenant-hacienda-config.service';

jest.mock('@/common/crypto/aes-256-gcm', () => ({
  encrypt: (v: string) => `enc:${v}`,
  decrypt: (v: string) => v.replace(/^enc:/, ''),
}));

// Helper: matches the query proxy by its __queryKey, since the proxy in
// @crane-technologies/database returns a fresh object (with fresh toString/
// valueOf function refs) on every property access, defeating Jest deep
// equality.
const queryKey = (key: string) =>
  expect.objectContaining({ __queryKey: key });

type DbMock = { query: jest.Mock };

function makeRow(overrides: Partial<any> = {}) {
  return {
    electronic_sale_invoice_id: 'inv-1',
    key_number: '506...',
    tenant_id: 'tenant-1',
    created_at: new Date().toISOString(),
    check_attempts: 0,
    ...overrides,
  };
}

function makeCredentials() {
  return {
    haciendaClientId: 'api-stag',
    haciendaUsername: 'u',
    haciendaPassword: 'p',
    p12Base64: '',
    p12Password: '',
  } as any;
}

describe('EInvoiceStatusCron', () => {
  let db: DbMock;
  let hacienda: jest.Mocked<HaciendaService>;
  let tenantCfg: jest.Mocked<TenantHaciendaConfigService>;
  let cron: EInvoiceStatusCron;

  beforeEach(() => {
    db = { query: jest.fn() };
    hacienda = {
      checkInvoiceStatus: jest.fn(),
    } as any;
    tenantCfg = {
      getCredentials: jest.fn().mockResolvedValue(makeCredentials()),
    } as any;
    cron = new EInvoiceStatusCron(db as any, hacienda, tenantCfg);
  });

  describe('processInvoice', () => {
    it('marks status=2 when Hacienda returns aceptado', async () => {
      hacienda.checkInvoiceStatus.mockResolvedValue({
        indEstado: 'aceptado',
        respuestaXml: 'xml-base64',
      } as any);

      await cron.processInvoice(makeRow());

      expect(db.query).toHaveBeenCalledWith(
        queryKey('eInvoice.updateHaciendaResponse'),
        ['inv-1', 'enc:xml-base64', 2],
      );
      expect(db.query).toHaveBeenCalledTimes(1);
    });

    it('marks status=3 when Hacienda returns rechazado', async () => {
      hacienda.checkInvoiceStatus.mockResolvedValue({
        indEstado: 'rechazado',
        respuestaXml: 'xml-base64',
      } as any);

      await cron.processInvoice(makeRow());

      expect(db.query).toHaveBeenCalledWith(
        queryKey('eInvoice.updateHaciendaResponse'),
        ['inv-1', 'enc:xml-base64', 3],
      );
    });

    it('schedules retry on first pending (attempts=0)', async () => {
      hacienda.checkInvoiceStatus.mockResolvedValue({
        indEstado: 'procesando',
      } as any);

      await cron.processInvoice(makeRow({ check_attempts: 0 }));

      expect(db.query).toHaveBeenCalledWith(queryKey('eInvoice.markAttempt'), [
        'inv-1',
        '2 hours',
      ]);
    });

    it('marks status=4 on second pending (attempts=1 reaches MAX_ATTEMPTS=2)', async () => {
      hacienda.checkInvoiceStatus.mockResolvedValue({
        indEstado: 'procesando',
      } as any);

      await cron.processInvoice(makeRow({ check_attempts: 1 }));

      expect(db.query).toHaveBeenCalledWith(queryKey('eInvoice.markFailed'), [
        'inv-1',
      ]);
    });

    it('schedules retry when Hacienda throws (treats as pending)', async () => {
      hacienda.checkInvoiceStatus.mockRejectedValue(new Error('network down'));

      await cron.processInvoice(makeRow({ check_attempts: 0 }));

      expect(db.query).toHaveBeenCalledWith(queryKey('eInvoice.markAttempt'), [
        'inv-1',
        '2 hours',
      ]);
    });

    it('marks failed when Hacienda throws on the last allowed attempt', async () => {
      hacienda.checkInvoiceStatus.mockRejectedValue(new Error('network down'));

      await cron.processInvoice(makeRow({ check_attempts: 1 }));

      expect(db.query).toHaveBeenCalledWith(queryKey('eInvoice.markFailed'), [
        'inv-1',
      ]);
    });

    it('skips invoice when tenant has no credentials', async () => {
      tenantCfg.getCredentials.mockResolvedValue(null as any);

      await cron.processInvoice(makeRow());

      expect(hacienda.checkInvoiceStatus).not.toHaveBeenCalled();
      expect(db.query).not.toHaveBeenCalled();
    });
  });

  describe('checkPendingInvoices', () => {
    it('does nothing when queue is empty', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });

      await cron.checkPendingInvoices();

      expect(db.query).toHaveBeenCalledTimes(1);
      expect(db.query).toHaveBeenCalledWith(queryKey('eInvoice.getDueInvoices'));
      expect(hacienda.checkInvoiceStatus).not.toHaveBeenCalled();
    });

    it('processes every due invoice', async () => {
      const rows = [
        makeRow({ electronic_sale_invoice_id: 'a' }),
        makeRow({ electronic_sale_invoice_id: 'b' }),
        makeRow({ electronic_sale_invoice_id: 'c' }),
      ];
      db.query.mockResolvedValueOnce({ rows });
      hacienda.checkInvoiceStatus.mockResolvedValue({
        indEstado: 'aceptado',
        respuestaXml: 'x',
      } as any);

      await cron.checkPendingInvoices();

      expect(hacienda.checkInvoiceStatus).toHaveBeenCalledTimes(3);
    });

    it('skips overlapping ticks while one is still running', async () => {
      let resolveFirst!: (v: any) => void;
      db.query.mockImplementationOnce(
        () =>
          new Promise((r) => {
            resolveFirst = r;
          }),
      );

      const first = cron.checkPendingInvoices();
      // Second tick while first is in flight.
      await cron.checkPendingInvoices();

      expect(db.query).toHaveBeenCalledTimes(1);

      resolveFirst({ rows: [] });
      await first;
    });
  });
});
