/**
 * Feature flags por cliente.
 *
 * El backend resuelve el valor efectivo de cada flag (rollout global u
 * opt-in por whitelist) y lo entrega dentro de `loginProfile.featureFlags`
 * (ver AuthContext). Este helper solo lee ese mapa ya resuelto — no hay
 * lógica de negocio acá.
 *
 * Si `featureFlags` no llegó todavía (sesión recién rehidratada desde
 * localStorage antes del primer refresh), se trata como "sin flags" →
 * comportamiento por defecto (versión anterior de la feature).
 */
export function isFeatureEnabled(
  loginProfile: { featureFlags?: Record<string, boolean> } | null | undefined,
  key: string,
): boolean {
  return Boolean(loginProfile?.featureFlags?.[key]);
}
