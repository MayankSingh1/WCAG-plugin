import { Issue } from "../types";
import { findEffectiveBackground } from "../figma/background";
import { contrastRatio } from "../color/contrast";
import { RGB } from "../color/luminance";
import { isNonTextCandidate } from "../figma/roles";

const isSolidPaint = (paint: Paint): paint is SolidPaint =>
  paint.type === "SOLID" && paint.visible !== false && typeof paint.opacity !== "undefined";

function solidFromNode(node: SceneNode): { color: RGB; opacity: number } | null {
  if ("fills" in node && Array.isArray((node as any).fills)) {
    for (const paint of (node as any).fills as Paint[]) {
      if (isSolidPaint(paint)) {
        return { color: paint.color, opacity: paint.opacity ?? 1 };
      }
    }
  }
  if ("strokes" in node && Array.isArray((node as any).strokes)) {
    for (const paint of (node as any).strokes as Paint[]) {
      if (isSolidPaint(paint)) {
        return { color: paint.color, opacity: paint.opacity ?? 1 };
      }
    }
  }
  return null;
}

export async function nonTextContrastRule(node: SceneNode): Promise<Issue[]> {
  if (!isNonTextCandidate(node)) return [];

  const fg = solidFromNode(node);
  if (!fg) {
    return [
      {
        id: `${node.id}-nontext-unknownfg`,
        severity: "manual",
        wcagRef: "1.4.11",
        issueType: "contrast",
        title: "Foreground unclear",
        nodeId: node.id,
        nodeName: node.name,
        nodeType: node.type,
        message: "Non-text element has no solid fill/stroke; manual review.",
        suggestion: "Use solid fill/stroke for automatic contrast evaluation.",
        evidence: {},
      },
    ];
  }

  const bg = findEffectiveBackground(node);
  if (!bg || bg.type !== "solid") {
    return [
      {
        id: `${node.id}-nontext-bgunknown`,
        severity: "manual",
        wcagRef: "1.4.11",
        issueType: "contrast",
        title: "Background unclear",
        nodeId: node.id,
        nodeName: node.name,
        nodeType: node.type,
        message: "Could not determine solid background; manual review.",
        suggestion: "Verify contrast against actual background.",
        evidence: {},
      },
    ];
  }

  const ratio = contrastRatio(fg.color, bg.color, fg.opacity, bg.opacity);
  if (ratio >= 3) return [];

  return [
    {
      id: `${node.id}-nontext`,
      severity: "warning",
      wcagRef: "1.4.11",
      issueType: "contrast",
      title: "Non-text contrast low",
      nodeId: node.id,
      nodeName: node.name,
      nodeType: node.type,
      message: `Contrast ${ratio.toFixed(2)}:1 below 3:1`,
      suggestion: "Darken foreground or lighten background to reach 3:1.",
      evidence: { ratio, fg: fg.color, bgColor: bg.color },
    },
  ];
}
