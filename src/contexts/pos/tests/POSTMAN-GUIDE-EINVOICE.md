# Guia Postman: Flujo completo Venta + Factura Electronica

## Prerequisitos

1. **Docker corriendo** con PostgreSQL + Redis:
   ```bash
   docker compose -f docker-compose.dev.yml up -d
   ```
2. **Bootstrap SQL aplicado** (automatico con docker-init si es primera vez)
3. **Variables de entorno** en `.env`:
   ```env
   HACIENDA_MOCK=true
   ENCRYPTION_KEY=<64 caracteres hex — ver Paso 4>
   ```
4. **Servidor corriendo**:
   ```bash
   npm run start:dev
   ```

---

## Variables a capturar

A lo largo de la guia, cada respuesta devuelve IDs que necesitas
para pasos siguientes. Crea estas variables en Postman (pestaña
**Environment**):

| Variable            | Se obtiene en |
| ------------------- | ------------- |
| `tenantId`          | Paso 1        |
| `branchId`          | Paso 0 (SQL)  |
| `turnId`            | Paso 0 (SQL)  |
| `userId`            | Paso 2        |
| `authCookie`        | Paso 3        |
| `cashRegisterId`    | Paso 5        |
| `cashRegSessionId`  | Paso 6        |
| `customerId`        | Paso 7        |
| `variantId`         | Paso 8        |
| `saleId`            | Paso 9        |
| `saleIdWithEInv`    | Paso 11       |

---

## Paso 0 — Bootstrap SQL (una sola vez)

Ejecutar en pgAdmin o `psql`. La sucursal y el turno no se pueden
crear via HTTP sin un usuario autenticado, pero el usuario necesita
una sucursal. Se rompe el ciclo con SQL directo.

```sql
-- Primero crea el tenant (Paso 1 via Postman) y copia el tenant_id aqui:

-- 1. Crear sucursal principal
INSERT INTO general_schema.branch
  (tenant_id, branch_name, branch_number, is_main_branch)
VALUES
  ('<tenantId>', 'Sucursal Central', '001', true)
RETURNING branch_id;
-- → Guardar branch_id en variable {{branchId}}

-- 2. Crear turno de trabajo
INSERT INTO hr_schema.turn (branch_id, entry, out)
VALUES ('<branchId>', '08:00', '17:00')
RETURNING turn_id;
-- → Guardar turn_id en variable {{turnId}} (normalmente 1)
```

> **Orden real**: Primero haces Paso 1 (crear tenant), copias el
> `tenant_id`, luego vuelves aqui a ejecutar el SQL, y despues
> continuas con Paso 2.

---

## Paso 1 — Crear Tenant

```
POST http://localhost:3000/api/v1/tenant
Content-Type: application/json
```

**Body:**
```json
{
  "tenant_name": "Daniel Karim Alchaar Saab",
  "contact_email": "demo@distribuidora.cr",
  "region_id": 1,
  "identification": "3140001694",
  "economic_activity": "722001",
  "sign": "DKA",
  "is_subscribed": true
}
```

**Respuesta esperada:**
```json
{
  "tenant_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "tenant_name": "Daniel Karim Alchaar Saab",
  ...
}
```

> Copiar `tenant_id` → variable `{{tenantId}}`
>
> **Ahora ejecuta el SQL del Paso 0** con este tenant_id.

---

## Paso 2 — Crear Usuario Admin

```
POST http://localhost:3000/api/v1/user
Content-Type: application/json
```

**Body:**
```json
{
  "tenant_id": "{{tenantId}}",
  "email": "admin@distribuidora.cr",
  "password": "Admin1234!",
  "role_id": 1,
  "employeeInfo": {
    "tenant_id": "{{tenantId}}",
    "branch_id": "{{branchId}}",
    "first_name": "Carlos",
    "last_name": "Mora",
    "doc_number": "106780000",
    "phone": "60001111",
    "email": "admin@distribuidora.cr",
    "payment_schedule_id": 1,
    "contractData": {
      "start_date": "2025-01-01",
      "end_date": "2026-01-01",
      "hours": 40,
      "base_salary": 500000,
      "duties": "Administracion general",
      "turn_type": 1,
      "turn_id": {{turnId}}
    }
  }
}
```

**Respuesta esperada:** objeto con `user_id`

