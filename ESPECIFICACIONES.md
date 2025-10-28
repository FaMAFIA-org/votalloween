# VotAlloween - Especificaciones del Proyecto

## Descripción General
Aplicación web React simple para concurso de disfraces de Halloween con dos fases: subida de fotos y votación.

## Fases del Concurso

### Fase 1: Subida de Disfraces
Los usuarios pueden subir fotos de sus disfraces y registrar su participación.

### Fase 2: Votación
Los usuarios votan por los mejores disfraces. Una vez que votan, ven un contador regresivo hasta el fin del concurso.

## Características Principales

### Fase 1: Registro de Disfraces

#### Pantalla Principal (Sin disfraces registrados)
- Botón grande: "Entrar al Concurso"

#### Flujo de Registro
1. Usuario presiona "Entrar al Concurso"
2. Se abre cámara/selector de archivo para tomar/subir foto
3. Después de capturar foto, formulario simple:
   - Campo: Nombre del participante (requerido)
   - Campo: Nombre del disfraz (opcional)
   - Botón: "Registrar Disfraz"

#### Pantalla Principal (Con disfraces registrados)
- Lista de todos los disfraces que el dispositivo ha subido
- Cada elemento muestra:
  - Foto del disfraz (miniatura)
  - Nombre del participante
  - Nombre del disfraz (si se proporcionó)
  - Botón "Editar"
- Botón al final: "Subir Otro Disfraz"

#### Edición de Disfraces
- Permite editar nombre del participante y nombre del disfraz
- Permite cambiar la foto
- Los datos se actualizan localmente y en el backend

### Fase 2: Votación

#### Cuando la fase de votación está activa (flag del servidor)

**Si el dispositivo NO ha votado:**
- Mostrar sistema de votación (a definir posteriormente)
- Una vez que vota, marcar el dispositivo como "ha votado"

**Si el dispositivo YA votó:**
- Mostrar contador regresivo hasta el fin del concurso
- Formato: "El concurso termina en: XX:XX:XX"
- Mensaje: "¡Gracias por votar!"

**Cuando el tiempo termina:**
- Mostrar pantalla: "¡Feliz Halloween! 🎃"
- Mensaje adicional: "Gracias por participar"

## Datos a Almacenar

### LocalStorage (Dispositivo)
```javascript
{
  deviceId: "uuid-generado",
  myUploads: [
    {
      id: "id-del-servidor",
      participantName: "Nombre",
      costumeName: "Nombre del disfraz",
      imageUrl: "url-del-servidor"
    }
  ],
  hasVoted: false,
  votedAt: "timestamp"
}
```

### Base de Datos PostgreSQL (via Prisma)

#### Modelo Config
```prisma
model Config {
  id              Int       @id @default(autoincrement())
  phase           String    @default("upload") // "upload" o "voting"
  votingStartTime DateTime?
  votingEndTime   DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}
```

#### Modelo Costume
```prisma
model Costume {
  id              String   @id @default(uuid())
  participantName String
  costumeName     String?
  imageUrl        String
  deviceId        String
  votes           Int      @default(0)
  uploadedAt      DateTime @default(now())
  Vote            Vote[]
}
```

#### Modelo Vote
```prisma
model Vote {
  id        String   @id @default(uuid())
  deviceId  String   @unique
  costumeId String
  costume   Costume  @relation(fields: [costumeId], references: [id])
  votedAt   DateTime @default(now())
}
```

### Almacenamiento de Imágenes
- Carpeta local del servidor: `/backend/uploads/`
- Formato de archivo: `{timestamp}-{random}.jpg/png`
- Servido por Express como archivos estáticos

## Requisitos Técnicos

### Arquitectura
- **Frontend**: React (Vite)
- **Backend**: Express.js + Node.js
- **Base de Datos**: PostgreSQL
- **ORM**: Prisma
- **Deployment**: Railway

### Stack Tecnológico

#### Frontend
- **React** con Vite
- **react-webcam** - Para captura de fotos desde cámara
- **uuid** - Para generar IDs únicos de dispositivo
- **axios** - Para llamadas al backend

#### Backend
- **Express.js** - Servidor web
- **Prisma** - ORM para PostgreSQL
- **multer** - Manejo de subida de archivos
- **cors** - Permitir peticiones cross-origin
- **dotenv** - Variables de entorno

### Configuración de Railway

