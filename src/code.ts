import { runRules } from "./engine/ruleEngine";
import { traverse, CancelToken } from "./traversal";
import { defaultSettings } from "./settings";
import { Issue, ScanResult, ScanRequest } from "./types";
import { log } from "./utils/logger";

declare const __UI_HTML__: string;

// Wider panel to show table + detail side-by-side
figma.showUI(__UI_HTML__, { width: 960, height: 760 });

let cancelToken: CancelToken | null = null;

function summarize(issues: Issue[], durationMs: number, nodesScanned: number): ScanResult["summary"] {
  return {
    errors: issues.filter((i) => i.severity === "error").length,
    warnings: issues.filter((i) => i.severity === "warning").length,
    manual: issues.filter((i) => i.severity === "manual").length,
    total: issues.length,
    durationMs,
    nodesScanned,
  };
}

function postProgress(scanned: number, total: number, lastNodeId?: string) {
  figma.ui.postMessage({
    type: "SCAN_PROGRESS",
    payload: { scanned, total, percent: total === 0 ? 0 : scanned / total, lastNodeId },
  });
}

function postComplete(issues: Issue[], summary: ScanResult["summary"]) {
  figma.ui.postMessage({ type: "SCAN_COMPLETE", payload: { issues, summary } });
}

function postError(message: string) {
  figma.ui.postMessage({ type: "SCAN_ERROR", payload: { message } });
}

figma.ui.onmessage = async (msg) => {
  if (msg.type === "START_SCAN") {
    const payload = msg.payload as ScanRequest;
    const settings = {
      includeHidden: payload.includeHidden ?? defaultSettings.includeHidden,
      includeLocked: payload.includeLocked ?? defaultSettings.includeLocked,
      textSizeMin: payload.textSizeMin ?? defaultSettings.textSizeMin,
      strictTextSize: payload.strictTextSize ?? defaultSettings.strictTextSize,
    };

    if (payload.scope === "selection" && figma.currentPage.selection.length === 0) {
      postError("Selection is empty. Select at least one node.");
      return;
    }

    cancelToken = { cancelled: false };
    const start = Date.now();
    const timeout = setTimeout(() => {
      if (cancelToken) cancelToken.cancelled = true;
      postError("Scan timed out (20s). Try scanning a smaller scope.");
    }, 20000);

    const issues: Issue[] = [];

    try {
      const traversalResult = await traverse(
        payload.scope,
        settings.includeHidden,
        settings.includeLocked,
        cancelToken,
        async (node, scanned, total) => {
          issues.push(...(await runRules(node, { textSizeMin: settings.textSizeMin, strictTextSize: settings.strictTextSize })));
          if (scanned % 50 === 0) {
            postProgress(scanned, total, node.id);
          }
        }
      );

      if (cancelToken.cancelled) {
        figma.ui.postMessage({ type: "SCAN_CANCELLED" });
      } else {
        const summary = summarize(issues, Date.now() - start, traversalResult.total);
        postComplete(issues, summary);
      }
    } catch (err: any) {
      postError(err?.message ?? String(err));
    } finally {
      clearTimeout(timeout);
    }
  }

  if (msg.type === "CANCEL_SCAN") {
    if (cancelToken) cancelToken.cancelled = true;
  }

  if (msg.type === "GO_TO_NODE") {
    const node = figma.getNodeById(msg.payload.id);
    if (node) {
      figma.currentPage.selection = [node];
      figma.viewport.scrollAndZoomIntoView([node]);
    }
  }
};
