# 🚂 Guía de Deployment en Railway

Esta guía te llevará paso a paso para desplegar VotAlloween en Railway con auto-deploy desde GitHub.

## Prerequisitos

- Cuenta en [Railway](https://railway.app/)
- Cuenta de GitHub con acceso al repositorio
- Repositorio: `https://github.com/FaMAFIA-org/votalloween`

## Paso 1: Crear Proyecto en Railway

1. Ve a [Railway](https://railway.app/) e inicia sesión
2. Click en **"New Project"**
3. Selecciona **"Deploy from GitHub repo"**
4. Autoriza Railway para acceder a tu cuenta de GitHub
5. Selecciona el repositorio: **`FaMAFIA-org/votalloween`**

## Paso 2: Agregar Base de Datos PostgreSQL

1. En tu proyecto de Railway, click en **"+ New"**
2. Selecciona **"Database"** → **"Add PostgreSQL"**
3. Railway creará automáticamente la base de datos
4. La variable `DATABASE_URL` se generará automáticamente

## Paso 3: Configurar Servicio Backend

### 3.1 Crear Servicio Backend

1. En tu proyecto, click en **"+ New"**
2. Selecciona **"GitHub Repo"** → **"FaMAFIA-org/votalloween"**
3. Railway detectará el repositorio y creará un servicio

⚠️ **IMPORTANTE**: Si ves un error de "Failed to create build plan" o "Nixpacks error", es normal. Necesitas configurar el Root Directory primero (siguiente paso).

### 3.2 Configurar Root Directory

1. Ve al servicio que acabas de crear
2. Click en **"Settings"**
3. En **"Root Directory"**, ingresa: **`backend`**
4. Guarda los cambios

### 3.3 Configurar Build y Start Commands (Opcional)

Railway detectará automáticamente desde `package.json`, pero puedes verificar:

- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

### 3.4 Variables de Entorno

Railway conectará automáticamente `DATABASE_URL` desde PostgreSQL. No necesitas configurar nada más.

Para verificar:
1. Ve a **"Variables"** en el servicio backend
2. Deberías ver `DATABASE_URL` disponible (conectada desde PostgreSQL)

### 3.5 Generar Domain

1. En **"Settings"** del servicio backend
2. Scroll hasta **"Networking"** → **"Public Networking"**
3. Click en **"Generate Domain"**
4. Copia la URL generada (ej: `votalloween-backend-production.up.railway.app`)

## Paso 4: Configurar Servicio Frontend

### 4.1 Crear Servicio Frontend

1. En tu proyecto, click en **"+ New"** nuevamente
2. Selecciona **"GitHub Repo"** → **"FaMAFIA-org/votalloween"**
3. Railway creará otro servicio

### 4.2 Configurar Root Directory

1. Ve al nuevo servicio frontend
2. Click en **"Settings"**
3. En **"Root Directory"**, ingresa: **`frontend`**
4. Guarda los cambios

### 4.3 Configurar Variables de Entorno

1. Ve a **"Variables"** en el servicio frontend
2. Click en **"+ New Variable"**
3. Agrega:
   - **Name**: `VITE_API_URL`
   - **Value**: La URL del backend (del paso 3.5)

   Ejemplo: `https://votalloween-backend-production.up.railway.app`

4. Guarda los cambios

### 4.4 Configurar Build Command (Importante para Vite)

1. En **"Settings"** del servicio frontend
2. En **"Build Command"**, asegúrate que sea: `npm install && npm run build`
3. En **"Start Command"**, usa: `npm run preview`

O mejor aún, instala un servidor estático:

**Opción A: Usar vite preview (más simple)**
- Start Command: `npm run preview -- --port $PORT --host 0.0.0.0`

**Opción B: Usar serve (recomendado para producción)**
1. Agregar `serve` al `package.json` del frontend (ver sección de Optimización)
2. Start Command: `npx serve -s dist -l $PORT`

### 4.5 Generar Domain para Frontend

1. En **"Settings"** del servicio frontend
2. Scroll hasta **"Networking"** → **"Public Networking"**
3. Click en **"Generate Domain"**
4. Esta será la URL principal de tu aplicación

## Paso 5: Verificar Auto-Deploy

Railway está configurado para auto-deploy. Cada vez que hagas push a GitHub:

1. Railway detectará el cambio automáticamente
2. Re-desplegará los servicios afectados
3. Puedes ver los logs en tiempo real en cada servicio

### Probar Auto-Deploy

```bash
# Hacer un cambio pequeño
git commit --allow-empty -m "Test auto-deploy"
git push origin main

# Railway detectará el push y re-desplegará
```

## Paso 6: Verificar Deployment

### Backend
1. Abre la URL del backend en el navegador
2. Agrega `/health` al final (ej: `https://tu-backend.railway.app/health`)
3. Deberías ver: `{"status":"ok","message":"VotAlloween API is running"}`

### Frontend
1. Abre la URL del frontend
2. Deberías ver la aplicación React cargando

## Configuración de CORS (Si es necesario)

Si el frontend no puede conectarse al backend, verifica CORS:

1. El backend ya tiene CORS habilitado en `backend/src/index.js`
2. Si necesitas restringirlo a tu dominio específico:

```javascript
// En backend/src/index.js
app.use(cors({
  origin: 'https://tu-frontend.railway.app'
}));
```

## Estructura Final del Proyecto en Railway

Tu proyecto debería tener:

```
VotAlloween (Proyecto)
├── PostgreSQL (Database)
├── votalloween-backend (Service)
│   └── Root Directory: backend/
└── votalloween-frontend (Service)
    └── Root Directory: frontend/
```

## Optimización del Frontend para Producción

Para mejor rendimiento, actualiza `frontend/package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview --port $PORT --host 0.0.0.0"
  }
}
```

O instala `serve`:

```bash
cd frontend
npm install --save serve
```

Y actualiza el Start Command en Railway a: `npx serve -s dist -l $PORT`

## Monitoreo y Logs

### Ver Logs en Tiempo Real
1. Click en cualquier servicio
2. Ve a la pestaña **"Deployments"**
3. Click en el deployment activo
4. Verás los logs en tiempo real

### Métricas
1. Railway muestra métricas de CPU y RAM automáticamente
2. Puedes ver el tráfico en la pestaña de cada servicio

## Cambiar Fase del Concurso

Para cambiar de "upload" a "voting":

```bash
curl -X PUT https://tu-backend.railway.app/api/config \
  -H "Content-Type: application/json" \
  -d '{
    "phase": "voting",
    "votingEndTime": "2025-10-31T23:59:59Z"
  }'
```

## Troubleshooting

### ❌ Error: "Failed to create build plan" o "Nixpacks error"

**Causa**: Railway no puede detectar automáticamente qué construir en un monorepo.

**Solución**:
1. **CRÍTICO**: Configura el **Root Directory** inmediatamente después de crear el servicio
   - Para backend: `backend/`
   - Para frontend: `frontend/`
2. Si el error persiste, haz click en **"Redeploy"** después de configurar el Root Directory
3. Los archivos `nixpacks.toml` en cada carpeta ayudarán a Railway a detectar la configuración correcta

**Pasos específicos:**
1. Ve a Settings del servicio
2. En "Root Directory" escribe: `backend/` o `frontend/`
3. Guarda los cambios
4. Ve a Deployments
5. Click "Redeploy" en el deployment fallido

### ❌ Error: "Cannot find module '@prisma/client'"

**Causa**: Prisma no se generó durante el build.

**Solución**:
1. Verifica que el Root Directory es `backend/`
2. El `package.json` del backend ya tiene el script `build` correcto
3. Railway ejecutará automáticamente: `npm install && npm run build`

### ❌ Error: Frontend no puede conectar con Backend (CORS error)

**Causa**: `VITE_API_URL` no está configurada o el backend no tiene la URL correcta.

**Solución**:
1. En el servicio **Backend**, genera un domain público (Settings → Networking)
2. Copia la URL del backend (ej: `https://votalloween-backend-production.up.railway.app`)
3. En el servicio **Frontend**, agrega variable de entorno:
   - Name: `VITE_API_URL`
   - Value: URL del backend (sin `/` al final)
4. Redeploy el frontend

### ❌ Error: Database connection failed

**Causa**: Backend no puede conectarse a PostgreSQL.

**Solución**:
1. Verifica que el servicio PostgreSQL está corriendo (debe tener un círculo verde)
2. Ve a Variables en el backend
3. Debe existir `DATABASE_URL` (Railway la conecta automáticamente)
4. Si no existe:
   - Click "New Variable"
   - Click "Add Reference"
   - Selecciona PostgreSQL → DATABASE_URL

### ❌ Error: Build falla en el frontend

**Causa**: Root Directory incorrecto o dependencias no instaladas.

**Solución**:
1. Verifica Root Directory = `frontend/`
2. Verifica que `package.json` existe en `frontend/`
3. Chequea los logs de build para errores específicos

### ❌ Error: "Port already in use" o app no responde

**Causa**: Railway necesita que uses la variable `$PORT`.

**Solución**:
- **Backend**: Ya configurado correctamente (usa `process.env.PORT`)
- **Frontend**: El script `preview` ya está configurado para usar el puerto correcto

### ⚠️ Warning: "LF will be replaced by CRLF"

**Causa**: Git en Windows convierte line endings.

**Solución**: Es solo un warning, no afecta el deployment. Puedes ignorarlo.

## Variables de Entorno - Resumen

### Backend
- `DATABASE_URL` - ✅ Automática (desde PostgreSQL)
- `PORT` - ✅ Automática (Railway)

### Frontend
- `VITE_API_URL` - ⚠️ Manual (URL del backend)

## Costos

Railway ofrece:
- **$5 de crédito gratis mensual** (Hobby Plan)
- Si necesitas más, considera el Developer Plan ($20/mes)

Para este proyecto simple, el plan gratuito debería ser suficiente para el evento.

## Comandos Útiles

### Re-deploy Manual
```bash
git commit --allow-empty -m "Force redeploy"
git push origin main
```

### Ver Estado de la Base de Datos
Desde el servicio backend, puedes ejecutar:

```bash
npx prisma studio
```

Pero es mejor usar Railway's Query Editor en la pestaña de PostgreSQL.

## Siguiente Paso

Una vez desplegado, comparte la URL del frontend con los participantes del evento:

```
https://tu-frontend.railway.app
```

¡Listo para el concurso de Halloween! 🎃
