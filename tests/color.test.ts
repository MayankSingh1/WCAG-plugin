import { describe, expect, it } from "vitest";
import { relativeLuminance } from "../src/color/luminance";
import { contrastRatio } from "../src/color/contrast";

describe("luminance", () => {
  it("computes relative luminance for black/white", () => {
    expect(relativeLuminance({ r: 0, g: 0, b: 0 })).toBeCloseTo(0);
    expect(relativeLuminance({ r: 1, g: 1, b: 1 })).toBeCloseTo(1);
  });
});

describe("contrast", () => {
  it("returns 21:1 for black/white", () => {
    expect(contrastRatio({ r: 0, g: 0, b: 0 }, { r: 1, g: 1, b: 1 })).toBeCloseTo(21);
  });

  it("handles opacity compositing", () => {
    const ratio = contrastRatio(
      { r: 0, g: 0, b: 0 },
      { r: 1, g: 1, b: 1 },
      0.5,
      1
    );
    // 50% black over white should drop below 4.5 but stay safely above 3
    expect(ratio).toBeLessThan(21);
    expect(ratio).toBeGreaterThan(3);
  });
});
