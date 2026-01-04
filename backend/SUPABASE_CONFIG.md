# Configuración de Supabase

## Obtener Credenciales de Conexión

### 1. Ir al Dashboard de Supabase
https://supabase.com/dashboard/project/hkepastqekfrckyppbnp

### 2. Navegar a Settings → Database
En el menú lateral izquierdo:
- Click en el ícono de **Settings** (⚙️)
- Seleccionar **Database**

### 3. Obtener Connection String
En la sección "Connection string", verás diferentes opciones:

#### Opción A: Connection Pooling (Recomendado para producción)
```
postgresql://postgres.hkepastqekfrckyppbnp:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**Usar en .env:**
```env
DB_HOST=aws-0-us-east-1.pooler.supabase.com
DB_PORT=6543
DB_USERNAME=postgres.hkepastqekfrckyppbnp
DB_PASSWORD=[TU-PASSWORD-AQUI]
DB_DATABASE=postgres
```

#### Opción B: Direct Connection
```
postgresql://postgres:[YOUR-PASSWORD]@db.hkepastqekfrckyppbnp.supabase.co:5432/postgres
```

**Usar en .env:**
```env
DB_HOST=db.hkepastqekfrckyppbnp.supabase.co
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=[TU-PASSWORD-AQUI]
DB_DATABASE=postgres
```

### 4. Password
Si no tienes la contraseña guardada:
1. Ve a Settings → Database
2. Busca la sección "Database password"
3. Puedes resetear la contraseña si es necesario
4. **IMPORTANTE**: Guarda la nueva contraseña en un lugar seguro

### 5. Actualizar archivo .env

Edita el archivo `backend/.env`:

```env
# Database - Supabase PostgreSQL
DB_HOST=aws-0-us-east-1.pooler.supabase.com
DB_PORT=6543
DB_USERNAME=postgres.hkepastqekfrckyppbnp
DB_PASSWORD=TU_PASSWORD_REAL_AQUI
DB_DATABASE=postgres
```

### 6. Reiniciar el servidor

```bash
cd backend
npm run start:dev
```

## Verificar Conexión

Si la conexión es exitosa, verás en los logs:

```
[Nest] LOG [InstanceLoader] TypeOrmCoreModule dependencies initialized
[Nest] LOG [RoutesResolver] UsersController {/api/users}
[Nest] LOG [RouterExplorer] Mapped {/api/users, GET} route
🚀 Application is running on: http://localhost:3000/api
📚 Swagger docs available at: http://localhost:3000/api/docs
```

## Solución de Problemas

### Error: "Tenant or user not found"
- Verifica que el password sea correcto
- Asegúrate de usar el formato correcto de username (con o sin el prefijo `postgres.`)

### Error: "Connection timeout"
- Verifica tu firewall
- Asegúrate de que el puerto esté abierto
- Intenta con direct connection (puerto 5432) en lugar de pooler (6543)

### Error: "SSL connection required"
- Supabase requiere SSL. El archivo `ormconfig.ts` ya está configurado para esto.

## Información del Proyecto Supabase

- **Project ID**: hkepastqekfrckyppbnp
- **Region**: US East (N. Virginia)
- **Database Version**: PostgreSQL 15
- **URL Dashboard**: https://supabase.com/dashboard/project/hkepastqekfrckyppbnp

## Siguientes Pasos

Una vez conectado exitosamente:

1. Crear las tablas ejecutando las migraciones
2. Crear un usuario admin inicial
3. Probar los endpoints en Swagger
4. Configurar Row Level Security (RLS) en Supabase si es necesario
