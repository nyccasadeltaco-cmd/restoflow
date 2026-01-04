# 🔧 Guía Rápida: Obtener Connection String de Supabase

## Paso 1: Ir a Settings → Database

1. Abre tu proyecto en Supabase: https://supabase.com/dashboard/project/hkepastqekfrckyppbnp
2. Click en el ícono **Settings** (⚙️) en la barra lateral izquierda
3. Click en **Database**

## Paso 2: Buscar "Connection string"

Busca la sección **Connection string** en la página.

## Paso 3: Copiar el URI

Verás algo como esto:

### Session mode (Direct connection):
```
postgresql://postgres:[YOUR-PASSWORD]@db.hkepastqekfrckyppbnp.supabase.co:5432/postgres
```

### Transaction mode (Pooler):
```
postgresql://postgres.hkepastqekfrckyppbnp:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

## Paso 4: Reemplazar [YOUR-PASSWORD]

Reemplaza `[YOUR-PASSWORD]` con: `Z\`6*k-kFP]SCzGTN+Mux`

Debe quedar así:

### Session mode:
```
postgresql://postgres:Z`6*k-kFP]SCzGTN+Mux@db.hkepastqekfrckyppbnp.supabase.co:5432/postgres
```

### Transaction mode:
```
postgresql://postgres.hkepastqekfrckyppbnp:Z`6*k-kFP]SCzGTN+Mux@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

## ⚠️ Problema Posible

Si la contraseña tiene caracteres especiales como `, [ o ], puede causar problemas.

### Solución 1: Resetear la contraseña

1. En Settings → Database
2. Busca "Reset database password"
3. Crea una contraseña nueva **SIN caracteres especiales** (solo letras, números, guiones)
4. Guarda la nueva contraseña
5. Actualiza el archivo `.env`

### Solución 2: URI Encode la contraseña

Si la contraseña es: `Z\`6*k-kFP]SCzGTN+Mux`

Encoded debería ser: `Z%606*k-kFP%5DSCzGTN%2BMux`

Donde:
- ` se convierte en %60
- ] se convierte en %5D
- + se convierte en %2B

## 📋 Checklist

- [ ] Tengo acceso al dashboard de Supabase
- [ ] Puedo ver Settings → Database
- [ ] Veo la Connection String
- [ ] Copié el URI completo
- [ ] Reemplacé [YOUR-PASSWORD] con la contraseña real
- [ ] La contraseña no tiene espacios al inicio o final

## 🚀 Siguiente Paso

Una vez tengas el URI completo, compártelo conmigo y actualizaré la configuración.

O si prefieres, **resetea la contraseña** a algo simple como:
`RestFolow2024Secure`

Y luego compárteme la nueva contraseña.
