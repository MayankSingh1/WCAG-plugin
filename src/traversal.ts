import { log } from "./utils/logger";

export interface CancelToken {
  cancelled: boolean;
}

type VisitFn = (node: SceneNode, scanned: number, total: number) => Promise<void>;

export async function traverse(
  scope: "selection" | "page",
  includeHidden: boolean,
  includeLocked: boolean,
  cancel: CancelToken,
  visit: VisitFn
): Promise<{ cancelled: boolean; total: number }> {
  const roots =
    scope === "selection" ? figma.currentPage.selection : (figma.currentPage.children as SceneNode[]);

  if (scope === "selection" && roots.length === 0) {
    throw new Error("Selection is empty. Select at least one node.");
  }

  const queue: SceneNode[] = [...roots];
  let scanned = 0;
  let total = queue.length;

  while (queue.length) {
    if (cancel.cancelled) return { cancelled: true, total: scanned };
    const node = queue.shift()!;
    scanned++;

    await visit(node, scanned, total);

    if ("children" in node) {
      for (const child of node.children as SceneNode[]) {
        if ((!includeHidden && !child.visible) || (!includeLocked && (child as any).locked) ) continue;
        queue.push(child);
        total++;
      }
    }

    if (scanned % 200 === 0) {
      await Promise.resolve(); // yield
    }
  }

  log("Traversal complete", scanned);
  return { cancelled: false, total: scanned };
}
