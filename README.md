# Auth Backend – MVP

Une brique d’authentification backend bootstrapable en Node.js/TypeScript avec Fastify, PostgreSQL et Prisma.

## Fonctionnalités

- Authentification email / mot de passe
- JWT access token + refresh token
- Rotation sécurisée des refresh tokens
- Middleware `authGuard` réutilisable
- Route protégée `/me`
- Rate limiting & validation (Zod)
- Routes REST (`/signup`, `/login`, `/refresh`, `/logout`)

## Démarrage rapide

```bash
yarn install
cp .env.example .env
npx prisma migrate dev
yarn dev
```
