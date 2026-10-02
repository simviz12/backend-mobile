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
