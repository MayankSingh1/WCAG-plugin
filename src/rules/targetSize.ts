import { Issue } from "../types";
import { isInteractive } from "../figma/roles";

export async function targetSizeRule(node: SceneNode): Promise<Issue[]> {
  if (!isInteractive(node)) return [];

  const bounds = (node as GeometryMixin).absoluteRenderBounds || node.absoluteBoundingBox;
  if (!bounds) return [];

  const width = bounds.width;
  const height = bounds.height;
  if (width >= 24 && height >= 24) return [];

  return [
    {
      id: `${node.id}-target`,
      severity: "error",
      wcagRef: "2.5.8",
      issueType: "target-size",
      title: "Target too small",
      nodeId: node.id,
      nodeName: node.name,
      nodeType: node.type,
      message: `${Math.round(width)}×${Math.round(height)}px < 24×24px minimum`,
      suggestion:
        "Increase hit area to at least 24×24px. Add padding or min-size; if visually small, keep visual size but enlarge touch target via invisible padding container.",
      evidence: { width, height },
    },
  ];
}
