# ADR-0001: Technology Stack Selection

## Status
Accepted

## Context
We need a robust, scalable backend and a cross-platform mobile application for the Guardian Mobile anti-theft system.

## Options Considered
* Node.js (Express) vs NestJS
* React Native vs Flutter
* MySQL vs PostgreSQL
* FCM vs WebSockets alone

## Decision
* **Backend:** NestJS with PostgreSQL.
* **Frontend:** Flutter.
* **Messaging:** Firebase Cloud Messaging (FCM).

## Consequences
NestJS enforces a good modular structure. Flutter provides high performance and a single codebase for Android/iOS (though MVP is Android). PostgreSQL handles relational data well.
