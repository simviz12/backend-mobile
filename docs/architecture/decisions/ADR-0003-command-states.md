# ADR-0003: Command and States Model

## Status
Accepted

## Context
Commands sent to the device (ring, locate, wipe) need a reliable state tracking mechanism since devices may be offline.

## Decision
Commands will transition through states: PENDING -> SENT -> DELIVERED -> EXECUTED / FAILED.
The frontend will poll or receive WebSocket updates reflecting these states.

## Consequences
Requires robust handling of FCM acknowledgments and device status updates.
