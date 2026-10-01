# Guardian Backend

Backend service for Guardian Mobile, a remote anti-theft system for Android phones.
Built with NestJS (TypeScript), PostgreSQL, and Clean Architecture.

## Features (Planned)
- Remote lock, alarm, wipe, and location tracking.
- WebSocket realtime events.
- 2FA and Firebase Cloud Messaging integration.

## Getting Started

### Prerequisites
- Node.js >= 20
- Docker and Docker Compose (for the database)

### Setup
1. Clone the repository and install dependencies:
   ```bash
   git clone <repo-url>
   cd guardian-backend
   npm install
   ```

2. Configure environment:
   ```bash
   cp .env.example .env
   ```

3. Start PostgreSQL via Docker Compose:
   ```bash
   docker-compose up -d
   ```

4. Start the application:
   ```bash
   npm run start:dev
   ```

### Running Tests
- Unit Tests: `npm run test`
- E2E Tests: `npm run test:e2e`
- Test Coverage: `npm run test:cov`

## Architecture
This project follows strict Clean Architecture principles.
- `src/modules/`: Contains isolated features (`auth`, `users`, `devices`, etc.).
  - `domain/`: Entities, value objects, domain rules.
  - `application/`: Use cases, DTOs, ports.
  - `infrastructure/`: Database adapters, external services (FCM).
  - `presentation/`: Controllers, Gateways.
- `src/shared/`: Cross-cutting concerns (config, logger, common errors).

## Contributing
Follow conventional commits and standard GitFlow (`main` -> `develop` -> `feature/*`).
All feature branches must open a PR to `develop`.
