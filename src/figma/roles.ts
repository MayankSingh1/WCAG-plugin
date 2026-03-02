const interactiveNameRegex = /(button|icon button|cta|link|chip|toggle|switch|checkbox|radio)/i;

export function isInteractive(node: SceneNode): boolean {
  if (node.type === "COMPONENT" || node.type === "INSTANCE") return true;
  if (interactiveNameRegex.test(node.name)) return true;
  if (node.getPluginData("interactive") === "true") return true;
  const role = node.getPluginData("role");
  if (role && ["button", "link", "input"].includes(role)) return true;
  return false;
}

export function isNonTextCandidate(node: SceneNode): boolean {
  if (!isInteractive(node)) return false;
  return (
    node.type === "VECTOR" ||
    node.type === "BOOLEAN_OPERATION" ||
    node.type === "RECTANGLE" ||
    node.type === "ELLIPSE" ||
    node.type === "POLYGON" ||
    node.type === "STAR"
  );
}
