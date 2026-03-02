export function log(...args: unknown[]) {
  if (figma.editorType === "figjam") return; // keep quiet in FigJam if desired
  // eslint-disable-next-line no-console
  console.log("[WCAG22]", ...args);
}
