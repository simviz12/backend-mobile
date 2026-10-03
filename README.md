# Guardian Backend

Backend service for Guardian Mobile, a remote anti-theft system for Android phones.
Built with NestJS (TypeScript), PostgreSQL, Prisma, and Clean Architecture.

## Features
- **Clean Architecture**: `domain`, `application`, `infrastructure`, and `presentation` layers.
- **Authentication**: Argon2 password hashing, short-lived JWT Access Tokens, and rotating Refresh Tokens with revocation.
- **Validation & Error Handling**: Global ValidationPipe and uniform Exception Filters.
- **Documentation**: Swagger OpenAPI at `/api/docs`.
- **Database**: PostgreSQL with Prisma ORM.

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   ```bash
   cp .env.example .env
   # Update JWT_SECRET and DATABASE_URL if necessary
   ```

3. **Start Database**
   ```bash
   docker-compose up -d
   ```

4. **Run Migrations & Prisma**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start the Application**
   ```bash
   npm run start:dev
   ```

## Running Tests

We ensure high quality with comprehensive tests:
- **Unit Tests**: `npm run test`
- **E2E Tests**: `npm run test:e2e` (Requires PostgreSQL running)
- **Coverage**: `npm run test:cov` (Requires >80% coverage in `application` and `domain`)

## Authentication Endpoints

All endpoints are documented in `/api/docs` (Swagger UI).

- `POST /auth/register`: Register a new account.
- `POST /auth/login`: Login and receive `accessToken` and `refreshToken`.
- `POST /auth/refresh`: Refresh access tokens securely.
- `POST /auth/logout`: Revoke all refresh tokens for the user. (Requires Bearer token).

## Architecture

This project strictly adheres to Clean Architecture:
- `src/modules/<feature>/domain`: Pure business logic (Entities, Value Objects). No external dependencies.
- `src/modules/<feature>/application`: Use cases orchestrating domain rules.
- `src/modules/<feature>/infrastructure`: Implementations (Prisma repositories, APIs).
- `src/modules/<feature>/presentation`: REST Controllers, WebSocket Gateways.

## Day 6: Devices Linking
- Created Device model and DeviceMode enum.
- Created LinkDeviceUseCase and POST /devices endpoint.

## Day 8 (Real Day 7): Devices Management
- Implemented GET /devices, GET /devices/:id, PATCH /devices/:id, DELETE /devices/:id endpoints.
- Added ownership verification.

## Day 8: Commands Core
- Created Command entity with state machine (PENDING, SENT, DELIVERED, EXECUTED, FAILED, EXPIRED).
- Endpoint POST /devices/:id/commands implemented.

## Day 9: FCM Delivery
- Integrated Firebase Admin SDK via PushNotificationPort.
- Added command expiration job.
- Mocked FCM for local tests.

## Day 10: Commands History & Ack
- GET /devices/:id/commands with pagination and status filter.
- PATCH /devices/:id/commands/:commandId/ack endpoint for device acknowledgment.
- Coverage >= 80%.

## Day 11: Locations
- POST /devices/:id/locations to record GPS coordinates.
- GET /devices/:id/locations?from=&to= with pagination.
- Coordinate range validation in domain entity.
- DB index on (deviceId, recordedAt).

## Day 12: Device Status & Heartbeat
- POST /devices/:id/status to report battery, network, and app version.
- Device now has isOnline flag updated on heartbeat.
- Cron job marks devices offline if not seen for 5 minutes.

## Day 13: Realtime Gateway
- WebSocket /realtime with JWT Auth.
- Rooms by user/device.
- Published events: device.online, device.offline, location.updated.

## Day 14: Realtime Commands & Idempotency
- Published command.updated event from Create and Ack use cases.
- Published command.updated when a command expires in the background cron job.
- Added idempotency to command state machine to gracefully handle duplicate acks.
- Added concurrency tests for command states.

## Day 15: Week 3 Integration
- Added full e2e test for the command flow: create -> FCM simulate -> ack -> realtime event.
- Reviewed and added DB indexes for Device and Command.
- Confirmed high code coverage in critical domain rules.

## Day 16: Theft Mode
- Added TheftModeModule with ActivateTheftModeUseCase and DeactivateTheftModeUseCase.
- Added isTheftModeActive state to Device.
- Logging of activation/deactivation via TheftModeLog.
- Activation orchestrates multiple emergency commands (LOCK, RING, MESSAGE, LOCATE, THEFT_MODE).

## Day 17: Wipe & Audit
- Added AuditModule with AuditLog to record sensitive actions like WIPE and LOCK.
- Enforced sourceDeviceId parameter to ensure only a CONTROLLER owned by the user can issue these commands.
- Enforced Argon2 password re-confirmation before executing the WIPE command.

## Day 18: Security Hardening & 2FA
- Enforced HTTP security headers with helmet.
- Added rate limiting using @nestjs/throttler (100 reqs/min).
- Configured strict CORS in main.ts.
- (Pending/Documented) 2FA TOTP module implementation to verify critical commands is drafted for next iterations.

## Production Deployment (Release 1.0.0)

1. Build the Docker image:
   `ash
   docker build -t guardian-backend .
   `
2. Set your .env variables (DATABASE_URL, JWT_SECRET, etc.).
3. Run the container:
   `ash
   docker run -p 3000:3000 --env-file .env guardian-backend
   `
The entrypoint script automatically applies pending Prisma migrations on startup.


