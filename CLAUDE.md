# CLAUDE.md — Lupea Frontend

> Contexto y reglas para Claude Code en el repo **frontend** de Lupea.
> El backend (Strapi 5) vive en un **repo separado**; este archivo aplica solo al frontend.
> Este archivo describe el **estado real** + las **convenciones objetivo**. Donde el
> código actual difiere del objetivo, se indica explícitamente.
> **No asumas capas, endpoints o patrones que no verificaste en el árbol.**

---

## Proyecto

Lupea (www.lupea.app) es un **ecosistema de bienestar automotriz**: un marketplace
B2B/B2C de repuestos que conecta **Usuarios** (clientes) con **Aliados** (proveedores
certificados) a través del flujo:

`solicitud → matching → cotización → orden de compra`

Monetización por tokens (moneda **"lupa"**). **Develsoft** es el partner técnico de ejecución.

---

## Stack real (verificado 2026-07-09)

- **Next.js 16.1.0** (App Router) · **React 19.2.3** · **TypeScript 5.9.3** (`strict: true`)
- **Tailwind CSS v4.2.0** — tokens en `app/globals.css` vía `@theme` (CSS-first). **NO tratar como v3.**
- **pnpm** (workspace, `packages: [.]`) · **Zod v4** · SDK `openai` contra **OpenRouter** · `socket.io-client` · `react-markdown` + `remark-breaks`
- Sin React Query/SWR → `fetch` nativo. Sin Redux/Zustand → **React Context**. Sin lib UI externa → **CSS Modules**.

> ⚠️ Deuda conocida en config: coexisten `tailwind.config.ts` (estilo v3) y `@theme` CSS-first.
> La **fuente de verdad de los tokens es `globals.css`**. Al agregar tokens, hacelo ahí.

---

## Léxico de dominio (OBLIGATORIO)

| Dominio                                     | Código                             |
| ------------------------------------------- | ---------------------------------- |
| **Usuario** (cliente)                       | `role: "client"`                   |
| **Aliado** (proveedor)                      | `role: "provider"`                 |
| **lupa** (saldo/moneda), verbo **"lupear"** | campos `tokens*` en `loginProfile` |

- Regla de negocio: **1 solicitud = 1 lupa** (varios repuestos en una solicitud = un solo _lupeo_).
- ⚠️ **Inconsistencia conocida:** el dominio dice `lupa`/`lupear`, el código dice `tokens*`.
  Al escribir la **capa de dominio** usá semántica `lupa`; el mapeo `tokens → lupa` vive en el **adapter**.

---

## Reglas de seguridad y producción (NO NEGOCIABLES)

- **App EN PRODUCCIÓN.** Nunca trabajar directo en `main`. Toda tarea en **feature branch**.
- **Diagnose-before-implement:** primero prompt de diagnóstico _read-only_, revisar el output, y recién ahí implementar.
- **Nunca commitear secretos.** `.env.local` no se versiona. (Deuda urgente: hay claves reales expuestas — rotar y verificar `.gitignore`.)
- **Nunca tocar datos de producción** sin confirmación explícita del humano.
- **Sin refactors big-bang.** Clean Architecture / SOLID se aplican a **código nuevo** y de forma **oportunista** al tocar código existente, nunca migrando todo de golpe.
- Endpoints temporales (seed, wipe) se despliegan, se ejecutan, se borran y se verifica 404. Los permanentes viven en su namespace.

---

## Convenciones de código

### Estructura

- **Componentes:** `components/<kebab-carpeta>/<PascalCase>.tsx` + `<PascalCase>.module.css` colocado.
- **Rutas:** App Router en `app/`, route groups `(auth)` y `(dashboard)`.
- **Cliente API:** `app/lib/api/<dominio>/` — segmentado por `client/`, `provider/`, `request/`, `vendor/`.
- **Estado:** `context/` (Auth, Socket, Sidebar, FooterVisibility). **Hooks:** `hooks/`. **Schemas:** `schemas/` (Zod).

### Estilos

- CSS Modules por componente. Tokens **Material Design 3** (surface/primary/secondary/tertiary + _fixed_) y tipografía Lupea (`display-lg`, `headline`, `body`, `label`) en `globals.css @theme`.
- Usar utilidades Tailwind **sobre los tokens existentes**. No hardcodear colores ni tamaños de fuente.

### Estado y auth

- 4 Contexts. `AuthContext` persiste en `localStorage` (`jwt`, `userData`, `loginProfile`, `fullProfile`) — patrón SPA.
- **No introducir** React Query / estado global nuevo sin decisión explícita.

### Integración Strapi 5

- Respuesta estándar: `{ ok, message, data }` + **`documentId`** (no `id` numérico como en v4).
- Document Service: `status: 'published'` (**no** `publishedAt` de v4).
- `fetch` + `Authorization: Bearer ${jwt}`. Realtime vía socket.io en `/realtime/socket.io`.
- ⚠️ **Deuda:** `API_URL` está duplicado en ~15 archivos de `app/lib/api`. Al crear módulos nuevos, **centralizar** (ver arquitectura).

---

## Arquitectura

Ver **`@.claude/rules/architecture.md`** — Clean Architecture (pragmática) + SOLID.

> **IMPORTANTE:** el código actual es mayormente client-side (fetch en componentes, JWT en
> localStorage, casi sin Server Components). La arquitectura objetivo **NO está implementada aún**:
> es guía para código nuevo y refactor oportunista, **no** una descripción del estado actual.

---

## Lo que NO está terminado (no asumir que funciona)

- **Lupita** (chat IA): el envío de solicitud es **STUB** (`handleSubmitStub` = `console.log`). No llama a `/quote-requests/me`. El flujo v1 no cierra.
- **Sin tests** (cero cobertura). Sin `loading.tsx` / `error.tsx` (se usan `Skeleton*` manuales).
- **Bug conocido:** `matchedProvidersCount: 0` para proveedores tras el reseed de taxonomía (perfiles apuntando a IDs viejos).

---

## Comandos

- `pnpm dev` · `pnpm build` · `pnpm start` · `pnpm lint`
- **No hay** script de `test`.
- **Frontend y backend son repos independientes** (no es un monorepo). Este repo es solo el frontend; el backend Strapi 5 tiene su propio repo y su propio ciclo.
