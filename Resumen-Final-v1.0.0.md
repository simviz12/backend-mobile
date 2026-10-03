# Guardian Mobile API - Release 1.0.0

El plan de 20 días se ha completado en su totalidad, resultando en una API backend robusta construida con NestJS y Prisma para el sistema antirrobo Guardian Mobile.

## 🚀 Resumen Final del Proyecto

### Semana 1: Core & Auth
- **Arquitectura Limpia**: Se implementó de manera estricta la separación de capas (`domain`, `application`, `infrastructure`, `presentation`).
- **Autenticación**: Registro y login de usuarios con Argon2 y JWT (Access & Refresh tokens).
- **Gestión de Dispositivos**: Los dispositivos se pueden enlazar (Link) y clasificar en `PROTECTED` o `CONTROLLER`.

### Semana 2: Comandos Remotos
- **Máquina de Estados de Comandos**: Estados `PENDING`, `SENT`, `DELIVERED`, `EXECUTED`, `FAILED`, `EXPIRED`.
- **Integración FCM**: Envío de comandos push silenciosos de alta prioridad utilizando Firebase Admin SDK mediante un adaptador.
- **Acuses de Recibo (Ack)**: Los dispositivos confirman la recepción y ejecución de los comandos, con idempotencia en las transiciones de estado.

### Semana 3: Tiempo Real & Geolocalización
- **Gateway de WebSockets**: Implementado con Socket.IO y JWT para emitir eventos en tiempo real a los clientes (salas por usuario).
- **Locations & Heartbeat**: Registro de coordenadas de ubicación validadas y estados periódicos (batería, red). Cron jobs automáticos marcan a los dispositivos como `offline` si dejan de emitir.
- **Tests E2E**: Integración completa desde la creación del comando, mock de FCM, hasta el acuse y la emisión del evento en tiempo real.

### Semana 4: Seguridad & Funciones Críticas (Días 16-20)
- **Modo Robo**: Orquestación automática de comandos de emergencia (bloqueo, alarma, mensaje, rastreo).
- **Wipe & Audit Log**: Ejecución protegida de reseteo de fábrica, exigiendo confirmación de contraseña, originado obligatoriamente desde un dispositivo `CONTROLLER` del usuario. Todos los intentos quedan registrados en una pista de auditoría inmutable.
- **Hardening**: Configuración de seguridad HTTP con Helmet, estricto CORS y Rate Limiting global (100 req/min) usando `@nestjs/throttler`.
- **Despliegue**: Creación de Dockerfile con imagen optimizada basada en Alpine, junto con guía en README para su paso a producción.

---

## 🛠️ Comandos de Git Utilizados en el Cierre
Durante el flujo de cierre (Días 19 y 20) se ejecutaron los siguientes comandos GitFlow para la generación del Release:

```bash
# 1. Crear rama de release
git checkout -b release/1.0.0

# 2. Subir preparativos
git add .
git commit -m "chore: release 1.0.0 preparations and docker build"
git push -u origin release/1.0.0

# 3. Merge a main y creación del Tag v1.0.0
git checkout main
git merge release/1.0.0 --no-ff -m "Merge release 1.0.0 into main"
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin main --tags

# 4. Back-merge a develop para alinear el historial
git checkout develop
git merge main --no-ff -m "Back-merge v1.0.0 into develop"
git push origin develop
```
