# Pyramid Mail — Frontend 🚀

## 📋 Description

Pyramid Mail est une application de messagerie web moderne, intégrée à un backend NestJS/Fastify. Sprint 01 clôturé sur `sprint-01-dev-a` avec upload, recherche avancée, profil et UX corbeille/spam finalisés.

## ⚠️ Prérequis techniques (upload)

**MinIO doit tourner avant tout upload** (pièces jointes ou photo de profil) :

```bash
cd docker
docker compose up -d minio redis
```

Sans MinIO, l'API renvoie une erreur 500. PostgreSQL et MailHog sont nécessaires pour l'auth et l'envoi d'emails.

## 🎨 Design System

- **Bleu primaire :** `#0087CA`
- **Fonds :** `#EDF3F6`, `#DFE5E7`
- **Texte :** `#162A42`, `#091D35`
- Composants : shadcn/ui + Tailwind

## 📦 Stack technique

React 18, Vite 5, TypeScript, Tailwind, Zustand, TanStack Query, Tiptap, React Router v6, Lucide.

## 🗺️ Routes principales

| Route                                         | Page                | Protection |
| --------------------------------------------- | ------------------- | ---------- |
| `/login`, `/signup`, `/forgot-password`       | Auth                | Publique   |
| `/inbox`, `/sent`, `/drafts`, `/bin`, `/spam` | Dossiers            | Protégée   |
| `/starred`, `/importants`, `/all-mails`       | Raccourcis          | Protégée   |
| `/search`                                     | Résultats recherche | Protégée   |
| `/profile`, `/settings`                       | Compte              | Protégée   |
| `/admin/*`                                    | Administration      | Admin      |

## 📊 Sprint 01 — État des fonctionnalités

| Fonctionnalité                  | Statut           | Notes                                                          |
| ------------------------------- | ---------------- | -------------------------------------------------------------- |
| Upload pièces jointes (Compose) | ✅ Fonctionnel   | `email.service.uploadAttachment`, intercepteur FormData        |
| Upload avatar (Profil)          | ✅ Fonctionnel   | `user.service.uploadAvatar`                                    |
| Avatar dans dropdown header     | ✅ Implémenté    | `jwt.strategy` + `Header` AvatarImage + cache `AUTH_QUERY_KEY` |
| Recherche avancée               | ✅ 100 %         | De, Objet, Dossier, PJ → URL + `useSearch`                     |
| Icône Archive (lecture)         | ✅ Fonctionnelle | `InboxPage` → `folder: ARCHIVE`                                |
| Modales corbeille / spam        | ✅ OK            | `ConfirmDialog` — vider + supprimer définitivement             |
| Prévisualisation PJ             | ✅               | `AttachmentPreview` (image/PDF/blob)                           |
| Répondre / Composer / Emojis    | ✅               | Sprint précédent                                               |

## 🔧 Composants clés

- `Header.tsx` — Recherche simple + avancée, avatar compte
- `ComposeModal.tsx` — Rédaction + upload PJ
- `AttachmentCard` / `AttachmentPreview` — PJ dans la lecture
- `confirm-dialog.tsx` — Confirmations stylisées
- `ProfilePage.tsx` — Profil + avatar (`resolveApiPath`)

## 🔐 Comptes de test

| Email              | Mot de passe | Rôle                 |
| ------------------ | ------------ | -------------------- |
| `monark@pymail.cm` | `Monark123`  | user / free          |
| `parker@pymail.cm` | `Monark123`  | user / free          |
| `rubens@pymail.cm` | (équipe)     | superadmin / premium |
| `isaac@pymail.cm`  | (équipe)     | user / free          |

## 🚀 Installation et démarrage

```bash
cd docker && docker compose up -d
pnpm install
cd apps/backend && cp .env.example .env && pnpm prisma:migrate && pnpm prisma:generate
cd ../.. && pnpm dev
```

- Frontend : http://localhost:5173
- API : http://localhost:3000/api

## 🧪 Workflows de test

### Upload pièce jointe

1. Se connecter → Nouveau message → icône trombone → joindre un fichier → envoyer.
2. Ou curl : `POST /api/attachments/upload` avec cookie de session (voir `apps/backend/README.md`).

### Upload avatar + header

1. Profil → changer la photo → sauvegarder.
2. Ouvrir le menu compte (header) : l'avatar doit s'afficher **sans recharger la page**.

### Recherche avancée

1. Icône filtres dans la barre de recherche.
2. Renseigner De / Objet / Dossier / PJ → Rechercher.
3. Vérifier l'URL `/search?from=...&subject=...` et les résultats.

### Archive

1. Ouvrir un email dans Inbox → icône Archive → le thread quitte la boîte de réception.

### Corbeille / Spam

1. Vider la corbeille ou le spam → modale de confirmation (pas de `confirm()` natif).
2. Supprimer définitivement un email → seconde modale de confirmation.

## 🔮 Prochaines étapes

- Tests E2E (Playwright)
- Notifications temps réel
- PWA / mode hors-ligne

## 👥 Contribution

Branche de feature → Pull Request vers `sprint-01-dev-a` ou `main` selon la politique d'équipe.
