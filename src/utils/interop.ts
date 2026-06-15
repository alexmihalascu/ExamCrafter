import type { ComponentType } from 'react';

/**
 * Vite 8 / rolldown can double-wrap the default export of CommonJS packages
 * (e.g. react-countup, react-apexcharts), so a plain default import yields an
 * object instead of the component. This unwraps up to two levels defensively,
 * covering both the dev double-wrap and the single-wrap prod build.
 */
export function interopDefault<P = Record<string, unknown>>(mod: unknown): ComponentType<P> {
  const level1 = (mod as { default?: unknown })?.default;
  const level2 = (level1 as { default?: unknown })?.default;
  return (level2 || level1 || mod) as ComponentType<P>;
}
