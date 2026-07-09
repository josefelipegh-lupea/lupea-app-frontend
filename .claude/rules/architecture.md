# Arquitectura — Clean Architecture (pragmática) + SOLID · Lupea Frontend

> Destino en el repo: `frontend/.claude/rules/architecture.md`
> Importado desde `CLAUDE.md` vía `@.claude/rules/architecture.md`.

---

## Estado vs. objetivo (leer primero)

El código actual **NO sigue esta arquitectura**: la mayoría son client components que hacen
`fetch` directo con el JWT de localStorage, sin capa de dominio ni casos de uso.

Este documento define el **objetivo** para:

1. **Código nuevo** (features desde cero).
2. **Refactors oportunistas** al tocar código existente — solo lo que tocás, nunca big-bang.

**No inventes capas que no existan en el árbol.** Si una capa falta, la creás siguiendo esto,
en **feature branch**, y de forma incremental. Ante la duda: diagnóstico read-only primero.

---

## Regla de dependencia (el corazón de Clean Architecture)

Las dependencias del código apuntan **siempre hacia adentro**. Lo de adentro **no conoce** lo de afuera.

```
   ┌───────────────────────────────────────────────┐
   │  Presentación  (React: app/, components/, ...) │
   │      │  usa                                     │
   │      ▼                                          │
   │  Casos de uso  (app/lib/use-cases/)             │
   │      │  depende de PUERTOS (interfaces)         │
   │      ▼                                          │
   │  Dominio  (app/lib/domain/)  ← núcleo puro      │
   │      ▲                                          │
   │      │  implementa los puertos                  │
   │  Adapters / Infra  (app/lib/api/**)             │
   └───────────────────────────────────────────────┘
```

Reglas duras:

- El **dominio** no importa React, ni `fetch`, ni Strapi, ni Next. Es TypeScript puro.
- Un **componente nunca** llama `fetch`/Strapi directo: pasa por un hook → caso de uso → repositorio.
- Lo que sabe de Strapi, JWT, URLs y socket.io vive **solo** en la capa adapter.

---

## Capas (mapeo a este repo)

### 1. Dominio — `app/lib/domain/`

Tipos y reglas de negocio puras, sin dependencias de framework.

- **Entidades:** `Usuario`, `Aliado`, `Solicitud` (QuoteRequest), `Cotizacion` (Quote), `Orden` (Order), `SaldoLupas`.
- **Reglas:** "1 solicitud = 1 lupa", estados válidos del flujo (`sent|pending|cancelled|completed`), semántica **lupa** (no "tokens").
- **Puertos (interfaces):** `SolicitudRepository`, `CotizacionRepository`, `OrdenRepository`… — contratos, sin implementación.

### 2. Casos de uso — `app/lib/use-cases/`

Orquestan el dominio. Dependen de **puertos** (interfaces), nunca de `fetch`/Strapi concreto.

- Ej.: `enviarSolicitud(input, { solicitudRepo })`, `compararCotizaciones({ cotizacionRepo }, solicitudId)`.
- Acá vive la lógica que hoy está mezclada dentro de `page.tsx`.

### 3. Adapters / Infraestructura — `app/lib/api/**`

El cliente Strapi actual **es** esta capa. Implementa los puertos del dominio.

- Mapea el DTO de Strapi (`{ ok, message, data }`, `documentId`, campos `tokens*`) ↔ entidades de dominio.
- Acá —y **solo** acá— se conoce Strapi, JWT, `API_URL` y socket.io.
- **Fix de deuda:** centralizar el `API_URL` duplicado (~15 archivos) en un único módulo de esta capa.
- Acá se resuelve el mapeo **`tokens*` → `lupa`**.

### 4. Presentación — `app/`, `components/`, `context/`, `hooks/`

React. Consume casos de uso **vía hooks**. Nunca `fetch`/Strapi directo.

- Los **hooks** son el puente presentación → casos de uso.
- Los **Contexts** son solo para estado transversal (Auth, Socket…), no para lógica de negocio.

---

## SOLID aplicado a Lupea (concreto, no abstracto)

### S — Single Responsibility

Un archivo, una razón para cambiar. Componente **renderiza**; hook = **lógica de vista**; caso de uso = **regla de negocio**; repositorio = **I/O**.

> ❌ Anti-patrón actual: `home/.../page.tsx` hace `fetch` + lee JWT de localStorage + renderiza. En código nuevo, separá esas tres responsabilidades.

### O — Open/Closed

Extender sin modificar. La cadena de fallback de modelos en `/api/lupita` y los repositorios se extienden **agregando** implementaciones, no editando el core.

### L — Liskov

Los flujos por rol (`home/user/*` vs `home/vendor/*`) deben ser **sustituibles** tras una interfaz común. Hoy son copy-paste; al unificar, respetá un contrato común (candidato a agent `role-mirror`).

### I — Interface Segregation

Puertos chicos por dominio (`client` / `provider` / `request` / `vendor`) — ya está segmentado, **mantenerlo**. No crear un "mega-repositorio" ni un mega-Context que obligue a depender de cosas que no se usan.

### D — Dependency Inversion

Casos de uso y componentes dependen de **interfaces (puertos)**, no de la implementación Strapi; la implementación se **inyecta**. Es lo que hoy más se viola (`fetch` directo en componentes) y **lo más valioso de arreglar**: desacopla la UI del backend y del transporte.

---

## Cómo aplicarlo sin romper producción

1. **No migres todo de golpe.** Esta arquitectura es un objetivo, no una tarea única.
2. **Feature nuevo:** construí en orden `dominio → caso de uso → adapter → UI`.
3. **Feature viejo:** al tocarlo, extraé solo la lógica de `fetch` del componente hacia un repositorio/caso de uso — nada más.
4. **Siempre** en feature branch + diagnóstico read-only antes de implementar.
5. Cuando una tarea empuje a refactorizar de más, **frená y consultá** antes de expandir el scope.
