# Plan: Migrar polling de e-invoice a Job Queue (BullMQ)

## Contexto

Actualmente el servicio de facturación electrónica usa un cron job que corre cada minuto
para verificar el estado de facturas pendientes en Hacienda. Este enfoque no escala con
múltiples tenants y no respeta rate limits del API de Hacienda.

**TODO original (e-invoice.service.ts:47):**

> Al enviar la factura a Hacienda, no se recibe un resultado inmediato, sino que se
> procesa asincrónicamente. Implementar un mecanismo de polling o webhook para actualizar
> el estado de la factura una vez que Hacienda la procese.

---

## IMPORTANTE: Credenciales de Hacienda son globales (bloqueante)

Actualmente el certificado P12 y las credenciales de Hacienda (ATV) están en env vars
globales. Esto significa que todos los tenants facturan con las mismas credenciales,
lo cual no funciona en multi-tenant. Cada empresa tiene su propio certificado y usuario.

**Antes o durante la implementación del job queue, se necesita:**

- Crear tabla `tenant_hacienda_config` (o similar) con: `tenant_id`, `p12_base64`,
  `p12_password`, `hacienda_username`, `hacienda_password`, `hacienda_client_id`
  (todo encriptado en BD)
- El worker debe resolver las credenciales del tenant desde BD al procesar cada job
- `HaciendaService` debe aceptar credenciales dinámicas en vez de leer de `process.env`
- Las env vars actuales pueden mantenerse como fallback o eliminarse
- Las credenciales deben cifrarse con AES-256-GCM en BD (no plaintext)

---

## PENDIENTE: Mejoras en HaciendaService

1. **No hay timeout en `fetch`**: Si Hacienda se cuelga, el request queda abierto
   indefinidamente. Agregar `AbortController` con timeout configurable (ej: 30s).

2. **No hay retry en `fetch`**: Si Hacienda responde 500 o hay error de red en
   `sendInvoice()`, la factura se pierde. Agregar retry con 2-3 intentos antes de fallar.

---

## Enfoque propuesto: Batch Dispatch + Re-enqueue on Failure

Reemplazar el cron cada minuto + backoff individual por un ciclo de batch periódico
con BullMQ. El principio es simple: cada N horas el sistema despierta, recoge TODAS
las facturas pendientes, las procesa secuencialmente con rate limiting, y las que no
se resuelven vuelven a la cola para el siguiente ciclo.

### Por qué NO backoff exponencial individual

Con 2000 facturas enviadas al mismo tiempo, el backoff individual provoca que todas
se re-agenden al mismo momento (2min, 4min, 8min...), generando ráfagas sincronizadas
que colapsan Hacienda con 429. El batch periódico elimina esto: el tráfico es siempre
secuencial, predecible y espaciado.

### Flujo

```
Cron (cada 2 horas) — "Batch Dispatcher"
  → SELECT facturas WHERE status = pendiente AND created_at > NOW() - TTL
  → Si no hay pendientes → no hacer nada, el worker no se despierta
  → Encolar cada factura como job individual en cola "einvoice-status"

Worker (procesa cola "einvoice-status"):
  → Toma job
  → Consulta GET /recepcion/{clave} en Hacienda
  → Si resuelto (aceptado/rechazado):
      → UPDATE status en BD (2 o 3)
      → Job completado ✓
  → Si pendiente:
      → Re-encola ESE job con delay de 2hrs (vuelve en el siguiente ciclo)
  → Si TTL expirado (factura tiene más de Nhrs):
      → UPDATE status = 4 (timeout)
      → Job completado ✓
  → Pausa 5s antes del siguiente job (rate limiting)

createEInvoiceForSale()
  → Envía XML a Hacienda
  → Inserta registro con status=1 (pendiente)
  → Retorna al cliente inmediatamente (no quick-poll, no sleep)
  → La factura será recogida en el próximo ciclo de batch
```

### Ritmo de procesamiento

| Escenario | Facturas | Tiempo de batch (5s/factura) |
| --------- | -------- | ---------------------------- |
| Bajo      | 50       | ~4 min                       |
| Medio     | 500      | ~42 min                      |
| Alto      | 2000     | ~2.8 hrs                     |
| Extremo   | 5000     | ~6.9 hrs                     |

Para el escenario extremo (5000+), se puede reducir el sleep a 2-3s o agregar
concurrency de 2 workers con rate limiter global en BullMQ.

---

## Fortalezas

1. **Tráfico predecible**: Hacienda recibe máximo 1 request cada 5s. No hay ráfagas.
   Imposible un 429.

2. **Sin polling si no hay trabajo**: Si no hay facturas pendientes, el cron no encola
   nada y el worker no se despierta. Zero waste.

3. **Simplicidad**: No hay backoff exponencial, no hay cálculos de delay por factura,
   no hay columnas `check_attempts` ni `next_check_at`. El ciclo es: batch → procesar
   → las que fallan vuelven al siguiente batch.

4. **Escala con tenants**: 100 tenants × 20 facturas = 2000 jobs. Se procesan en orden,
   uno por uno, con 5s entre cada uno. BullMQ maneja la cola.

5. **Rate limiting nativo de BullMQ**: `limiter: { max: 12, duration: 60_000 }` garantiza
   que nunca se excedan 12 requests/minuto a Hacienda, sin lógica manual.

6. **No hay solapamiento**: BullMQ garantiza que un job en proceso no puede ser tomado
   por otro worker. El cron actual puede solaparse si tarda más de 1 minuto.

