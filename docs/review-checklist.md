# Review Checklist

## General
- [ ] No secrets or environment files in the repo.
- [ ] All code, variables, function names, and comments are in English.
- [ ] (Flutter only) User-visible UI strings are in Spanish.

## Architecture
- [ ] (Backend) Clean Architecture: modules/<feature>/{domain,application,infrastructure,presentation}.
- [ ] (Frontend) Core/ + features/<feature>/{domain,data,presentation}.
- [ ] Domain has no external imports that violate boundaries.
- [ ] Folder structure strictly followed.

## Testing
- [ ] Tests exist and test behavior.
- [ ] Tests pass locally.
- [ ] Minimum coverage met (Backend: 80%, Frontend: 75% in logic layers).

## GitFlow
- [ ] Branch originates from develop.
- [ ] Conventional Commits used.

## API & Contract
- [ ] Implementation matches openapi.yaml.

## Security
- [ ] Minimal Android permissions requested.
