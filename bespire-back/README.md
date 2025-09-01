# Bespire Backend

**Bespire Backend** es una API desarrollada con [NestJS](https://nestjs.com/) para servir como núcleo de la plataforma Bespire.

## 🚀 Características principales

- Estructura robusta basada en [NestJS](https://nestjs.com/)
- Modular y escalable
- Autenticación y autorización
- Soporte para múltiples bases de datos
- API RESTful

## 🚀 Stack

- [NestJS](https://nestjs.com/) (Typescript)
- [MongoDB](https://www.mongodb.com/)
- [Mongoose](https://mongoosejs.com/)
- [GraphQL](https://graphql.org/)
- [Apollo Server](https://www.apollographql.com/docs/apollo-server/)
- JWT Auth

## 🛠️ Requisitos

- Node.js 18+
- MongoDB corriendo localmente o en la nube (Mongo Atlas)
- Yarn (recomendado) o npm

## 🏗️ Instalación rápida

1. **Clona el repositorio**
   ```bash
   git clone https://hector62@bitbucket.org/apturalabs/bespire-app-backend.git
   cd bespire-backend
   ```

2. **Instala dependencias**
   ```bash
   npm install
   ```

3. **Configura las variables de entorno**
   Copia el archivo `.env.example` a `.env` y ajusta los valores según tu entorno.

   ```bash
   cp .env.example .env
   ```

4. **Ejecuta la aplicación**
   ```bash
   npm run start:dev
   ```

## 🛠️ Scripts útiles

- `npm run start:dev` - Inicia el servidor en modo desarrollo
- `npm run start:prod` - Inicia en modo producción
- `npm run test` - Ejecuta pruebas unitarias

## ✨ Estructura de carpetas

```ts
src/
  ├── auth/          # JWT, Guards, roles, permisos
  ├── users/         # Users, team members
  ├── requests/      # Requests, subtasks, comments, files
  ├── brands/        # Brands
  ├── workspace/     # Workspaces y lógica asociada
  └── ... 
```

## 📚 Endpoints principales

- /graphql - API GraphQL principal (Apollo)

##  🔐 Autenticación
- JWT Bearer Token en cabecera Authorization

- El token se obtiene al hacer login y debe enviarse en cada request

## 🔐 Token Management

- **JWT tokens** are used for authentication and permissions.
- The backend provides a `refreshToken` mutation to always keep your user’s JWT and permissions up to date.
- **Why?** User roles or permissions can change at any time. The frontend should call this mutation every time the app loads, and update the JWT accordingly.

**Example:**

```graphql
mutation {
  refreshToken {
    token
    user { _id, email }
  }
}
```

## 🔒 Permissions System

- All access control is handled using a fine-grained permission system.
- Permissions are defined in `/src/auth/permissions.constants.ts`.
- You can use **decorators** in your resolvers/controllers to require permissions:

```ts
@UseGuards(GqlAuthGuard, PermissionsGuard)
@Permissions(PERMISSIONS.CREATE_USERS)
async createUser(...) { ... }
```

## 🚀 Crear usuario admin y workspace desde script

```ts
npx ts-node scripts/create-admin-user-and-workspace.ts
```

Este script hace lo siguiente:

- Crea un usuario admin (admin@bespire.com) con contraseña admin123456** si no existe.

- Crea un workspace “Admin Workspace” y lo asocia como workspace principal del admin.

- El workspace se crea solo si no existe uno con ese admin como owner.

- Si el usuario admin ya tiene el workspace asociado, lo deja igual.

- Importante: Puedes personalizar el email y contraseña editando las variables ADMIN_EMAIL y ADMIN_PASSWORD dentro del script antes de ejecutarlo.

## 🧑‍💻 Contacto

- hectoracosta5@gmail.com
- [GitHub](https://github.com/hector53).