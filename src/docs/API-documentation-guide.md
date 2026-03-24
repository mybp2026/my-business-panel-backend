# Cómo documentar la API

Este proyecto documenta los endpoints usando **archivos `.doc.ts` separados** del código de negocio.
La idea es simple: el controlador y los DTOs solo hacen referencia a la documentación, no la contienen.

---

## Regla 1 — Un archivo `.doc.ts` por cada método del controlador

Cada método (endpoint) tiene su propio archivo de documentación. No mezcles la doc de varios endpoints en un solo archivo.

```
docs/
└── contexts/
    └── general/
        └── auth/
            ├── login.doc.ts    ← solo documenta POST /auth/login
            ├── logout.doc.ts   ← solo documenta POST /auth/logout
            └── index.ts
```

**Nomenclatura:** usa el nombre del método del controlador en `kebab-case`.

| Método del controlador | Nombre del archivo         |
| ---------------------- | -------------------------- |
| `createUser`           | `create-user.doc.ts`       |
| `getUserByEmail`       | `get-user-by-email.doc.ts` |
| `assignRole`           | `assign-role.doc.ts`       |
| `getSelfInfo`          | `get-self-info.doc.ts`     |

---

## Regla 2 — Todos los `.doc.ts` se exportan desde un `index.ts`

El `index.ts` es un barrel: solo re-exporta, no define nada.

```ts
// src/docs/contexts/general/auth/index.ts
export * from './login.doc';
export * from './logout.doc';
```

El controlador importa todo desde el `index.ts`:

```ts
import { loginDoc, logoutDoc } from '@/docs/contexts/general/auth';
```

---

## Regla 3 — Estructura fija de cada `.doc.ts`

Cada archivo exporta una constante con el nombre `[nombreMetodo]Doc` y tiene hasta tres secciones:

```ts
export const miMetodoDoc = {
  // SECCIÓN 1: solo si el endpoint recibe un body (DTO)
  dto: {
    nombreCampo: {
      description: 'Qué representa este campo.',
      example: 'valor de ejemplo',
    },
    // un objeto por cada campo del DTO
  },

  // SECCIÓN 2: siempre presente
  operation: {
    summary: 'Título corto del endpoint.',
    description: 'Descripción más larga de qué hace el endpoint.',
  },

  // SECCIÓN 3: siempre presente
  responses: {
    200: {
      status: 200,
      description: 'Descripción del caso exitoso',
      schema: {
        type: 'object',
        properties: {
          // campos que retorna la respuesta
        },
      },
    },
    401: {
      status: 401,
      description: 'No autorizado',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Unauthorized' },
        },
      },
    },
    // agrega solo los códigos que el endpoint realmente puede retornar
  },
};
```

> Si el endpoint **no recibe body** (p.ej. un GET sin parámetros), omite la sección `dto` completamente.

---

## Regla 4 — Lee el servicio para identificar las respuestas posibles

Antes de escribir la sección `responses`, abre el archivo de servicio asociado al método y busca:

- **¿Qué retorna el método en el caso exitoso?** → ese es el `200`.
- **¿Qué errores lanza (`throw`)?** → cada error es una respuesta adicional (`400`, `404`, `409`, etc.).
- **¿Puede retornar `null`?** → probablemente es un `404`.

**Ejemplo:** al documentar `getUserByEmail`, el servicio dice:

```ts
async getUserByEmail(email: string): Promise<IUserResult | null> {
  const fetchedData = await this.db.query(users.byEmailWithPassword, [email]);
  if (fetchedData.rows.length === 0) return null; // <-- posible 404
  return fetchedData.rows[0];                      // <-- respuesta 200
}
```

Entonces el doc debe tener respuestas `200` y `404`.

---

## Regla 5 — La carpeta del doc sigue la ruta del controlador

La estructura de carpetas dentro de `src/docs/` replica la estructura de `src/contexts/`.

```
src/
├── contexts/
│   └── general/
│       └── modules/
│           └── user/          ← controlador de /user
│               └── user.controller.ts
│
└── docs/
    └── contexts/
        └── general/
            └── user/          ← docs del controlador de /user
                ├── create-user.doc.ts
                ├── assign-role.doc.ts
                ├── get-self-info.doc.ts
                ├── get-user-by-email.doc.ts
                └── index.ts
```

