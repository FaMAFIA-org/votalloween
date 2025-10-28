# 🎃 VotAlloween

Aplicación web para concurso de disfraces de Halloween con dos fases: subida de fotos y votación.

## Arquitectura

- **Frontend**: React + Vite
- **Backend**: Express.js + Node.js
- **Base de Datos**: PostgreSQL + Prisma
- **Deployment**: Railway

## Estructura del Proyecto

```
votalloween/
├── backend/          # Servidor Express + Prisma
├── frontend/         # Aplicación React
└── ESPECIFICACIONES.md
```

## Desarrollo Local

### Prerequisitos

- Node.js 18+
- PostgreSQL (o usar Railway para la BD)
- npm o yarn

### Backend

1. Navegar a la carpeta backend:
```bash
cd backend
```

2. Instalar dependencias:
```bash
npm install
```

3. Crear archivo `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/votalloween?schema=public"
PORT=3000
```

4. Aplicar el esquema de Prisma a la base de datos:
```bash
npm run db:push
```

5. Iniciar el servidor en modo desarrollo:
```bash
npm run dev
```

El backend estará disponible en `http://localhost:3000`

### Frontend

1. Navegar a la carpeta frontend:
```bash
cd frontend
```

2. Instalar dependencias:
```bash
npm install
```

3. Crear archivo `.env`:
```env
VITE_API_URL=http://localhost:3000
```

4. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

## Configuración de la Base de Datos

La aplicación incluye una tabla `Config` que controla las fases del concurso:

### Modelo Config

```prisma
model Config {
  id              Int       @id @default(autoincrement())
  phase           String    @default("upload")  // "upload" o "voting"
  votingStartTime DateTime?
  votingEndTime   DateTime?
}
```

### Cambiar Fase del Concurso

Para cambiar de la fase de subida a votación:

```bash
curl -X PUT http://localhost:3000/api/config \
  -H "Content-Type: application/json" \
  -d '{
    "phase": "voting",
    "votingEndTime": "2025-10-31T23:59:59Z"
  }'
```

## Deployment con Auto-Deploy

Este proyecto usa una arquitectura híbrida:
- **Backend en Railway** (Express + PostgreSQL)
- **Frontend en GitHub Pages** (React)

### 🚀 Guía Completa de Deployment

Ver **[GITHUB_PAGES_DEPLOYMENT.md](./GITHUB_PAGES_DEPLOYMENT.md)** para instrucciones detalladas paso a paso.

### Resumen Rápido

#### Backend en Railway

1. **Conectar repositorio a Railway**
2. **Crear 2 servicios:**
   - PostgreSQL Database
   - Backend Service (root directory: `backend/`)
3. **Generar dominio público** para el backend

#### Frontend en GitHub Pages

1. **Habilitar GitHub Pages** (Settings → Pages → Source: GitHub Actions)
2. **Configurar variable** `VITE_API_URL` con la URL del backend
3. **Push a main** → Auto-deploy automático

### Auto-Deploy Configurado

- ✅ Backend: Cada push que modifique `backend/` → Railway auto-deploy
- ✅ Frontend: Cada push que modifique `frontend/` → GitHub Pages auto-deploy

```bash
# Hacer cambios y commitear
git add .
git commit -m "Update feature"
git push origin main

# Se desplegarán automáticamente los servicios afectados
```

### URLs de Producción

- **Frontend**: `https://famafia-org.github.io/votalloween/`
- **Backend API**: `https://tu-backend.railway.app`

## API Endpoints

### Config
- `GET /api/config` - Obtener configuración actual
- `PUT /api/config` - Actualizar fase y tiempos

### Costumes
- `GET /api/costumes` - Listar todos los disfraces
- `GET /api/costumes/device/:deviceId` - Disfraces de un dispositivo
- `POST /api/costumes` - Subir nuevo disfraz (multipart/form-data)
- `PUT /api/costumes/:id` - Actualizar disfraz
- `DELETE /api/costumes/:id` - Eliminar disfraz

### Votes
- `GET /api/votes/check/:deviceId` - Verificar si dispositivo votó
- `POST /api/votes` - Registrar voto
- `GET /api/votes/results` - Obtener resultados

## Fases del Concurso

### Fase 1: Upload (Subida de Disfraces)
- Los usuarios toman fotos de sus disfraces
- Registran nombre del participante y nombre del disfraz
- Pueden editar sus disfraces subidos
- Pueden subir múltiples disfraces desde el mismo dispositivo

### Fase 2: Voting (Votación)
- Los usuarios ven todos los disfraces y votan por su favorito
- Cada dispositivo puede votar una sola vez
- Después de votar, ven un contador regresivo
- Cuando termina el tiempo, se muestra pantalla de "Feliz Halloween"

## Control del Evento

La aplicación usa la tabla `Config` para controlar:
- **phase**: "upload" o "voting"
- **votingEndTime**: Cuándo termina la votación

Para cambiar de fase, actualizar la configuración via API (ver arriba).

## Tecnologías

### Frontend
- React 18
- Vite
- react-webcam (captura de fotos)
- axios (llamadas API)
- uuid (IDs de dispositivo)

### Backend
- Express.js
- Prisma (ORM)
- multer (subida de archivos)
- PostgreSQL

## Notas Importantes

⚠️ **Esta es una aplicación simple para un evento único**:
- No tiene autenticación
- No hay seguridad avanzada
- Los usuarios pueden votar desde múltiples dispositivos
- Diseñada para un entorno controlado

## Documentación Completa

Ver [ESPECIFICACIONES.md](./ESPECIFICACIONES.md) para detalles completos del proyecto.

## Licencia

ISC
