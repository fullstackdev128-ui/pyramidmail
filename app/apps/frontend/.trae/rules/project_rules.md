# Règles de travail (Frontend & Intégration Backend)

## Périmètre autorisé

- Travailler principalement dans `apps/frontend/` ; modifications `apps/backend/` autorisées pour l'intégration.
- Commandes depuis la racine du monorepo (`pnpm --filter @pyramid/frontend`, etc.).

## Infrastructure requise (upload)

**MinIO et Redis doivent être démarrés avant tout test d'upload** (pièces jointes ou avatar) :

```bash
cd docker
docker compose up -d minio redis
```

Sans MinIO : `POST /api/attachments/upload` et `POST /api/user/avatar` → HTTP 500.

## Contraintes produit

- Intégration avec le backend NestJS réel (pas de mock pour les flux email/profil/upload).
- **TanStack Query** pour toutes les communications API.
- Auth JWT via cookies ; `useAuth` / clé `AUTH_QUERY_KEY` pour le cache utilisateur (avatar header).
- **FormData** : ne jamais définir manuellement `Content-Type: multipart/form-data` — utiliser l'intercepteur dans `lib/api.ts`.

## Sprint 01 — fonctionnalités validées

| Feature                | Statut |
| ---------------------- | ------ |
| Upload pièces jointes  | ✅     |
| Upload avatar          | ✅     |
| Avatar dropdown header | ✅     |
| Recherche avancée      | ✅     |
| Archive Inbox          | ✅     |
| ConfirmDialog bin/spam | ✅     |
