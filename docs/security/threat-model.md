# Threat Model - Guardian Mobile

## Overview
Guardian Mobile handles sensitive device data and remote wipe capabilities.

## Threats & Mitigations
1. **Unauthorized Command Execution:** Mitigated by strict ownership checks and JWT authentication.
2. **Data Interception:** All communication is over HTTPS.
3. **Accidental WIPE:** Requires 2FA / strict confirmation before dispatch.
4. **Android Limitations:** OS may kill background services; we rely on high-priority FCM messages.
