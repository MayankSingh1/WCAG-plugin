import { Issue } from "../types";

interface Ctx {
  textSizeMin: number;
  strictTextSize: boolean;
}

export async function textSizeRule(node: SceneNode, ctx: Ctx): Promise<Issue[]> {
  if (node.type !== "TEXT") return [];

  const fontSize = node.fontSize as number | PluginAPI["mixed"];
  if (fontSize === figma.mixed) return []; // mixed styles, skip for MVP
  const threshold = ctx.textSizeMin ?? 12;

  if ((fontSize as number) >= threshold) return [];

  const severity = ctx.strictTextSize ? "error" : "warning";

  return [
    {
      id: `${node.id}-textsize`,
      severity,
      wcagRef: "DS-TextSize",
      issueType: "text-size",
      title: "Text below design minimum",
      nodeId: node.id,
      nodeName: node.name,
      nodeType: node.type,
      message: `Font size ${fontSize}px is below ${threshold}px`,
      suggestion: "Increase text size to meet design system minimum for legibility.",
      evidence: { fontSize, nodeName: node.name },
    },
  ];
}
