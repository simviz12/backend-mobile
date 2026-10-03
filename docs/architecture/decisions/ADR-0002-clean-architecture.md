# ADR-0002: Clean Architecture

## Status
Accepted

## Context
To maintain separation of concerns and allow independent testing of the domain logic.

## Decision
Both repositories will strictly follow Clean Architecture:
* Backend: domain, pplication, infrastructure, presentation per module.
* Frontend: core and eatures with domain, data, and presentation.

## Consequences
Higher initial boilerplate but better long-term maintainability.
