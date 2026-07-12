# PyramidMail - Frontend

Application webmail React pour PyramidMail.

## Stack Technique

- **Framework** : React 18 + Vite
- **Style** : Tailwind CSS + shadcn/ui (Radix)
- **État** : Zustand + TanStack React Query
- **Éditeur** : Tiptap

## Fonctionnalités (Sprint 01 — final)

| Fonctionnalité                       | Fichiers clés                                                     | Statut |
| ------------------------------------ | ----------------------------------------------------------------- | ------ |
| Upload pièces jointes                | `ComposeModal`, `email.service`, `api.ts` (intercepteur FormData) | ✅     |
| Prévisualisation / téléchargement PJ | `AttachmentCard`, `AttachmentPreview`, `lib/attachments.ts`       | ✅     |
| Upload avatar                        | `ProfilePage`, `useUploadAvatar`, `user.service`                  | ✅     |
| Avatar header (dropdown)             | `Header.tsx`, `useAuth`, `resolveApiPath`                         | ✅     |
| Recherche avancée                    | `Header.tsx`, `useSearch.ts`, `SearchResultsPage`                 | ✅     |
| Archive (lecture email)              | `InboxPage.tsx` → `moveMutation` / `ARCHIVE`                      | ✅     |
| Modales confirmation                 | `confirm-dialog.tsx`, `BinPage`, `SpamPage`                       | ✅     |

## Prérequis (upload)

Le frontend envoie les fichiers vers l'API NestJS, qui les stocke dans **MinIO**. MinIO doit tourner côté Docker :

```bash
cd docker
docker compose up -d minio redis
```

En développement, le proxy Vite (`vite.config.ts`) redirige `/api` vers `http://localhost:3000` pour les cookies et les URLs d'avatar.

## Authentification

- JWT via cookies (`pm_access`, `pm_sid`)
- `useAuth` → `GET /api/auth/me` (inclut `avatar` et `plan` après sprint 01)
- Guards : `ProtectedRoute`, `AdminProtectedRoute` dans `lib/auth-guard.tsx`

## Mise en route

```bash
# Depuis la racine du monorepo
pnpm --filter @pyramid/frontend dev

# Ou depuis ce dossier
pnpm dev
```

API par défaut : `http://localhost:3000/api` (variable `VITE_API_URL` optionnelle).

## Comptes de test

- `monark@pymail.cm` / `Monark123`
- `parker@pymail.cm` / `Monark123`
- `rubens@pymail.cm` — superadmin (mot de passe équipe)