> Copiar `user_id` → variable `{{userId}}`

---

## Paso 3 — Login

```
POST http://localhost:3000/api/v1/auth/login
Content-Type: application/json
```

**Body:**
```json
{
  "email": "admin@distribuidora.cr",
  "password": "Admin1234!"
}
```

**Respuesta esperada:**
```json
{
  "message": "Login successful",
  "user": {
    "user_id": "...",
    "email": "admin@distribuidora.cr",
    "tenant_id": "...",
    "role_id": 1
  }
}
```

> En Postman, la cookie `auth_token` se guarda automaticamente.
> Verificar en la pestaña **Cookies** que aparezca `auth_token`
> para `localhost`.
>
> Si usas los headers manualmente:
> `Cookie: auth_token=<valor del token>`

---

## Paso 4 — Seed: CABYS + Credenciales Hacienda

### 4a. Generar ENCRYPTION_KEY (si no tienes una)

Ejecuta en tu terminal:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copia el resultado (64 caracteres hex) y ponlo en tu `.env`:

```env
ENCRYPTION_KEY=<el valor generado>
```

**Reinicia el servidor** despues de agregar esta variable.

### 4b. Insertar entradas CABYS en catalogo

Ejecutar en pgAdmin/psql — son las entradas del catalogo de Hacienda
que usaran los productos:

```sql
INSERT INTO general_schema.product (cabys_code, product_name)
VALUES ('0111100009900', 'Articulos de oficina y papeleria')
ON CONFLICT (cabys_code) DO NOTHING;
```

### 4c. Guardar credenciales de Hacienda para el tenant

> Requiere auth cookie del Paso 3 (nivel 4).

```
POST http://localhost:3000/api/v1/tenant-hacienda-config
Content-Type: application/json
Cookie: auth_token=<token>
```

**Body:**
```json
{
  "tenant_id": "{{tenantId}}",
  "hacienda_username": "nite-3140001694@stag.comprobanteselectronicos.go.cr",
  "hacienda_password": "tu-password-de-hacienda",
  "hacienda_client_id": "api-stag",
  "p12_base64": "<contenido base64 de tu archivo .p12>",
  "p12_password": "tu-password-del-p12"
}
```

