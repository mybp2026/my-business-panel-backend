# Guía de Contribución

Este documento define el flujo de trabajo, estructura de ramas y reglas que todo el equipo de desarrollo debe seguir al colaborar en este repositorio. El objetivo es mantener un proceso ordenado, reproducible y sin conflictos, garantizando la calidad del código en cada entorno.

---

## Nuevo flujo de trabajo basado en forks

El flujo de trabajo actualizado es el siguiente:

1. **Cada desarrollador crea su propio fork** del repositorio original en GitHub.
2. **Los desarrolladores trabajan sobre la rama `development` de su fork**. Todos los cambios y commits se realizan en esta rama.
3. **Antes de empezar a trabajar cada día, sincroniza tu rama `development` con el upstream** (repositorio original):

   ```bash
   git checkout development
   git pull upstream development
   ```

   Esto asegura que trabajas sobre la versión más reciente del código base.

4. **Sube tus cambios a la rama `development` de tu fork**:

   ```bash
   git push origin development
   ```

5. **Envía un Pull Request (PR) desde la rama `development` de tu fork** comparándola con la rama `development` del repositorio original.
6. **El administrador revisa el PR y realiza el merge commit** en la rama `development` del repositorio original.

---

## Estructura de ramas

El repositorio cuenta con las siguientes ramas principales:

| Rama        | Descripción                                                                              | Política de cambios                                        |
| ----------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| master      | Ambiente de **producción**. Contiene código estable y datos reales.                      | 🔒 Solo se actualiza mediante _merge_ desde `staging`.     |
| staging     | Ambiente de **preproducción** o _QA_. Simula producción con datos no reales.             | 🔒 Solo se actualiza mediante _merge_ desde `development`. |
| development | Ambiente de **integración**. Recibe los _pull requests_ aprobados de cada desarrollador. | 🔒 Solo se actualiza mediante PRs desde forks.             |

---

## Ejemplo de flujo completo

```bash
# 1. Crear tu fork en GitHub
# 2. Clonar tu fork
git clone git@github.com:<tu-usuario>/<repositorio>.git
cd <repositorio>

# 3. Agregar el repositorio original como upstream
git remote add upstream git@github.com:<organizacion>/<repositorio>.git

# 4. Sincronizar tu rama development con upstream antes de trabajar
git checkout development
git pull upstream development

# 5. Desarrollar y hacer commits
git add .
git commit -m "feat: descripción del cambio"
git push origin development

# 6. Crear un Pull Request desde development de tu fork hacia development del repositorio original
# 7. Esperar revisión y merge por el administrador
```

---

## Reglas importantes

- **No se permite hacer push directo a las ramas `development`, `staging` o `master` del repositorio original.**
- **Todos los cambios deben pasar por Pull Request y revisión.**
  fork → development → staging → master
