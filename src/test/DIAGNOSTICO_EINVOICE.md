# Guía de Diagnóstico - Error de Facturación Electrónica (E-Invoice)

## 🔍 Cambios Implementados

Se ha mejorado el archivo `HaciendaService` para proporcionar logging detallado que permita identificar exactamente dónde está fallando el envío de facturas electrónicas a Hacienda.

### Cambios Realizados:

1. **Logger de NestJS integrado**
   - Antes: `console.log` y `console.error`
   - Ahora: `Logger` oficial de NestJS para mejor control

2. **Nueva función `decodeJWT()`**
   - Decodifica tokens JWT (sin verificar firma)
   - Permite inspeccionar el contenido del token
   - Útil para validar que el token es un JWT válido

3. **Logging detallado en `getAccessToken()`**
   - URL del IDP siendo usado
   - Credenciales siendo enviadas (sin exponer password)
   - Respuesta completa del IDP
   - Tipo y contenido del token (si es JWT)
   - Campos adicionales en la respuesta del IDP
   - Tiempo de expiración del token

4. **Logging detallado en `sendInvoice()`**
   - Endpoint exacto siendo llamado
   - Primeros 50 caracteres del token
   - Authorization header completo (pero truncado)
   - Contenido del payload (sin datos Base64 grandes)
   - Respuesta de Hacienda (status, headers, body)
   - Estado final (aceptado/rechazado)

5. **Cambio de `bearer` a `Bearer`**
   - Línea 107 (antes): `Authorization: \`bearer ${token.trim()}\``
   - Ahora: `Authorization: \`Bearer ${token.trim()}\``
   - **Razón**: RFC 7235 especifica que el esquema debe ser `Bearer` con mayúscula

6. **Mejor manejo de errores**
   - Logs de error más detallados
   - Incluye respuesta completa de Hacienda en caso de fallo

---

## 🚀 Cómo Diagnosticar

### Paso 1: Ejecutar la Solicitud con Logs Habilitados

```bash
# 1. Asegúrate de que los logs de NestJS estén habilitados en producción
# En .env o configuración, verifica que el nivel de logging está en DEBUG o INFO

# 2. Ejecuta la solicitud HTTP:
POST {{baseUrl}}/sale/{{saleId}}/e-invoice
Authorization: Bearer {{tenantToken}}
```

### Paso 2: Revisar los Logs en Consola

Los logs se mostrarán en el siguiente orden:

#### Fase 1: Obtención del Token (getAccessToken)

```
[NestJS] INFO  HaciendaService Solicitando token a IDP: https://idp.comprobanteselectronicos.go.cr/auth/realms/...
[NestJS] INFO  HaciendaService Cliente: api-stag, Usuario: nite-3140001694@stag.comprobanteselectronicos.go.cr
[NestJS] LOG   HaciendaService ✓ Token obtenido de Hacienda IDP. Expira en: 3600s
[NestJS] DEBUG HaciendaService Token length: XXXX caracteres
[NestJS] DEBUG HaciendaService Primeros 50 caracteres: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
[NestJS] DEBUG HaciendaService Token es un JWT válido
[NestJS] DEBUG HaciendaService JWT Header: {"alg":"HS256","typ":"JWT"}
[NestJS] DEBUG HaciendaService JWT Payload: { "sub": "...", "exp": "...", ... }
```

**Qué revisar**:
- ¿El token se obtiene exitosamente?
- ¿Es un JWT válido?
- ¿Cuánto tiempo expira (expires_in)?
- ¿Hay campos adicionales en la respuesta del IDP?

#### Fase 2: Envío del Comprobante (sendInvoice)

```
[NestJS] LOG   HaciendaService Enviando comprobante a Hacienda...
[NestJS] DEBUG HaciendaService Endpoint: https://api-sandbox.comprobanteselectronicos.go.cr/recepcion-sandbox/v1/recepcion
[NestJS] DEBUG HaciendaService Token length: XXXX caracteres
[NestJS] DEBUG HaciendaService Primeros 50 caracteres: eyJhbGciOiJIUzI1NiIs...
[NestJS] DEBUG HaciendaService Authorization header: Bearer eyJhbGciOiJIUzI1NiIs...
[NestJS] DEBUG HaciendaService Payload: { "clave": "...", "fecha": "...", ... }
[NestJS] LOG   HaciendaService Respuesta de Hacienda: 201
[NestJS] LOG   HaciendaService ✓ Comprobante aceptado por Hacienda (201)
```

**Qué revisar**:
- ¿Es el token que se envía el mismo que se obtuvo?
- ¿Es el endpoint correcto?
- ¿Cuál es el status de la respuesta?
  - 201 = Éxito
  - 422 = Comprobante duplicado (también OK)
  - 4xx/5xx = Error

---

## 📊 Interpretación de Errores

### Error: `Invalid key=value pair (missing equal-sign)`

**Causa probable**: El Authorization header está malformado o el token no es válido para Hacienda.