**Respuesta esperada:**
```json
{
  "tenant_hacienda_config_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

> Las credenciales se cifran con AES-256-GCM antes de guardarse en BD.
> El endpoint nunca devuelve los valores en plaintext.
>
> **Para obtener el base64 del P12**, ejecuta en terminal:
> ```bash
> base64 -w 0 tu-certificado.p12
> ```
> (en Windows con Git Bash, o `certutil -encode` en cmd)
>
> **Para verificar a quien pertenece el P12**, ejecuta:
> ```bash
> openssl pkcs12 -in tu-certificado.p12 -nokeys -clcerts | openssl x509 -subject -noout
> ```
>
> **CRITICO**: El RUC/cedula embebido en el certificado P12 **debe coincidir**
> con el campo `identification` del tenant (Paso 1). Si no coinciden,
> Hacienda rechaza con error -60: "El contribuyente que firma la factura
> electronica no es el emisor." El ROPC (username/password) y el P12 son
> mecanismos independientes — el token puede funcionar pero la firma ser
> rechazada si el P12 no pertenece al emisor.
>
> **IMPORTANTE**: Si `HACIENDA_MOCK=true`, las credenciales de Hacienda
> (username/password) no se usan realmente para autenticarse. Pero el
> P12 **si se usa** para firmar el XML. Si no tienes un certificado P12
> real, el paso 11 (venta con e-invoice) devolvera un warning en vez de
> fallar la venta.

### 4d. Verificar que las credenciales quedaron guardadas

```
GET http://localhost:3000/api/v1/tenant-hacienda-config/{{tenantId}}
Cookie: auth_token=<token>
```

**Respuesta esperada:**
```json
{
  "configured": true,
  "hacienda_client_id": "api-stag",
  "has_p12": true
}
```

> Si `configured: false`, el POST del paso anterior fallo.
> Si `has_p12: false`, el campo `p12_base64` no era base64 valido.

---

## Paso 5 — Crear Caja Registradora

> Requiere auth cookie del Paso 3.

```
POST http://localhost:3000/api/v1/cash-register
Content-Type: application/json
Cookie: auth_token=<token>
```

**Body:**
```json
{
  "branch_id": "{{branchId}}",
  "register_name": "Caja Principal",
  "is_active": true
}
```

**Respuesta esperada:** objeto con `cash_register_id`

> Copiar `cash_register_id` → variable `{{cashRegisterId}}`

---

## Paso 6 — Abrir Sesion de Caja

```
POST http://localhost:3000/api/v1/cash-register/start
Content-Type: application/json
Cookie: auth_token=<token>
```

**Body:**
```json
{
  "cash_register_id": "{{cashRegisterId}}",
  "opening_amount": 100000,
  "opened_at": "2025-06-01T08:00:00.000Z"
}
```

**Respuesta esperada:** objeto con `cash_register_session_id`

> Copiar `cash_register_session_id` → variable `{{cashRegSessionId}}`

---

## Paso 7 — Crear Cliente

```
POST http://localhost:3000/api/v1/customers
Content-Type: application/json
```

**Body:**
```json
{
  "tenant_id": "{{tenantId}}",
  "first_name": "Maria",
  "last_name": "Rodriguez Vega",
  "document_type_id": 1,
  "document_number": "106780001",
  "economic_activity": "722001",
  "email": "maria.rodriguez@gmail.com",
  "phone": "60001234",
  "address": "San Jose, Escazu, Costa Rica",
  "is_tenant": false
}
```

**Respuesta esperada:** objeto con `tenant_customer_id`

> Copiar `tenant_customer_id` → variable `{{customerId}}`

---

## Paso 8 — Crear Producto con CABYS

```
POST http://localhost:3000/api/v1/product
Content-Type: application/json
```

**Body:**
```json
{
  "products": [
    {
      "tenant_id": "{{tenantId}}",
      "sku": "PROD-001",
      "variant_name": "Cuaderno universitario 100 hojas",
      "unit_price": 1500,
      "cabys_code": "0111100009900"
    }
  ]
}
```

**Respuesta esperada:** array con los productos creados, cada uno con
`product_variant_id`

> Copiar el `product_variant_id` del primer elemento → variable `{{variantId}}`

---

## Paso 9 — Crear Venta SIN factura electronica

Verifica que el flujo basico funcione antes de probar e-invoice.

**Calculo:**
- 2 x Cuaderno a 1,500 = 3,000
- IVA 13% = 390
- Total = 3,390

```
POST http://localhost:3000/api/v1/sale
Content-Type: application/json
```

**Body:**
```json
{
  "branch_id": "{{branchId}}",
  "currency_id": 1,
  "tenant_id": "{{tenantId}}",
  "tenant_customer_id": "{{customerId}}",
  "sale_condition": "01",
  "sale_date": "2025-06-01T10:30:00.000Z",
  "subtotal_amount": 3000.00,
  "tax_amount": 390.00,
  "total_amount": 3390.00,
  "is_completed": true,
  "has_electronic_invoice": false,
  "items": [
    {
      "tenant_id": "{{tenantId}}",
      "product_variant_id": "{{variantId}}",
      "quantity": 2,
      "unit_price": 1500.00,
      "total_price": 3000.00
    }
  ],
  "payments": [
    {
      "tenant_customer_id": "{{customerId}}",
      "payment_method_id": 1,
      "is_points_redemption": false,
      "points_redeemed": 0,
      "points_to_currency_rate": 0,
      "payment_amount": 3390.00,
      "payment_date": "2025-06-01T10:30:00.000Z",
      "currency_id": 1,
      "verified": true
    }
  ]
}
```

**Respuesta esperada:**
```json
{
  "saleId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

> Copiar `saleId` → variable `{{saleId}}`

---

## Paso 10 — Verificar factura digital

```
GET http://localhost:3000/api/v1/invoice/{{tenantId}}
```

**Respuesta esperada:** array con al menos 1 factura digital
(`digital_sale_invoice`) asociada al sale_id del paso 9.

Tambien puedes verificar detalle:

```
GET http://localhost:3000/api/v1/invoice/details/{{saleId}}
```

> Si ves la factura digital, el flujo basico esta OK.

---

## Paso 11 — Crear Venta CON factura electronica

La unica diferencia es `has_electronic_invoice: true`.

```
POST http://localhost:3000/api/v1/sale
Content-Type: application/json
```

**Body:**
```json
{
  "branch_id": "{{branchId}}",
  "currency_id": 1,
  "tenant_id": "{{tenantId}}",
  "tenant_customer_id": "{{customerId}}",
  "sale_condition": "01",
  "sale_date": "2025-06-02T10:30:00.000Z",
  "subtotal_amount": 3000.00,
  "tax_amount": 390.00,
  "total_amount": 3390.00,
  "is_completed": true,
  "has_electronic_invoice": true,
  "items": [
    {
      "tenant_id": "{{tenantId}}",
      "product_variant_id": "{{variantId}}",
      "quantity": 2,
      "unit_price": 1500.00,
      "total_price": 3000.00
    }
  ],
  "payments": [
    {
      "tenant_customer_id": "{{customerId}}",
      "payment_method_id": 1,
      "is_points_redemption": false,
      "points_redeemed": 0,
      "points_to_currency_rate": 0,
      "payment_amount": 3390.00,
      "payment_date": "2025-06-02T10:30:00.000Z",
      "currency_id": 1,
      "verified": true
    }
  ]
}
```

**Respuesta esperada (exito):**
```json
{
  "saleId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

**Respuesta con warning (P12 invalido o credenciales mal):**
```json
{
  "saleId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "eInvoiceWarning": "El tenant no tiene credenciales de Hacienda configuradas"
}
```

> Si ves `eInvoiceWarning`, la venta se creo correctamente pero la
> factura electronica fallo. Revisa el Paso 4.
>
> Si no hay warning, la factura electronica se genero exitosamente.
>
> Copiar `saleId` → variable `{{saleIdWithEInv}}`

---

## Paso 12 — Verificar factura electronica

```
GET http://localhost:3000/api/v1/sale/{{saleIdWithEInv}}/e-invoice
```

**Respuesta esperada:** array con la factura electronica:
```json
[
  {
    "electronic_sale_invoice_id": "...",
    "sale_id": "...",
    "key_number": "506...",
    "consecutive_number": "001001001...",
    "hacienda_status": 1,
    ...
  }
]
```

- `hacienda_status = 1` → "procesando" (enviada, esperando respuesta)
- `key_number` → clave de 50 digitos
- `consecutive_number` → consecutivo de 20 digitos

> La resolucion del estado ocurre **automaticamente** via BullMQ:
> - Cada **2 horas**: el batch dispatcher encola las facturas pendientes
> - Cada **30 minutos**: el cron de reconciliacion re-encola huerfanas
> - El worker consulta Hacienda (mock → `aceptado` inmediato)
> - El status se actualiza a `2` (aceptado) en BD
>
> Puedes esperar al proximo ciclo o forzarlo — ver Paso 13.

---

## Paso 13 — (Opcional) Verificar/Forzar resolucion via Redis

### Opcion A: Esperar al cron

El batch dispatcher corre segun `EINVOICE_BATCH_CRON` (default: cada
2 horas). El reconciliation cron corre cada 30 minutos. Cuando se
ejecute, con `HACIENDA_MOCK=true` el status se resuelve a `aceptado`
inmediatamente.

### Opcion B: Forzar via endpoint

Puedes disparar la creacion de e-invoice manualmente para una venta
que no la tenga (util si el paso 11 fallo parcialmente):

```
POST http://localhost:3000/api/v1/sale/{{saleIdWithEInv}}/e-invoice
```

### Opcion C: Verificar jobs en Redis (RedisInsight)

Si tienes RedisInsight corriendo (`http://localhost:5540`):

1. Conectar a `localhost:6379`
2. Buscar keys que empiecen con `bull:einvoice-status:`
3. Veras los jobs en estado `waiting`, `delayed`, o `completed`

### Verificar resolucion

Despues de que el worker procese el job, volver a consultar:

```
GET http://localhost:3000/api/v1/sale/{{saleIdWithEInv}}/e-invoice
```

**Respuesta esperada (ya resuelta):**
```json
[
  {
    "electronic_sale_invoice_id": "...",
    "hacienda_status": 2,
    "hacienda_response_xml": "...",
    ...
  }
]
```

- `hacienda_status = 2` → aceptado
- `hacienda_status = 3` → rechazado
- `hacienda_status = 4` → timeout (TTL expirado, default 3hrs)

---

## Paso 14 — Cerrar Sesion de Caja

```
POST http://localhost:3000/api/v1/cash-register/close
Content-Type: application/json
Cookie: auth_token=<token>
```

**Body:**
```json
{
  "cash_register_session_id": "{{cashRegSessionId}}",
  "closing_amount": 106780.00,
  "closed_at": "2025-06-02T18:00:00.000Z"
}
```

---

## Paso 15 — Consultas de verificacion final

Ejecutar estos GETs para validar que todo quedo correcto:

| Que verificar                   | Request                                                  |
| ------------------------------- | -------------------------------------------------------- |
| Ventas de la sucursal           | `GET /api/v1/sale/{{branchId}}`                                 |
| Items de una venta              | `GET /api/v1/items/{{saleId}}`                                  |
| Facturas digitales del tenant   | `GET /api/v1/invoice/{{tenantId}}`                              |
| Factura electronica de la venta | `GET /api/v1/sale/{{saleIdWithEInv}}/e-invoice`                 |
| E-invoices de la sucursal       | `GET /api/v1/sale/e-invoice/branch/{{branchId}}`                |
| Clientes del tenant             | `GET /api/v1/customers/tenant/{{tenantId}}`                     |
| Cajas de la sucursal            | `GET /api/v1/cash-register?branch_id={{branchId}}`              |
| Config Hacienda del tenant      | `GET /api/v1/tenant-hacienda-config/{{tenantId}}`        |

---

## Resumen del flujo interno

```
POST /sale (has_electronic_invoice: true)
  │
  ├── [TRANSACCION]
  │   ├── INSERT sale
  │   ├── INSERT sale_items (bulk)
  │   ├── INSERT customer_payments (bulk)
  │   ├── INSERT digital_sale_invoice
  │   └── INSERT journal_entries (contabilidad)
  │
  ├── COMMIT
  │
  └── [POST-COMMIT] EInvoiceService.createEInvoiceForSale()
      ├── Valida: venta completada, items con CABYS, d-invoice existe
      ├── Genera: consecutivo (20 chars) + clave (50 chars) + QR
      ├── Firma XML con P12 (XAdES-BES)
      ├── Envia a Hacienda (mock → accepted inmediato)
      ├── INSERT electronic_sale_invoice (status=1 "procesando")
      ├── INSERT electronic_sale_invoice_items
      └── UPDATE sale SET already_invoiced = true

[CADA 2 HORAS] EInvoiceBatchDispatcher
  ├── SELECT facturas pendientes (status=1, < TTL)
  ├── Filtra las que ya tienen job activo en Redis
  └── Encola las nuevas en "einvoice-status"

[WORKER BullMQ] EInvoiceStatusProcessor
  ├── GET /recepcion/{clave} en Hacienda (mock → "aceptado")
  ├── Si resuelto → UPDATE status (2=aceptado / 3=rechazado)
  ├── Si pendiente → Re-encola con delay 2hrs
  └── Si TTL expirado → UPDATE status=4 (timeout)
```

---

## Troubleshooting

| Problema                                               | Solucion                                                                            |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| `eInvoiceWarning: "no tiene credenciales de Hacienda"` | Ejecutar Paso 4c (POST credenciales) y verificar con 4d                             |
| `ENCRYPTION_KEY env var not set`                        | Agregar `ENCRYPTION_KEY` a `.env` y reiniciar servidor                              |
| `ENCRYPTION_KEY must be 64 hex chars`                   | Generar con `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| E-invoice se crea pero status nunca cambia de 1         | Verificar que Redis esta corriendo y el worker esta activo (ver logs del servidor)   |
| `La venta no tiene factura digital generada`            | El d-invoice se crea dentro de la transaccion. Si falla, revisar logs de error      |
| `productos no tienen codigo CABYS asignado`             | Ejecutar Paso 4b y verificar que el producto se creo con `cabys_code`               |
| Hacienda error -60: "firmante no es el emisor"          | El P12 no corresponde al `identification` del tenant. Verificar con `openssl` a quien pertenece el P12 y que coincida con el tenant |
| 401 en `/cash-register`                                 | La cookie `auth_token` expiro. Repetir Paso 3 (login)                               |
