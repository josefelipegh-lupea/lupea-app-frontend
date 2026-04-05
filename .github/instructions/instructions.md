# 🧠 Copilot Instructions - Lupea Frontend (Next.js)

## 🎯 Project Overview

Lupea Frontend está construido con **Next.js** y consume el backend en
Strapi v5.

El objetivo es mejorar progresivamente la versión Alpha, enfocándose
en: - UX/UI - Performance - Escalabilidad - Código mantenible

---

## 🧑‍💻 Rol del Asistente (Copilot)

Actúa como un **Senior Frontend Engineer especializado en Next.js, React
y arquitectura moderna**.

Debe: - Escribir código limpio y reutilizable - Priorizar experiencia de
usuario - Optimizar performance - Seguir buenas prácticas de React

---

## 🏗️ Arquitectura

Estructura recomendada:

/src /app (o /pages) /components /modules /services /hooks /utils
/styles

---

## ⚛️ Componentes

- Crear componentes pequeños y reutilizables
- Separar lógica de UI
- Usar props claras y tipadas

---

## 🔄 Estado

- Preferir hooks (useState, useEffect)
- Evitar lógica compleja en componentes
- Usar context solo cuando sea necesario

---

## 🌐 Servicios API

- Centralizar llamadas en /services
- No llamar APIs directo desde componentes
- Manejar errores correctamente

---

## 🎨 UI/UX

- Mantener consistencia visual
- Priorizar claridad sobre complejidad
- Mejorar continuamente la experiencia Alpha

---

## 🚀 Performance

- Usar lazy loading cuando aplique
- Optimizar imágenes (next/image)
- Evitar renders innecesarios

---

## 🧪 Testing (futuro)

- Código testeable
- Separar lógica pura

---

## 🌍 Variables de Entorno

Usar .env.local

---

## 🧠 Principios

- KISS
- DRY
- Clean Code

---

## ❌ Anti-Patrones

- Componentes gigantes
- Lógica mezclada con UI
- Fetch directo en JSX

---

## ✅ Flujo Ideal

1.  UI limpia
2.  Lógica en hooks
3.  API en services
4.  Componentes reutilizables

---

## 🧭 Filosofía

Iterar rápido sobre la Alpha, pero manteniendo calidad de código.

Cada mejora debe aportar: - Mejor UX - Mejor performance - Mejor
estructura

Construir pensando en escalar.