7. **Distributed lock gratis**: Si se escala a múltiples instancias del backend, BullMQ
   - Redis coordina que cada job se procese una sola vez.

8. **Retry automático**: Si el worker crashea (error de red, OOM), BullMQ reintenta
   el job automáticamente.

9. **Observabilidad**: BullMQ expone métricas (completados, fallidos, en espera, delayed).
   Se puede agregar Bull Board para dashboard visual.

10. **Re-enqueue con delay**: Las facturas que no se resuelven se re-encolan con delay
    de 2hrs. No necesitan lógica especial, simplemente vuelven al siguiente ciclo.

---

## Desventajas

1. **Nueva dependencia: Redis**: Requiere instalar, configurar y mantener Redis.
   En producción necesita persistencia (AOF/RDB) para no perder jobs ante un reinicio.

2. **Complejidad operacional**: Hay que monitorear Redis además de PostgreSQL.
   Si Redis se cae, los jobs se pierden hasta que vuelva.

3. **Estado dividido**: El estado de la factura vive en PostgreSQL, los jobs pendientes
   en Redis. Si Redis pierde datos, hay facturas huérfanas.

4. **Latencia de resolución**: Una factura creada justo después de un batch espera
   hasta 2hrs para ser consultada. El usuario no recibe confirmación inmediata.

5. **Batches largos con volumen extremo**: 5000 facturas × 5s = ~7hrs. Si el batch
   no termina antes del siguiente ciclo, se pueden acumular jobs.

6. **Curva de aprendizaje**: El equipo necesita entender BullMQ (workers, processors,
   events, concurrency).

---

## Mitigación de desventajas

| Desventaja           | Mitigación                                                                                                                                                                                                             |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Redis como SPOF      | Redis con persistencia AOF. Cron de reconciliación como fallback (cada 30min busca facturas pendientes sin job activo y las re-encola).                                                                                |
| Estado dividido      | PostgreSQL es la fuente de verdad. Si Redis pierde jobs, el cron de reconciliación los detecta y re-encola.                                                                                                            |
| Latencia de 2hrs     | Aceptable para facturación electrónica: Hacienda no requiere resolución inmediata. Si se necesita respuesta más rápida para UX, se puede reducir el ciclo a 1hr o agregar un endpoint manual "consultar estado ahora". |
| Batches largos       | Reducir sleep a 2-3s, o aumentar concurrency a 2 workers con rate limiter global. BullMQ maneja esto nativamente.                                                                                                      |
| Curva de aprendizaje | BullMQ es el estándar de facto en NestJS para colas. Documentación extensa y comunidad activa.                                                                                                                         |

---

## Sugerencia: Protección contra duplicados en batch dispatcher

Cuando el volumen crece, un batch puede no terminar antes del siguiente ciclo.
El batch dispatcher seguirá encolando facturas cada 2hrs, pero algunas ya estarán
en la cola (waiting, delayed o active). Para evitar duplicados:

```typescript
// Batch dispatcher - antes de encolar
const activeJobs = await queue.getJobs(['waiting', 'delayed', 'active']);
const activeInvoiceIds = new Set(activeJobs.map((j) => j.data.invoiceId));

for (const invoice of pendingInvoices) {
  if (!activeInvoiceIds.has(invoice.id)) {
    await queue.add('check-status', { invoiceId: invoice.id });
  }
}
```

Esto garantiza que:

- El worker se duerme naturalmente cuando la cola se vacía
- El worker se despierta solo cuando llegan jobs nuevos
- No se duplican jobs para la misma factura
- Si el volumen crece y el batch no termina a tiempo, los jobs pendientes
  siguen procesándose sin interrupción y el batch solo agrega los nuevos

---

## Progreso y cronograma (deadline: martes 31/03/2026)

### Completado ✅

- [x] Fase 1: Infraestructura Redis + BullMQ (dependencias, QueueModule con adapter/facade/prototype)
- [x] Fase 2: Cola einvoice-status + batch dispatcher + processor
- [x] Fase 3: Migrar createEInvoiceForSale (eliminar quick-poll, cron, backoff)

### Hoy (jueves 26/03)

- [x] Conectar worker de BullMQ al processor (para que los jobs se ejecuten)

### Viernes 27/03

- [x] Credenciales dinámicas por tenant (tabla `tenant_hacienda_config`)
- [x] Cifrado AES-256-GCM para credenciales en BD
- [x] Refactor HaciendaService para recibir credenciales dinámicas
- [x] Token cache por tenant (no singleton global)

### Lunes 30/03

- [x] Timeout + retry en fetch (HaciendaService)
- [x] Cron de reconciliación (safety net)
- [x] Limpieza: eliminar columnas `check_attempts`, `next_check_at` (migración SQL)

### Martes 31/03 (deadline)

- [ ] Testing: processor, batch dispatcher, reconciliación, TTL
- [ ] Revisión final y entrega

---

## Dependencias nuevas

```json
{
  "bullmq": "^5.x",
  "@nestjs/bullmq": "^11.x",
  "ioredis": "^5.x"
}
```

```json
// devDependencies
{
  "ioredis-mock": "^8.x"
}
```

## Variables de entorno nuevas

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
EINVOICE_TTL_HOURS=3
EINVOICE_BATCH_CRON=0 */2 * * *
EINVOICE_REQUEST_GAP_MS=5000
```