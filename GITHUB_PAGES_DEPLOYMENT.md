# 🚀 Deployment: Backend (Railway) + Frontend (GitHub Pages)

Esta guía te llevará paso a paso para desplegar VotAlloween con:
- **Backend en Railway** (Express + PostgreSQL)
- **Frontend en GitHub Pages** (React + Auto-deploy)

## Arquitectura de Deployment

```
┌─────────────────┐         ┌──────────────────┐
│  GitHub Pages   │────────▶│  Railway API     │
│  (Frontend)     │  HTTPS  │  (Backend)       │
│  votalloween/   │         │  + PostgreSQL    │
└─────────────────┘         └──────────────────┘
```

---

## Parte 1: Desplegar Backend en Railway

### Paso 1: Crear Proyecto en Railway

1. Ve a [Railway](https://railway.app/) e inicia sesión
2. Click en **"New Project"**
3. Selecciona **"Deploy from GitHub repo"**
4. Autoriza Railway y selecciona: **`FaMAFIA-org/votalloween`**

### Paso 2: Agregar PostgreSQL

1. En tu proyecto, click en **"+ New"**
2. Selecciona **"Database"** → **"Add PostgreSQL"**
3. Railway creará automáticamente `DATABASE_URL`

### Paso 3: Configurar Servicio Backend

1. En tu proyecto, click en **"+ New"**
2. Selecciona **"GitHub Repo"** → **`FaMAFIA-org/votalloween`**

⚠️ **Si ves error de "Failed to create build plan"**, es normal. Continúa:

3. Ve al servicio → **Settings**
4. En **"Root Directory"**, ingresa: **`backend`** (SIN `/` al inicio)
   - ✅ Correcto: `backend`
   - ❌ Incorrecto: `/backend`
5. Guarda los cambios
6. Ve a **Deployments** → Click **"Redeploy"**

### Paso 4: Conectar Base de Datos

1. En el servicio backend, ve a **"Variables"**
2. Verifica que `DATABASE_URL` existe (automática desde PostgreSQL)
3. Si no existe:
   - Click "New Variable" → "Add Reference"
   - Selecciona PostgreSQL → DATABASE_URL

### Paso 5: Generar Domain Público

1. En **Settings** del backend
2. Scroll a **"Networking"** → **"Public Networking"**
3. Click **"Generate Domain"**
4. **GUARDA esta URL** (la necesitarás para el frontend)

Ejemplo: `https://votalloween-backend-production.up.railway.app`

### Paso 6: Verificar Backend

Abre en navegador: `https://tu-backend.railway.app/health`

Deberías ver:
```json
{"status":"ok","message":"VotAlloween API is running"}
```

✅ **Backend listo!**

---

## Parte 2: Desplegar Frontend en GitHub Pages

### Paso 1: Habilitar GitHub Pages

1. Ve al repositorio en GitHub: **`FaMAFIA-org/votalloween`**
2. Click en **"Settings"** (del repositorio)
3. En el menú lateral, click en **"Pages"**
4. En **"Source"**, selecciona: **"GitHub Actions"**

### Paso 2: Configurar Variable de Entorno

El frontend necesita saber la URL del backend.

1. En el repositorio, ve a **"Settings"** → **"Secrets and variables"** → **"Actions"**
2. Click en la pestaña **"Variables"**
3. Click **"New repository variable"**
4. Agrega:
   - **Name**: `VITE_API_URL`
   - **Value**: URL del backend de Railway (del Paso 5 anterior)

   Ejemplo: `https://votalloween-backend-production.up.railway.app`

5. Click **"Add variable"**

### Paso 3: Hacer Push para Desplegar

El workflow de GitHub Actions ya está configurado en `.github/workflows/deploy-frontend.yml`.

Simplemente haz push a `main`:

```bash
git add .
git commit -m "Configure GitHub Pages deployment"
git push origin main
```

### Paso 4: Monitorear Deployment

1. Ve al repositorio en GitHub
2. Click en la pestaña **"Actions"**
3. Verás el workflow **"Deploy Frontend to GitHub Pages"** ejecutándose
4. Espera a que termine (toma ~2-3 minutos)

### Paso 5: Acceder al Frontend

Una vez completado, tu app estará en:

```
https://famafia-org.github.io/votalloween/
```

✅ **Frontend listo!**

---

## Auto-Deploy Configurado

### Backend (Railway)
- Cada push a `main` que modifique archivos en `backend/` → Auto-deploy en Railway

### Frontend (GitHub Pages)
- Cada push a `main` que modifique archivos en `frontend/` → Auto-deploy en GitHub Pages
- También puedes desplegar manualmente desde Actions → "Deploy Frontend to GitHub Pages" → "Run workflow"

---

## Verificar que Todo Funciona

### 1. Verificar Backend
```bash
curl https://tu-backend.railway.app/api/config
```

Deberías ver:
```json
{
  "id": 1,
  "phase": "upload",
  "votingStartTime": null,
  "votingEndTime": null,
  ...
}
```

### 2. Verificar Frontend
1. Abre `https://famafia-org.github.io/votalloween/`
2. Abre DevTools (F12) → Console
3. No deberías ver errores de CORS o conexión

---

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

---

## Troubleshooting

### ❌ Frontend no puede conectar con Backend (CORS)

**Solución**:
1. Verifica que `VITE_API_URL` en GitHub Variables tiene la URL correcta del backend
2. Verifica que NO tiene `/` al final
3. Re-ejecuta el workflow de GitHub Actions

### ❌ GitHub Pages muestra página en blanco

**Causa**: Ruta base incorrecta.

**Solución**:
1. Verifica que `vite.config.js` tiene: `base: '/votalloween/'`
2. Push y espera el redeploy

### ❌ Backend error "Cannot find module '@prisma/client'"

**Solución**:
1. Verifica Root Directory = `backend` en Railway
2. Redeploy el backend

### ❌ Variables no se aplican en GitHub Actions

**Solución**:
1. Verifica que la variable está en **"Variables"** (no "Secrets")
2. Re-ejecuta el workflow manualmente

---

## Estructura Final

```
GitHub Repository (FaMAFIA-org/votalloween)
│
├── Backend → Railway
│   ├── PostgreSQL Database
│   └── API: https://votalloween-backend-*.railway.app
│
└── Frontend → GitHub Pages
    └── App: https://famafia-org.github.io/votalloween/
```

---

## URLs Finales

| Servicio | URL |
|----------|-----|
| **Frontend** | `https://famafia-org.github.io/votalloween/` |
| **Backend API** | `https://tu-backend.railway.app` |
| **Health Check** | `https://tu-backend.railway.app/health` |
| **API Config** | `https://tu-backend.railway.app/api/config` |

---

## Comandos Útiles

### Re-deploy Frontend Manualmente
```bash
# Opción 1: Desde GitHub Actions UI
# Actions → Deploy Frontend to GitHub Pages → Run workflow

# Opción 2: Force push
git commit --allow-empty -m "Force redeploy frontend"
git push origin main
```

### Ver Logs del Frontend
- GitHub → Actions → Click en el workflow activo

### Ver Logs del Backend
- Railway → Tu proyecto → Backend service → Deployments

---

## Costos

- **GitHub Pages**: ✅ Gratis (500 MB, 100 GB bandwidth/mes)
- **Railway**: $5 crédito gratis mensual (suficiente para este proyecto)

---

## ¡Listo para Halloween! 🎃

Comparte la URL del frontend con los participantes:

```
https://famafia-org.github.io/votalloween/
```
