import { RGB } from "../color/luminance";

export type BackgroundResult =
  | { type: "solid"; color: RGB; opacity: number }
  | { type: "unknown" }
  | null;

const isSolidPaint = (paint: Paint): paint is SolidPaint =>
  paint.type === "SOLID" && paint.visible !== false && typeof paint.opacity !== "undefined";

function firstSolidFill(node: BaseNode & { fills?: readonly Paint[] }): SolidPaint | null {
  if (!("fills" in node) || !Array.isArray(node.fills)) return null;
  for (const paint of node.fills as Paint[]) {
    if (isSolidPaint(paint)) return paint;
  }
  return null;
}

/**
 * Try to find an effective solid background for a node.
 * Walks siblings (background rect) then ancestors.
 */
export function findEffectiveBackground(node: SceneNode): BackgroundResult {
  const parent = node.parent;

  // Heuristic: background rectangle just behind the node inside same frame
  if (parent && "children" in parent) {
    const siblings = parent.children;
    const idx = siblings.indexOf(node);
    for (let i = idx - 1; i >= 0; i--) {
      const sib = siblings[i];
      if ("fills" in sib) {
        const fill = firstSolidFill(sib as any);
        if (fill) {
          return {
            type: "solid",
            color: fill.color,
            opacity: fill.opacity ?? 1,
          };
        }
      }
    }
  }

  // Walk ancestors
  let p: BaseNode | null = node.parent;
  while (p) {
    if ("fills" in p) {
      const fill = firstSolidFill(p as any);
      if (fill) {
        return {
          type: "solid",
          color: fill.color,
          opacity: fill.opacity ?? 1,
        };
      }
      // if has any fill that is not solid, background is unknown
      const fills = (p as any).fills as Paint[];
      if (Array.isArray(fills) && fills.some((f) => f.type !== "SOLID" && f.visible !== false)) {
        return { type: "unknown" };
      }
    }
    p = p.parent;
  }

  return null;
}
