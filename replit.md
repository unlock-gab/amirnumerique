# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Main product: **Amir Numérique** — a full-stack digital printing & advertising agency platform for Algeria.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Wouter + Framer Motion + Tailwind CSS

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Amir Numérique Platform

### Features
- **Bilingual**: French/Arabic with RTL support for Arabic
- **Role-based pricing**: visitor / client / subcontractor / admin tiers
- **Price calculator**: cm→m conversion, area × price/m² automatic
- **File uploads**: Print files, service images via upload endpoint
- **Admin dashboard**: Full CRUD for services, orders, quotes, users

### Auth
- Session-based (express-session + connect-pg-simple), NOT JWT
- Cookie `sameSite: "lax"` in dev
- Admin: `admin@amirnumerique.dz` / `admin123456`
- Client: `client@example.com` / `client123`

### Design System
- **Fonts**: Space Grotesk (display/headings) + Inter (body)
- **CSS Tokens**: `.glass`, `.glass-strong`, `.glow-primary`, `.card-premium`, `.text-gradient`, `.section-divider`, `.font-display`
- **Background**: `hsl(222 28% 7%)` (deep dark)
- **Accent**: amber/gold primary

### Key Architecture Notes
- Vite proxy: `/api` → `http://localhost:8080` (in `vite.config.ts`)
- `imageUrl` is in DB schema and all API Zod types
- Image upload: `useUploadFile()` hook returns `{url: string}`
- Order IDs are numbers; field `orderStatus`, `widthInput/heightInput/unitInput`, `displayedPrice/finalPrice`
- List endpoints return `{orders:[...], total}` / `{quotes:[...], total}` / `{users:[...], total}`
- Service detail shows ONLY total price in DA — no formula shown to client

### Pages
- `/` — Home (7 sections: hero, features, services, how-it-works, testimonials, pricing preview, CTA)
- `/services` — Services grid
- `/services/:slug` — Service detail (hero, pricing, order form, info sections)
- `/auth/login` — Split-screen login
- `/auth/register` — Registration
- `/pricing` — Pricing tiers
- `/admin` — Dashboard (stats + quick links + activity)
- `/admin/services` — Manage services with image upload
- `/admin/orders` — Orders table with status filter
- `/admin/quotes` — Quotes table
- `/admin/users` — Users with role management + search
- `/partenariat` — Subcontractor partnership request form (public) + WhatsApp integration
- `/admin/subcontractor-requests` — Admin view/manage subcontractor requests

### Subcontractor Flow
- Public `/partenariat` page: collects fullName, companyName, phone, city, activityType, estimatedVolume, message
- On success: saves to DB + shows WhatsApp CTA with pre-filled structured message
- WhatsApp number from settings key `company_whatsapp`
- Admin `/admin/subcontractor-requests`: list all requests, filter by status, expand details, update status (pending/reviewed/accepted/refused), open WhatsApp directly
- DB table: `subcontractor_requests` with `subcontractor_request_status` enum

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