**Qué revisar en los logs**:
1. ¿El token es un JWT válido?
2. ¿Cuál es el contenido del JWT (payload)?
3. ¿El Authorization header es exactamente `Bearer {token}`?
4. ¿El token tiene caracteres especiales o espacios?

### Error: `[401] Unauthorized`

**Causa probable**: El token es válido pero el IDP no lo emitió correctamente o las credenciales son incorrectas.

**Qué revisar en los logs**:
1. ¿La respuesta del IDP fue 200 OK?
2. ¿El token tiene una estructura correcta?
3. ¿Las credenciales en .env son correctas?

### Error: `[422] Already Received`

**Esto NO es un error** - significa que Hacienda ya recibió este comprobante anteriormente. El sistema lo trata como éxito.

### Error: `[403] Forbidden`

**Causa probable**: El certificado P12 no es válido o no está configurado correctamente en Hacienda.

**Qué revisar**:
1. ¿EINVOICE_P12_BASE64 tiene el contenido correcto?
2. ¿EINVOICE_P12_PASSWORD es correcta?
3. ¿El certificado está registrado en la plataforma de Hacienda?

---

## 🔧 Próximos Pasos para Diagnosticar

Si aún tienes el error después de implementar estos cambios:

### 1. **Captura los Logs Completos**
```bash
# Copia TODOS los logs desde que inicia getAccessToken hasta que termina sendInvoice
# Incluye toda la salida de consola
```

### 2. **Verifica la Respuesta de Hacienda**
El log mostrará: `Hacienda API Error Body: {...}`

Analiza el contenido del error de Hacienda - esto te dirá exactamente qué está mal.

### 3. **Prueba el Token por Separado**
Puedes crear un script para probar si el token es válido:

```typescript
// Script de diagnóstico
const token = 'eyJhbGciOiJIUzI1NiI...' // Token del log
const clave = '3e668234-c171-440d-...' // Clave del comprobante

// Intenta consultar el estado con este token
fetch('https://api-sandbox.comprobanteselectronicos.go.cr/recepcion-sandbox/v1/recepcion/{clave}', {
  headers: { Authorization: `Bearer ${token}` }
})
```

### 4. **Contacta a Hacienda**
Si los logs muestran que:
- El token se obtiene correctamente
- El Authorization header es válido
- El comprobante está bien formado

Entonces contacta al soporte de Hacienda con:
- El código de error exacto
- El mensaje de error exacto (del log)
- El rango de tiempo aproximado

---

## 📝 Variables de Entorno Críticas

Verifica que estas están configuradas correctamente en `.env`:

```env
# Hacienda IDP (para obtener token)
HACIENDA_IDP_URL=https://idp.comprobanteselectronicos.go.cr/auth/realms/rut-stag/protocol/openid-connect/token
HACIENDA_CLIENT_ID=api-stag
HACIENDA_USERNAME=nite-3140001694@stag.comprobanteselectronicos.go.cr
HACIENDA_PASSWORD=xxxxxxxxxxxxx

# Hacienda API (para enviar comprobantes)
EINVOICE_API_URL=https://api-sandbox.comprobanteselectronicos.go.cr/recepcion-sandbox/v1/

# Certificado Digital (para firmar comprobantes)
EINVOICE_P12_BASE64=xxxxxxxxxxxxx
EINVOICE_P12_PASSWORD=xxxxxxxxxxxxx

# Modo Mock (para pruebas sin llamar a Hacienda real)
HACIENDA_MOCK=false
```

---

## ✅ Checklist de Diagnóstico

- [ ] Ejecuté la solicitud POST /sale/{saleId}/e-invoice
- [ ] Reviré todos los logs de getAccessToken()
- [ ] El token se obtuvo correctamente (status 200)
- [ ] El token es un JWT válido
- [ ] Reviré todos los logs de sendInvoice()
- [ ] El Authorization header es `Bearer {token}`
- [ ] El endpoint es correcto: `.../recepcion`
- [ ] Revisé la respuesta de Hacienda (status, body)
- [ ] Capturé los logs completos para compartir

---

## 🆘 Si Aún Tienes Problemas

Comparte con el equipo de soporte:

1. **Log completo** desde la solicitud HTTP hasta el error
2. **Sale ID** del comprobante que estás intentando enviar
3. **Identificación del emisor** (HACIENDA_USERNAME)
4. **Tipo de comprobante** (factura, boleta, etc.)
5. **Status HTTP** de la respuesta de Hacienda
6. **Cuerpo del error** exacto de Hacienda (del log)

---

## Archivos Modificados

- `src/contexts/pos/modules/e-invoice/hacienda/hacienda.service.ts`
  - Añadido Logger
  - Función decodeJWT()
  - Logging detallado en getAccessToken()
  - Logging detallado en sendInvoice()
  - Cambio de `bearer` a `Bearer`
  - Mejor manejo de errores