#### 1. Crear Proyecto en Railway
- Ir a [Railway](https://railway.app/)
- Conectar con GitHub
- Seleccionar repositorio: `FaMAFIA-org/votalloween`

#### 2. Agregar Base de Datos PostgreSQL
- En Railway, hacer click en "New"
- Seleccionar "Database" → "PostgreSQL"
- Railway automáticamente creará la variable `DATABASE_URL`

#### 3. Configurar Backend Service
- Railway detectará automáticamente el `backend/package.json`
- Variables de entorno necesarias:
  - `DATABASE_URL` (automática de PostgreSQL)
  - `PORT` (automática de Railway)
- Build Command: `cd backend && npm install && npx prisma generate && npx prisma db push`
- Start Command: `cd backend && npm start`

#### 4. Configurar Frontend Service
- Crear segundo servicio para el frontend
- Variables de entorno:
  - `VITE_API_URL` (URL del backend)
- Build Command: `cd frontend && npm install && npm run build`
- Start Command: `cd frontend && npm run preview`

### API Endpoints

#### Config
- `GET /api/config` - Obtener configuración actual
- `PUT /api/config` - Actualizar fase y tiempos de votación

#### Costumes
- `GET /api/costumes` - Listar todos los disfraces
- `GET /api/costumes/device/:deviceId` - Obtener disfraces de un dispositivo
- `POST /api/costumes` - Subir nuevo disfraz (con imagen)
- `PUT /api/costumes/:id` - Actualizar disfraz
- `DELETE /api/costumes/:id` - Eliminar disfraz

#### Votes
- `GET /api/votes/check/:deviceId` - Verificar si dispositivo ha votado
- `POST /api/votes` - Registrar voto
- `GET /api/votes/results` - Obtener resultados de votación

## Estructura del Proyecto

```
votalloween/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── routes/
│   │   │   ├── costumes.js
│   │   │   ├── votes.js
│   │   │   └── config.js
│   │   └── index.js
│   ├── uploads/
│   ├── .env
│   ├── .gitignore
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── UploadPhase/
│   │   │   │   ├── WelcomeScreen.jsx
│   │   │   │   ├── PhotoCapture.jsx
│   │   │   │   ├── CostumeForm.jsx
│   │   │   │   ├── MyCostumes.jsx
│   │   │   │   └── EditCostume.jsx
│   │   │   ├── VotingPhase/
│   │   │   │   ├── VotingScreen.jsx (a definir)
│   │   │   │   ├── ThankYouCountdown.jsx
│   │   │   │   └── HalloweenEnd.jsx
│   │   │   └── common/
│   │   │       └── LoadingSpinner.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── localStorage.js
│   │   │   └── deviceId.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .gitignore
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
├── ESPECIFICACIONES.md
└── README.md
```

## Flujo de Usuario

### Escenario 1: Primera vez en la app (Fase Upload)
1. Abre la app
2. Ve botón "Entrar al Concurso"
3. Toma foto
4. Llena formulario
5. Ve su disfraz en la lista
6. Puede subir más disfraces

### Escenario 2: Regresa a la app (Fase Upload)
1. Abre la app
2. Ve lista de sus disfraces ya subidos
3. Puede editar o subir más

### Escenario 3: Fase de votación - No ha votado
1. Abre la app
2. Ve sistema de votación
3. Vota
4. Ve contador regresivo

### Escenario 4: Fase de votación - Ya votó
1. Abre la app
2. Ve contador regresivo inmediatamente

### Escenario 5: Concurso terminado
1. Abre la app
2. Ve pantalla "¡Feliz Halloween!"

## Textos en Español

### Fase Upload
- "Entrar al Concurso"
- "Subir Otro Disfraz"
- "Nombre del participante"
- "Nombre del disfraz (opcional)"
- "Registrar Disfraz"
- "Editar"
- "Guardar Cambios"
- "Cancelar"
- "Tomar Foto"
- "Subir Imagen"
- "Mis Disfraces"

### Fase Voting
- "¡Vota por tu disfraz favorito!"
- "Votar"
- "¡Gracias por votar!"
- "El concurso termina en:"
- "¡Feliz Halloween! 🎃"
- "Gracias por participar"

## Consideraciones Importantes

### Seguridad
- ⚠️ **NO hay seguridad** - esto es intencional para simplificar
- La app es para un evento único y controlado
- No se almacena información sensible

### Limitaciones Aceptadas
- Usuarios pueden votar desde múltiples dispositivos
- Usuarios pueden subir múltiples disfraces desde el mismo dispositivo
- No hay validación de identidad
- No hay autenticación de administrador para cambiar la fase

### Control del Evento

Para cambiar de fase manualmente, usar la API:

```bash
# Cambiar a fase de votación
curl -X PUT https://tu-backend.railway.app/api/config \
  -H "Content-Type: application/json" \
  -d '{
    "phase": "voting",
    "votingEndTime": "2025-10-31T23:59:59Z"
  }'
```

O crear un panel de administración simple (opcional).

## Próximos Pasos

1. ✅ Crear documento de especificaciones
2. ✅ Crear estructura backend (Express + Prisma)
3. ✅ Crear estructura de carpetas
4. ⏳ Implementar frontend React
5. ⏳ Conectar frontend con backend
6. ⏳ Definir sistema de votación
7. ⏳ Testing local
8. ⏳ Deploy a Railway
9. ⏳ Testing en producción

## Información Necesaria del Cliente

- [ ] ¿Cuánto tiempo durará la fase de votación? (minutos/horas)
- [ ] ¿Sistema de votación preferido? (una vez por dispositivo, ranking, etc.)
- [ ] ¿Fecha y hora del evento?

## Comandos Útiles

### Desarrollo Local

#### Backend
```bash
cd backend
npm install
# Crear archivo .env con DATABASE_URL
npm run db:push      # Aplicar esquema a la BD
npm run dev          # Iniciar servidor en modo desarrollo
```

#### Frontend
```bash
cd frontend
npm install
# Crear archivo .env con VITE_API_URL=http://localhost:3000
npm run dev          # Iniciar en modo desarrollo
```

### Deployment en Railway

1. Push a GitHub: `git push origin main`
2. Railway detectará cambios y desplegará automáticamente
3. Configurar variables de entorno en Railway dashboard

---

**Nota**: Esta es una aplicación simple para un uso único. No está diseñada para producción ni para almacenar datos sensibles.