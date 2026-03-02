import { RGB, relativeLuminance } from "./luminance";

/**
 * Composite a foreground color with opacity over an opaque background color.
 */
function composite(fg: RGB, fgAlpha: number, bg: RGB): RGB {
  const a = fgAlpha;
  return {
    r: fg.r * a + bg.r * (1 - a),
    g: fg.g * a + bg.g * (1 - a),
    b: fg.b * a + bg.b * (1 - a),
  };
}

export function contrastRatio(
  fg: RGB,
  bg: RGB,
  fgAlpha = 1,
  bgAlpha = 1
): number {
  const opaqueBg = bgAlpha === 1 ? bg : composite(bg, bgAlpha, { r: 1, g: 1, b: 1 });
  const blendedFg = fgAlpha === 1 ? fg : composite(fg, fgAlpha, opaqueBg);
  const L1 = relativeLuminance(blendedFg);
  const L2 = relativeLuminance(opaqueBg);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}
