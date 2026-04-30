# Workspace

## Overview

Imported from GitHub: https://github.com/Serena95/CRM-NUOVO.git

A Nexus CRM web application originally built with React + Vite + Express, using Firebase Firestore, Supabase, and the Google Gemini API. Imported into the pnpm workspace as the `crm-nuovo` artifact mounted at `/`.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend (crm-nuovo)**: React 19 + Vite, Tailwind CSS v4, Radix UI / base-ui, react-router-dom, TanStack Query, Zustand, TipTap, FullCalendar, Recharts, D3, Framer Motion
- **External services used by the imported code**: Firebase (`firebase-applet-config.json`), Supabase, Google Gemini AI (`@google/genai`)
- **API framework (template)**: Express 5 (separate `api-server` artifact, untouched)
- **Validation**: Zod
- **API codegen**: Orval (for the template api-server)

## Artifacts

- `artifacts/crm-nuovo` — the imported Nexus CRM React + Vite app, served at `/`
- `artifacts/api-server` — pnpm-template Express API at `/api` (not used by the imported app)
- `artifacts/mockup-sandbox` — design canvas at `/__mockup`

## Environment Variables

The imported app expects (see `artifacts/crm-nuovo/.env.example`):

- `GEMINI_API_KEY` — Google Gemini API key (used by `agenteService.ts`)
- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` — Supabase project credentials
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role (server-side only)
- `API_TOKEN` / `CRM_WEBHOOK_URL` — used by the original `server.ts` CRM webhook routes

Without these, the UI loads but Gemini, Supabase, and Firebase-backed features will be limited.

## Notes on the Import

- The original repo used a custom `server.ts` (Express + Firebase) for `/api/crm/*` and `/api/public/form` endpoints. That file is preserved in the artifact root for reference but is not wired into the workspace's API server. Backend ports were not migrated as part of the import.
- `@base-ui/react` imports were rewritten to `@base-ui-components/react` (the package's current published name).
- The original `@import "shadcn/tailwind.css"` line in `src/index.css` was removed because it referred to a generated AI Studio file that does not exist in the npm `shadcn` package; the rest of the Tailwind v4 theme block remains.
- Vite config was adapted to the workspace's `PORT` / `BASE_PATH` conventions while keeping the `process.env.GEMINI_API_KEY` define from the original.

## Key Commands

- `pnpm --filter @workspace/crm-nuovo run dev` — run the CRM frontend (use the workflow instead in Replit)
- `pnpm --filter @workspace/crm-nuovo run build` — production build
- `pnpm install` — install workspace dependencies

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
