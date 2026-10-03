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