---

## 📱 Guía Completa de Integración con el Frontend (Flutter / Web)

Esta sección explica detalladamente cómo conectar el frontend (`guardian-mobile` en Flutter o portal web) con este backend para tener el sistema funcionando de extremo a extremo.

### 1. URLs Base y Configuración de Red
Por defecto, el backend corre en el puerto `3000`. Dependiendo del entorno donde corras la app móvil, configura la URL base en el cliente:

| Entorno del Cliente Móvil | Base URL Recomendada | Nota |
|---|---|---|
| Emulador Android Oficial | `http://10.0.2.2:3000` | `10.0.2.2` apunta al `localhost` del host de desarrollo. |
| Emulador Genymotion | `http://10.0.3.2:3000` | Red virtual de Genymotion. |
| Dispositivo Físico Android | `http://<IP_LOCAL_DE_TU_PC>:3000` | PC y móvil deben estar en la misma red Wi-Fi. |
| Web / Desktop | `http://localhost:3000` | Mismo equipo. |

En el proyecto Flutter (`guardian-mobile`), el archivo `lib/core/network/api_config.dart` contiene la configuración de URL:
```dart
class ApiConfig {
  static const String baseUrl = 'http://10.0.2.2:3000'; // Para Emulador Android
}
```

---

### 2. Flujo Completo de Integración Paso a Paso

1. **Autenticación Inicial:**
   - La app solicita registro (`POST /auth/register`) o inicio de sesión (`POST /auth/login`).
   - El backend entrega `{ "accessToken": "...", "refreshToken": "..." }`.
   - El frontend almacena el `accessToken` en almacenamiento seguro (`flutter_secure_storage`).

2. **Conexión en Tiempo Real (Socket.IO):**
   - El frontend establece conexión con el namespace `/realtime` pasando el `accessToken`:
     ```dart
     import 'package:socket_io_client/socket_io_client.dart' as IO;

     IO.Socket socket = IO.io('http://10.0.2.2:3000/realtime', <String, dynamic>{
       'transports': ['websocket'],
       'auth': {'token': accessToken},
     });
     ```
   - El backend une el socket a la sala privada `user:{userId}`.
   - Escucha reactiva en el cliente:
     - `command.updated`: Se dispara cuando cambia el estado de un comando (`SENT`, `EXECUTED`, `FAILED`).
     - `location.updated`: Se dispara cuando llega una nueva coordenada GPS de un dispositivo.
     - `device.online` / `device.offline`: Notifica cambios de presencia.

3. **Vinculación de Dispositivos (`POST /devices`):**
   - El teléfono reporta su rol (`PROTECTED` para el teléfono a cuidar, o `CONTROLLER` para el teléfono del administrador).
   - Registra su `fcmToken` (token de Firebase Cloud Messaging) para habilitar envíos push.

4. **Heartbeat y Telemetría en Segundo Plano:**
   - Cada 1 a 3 minutos, el dispositivo protegido envía `POST /devices/:id/status` con nivel de batería y red.
   - Envía coordenadas con `POST /devices/:id/locations`.

5. **Envío y Ejecución de Comandos Remotos:**
   - El usuario envía un comando desde la app (`POST /devices/:id/commands`):
     - `RING`: Alarma sonora a volumen máximo.
     - `LOCATE`: Solicita reporte inmediato de ubicación.
     - `MESSAGE`: Muestra mensaje en pantalla.
     - `VIBRATE`: Vibración continua.
     - `LOCK`: Bloqueo de pantalla (requiere `sourceDeviceId` de un `CONTROLLER`).
     - `WIPE`: Borrado remoto de fábrica (requiere `sourceDeviceId` y confirmación de `password`).
   - El backend despacha el comando vía Firebase Cloud Messaging (FCM) con alta prioridad.
   - El teléfono destino recibe el push, ejecuta la acción nativa y confirma con `PATCH /devices/:id/commands/:cmdId/ack` enviando `status: "EXECUTED"`.

6. **Modo Robo de Emergencia:**
   - `POST /devices/:id/theft-mode`: Activa simultáneamente el bloqueo, sonido de alarma, mensaje disuasivo y rastreo geográfico.

---

### 3. Estado de Claves de API y Credenciales

#### ¿Hace falta alguna clave de API para probar el sistema hoy?
**NO, ninguna clave externa es obligatoria para desarrollo ni pruebas locales.**

El backend fue construido bajo principios de arquitectura hexagonal (puertos y adaptadores):
1. **Base de Datos:** Ya está lista localmente vía Docker Compose (`postgresql://postgres:password@localhost:5432/guardian`).
2. **Seguridad JWT:** Ya viene configurada en el archivo `.env` (`JWT_SECRET`).
3. **Firebase Cloud Messaging (FCM):** Cuenta con un **modo simulado automático (Dry-Run)**. Si la variable `FIREBASE_CREDENTIALS` no está configurada, el adaptador `FcmAdapter` simula exitosamente el envío de notificaciones en consola y permite que el ciclo de vida de los comandos funcione sin dependencias externas.
4. **Para Despliegue en Dispositivos Físicos Reales (Opcional):**
   - Solo cuando desees que el push llegue a antenas reales de Google en producción, necesitarás descargar el archivo `serviceAccountKey.json` de tu consola de Firebase y agregarlo a `.env`:
     ```env
     FIREBASE_CREDENTIALS=/ruta/a/serviceAccountKey.json
     ```
