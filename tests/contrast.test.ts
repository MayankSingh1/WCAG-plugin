import { describe, expect, it } from "vitest";
import { contrastRatio } from "../src/color/contrast";

describe("contrast thresholds", () => {
  it("passes 4.5 threshold for high contrast", () => {
    const ratio = contrastRatio({ r: 0, g: 0, b: 0 }, { r: 1, g: 1, b: 1 });
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it("fails 3:1 when colors are close", () => {
    const ratio = contrastRatio({ r: 0.6, g: 0.6, b: 0.6 }, { r: 0.7, g: 0.7, b: 0.7 });
    expect(ratio).toBeLessThan(3);
  });
});