---

## Regla 6 — Cómo se usa en el controlador y en el DTO

**En el controlador**, aplica los decoradores de Swagger referenciando el doc:

```ts
@ApiOperation(miMetodoDoc.operation)
@ApiResponse(miMetodoDoc.responses[200])
@ApiResponse(miMetodoDoc.responses[404])
@Get(':email')
async getUserByEmail(@Param('email') email: string) { ... }
```

**En el DTO**, aplica `@ApiProperty` referenciando la sección `dto`:

```ts
import { miMetodoDoc } from '@/docs/contexts/general/[modulo]';

export class MiDto {
  @ApiProperty(miMetodoDoc.dto.nombreCampo)
  @IsString()
  nombreCampo!: string;
}
```

---

## Ejemplo completo — Módulo `user`

El controlador `UserController` tiene los siguientes endpoints:

| Método HTTP | Ruta           | Método del controlador | ¿Tiene DTO? |
| ----------- | -------------- | ---------------------- | ----------- |
| `POST`      | `/user`        | `createUser`           | Sí          |
| `PUT`       | `/user`        | `assignRole`           | Sí          |
| `GET`       | `/user/roles`  | `getUserRoles`         | No          |
| `GET`       | `/user`        | `getSelfInfo`          | No          |
| `GET`       | `/user/:email` | `getUserByEmail`       | No          |

A continuación se muestra cómo quedaría la documentación para tres de estos métodos.

---

### `get-self-info.doc.ts`

> El servicio retorna `{ email, role, tenant }`. No lanza errores propios, pero requiere autenticación (puede dar 401).

```ts
// src/docs/contexts/general/user/get-self-info.doc.ts
export const getSelfInfoDoc = {
  operation: {
    summary: 'Get current user info',
    description:
      'Returns the profile information of the currently authenticated user, including their role and tenant.',
  },

  responses: {
    200: {
      status: 200,
      description: 'User info retrieved successfully',
      schema: {
        type: 'object',
        properties: {
          email: { type: 'string', example: 'johndoe@mybp.com' },
          role: {
            type: 'object',
            properties: {
              role_id: { type: 'number', example: 1 },
              name: { type: 'string', example: 'Admin' },
            },
          },
          tenant: {
            type: 'object',
            properties: {
              tenant_id: {
                type: 'string',
                example: '123e4567-e89b-12d3-a456-426614174000',
              },
              name: { type: 'string', example: 'Acme Corp' },
            },
          },
        },
      },
    },
    401: {
      status: 401,
      description: 'Unauthorized - Missing or invalid authentication token',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Unauthorized' },
        },
      },
    },
  },
};
```

---

### `assign-role.doc.ts`

> El servicio solo ejecuta una query y retorna `{ message: 'role assigned successfully!' }`. No lanza errores propios.

```ts
// src/docs/contexts/general/user/assign-role.doc.ts
export const assignRoleDoc = {
  dto: {
    user_id: {
      description: 'The UUID of the user to whom the role will be assigned.',
      example: '123e4567-e89b-12d3-a456-426614174000',
    },
    role_id: {
      description: 'The numeric ID of the role to assign.',
      example: 2,
    },
  },

  operation: {
    summary: 'Assign a role to a user',
    description: 'Updates the role of an existing user within the system.',
  },

  responses: {
    200: {
      status: 200,
      description: 'Role assigned successfully',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'role assigned successfully!' },
        },
      },
    },
    401: {
      status: 401,
      description: 'Unauthorized - Missing or invalid authentication token',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Unauthorized' },
        },
      },
    },
  },
};
```

---

### `get-user-by-email.doc.ts`

> El servicio puede retornar `null` si el usuario no existe → `404`.

