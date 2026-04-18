import { describe, it, expect } from "vitest";
import { demandColor, demandOpacity } from "./colorScale";

describe("demandColor", () => {
  it("returns blue-ish for index 0", () => {
    expect(demandColor(0)).toBe("rgb(59,130,246)");
  });

  it("returns red-ish for index 100", () => {
    expect(demandColor(100)).toBe("rgb(239,68,68)");
  });

  it("clamps below 0", () => {
    expect(demandColor(-10)).toBe(demandColor(0));
  });

  it("clamps above 100", () => {
    expect(demandColor(150)).toBe(demandColor(100));
  });

  it("midpoint is yellowish", () => {
    const mid = demandColor(50);
    expect(mid).toBe("rgb(234,179,8)");
  });
});

describe("demandOpacity", () => {
  it("minimum opacity at 0", () => {
    expect(demandOpacity(0)).toBeCloseTo(0.3);
  });

  it("maximum opacity at 100", () => {
    expect(demandOpacity(100)).toBeCloseTo(0.85);
  });

  it("is monotonically increasing", () => {
    expect(demandOpacity(40)).toBeLessThan(demandOpacity(80));
  });
});
