import { Issue } from "../types";
import { findEffectiveBackground } from "../figma/background";
import { contrastRatio } from "../color/contrast";
import { RGB } from "../color/luminance";

const isSolidPaint = (paint: Paint): paint is SolidPaint =>
  paint.type === "SOLID" && paint.visible !== false && typeof paint.opacity !== "undefined";

function firstSolidFill(node: TextNode): SolidPaint | null {
  if (!("fills" in node) || !Array.isArray(node.fills)) return null;
  for (const paint of node.fills as Paint[]) {
    if (isSolidPaint(paint)) return paint;
  }
  return null;
}

function fontIsBold(node: TextNode): boolean {
  const weight = node.fontWeight;
  if (weight === figma.mixed) return false;
  return typeof weight === "number" ? weight >= 700 : false;
}

function fontSizeValue(node: TextNode): number | null {
  if (node.fontSize === figma.mixed) return null;
  return node.fontSize as number;
}

export async function textContrastRule(node: SceneNode): Promise<Issue[]> {
  if (node.type !== "TEXT") return [];

  const fill = firstSolidFill(node);
  if (!fill) {
    return [
      {
        id: `${node.id}-textcontrast-unknownfill`,
        severity: "manual",
        wcagRef: "1.4.3",
        issueType: "contrast",
        title: "Text fill not solid",
        nodeId: node.id,
        nodeName: node.name,
        nodeType: node.type,
        message: "Text uses non-solid fill; manual contrast review needed.",
        suggestion: "Use solid fill to auto-evaluate or verify manually.",
        evidence: {},
      },
    ];
  }

  const bg = findEffectiveBackground(node);
  if (!bg || bg.type !== "solid") {
    return [
      {
        id: `${node.id}-textcontrast-bgunknown`,
        severity: "manual",
        wcagRef: "1.4.3",
        issueType: "contrast",
        title: "Background unclear",
        nodeId: node.id,
        nodeName: node.name,
        nodeType: node.type,
        message: "Could not determine solid background; manual contrast review needed.",
        suggestion: "Check contrast against actual background.",
        evidence: {},
      },
    ];
  }

  const fontSize = fontSizeValue(node);
  if (!fontSize) return [];
  const isLarge = fontSize >= 24 || (fontSize >= 18.66 && fontIsBold(node));
  const threshold = isLarge ? 3 : 4.5;

  const fgColor: RGB = fill.color;
  const ratio = contrastRatio(fgColor, bg.color, fill.opacity ?? 1, bg.opacity);

  if (ratio >= threshold) return [];

  return [
    {
      id: `${node.id}-textcontrast`,
      severity: "error",
      wcagRef: "1.4.3",
      issueType: "contrast",
      title: "Insufficient text contrast",
      nodeId: node.id,
      nodeName: node.name,
      nodeType: node.type,
      message: `Contrast ${ratio.toFixed(2)}:1 below ${threshold}:1`,
      suggestion: "Increase text color contrast or adjust background.",
      evidence: {
        ratio,
        textColor: fgColor,
        bgColor: bg.color,
        fontSize,
        fontWeight: node.fontWeight,
      },
    },
  ];
}