```ts
// src/docs/contexts/general/user/get-user-by-email.doc.ts
export const getUserByEmailDoc = {
  operation: {
    summary: 'Get user by email',
    description: 'Retrieves a user record by their email address.',
  },

  responses: {
    200: {
      status: 200,
      description: 'User found',
      schema: {
        type: 'object',
        properties: {
          user_id: {
            type: 'string',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
          email: { type: 'string', example: 'johndoe@mybp.com' },
          tenant_id: {
            type: 'string',
            example: '123e4567-e89b-12d3-a456-426614174000',
          },
          role_id: { type: 'number', example: 1 },
        },
      },
    },
    401: {
      status: 401,
      description: 'Unauthorized - Missing or invalid authentication token',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Unauthorized' },
        },
      },
    },
    404: {
      status: 404,
      description: 'User not found',
      schema: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'User not found' },
        },
      },
    },
  },
};
```

---

### `index.ts`

```ts
// src/docs/contexts/general/user/index.ts
export * from './get-self-info.doc';
export * from './assign-role.doc';
export * from './get-user-by-email.doc';
// agregar aquí los demás docs a medida que se creen
```

---

### Cómo queda el controlador con la documentación aplicada

```ts
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  assignRoleDoc,
  getSelfInfoDoc,
  getUserByEmailDoc,
} from '@/docs/contexts/general/user';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation(assignRoleDoc.operation)
  @ApiResponse(assignRoleDoc.responses[200])
  @ApiResponse(assignRoleDoc.responses[401])
  @Put()
  async assignRole(@Body() assignRoleDto: AssignRoleDto) {
    return this.userService.assignRole(assignRoleDto);
  }

  @ApiOperation(getSelfInfoDoc.operation)
  @ApiResponse(getSelfInfoDoc.responses[200])
  @ApiResponse(getSelfInfoDoc.responses[401])
  @Get()
  getSelfInfo(@Session() session: IUserSession) {
    return this.userService.getSelfInfo(session);
  }

  @ApiOperation(getUserByEmailDoc.operation)
  @ApiResponse(getUserByEmailDoc.responses[200])
  @ApiResponse(getUserByEmailDoc.responses[401])
  @ApiResponse(getUserByEmailDoc.responses[404])
  @Get(':email')
  async getUserByEmail(@Param('email') email: string) {
    return this.userService.getUserByEmail(email);
  }
}
```

### Cómo queda el DTO con la documentación aplicada

```ts
import { assignRoleDoc } from '@/docs/contexts/general/user';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class AssignRoleDto {
  @ApiProperty(assignRoleDoc.dto.user_id)
  @IsString()
  @IsNotEmpty()
  user_id!: string;

  @ApiProperty(assignRoleDoc.dto.role_id)
  @IsNumber()
  @IsNotEmpty()
  role_id!: number;
}
```

---

## Prompt de IA para generar archivos `.doc.ts`

Copia este prompt en el chat con el asistente de IA. Reemplaza las secciones entre `< >` con el código real.

```
Eres un asistente especializado en documentación de APIs con NestJS y Swagger.
Vas a generar archivos .doc.ts siguiendo un patrón específico de este proyecto.

## REGLAS DEL PATRÓN

Cada archivo .doc.ts exporta UNA constante con esta estructura:

  export const [nombreMetodo]Doc = {
    dto: {              // SOLO si el endpoint recibe un body
      [campo]: {
        description: string,
        example: any,
      }
    },
    operation: {
      summary: string,        // título corto
      description: string,    // descripción más larga
    },
    responses: {
      [statusCode]: {
        status: number,
        description: string,
        schema: {
          type: 'object',
          properties: { ... }
        }
      }
    }
  }

## PARA IDENTIFICAR LAS RESPUESTAS

- El caso exitoso (200) se extrae de lo que retorna el método del servicio.
- Cada `throw` en el servicio implica una respuesta de error (400, 404, 409, etc.).
- Si el método puede retornar `null`, agrega una respuesta 404.
- Si el endpoint usa `AuthenticationGuard`, siempre agrega una respuesta 401.

## TAREA

Genera el archivo .doc.ts para el siguiente método del controlador.

### Método del controlador:
<pega aquí el método del controlador>

### Método del servicio asociado:
<pega aquí el método del servicio>

### DTO (si aplica):
<pega aquí la clase DTO, o escribe "No aplica">

Genera únicamente el contenido del archivo .doc.ts, sin explicaciones adicionales.
```
