/**
 * Regression test for the "blind buttons" bug.
 *
 * tailwind.config.js used to REPLACE the default theme scales instead of
 * spreading them. In Tailwind v3.4 `defaultTheme.colors` is EMPTY (the real
 * palette lives in `tailwindcss/colors`), so `text-white`, `bg-black/80`,
 * gradients, shadows, etc. silently stopped generating - every button and gold
 * gradient rendered unstyled. These assertions fail if anyone re-breaks the
 * config by dropping the spreads.
 */
import * as configModule from '../../tailwind.config';

// Vite/Vitest expose the ESM default export as `.default`; fall back to the
// namespace so the test survives either interop shape.
const config = configModule.default ?? configModule;

// Every scale lives under `theme`. Reading `config.colors` directly returned
// undefined, which made all of these assertions silently meaningless.
const theme = config.theme ?? {};

describe('tailwind.config theme scales', () => {
  it('keeps the default color palette (text-white, bg-black/80, ...)', () => {
    expect(theme.colors.white).toBe('#fff');
    expect(theme.colors.black).toBe('#000');
    // Opacity modifiers like border-white/[0.06] need the base color present.
    expect(theme.colors.gray).toBeDefined();
    expect(theme.colors.red).toBeDefined();
  });

  it('keeps the brand palette layered on top of the defaults', () => {
    expect(theme.colors.ink['950']).toBe('#050505');
    expect(theme.colors.gold['400']).toBeDefined();
    expect(theme.colors.silver['100']).toBeDefined();
  });

  it('keeps default shadows AND the brand glows', () => {
    expect(theme.boxShadow.md).toBeDefined();
    expect(theme.boxShadow.glow).toBeDefined();
    expect(theme.boxShadow.card).toBeDefined();
  });

  it('keeps gradient utilities (bg-gradient-to-*) and the noise texture', () => {
    expect(theme.backgroundImage['gradient-to-b']).toBeDefined();
    expect(theme.backgroundImage['gradient-to-r']).toBeDefined();
    expect(theme.backgroundImage.grain).toContain('svg+xml');
  });

  it('keeps default + brand font families, animations and keyframes', () => {
    expect(Array.isArray(theme.fontFamily.sans)).toBe(true);
    expect(theme.fontFamily.display[0]).toBe('Cinzel');
    expect(typeof theme.animation['fade-in']).toBe('string');
    expect(theme.keyframes['fade-in']).toBeDefined();
  });
});
