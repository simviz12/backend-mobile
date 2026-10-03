# Guardian Mobile - Backend

## Overview
Backend service for the Guardian Mobile anti-theft system.

## Architecture
`mermaid
graph TD;
  API-->Application;
  Application-->Domain;
  Infrastructure-->Domain;
  Infrastructure-->Database[(PostgreSQL)];
`

## Setup
1. 
pm install
2. Configure .env
3. 
pm run start:dev

## Testing

pm run test

## GitFlow
Feature branches from develop, merged via PR.
