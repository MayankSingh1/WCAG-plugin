"use strict";

// src/figma/roles.ts
var interactiveNameRegex = /(button|icon button|cta|link|chip|toggle|switch|checkbox|radio)/i;
function isInteractive(node) {
  if (node.type === "COMPONENT" || node.type === "INSTANCE") return true;
  if (interactiveNameRegex.test(node.name)) return true;
  if (node.getPluginData("interactive") === "true") return true;
  const role = node.getPluginData("role");
  if (role && ["button", "link", "input"].includes(role)) return true;
  return false;
}
function isNonTextCandidate(node) {
  if (!isInteractive(node)) return false;
  return node.type === "VECTOR" || node.type === "BOOLEAN_OPERATION" || node.type === "RECTANGLE" || node.type === "ELLIPSE" || node.type === "POLYGON" || node.type === "STAR";
}

// src/rules/targetSize.ts
async function targetSizeRule(node) {
  if (!isInteractive(node)) return [];
  const bounds = node.absoluteRenderBounds || node.absoluteBoundingBox;
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
      message: `${Math.round(width)}\xD7${Math.round(height)}px < 24\xD724px minimum`,
      suggestion: "Increase hit area to at least 24\xD724px. Add padding or min-size; if visually small, keep visual size but enlarge touch target via invisible padding container.",
      evidence: { width, height }
    }
  ];
}

// src/rules/textSize.ts
async function textSizeRule(node, ctx) {
  var _a;
  if (node.type !== "TEXT") return [];
  const fontSize = node.fontSize;
  if (fontSize === figma.mixed) return [];
  const threshold = (_a = ctx.textSizeMin) != null ? _a : 12;
  if (fontSize >= threshold) return [];
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
      evidence: { fontSize, nodeName: node.name }
    }
  ];
}

// src/figma/background.ts
var isSolidPaint = (paint) => paint.type === "SOLID" && paint.visible !== false && typeof paint.opacity !== "undefined";
function firstSolidFill(node) {
  if (!("fills" in node) || !Array.isArray(node.fills)) return null;
  for (const paint of node.fills) {
    if (isSolidPaint(paint)) return paint;
  }
  return null;
}
function findEffectiveBackground(node) {
  var _a, _b;
  const parent = node.parent;
  if (parent && "children" in parent) {
    const siblings = parent.children;
    const idx = siblings.indexOf(node);
    for (let i = idx - 1; i >= 0; i--) {
      const sib = siblings[i];
      if ("fills" in sib) {
        const fill = firstSolidFill(sib);
        if (fill) {
          return {
            type: "solid",
            color: fill.color,
            opacity: (_a = fill.opacity) != null ? _a : 1
          };
        }
      }
    }
  }
  let p = node.parent;
  while (p) {
    if ("fills" in p) {
      const fill = firstSolidFill(p);
      if (fill) {
        return {
          type: "solid",
          color: fill.color,
          opacity: (_b = fill.opacity) != null ? _b : 1
        };
      }
      const fills = p.fills;
      if (Array.isArray(fills) && fills.some((f) => f.type !== "SOLID" && f.visible !== false)) {
        return { type: "unknown" };
      }
    }
    p = p.parent;
  }
  return null;
}

// src/color/luminance.ts
function srgbToLinear(c) {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}
function relativeLuminance(rgb) {
  const r = srgbToLinear(rgb.r);
  const g = srgbToLinear(rgb.g);
  const b = srgbToLinear(rgb.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// src/color/contrast.ts
function composite(fg, fgAlpha, bg) {
  const a = fgAlpha;
  return {
    r: fg.r * a + bg.r * (1 - a),
    g: fg.g * a + bg.g * (1 - a),
    b: fg.b * a + bg.b * (1 - a)
  };
}
function contrastRatio(fg, bg, fgAlpha = 1, bgAlpha = 1) {
  const opaqueBg = bgAlpha === 1 ? bg : composite(bg, bgAlpha, { r: 1, g: 1, b: 1 });
  const blendedFg = fgAlpha === 1 ? fg : composite(fg, fgAlpha, opaqueBg);
  const L1 = relativeLuminance(blendedFg);
  const L2 = relativeLuminance(opaqueBg);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

// src/rules/textContrast.ts
var isSolidPaint2 = (paint) => paint.type === "SOLID" && paint.visible !== false && typeof paint.opacity !== "undefined";
function firstSolidFill2(node) {
  if (!("fills" in node) || !Array.isArray(node.fills)) return null;
  for (const paint of node.fills) {
    if (isSolidPaint2(paint)) return paint;
  }
  return null;
}
function fontIsBold(node) {
  const weight = node.fontWeight;
  if (weight === figma.mixed) return false;
  return typeof weight === "number" ? weight >= 700 : false;
}
function fontSizeValue(node) {
  if (node.fontSize === figma.mixed) return null;
  return node.fontSize;
}
async function textContrastRule(node) {
  var _a;
  if (node.type !== "TEXT") return [];
  const fill = firstSolidFill2(node);
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
        evidence: {}
      }
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
        evidence: {}
      }
    ];
  }
  const fontSize = fontSizeValue(node);
  if (!fontSize) return [];
  const isLarge = fontSize >= 24 || fontSize >= 18.66 && fontIsBold(node);
  const threshold = isLarge ? 3 : 4.5;
  const fgColor = fill.color;
  const ratio = contrastRatio(fgColor, bg.color, (_a = fill.opacity) != null ? _a : 1, bg.opacity);
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
        fontWeight: node.fontWeight
      }
    }
  ];
}

// src/rules/nonTextContrast.ts
var isSolidPaint3 = (paint) => paint.type === "SOLID" && paint.visible !== false && typeof paint.opacity !== "undefined";
function solidFromNode(node) {
  var _a, _b;
  if ("fills" in node && Array.isArray(node.fills)) {
    for (const paint of node.fills) {
      if (isSolidPaint3(paint)) {
        return { color: paint.color, opacity: (_a = paint.opacity) != null ? _a : 1 };
      }
    }
  }
  if ("strokes" in node && Array.isArray(node.strokes)) {
    for (const paint of node.strokes) {
      if (isSolidPaint3(paint)) {
        return { color: paint.color, opacity: (_b = paint.opacity) != null ? _b : 1 };
      }
    }
  }
  return null;
}
async function nonTextContrastRule(node) {
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
        evidence: {}
      }
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
        evidence: {}
      }
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
      evidence: { ratio, fg: fg.color, bgColor: bg.color }
    }
  ];
}

// src/engine/ruleEngine.ts
var rules = [targetSizeRule, textSizeRule, textContrastRule, nonTextContrastRule];
async function runRules(node, ctx) {
  const issues = [];
  for (const rule of rules) {
    try {
      const res = await rule(node, ctx);
      if (Array.isArray(res)) issues.push(...res);
    } catch (err) {
      issues.push({
        id: `${node.id}-rule-error-${rule.name}`,
        severity: "manual",
        wcagRef: "DS-TextSize",
        issueType: "text-size",
        title: "Rule error",
        nodeId: node.id,
        nodeName: node.name,
        nodeType: node.type,
        message: `Rule ${rule.name} threw: ${err}`,
        suggestion: "Review node manually.",
        evidence: {}
      });
    }
  }
  return issues;
}

// src/utils/logger.ts
function log(...args) {
  if (figma.editorType === "figjam") return;
  console.log("[WCAG22]", ...args);
}

// src/traversal.ts
async function traverse(scope, includeHidden, includeLocked, cancel, visit) {
  const roots = scope === "selection" ? figma.currentPage.selection : figma.currentPage.children;
  if (scope === "selection" && roots.length === 0) {
    throw new Error("Selection is empty. Select at least one node.");
  }
  const queue = [...roots];
  let scanned = 0;
  let total = queue.length;
  while (queue.length) {
    if (cancel.cancelled) return { cancelled: true, total: scanned };
    const node = queue.shift();
    scanned++;
    await visit(node, scanned, total);
    if ("children" in node) {
      for (const child of node.children) {
        if (!includeHidden && !child.visible || !includeLocked && child.locked) continue;
        queue.push(child);
        total++;
      }
    }
    if (scanned % 200 === 0) {
      await Promise.resolve();
    }
  }
  log("Traversal complete", scanned);
  return { cancelled: false, total: scanned };
}

// src/settings.ts
var defaultSettings = {
  includeHidden: false,
  includeLocked: false,
  textSizeMin: 12,
  strictTextSize: false
};

// src/code.ts
figma.showUI('<!doctype html><html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>WCAG 2.2 Checker</title><style>:root {\n  --bg: #f6f7f9;\n  --surface: #ffffff;\n  --text: #1f2933;\n  --muted: #6b7280;\n  --border: #e5e7eb;\n  --primary: #2563eb;\n  --primary-weak: #e1e9ff;\n  --danger: #d32f2f;\n  --warning: #f59e0b;\n  --manual: #4b5563;\n  --radius: 12px;\n  --shadow: 0 8px 24px rgba(15, 23, 42, 0.08);\n  --control-h: 36px;\n}\n\n* { box-sizing: border-box; }\n\nbody {\n  margin: 0;\n  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;\n  background: var(--bg);\n  color: var(--text);\n  font-size: 14px;\n}\n\n.app {\n  height: 100%;\n  display: flex;\n  flex-direction: column;\n}\n\n.shell {\n  padding: 16px;\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n  height: 100%;\n}\n\n.card {\n  background: var(--surface);\n  border: 1px solid var(--border);\n  border-radius: var(--radius);\n  box-shadow: var(--shadow);\n}\n\n.header {\n  position: sticky;\n  top: 0;\n  z-index: 2;\n  background: var(--bg);\n  padding: 8px 0 4px;\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}\n\n.title-block h1 {\n  margin: 0;\n  font-size: 18px;\n  font-weight: 700;\n}\n.title-block .subtitle {\n  margin-top: 2px;\n  color: var(--muted);\n  font-size: 12px;\n}\n\n.segmented {\n  display: inline-flex;\n  border: 1px solid var(--border);\n  border-radius: 10px;\n  overflow: hidden;\n  background: var(--surface);\n}\n.segmented button {\n  border: none;\n  padding: 6px 12px;\n  background: transparent;\n  color: var(--text);\n  cursor: pointer;\n  font-size: 13px;\n}\n.segmented button.active {\n  background: var(--primary);\n  color: #fff;\n}\n.segmented button + button {\n  border-left: 1px solid var(--border);\n}\n\n.actions {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n\n.btn {\n  height: var(--control-h);\n  padding: 0 14px;\n  border-radius: 10px;\n  border: 1px solid transparent;\n  background: var(--surface);\n  color: var(--text);\n  cursor: pointer;\n  font-weight: 600;\n  font-size: 14px;\n  transition: background 0.15s, border 0.15s, color 0.15s, opacity 0.15s;\n}\n.btn-primary {\n  background: var(--primary);\n  color: #fff;\n  border-color: var(--primary);\n}\n.btn-secondary {\n  background: var(--surface);\n  border-color: var(--border);\n}\n.btn-ghost {\n  background: transparent;\n  border-color: transparent;\n  color: var(--muted);\n}\n.btn:disabled {\n  opacity: 0.5;\n  cursor: not-allowed;\n}\n\n.progress-text {\n  font-size: 12px;\n  color: var(--muted);\n}\n\n.filters {\n  display: grid;\n  grid-template-columns: 140px 140px 140px 1fr 80px;\n  gap: 8px;\n  align-items: center;\n}\n\n.field, .select {\n  height: var(--control-h);\n  border-radius: 10px;\n  border: 1px solid var(--border);\n  padding: 0 12px;\n  font-size: 13px;\n  background: var(--surface);\n  color: var(--text);\n}\n\n.chips {\n  display: flex;\n  gap: 8px;\n  flex-wrap: wrap;\n}\n.chip {\n  padding: 6px 10px;\n  border-radius: 999px;\n  border: 1px solid var(--border);\n  font-size: 12px;\n  cursor: pointer;\n  background: var(--surface);\n  display: inline-flex;\n  gap: 6px;\n  align-items: center;\n}\n.chip.active {\n  background: var(--primary-weak);\n  border-color: var(--primary);\n}\n.chip.error { color: var(--danger); }\n.chip.warning { color: var(--warning); }\n.chip.manual { color: var(--manual); }\n\n.content {\n  display: grid;\n  grid-template-columns: 3fr 2fr;\n  gap: 12px;\n  min-height: 360px;\n}\n\n.status-row {\n  display: grid;\n  grid-template-columns: 1.2fr 1fr 1fr 1fr;\n  gap: 12px;\n}\n.status-card {\n  padding: 16px;\n  border-radius: var(--radius);\n  border: 1px solid var(--border);\n  background: var(--surface);\n  box-shadow: var(--shadow);\n}\n.status-card.pass {\n  background: #ecfdf3;\n  border-color: #c1f0d7;\n  color: #166534;\n}\n.status-title {\n  font-weight: 700;\n  margin: 0;\n  font-size: 15px;\n}\n.status-sub {\n  margin: 4px 0 0;\n  color: var(--muted);\n  font-size: 12px;\n}\n.type-card {\n  padding: 16px;\n  border-radius: var(--radius);\n  border: 1px solid var(--border);\n  background: var(--surface);\n  cursor: pointer;\n  box-shadow: var(--shadow);\n  transition: border 0.15s, box-shadow 0.15s;\n}\n.type-card:hover { box-shadow: 0 8px 28px rgba(0,0,0,0.06); }\n.type-card.active { border-color: var(--primary); }\n.type-card .label { font-size: 12px; color: var(--muted); }\n.type-card .count { font-size: 20px; font-weight: 800; }\n.type-card.text { border-left: 4px solid #1d4ed8; }\n.type-card.contrast { border-left: 4px solid #f59e0b; }\n.type-card.target { border-left: 4px solid #d32f2f; }\n.type-card.text .count { color: #1d4ed8; }\n.type-card.contrast .count { color: #b45309; }\n.type-card.target .count { color: #b91c1c; }\n\n.table-card, .detail-card {\n  border-radius: var(--radius);\n  border: 1px solid var(--border);\n  background: var(--surface);\n  box-shadow: var(--shadow);\n  overflow: hidden;\n  display: flex;\n  flex-direction: column;\n}\n\n.table {\n  width: 100%;\n  border-collapse: collapse;\n  font-size: 13px;\n}\n.table thead {\n  position: sticky;\n  top: 0;\n  background: #f8fafc;\n  z-index: 1;\n}\n.table th, .table td {\n  padding: 10px 12px;\n  border-bottom: 1px solid var(--border);\n  text-align: left;\n}\n.table tr:hover { background: #f4f6fb; }\n.table tr.selected { background: #e8f0ff; }\n\n.pill {\n  padding: 4px 8px;\n  border-radius: 999px;\n  font-weight: 600;\n  font-size: 12px;\n  display: inline-flex;\n  align-items: center;\n  gap: 6px;\n}\n.pill.error { background: #fdecea; color: #b71c1c; }\n.pill.warning { background: #fff4e5; color: #b26a00; }\n.pill.manual { background: #eceff1; color: #37474f; }\n\n.ref-chip {\n  display: inline-flex;\n  align-items: center;\n  padding: 4px 8px;\n  border-radius: 8px;\n  border: 1px solid var(--border);\n  font-size: 12px;\n  color: var(--text);\n  background: #f8fafc;\n}\n\n.muted { color: var(--muted); }\n\n.detail {\n  padding: 14px;\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n  height: 100%;\n}\n.detail-header {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n}\n.detail-title {\n  margin: 0;\n  font-size: 16px;\n  font-weight: 700;\n}\n\n.evidence {\n  border: 1px dashed var(--border);\n  border-radius: 8px;\n  padding: 10px;\n  background: #f9fafb;\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));\n  gap: 8px;\n  font-size: 12px;\n}\n\n.badge-line {\n  font-size: 12px;\n  color: var(--muted);\n}\n\n.suggestion summary {\n  cursor: pointer;\n  font-weight: 600;\n}\n.suggestion div {\n  margin-top: 6px;\n  font-size: 13px;\n  color: var(--text);\n}\n\n.empty {\n  height: 240px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  flex-direction: column;\n  gap: 8px;\n  color: var(--muted);\n}\n\n.small-btn {\n  height: 28px;\n  padding: 0 10px;\n  border-radius: 8px;\n  border: 1px solid var(--border);\n  background: var(--surface);\n  cursor: pointer;\n  font-size: 12px;\n}\n.small-btn:hover { background: #f3f4f6; }\n\n.spinner {\n  width: 14px;\n  height: 14px;\n  border: 2px solid var(--surface);\n  border-top-color: var(--primary);\n  border-radius: 50%;\n  animation: spin 0.8s linear infinite;\n  display: inline-block;\n}\n\n@keyframes spin {\n  to { transform: rotate(360deg); }\n}\n</style></head><body><div id="root"></div><script>"use strict";\n(() => {\n  // node_modules/preact/dist/preact.module.js\n  var n;\n  var l;\n  var u;\n  var t;\n  var i;\n  var r;\n  var o;\n  var e;\n  var f;\n  var c;\n  var s;\n  var a;\n  var h;\n  var p = {};\n  var v = [];\n  var y = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;\n  var d = Array.isArray;\n  function w(n2, l3) {\n    for (var u4 in l3) n2[u4] = l3[u4];\n    return n2;\n  }\n  function g(n2) {\n    n2 && n2.parentNode && n2.parentNode.removeChild(n2);\n  }\n  function _(l3, u4, t3) {\n    var i4, r3, o3, e3 = {};\n    for (o3 in u4) "key" == o3 ? i4 = u4[o3] : "ref" == o3 ? r3 = u4[o3] : e3[o3] = u4[o3];\n    if (arguments.length > 2 && (e3.children = arguments.length > 3 ? n.call(arguments, 2) : t3), "function" == typeof l3 && null != l3.defaultProps) for (o3 in l3.defaultProps) void 0 === e3[o3] && (e3[o3] = l3.defaultProps[o3]);\n    return m(l3, e3, i4, r3, null);\n  }\n  function m(n2, t3, i4, r3, o3) {\n    var e3 = { type: n2, props: t3, key: i4, ref: r3, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: void 0, __v: null == o3 ? ++u : o3, __i: -1, __u: 0 };\n    return null == o3 && null != l.vnode && l.vnode(e3), e3;\n  }\n  function k(n2) {\n    return n2.children;\n  }\n  function x(n2, l3) {\n    this.props = n2, this.context = l3;\n  }\n  function S(n2, l3) {\n    if (null == l3) return n2.__ ? S(n2.__, n2.__i + 1) : null;\n    for (var u4; l3 < n2.__k.length; l3++) if (null != (u4 = n2.__k[l3]) && null != u4.__e) return u4.__e;\n    return "function" == typeof n2.type ? S(n2) : null;\n  }\n  function C(n2) {\n    if (n2.__P && n2.__d) {\n      var u4 = n2.__v, t3 = u4.__e, i4 = [], r3 = [], o3 = w({}, u4);\n      o3.__v = u4.__v + 1, l.vnode && l.vnode(o3), z(n2.__P, o3, u4, n2.__n, n2.__P.namespaceURI, 32 & u4.__u ? [t3] : null, i4, null == t3 ? S(u4) : t3, !!(32 & u4.__u), r3), o3.__v = u4.__v, o3.__.__k[o3.__i] = o3, V(i4, o3, r3), u4.__e = u4.__ = null, o3.__e != t3 && M(o3);\n    }\n  }\n  function M(n2) {\n    if (null != (n2 = n2.__) && null != n2.__c) return n2.__e = n2.__c.base = null, n2.__k.some(function(l3) {\n      if (null != l3 && null != l3.__e) return n2.__e = n2.__c.base = l3.__e;\n    }), M(n2);\n  }\n  function $(n2) {\n    (!n2.__d && (n2.__d = true) && i.push(n2) && !I.__r++ || r != l.debounceRendering) && ((r = l.debounceRendering) || o)(I);\n  }\n  function I() {\n    for (var n2, l3 = 1; i.length; ) i.length > l3 && i.sort(e), n2 = i.shift(), l3 = i.length, C(n2);\n    I.__r = 0;\n  }\n  function P(n2, l3, u4, t3, i4, r3, o3, e3, f4, c3, s3) {\n    var a3, h4, y3, d3, w3, g2, _2, m3 = t3 && t3.__k || v, b = l3.length;\n    for (f4 = A(u4, l3, m3, f4, b), a3 = 0; a3 < b; a3++) null != (y3 = u4.__k[a3]) && (h4 = -1 != y3.__i && m3[y3.__i] || p, y3.__i = a3, g2 = z(n2, y3, h4, i4, r3, o3, e3, f4, c3, s3), d3 = y3.__e, y3.ref && h4.ref != y3.ref && (h4.ref && D(h4.ref, null, y3), s3.push(y3.ref, y3.__c || d3, y3)), null == w3 && null != d3 && (w3 = d3), (_2 = !!(4 & y3.__u)) || h4.__k === y3.__k ? f4 = H(y3, f4, n2, _2) : "function" == typeof y3.type && void 0 !== g2 ? f4 = g2 : d3 && (f4 = d3.nextSibling), y3.__u &= -7);\n    return u4.__e = w3, f4;\n  }\n  function A(n2, l3, u4, t3, i4) {\n    var r3, o3, e3, f4, c3, s3 = u4.length, a3 = s3, h4 = 0;\n    for (n2.__k = new Array(i4), r3 = 0; r3 < i4; r3++) null != (o3 = l3[r3]) && "boolean" != typeof o3 && "function" != typeof o3 ? ("string" == typeof o3 || "number" == typeof o3 || "bigint" == typeof o3 || o3.constructor == String ? o3 = n2.__k[r3] = m(null, o3, null, null, null) : d(o3) ? o3 = n2.__k[r3] = m(k, { children: o3 }, null, null, null) : void 0 === o3.constructor && o3.__b > 0 ? o3 = n2.__k[r3] = m(o3.type, o3.props, o3.key, o3.ref ? o3.ref : null, o3.__v) : n2.__k[r3] = o3, f4 = r3 + h4, o3.__ = n2, o3.__b = n2.__b + 1, e3 = null, -1 != (c3 = o3.__i = T(o3, u4, f4, a3)) && (a3--, (e3 = u4[c3]) && (e3.__u |= 2)), null == e3 || null == e3.__v ? (-1 == c3 && (i4 > s3 ? h4-- : i4 < s3 && h4++), "function" != typeof o3.type && (o3.__u |= 4)) : c3 != f4 && (c3 == f4 - 1 ? h4-- : c3 == f4 + 1 ? h4++ : (c3 > f4 ? h4-- : h4++, o3.__u |= 4))) : n2.__k[r3] = null;\n    if (a3) for (r3 = 0; r3 < s3; r3++) null != (e3 = u4[r3]) && 0 == (2 & e3.__u) && (e3.__e == t3 && (t3 = S(e3)), E(e3, e3));\n    return t3;\n  }\n  function H(n2, l3, u4, t3) {\n    var i4, r3;\n    if ("function" == typeof n2.type) {\n      for (i4 = n2.__k, r3 = 0; i4 && r3 < i4.length; r3++) i4[r3] && (i4[r3].__ = n2, l3 = H(i4[r3], l3, u4, t3));\n      return l3;\n    }\n    n2.__e != l3 && (t3 && (l3 && n2.type && !l3.parentNode && (l3 = S(n2)), u4.insertBefore(n2.__e, l3 || null)), l3 = n2.__e);\n    do {\n      l3 = l3 && l3.nextSibling;\n    } while (null != l3 && 8 == l3.nodeType);\n    return l3;\n  }\n  function T(n2, l3, u4, t3) {\n    var i4, r3, o3, e3 = n2.key, f4 = n2.type, c3 = l3[u4], s3 = null != c3 && 0 == (2 & c3.__u);\n    if (null === c3 && null == e3 || s3 && e3 == c3.key && f4 == c3.type) return u4;\n    if (t3 > (s3 ? 1 : 0)) {\n      for (i4 = u4 - 1, r3 = u4 + 1; i4 >= 0 || r3 < l3.length; ) if (null != (c3 = l3[o3 = i4 >= 0 ? i4-- : r3++]) && 0 == (2 & c3.__u) && e3 == c3.key && f4 == c3.type) return o3;\n    }\n    return -1;\n  }\n  function j(n2, l3, u4) {\n    "-" == l3[0] ? n2.setProperty(l3, null == u4 ? "" : u4) : n2[l3] = null == u4 ? "" : "number" != typeof u4 || y.test(l3) ? u4 : u4 + "px";\n  }\n  function F(n2, l3, u4, t3, i4) {\n    var r3, o3;\n    n: if ("style" == l3) if ("string" == typeof u4) n2.style.cssText = u4;\n    else {\n      if ("string" == typeof t3 && (n2.style.cssText = t3 = ""), t3) for (l3 in t3) u4 && l3 in u4 || j(n2.style, l3, "");\n      if (u4) for (l3 in u4) t3 && u4[l3] == t3[l3] || j(n2.style, l3, u4[l3]);\n    }\n    else if ("o" == l3[0] && "n" == l3[1]) r3 = l3 != (l3 = l3.replace(f, "$1")), o3 = l3.toLowerCase(), l3 = o3 in n2 || "onFocusOut" == l3 || "onFocusIn" == l3 ? o3.slice(2) : l3.slice(2), n2.l || (n2.l = {}), n2.l[l3 + r3] = u4, u4 ? t3 ? u4.u = t3.u : (u4.u = c, n2.addEventListener(l3, r3 ? a : s, r3)) : n2.removeEventListener(l3, r3 ? a : s, r3);\n    else {\n      if ("http://www.w3.org/2000/svg" == i4) l3 = l3.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");\n      else if ("width" != l3 && "height" != l3 && "href" != l3 && "list" != l3 && "form" != l3 && "tabIndex" != l3 && "download" != l3 && "rowSpan" != l3 && "colSpan" != l3 && "role" != l3 && "popover" != l3 && l3 in n2) try {\n        n2[l3] = null == u4 ? "" : u4;\n        break n;\n      } catch (n3) {\n      }\n      "function" == typeof u4 || (null == u4 || false === u4 && "-" != l3[4] ? n2.removeAttribute(l3) : n2.setAttribute(l3, "popover" == l3 && 1 == u4 ? "" : u4));\n    }\n  }\n  function O(n2) {\n    return function(u4) {\n      if (this.l) {\n        var t3 = this.l[u4.type + n2];\n        if (null == u4.t) u4.t = c++;\n        else if (u4.t < t3.u) return;\n        return t3(l.event ? l.event(u4) : u4);\n      }\n    };\n  }\n  function z(n2, u4, t3, i4, r3, o3, e3, f4, c3, s3) {\n    var a3, h4, p3, y3, _2, m3, b, S2, C3, M2, $2, I2, A2, H2, L, T3 = u4.type;\n    if (void 0 !== u4.constructor) return null;\n    128 & t3.__u && (c3 = !!(32 & t3.__u), o3 = [f4 = u4.__e = t3.__e]), (a3 = l.__b) && a3(u4);\n    n: if ("function" == typeof T3) try {\n      if (S2 = u4.props, C3 = "prototype" in T3 && T3.prototype.render, M2 = (a3 = T3.contextType) && i4[a3.__c], $2 = a3 ? M2 ? M2.props.value : a3.__ : i4, t3.__c ? b = (h4 = u4.__c = t3.__c).__ = h4.__E : (C3 ? u4.__c = h4 = new T3(S2, $2) : (u4.__c = h4 = new x(S2, $2), h4.constructor = T3, h4.render = G), M2 && M2.sub(h4), h4.state || (h4.state = {}), h4.__n = i4, p3 = h4.__d = true, h4.__h = [], h4._sb = []), C3 && null == h4.__s && (h4.__s = h4.state), C3 && null != T3.getDerivedStateFromProps && (h4.__s == h4.state && (h4.__s = w({}, h4.__s)), w(h4.__s, T3.getDerivedStateFromProps(S2, h4.__s))), y3 = h4.props, _2 = h4.state, h4.__v = u4, p3) C3 && null == T3.getDerivedStateFromProps && null != h4.componentWillMount && h4.componentWillMount(), C3 && null != h4.componentDidMount && h4.__h.push(h4.componentDidMount);\n      else {\n        if (C3 && null == T3.getDerivedStateFromProps && S2 !== y3 && null != h4.componentWillReceiveProps && h4.componentWillReceiveProps(S2, $2), u4.__v == t3.__v || !h4.__e && null != h4.shouldComponentUpdate && false === h4.shouldComponentUpdate(S2, h4.__s, $2)) {\n          u4.__v != t3.__v && (h4.props = S2, h4.state = h4.__s, h4.__d = false), u4.__e = t3.__e, u4.__k = t3.__k, u4.__k.some(function(n3) {\n            n3 && (n3.__ = u4);\n          }), v.push.apply(h4.__h, h4._sb), h4._sb = [], h4.__h.length && e3.push(h4);\n          break n;\n        }\n        null != h4.componentWillUpdate && h4.componentWillUpdate(S2, h4.__s, $2), C3 && null != h4.componentDidUpdate && h4.__h.push(function() {\n          h4.componentDidUpdate(y3, _2, m3);\n        });\n      }\n      if (h4.context = $2, h4.props = S2, h4.__P = n2, h4.__e = false, I2 = l.__r, A2 = 0, C3) h4.state = h4.__s, h4.__d = false, I2 && I2(u4), a3 = h4.render(h4.props, h4.state, h4.context), v.push.apply(h4.__h, h4._sb), h4._sb = [];\n      else do {\n        h4.__d = false, I2 && I2(u4), a3 = h4.render(h4.props, h4.state, h4.context), h4.state = h4.__s;\n      } while (h4.__d && ++A2 < 25);\n      h4.state = h4.__s, null != h4.getChildContext && (i4 = w(w({}, i4), h4.getChildContext())), C3 && !p3 && null != h4.getSnapshotBeforeUpdate && (m3 = h4.getSnapshotBeforeUpdate(y3, _2)), H2 = null != a3 && a3.type === k && null == a3.key ? q(a3.props.children) : a3, f4 = P(n2, d(H2) ? H2 : [H2], u4, t3, i4, r3, o3, e3, f4, c3, s3), h4.base = u4.__e, u4.__u &= -161, h4.__h.length && e3.push(h4), b && (h4.__E = h4.__ = null);\n    } catch (n3) {\n      if (u4.__v = null, c3 || null != o3) if (n3.then) {\n        for (u4.__u |= c3 ? 160 : 128; f4 && 8 == f4.nodeType && f4.nextSibling; ) f4 = f4.nextSibling;\n        o3[o3.indexOf(f4)] = null, u4.__e = f4;\n      } else {\n        for (L = o3.length; L--; ) g(o3[L]);\n        N(u4);\n      }\n      else u4.__e = t3.__e, u4.__k = t3.__k, n3.then || N(u4);\n      l.__e(n3, u4, t3);\n    }\n    else null == o3 && u4.__v == t3.__v ? (u4.__k = t3.__k, u4.__e = t3.__e) : f4 = u4.__e = B(t3.__e, u4, t3, i4, r3, o3, e3, c3, s3);\n    return (a3 = l.diffed) && a3(u4), 128 & u4.__u ? void 0 : f4;\n  }\n  function N(n2) {\n    n2 && (n2.__c && (n2.__c.__e = true), n2.__k && n2.__k.some(N));\n  }\n  function V(n2, u4, t3) {\n    for (var i4 = 0; i4 < t3.length; i4++) D(t3[i4], t3[++i4], t3[++i4]);\n    l.__c && l.__c(u4, n2), n2.some(function(u5) {\n      try {\n        n2 = u5.__h, u5.__h = [], n2.some(function(n3) {\n          n3.call(u5);\n        });\n      } catch (n3) {\n        l.__e(n3, u5.__v);\n      }\n    });\n  }\n  function q(n2) {\n    return "object" != typeof n2 || null == n2 || n2.__b > 0 ? n2 : d(n2) ? n2.map(q) : w({}, n2);\n  }\n  function B(u4, t3, i4, r3, o3, e3, f4, c3, s3) {\n    var a3, h4, v3, y3, w3, _2, m3, b = i4.props || p, k3 = t3.props, x2 = t3.type;\n    if ("svg" == x2 ? o3 = "http://www.w3.org/2000/svg" : "math" == x2 ? o3 = "http://www.w3.org/1998/Math/MathML" : o3 || (o3 = "http://www.w3.org/1999/xhtml"), null != e3) {\n      for (a3 = 0; a3 < e3.length; a3++) if ((w3 = e3[a3]) && "setAttribute" in w3 == !!x2 && (x2 ? w3.localName == x2 : 3 == w3.nodeType)) {\n        u4 = w3, e3[a3] = null;\n        break;\n      }\n    }\n    if (null == u4) {\n      if (null == x2) return document.createTextNode(k3);\n      u4 = document.createElementNS(o3, x2, k3.is && k3), c3 && (l.__m && l.__m(t3, e3), c3 = false), e3 = null;\n    }\n    if (null == x2) b === k3 || c3 && u4.data == k3 || (u4.data = k3);\n    else {\n      if (e3 = e3 && n.call(u4.childNodes), !c3 && null != e3) for (b = {}, a3 = 0; a3 < u4.attributes.length; a3++) b[(w3 = u4.attributes[a3]).name] = w3.value;\n      for (a3 in b) w3 = b[a3], "dangerouslySetInnerHTML" == a3 ? v3 = w3 : "children" == a3 || a3 in k3 || "value" == a3 && "defaultValue" in k3 || "checked" == a3 && "defaultChecked" in k3 || F(u4, a3, null, w3, o3);\n      for (a3 in k3) w3 = k3[a3], "children" == a3 ? y3 = w3 : "dangerouslySetInnerHTML" == a3 ? h4 = w3 : "value" == a3 ? _2 = w3 : "checked" == a3 ? m3 = w3 : c3 && "function" != typeof w3 || b[a3] === w3 || F(u4, a3, w3, b[a3], o3);\n      if (h4) c3 || v3 && (h4.__html == v3.__html || h4.__html == u4.innerHTML) || (u4.innerHTML = h4.__html), t3.__k = [];\n      else if (v3 && (u4.innerHTML = ""), P("template" == t3.type ? u4.content : u4, d(y3) ? y3 : [y3], t3, i4, r3, "foreignObject" == x2 ? "http://www.w3.org/1999/xhtml" : o3, e3, f4, e3 ? e3[0] : i4.__k && S(i4, 0), c3, s3), null != e3) for (a3 = e3.length; a3--; ) g(e3[a3]);\n      c3 || (a3 = "value", "progress" == x2 && null == _2 ? u4.removeAttribute("value") : null != _2 && (_2 !== u4[a3] || "progress" == x2 && !_2 || "option" == x2 && _2 != b[a3]) && F(u4, a3, _2, b[a3], o3), a3 = "checked", null != m3 && m3 != u4[a3] && F(u4, a3, m3, b[a3], o3));\n    }\n    return u4;\n  }\n  function D(n2, u4, t3) {\n    try {\n      if ("function" == typeof n2) {\n        var i4 = "function" == typeof n2.__u;\n        i4 && n2.__u(), i4 && null == u4 || (n2.__u = n2(u4));\n      } else n2.current = u4;\n    } catch (n3) {\n      l.__e(n3, t3);\n    }\n  }\n  function E(n2, u4, t3) {\n    var i4, r3;\n    if (l.unmount && l.unmount(n2), (i4 = n2.ref) && (i4.current && i4.current != n2.__e || D(i4, null, u4)), null != (i4 = n2.__c)) {\n      if (i4.componentWillUnmount) try {\n        i4.componentWillUnmount();\n      } catch (n3) {\n        l.__e(n3, u4);\n      }\n      i4.base = i4.__P = null;\n    }\n    if (i4 = n2.__k) for (r3 = 0; r3 < i4.length; r3++) i4[r3] && E(i4[r3], u4, t3 || "function" != typeof n2.type);\n    t3 || g(n2.__e), n2.__c = n2.__ = n2.__e = void 0;\n  }\n  function G(n2, l3, u4) {\n    return this.constructor(n2, u4);\n  }\n  function J(u4, t3, i4) {\n    var r3, o3, e3, f4;\n    t3 == document && (t3 = document.documentElement), l.__ && l.__(u4, t3), o3 = (r3 = "function" == typeof i4) ? null : i4 && i4.__k || t3.__k, e3 = [], f4 = [], z(t3, u4 = (!r3 && i4 || t3).__k = _(k, null, [u4]), o3 || p, p, t3.namespaceURI, !r3 && i4 ? [i4] : o3 ? null : t3.firstChild ? n.call(t3.childNodes) : null, e3, !r3 && i4 ? i4 : o3 ? o3.__e : t3.firstChild, r3, f4), V(e3, u4, f4);\n  }\n  n = v.slice, l = { __e: function(n2, l3, u4, t3) {\n    for (var i4, r3, o3; l3 = l3.__; ) if ((i4 = l3.__c) && !i4.__) try {\n      if ((r3 = i4.constructor) && null != r3.getDerivedStateFromError && (i4.setState(r3.getDerivedStateFromError(n2)), o3 = i4.__d), null != i4.componentDidCatch && (i4.componentDidCatch(n2, t3 || {}), o3 = i4.__d), o3) return i4.__E = i4;\n    } catch (l4) {\n      n2 = l4;\n    }\n    throw n2;\n  } }, u = 0, t = function(n2) {\n    return null != n2 && void 0 === n2.constructor;\n  }, x.prototype.setState = function(n2, l3) {\n    var u4;\n    u4 = null != this.__s && this.__s != this.state ? this.__s : this.__s = w({}, this.state), "function" == typeof n2 && (n2 = n2(w({}, u4), this.props)), n2 && w(u4, n2), null != n2 && this.__v && (l3 && this._sb.push(l3), $(this));\n  }, x.prototype.forceUpdate = function(n2) {\n    this.__v && (this.__e = true, n2 && this.__h.push(n2), $(this));\n  }, x.prototype.render = k, i = [], o = "function" == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, e = function(n2, l3) {\n    return n2.__v.__b - l3.__v.__b;\n  }, I.__r = 0, f = /(PointerCapture)$|Capture$/i, c = 0, s = O(false), a = O(true), h = 0;\n\n  // node_modules/preact/hooks/dist/hooks.module.js\n  var t2;\n  var r2;\n  var u2;\n  var i2;\n  var o2 = 0;\n  var f2 = [];\n  var c2 = l;\n  var e2 = c2.__b;\n  var a2 = c2.__r;\n  var v2 = c2.diffed;\n  var l2 = c2.__c;\n  var m2 = c2.unmount;\n  var s2 = c2.__;\n  function p2(n2, t3) {\n    c2.__h && c2.__h(r2, n2, o2 || t3), o2 = 0;\n    var u4 = r2.__H || (r2.__H = { __: [], __h: [] });\n    return n2 >= u4.__.length && u4.__.push({}), u4.__[n2];\n  }\n  function d2(n2) {\n    return o2 = 1, h2(D2, n2);\n  }\n  function h2(n2, u4, i4) {\n    var o3 = p2(t2++, 2);\n    if (o3.t = n2, !o3.__c && (o3.__ = [i4 ? i4(u4) : D2(void 0, u4), function(n3) {\n      var t3 = o3.__N ? o3.__N[0] : o3.__[0], r3 = o3.t(t3, n3);\n      t3 !== r3 && (o3.__N = [r3, o3.__[1]], o3.__c.setState({}));\n    }], o3.__c = r2, !r2.__f)) {\n      var f4 = function(n3, t3, r3) {\n        if (!o3.__c.__H) return true;\n        var u5 = o3.__c.__H.__.filter(function(n4) {\n          return n4.__c;\n        });\n        if (u5.every(function(n4) {\n          return !n4.__N;\n        })) return !c3 || c3.call(this, n3, t3, r3);\n        var i5 = o3.__c.props !== n3;\n        return u5.some(function(n4) {\n          if (n4.__N) {\n            var t4 = n4.__[0];\n            n4.__ = n4.__N, n4.__N = void 0, t4 !== n4.__[0] && (i5 = true);\n          }\n        }), c3 && c3.call(this, n3, t3, r3) || i5;\n      };\n      r2.__f = true;\n      var c3 = r2.shouldComponentUpdate, e3 = r2.componentWillUpdate;\n      r2.componentWillUpdate = function(n3, t3, r3) {\n        if (this.__e) {\n          var u5 = c3;\n          c3 = void 0, f4(n3, t3, r3), c3 = u5;\n        }\n        e3 && e3.call(this, n3, t3, r3);\n      }, r2.shouldComponentUpdate = f4;\n    }\n    return o3.__N || o3.__;\n  }\n  function y2(n2, u4) {\n    var i4 = p2(t2++, 3);\n    !c2.__s && C2(i4.__H, u4) && (i4.__ = n2, i4.u = u4, r2.__H.__h.push(i4));\n  }\n  function T2(n2, r3) {\n    var u4 = p2(t2++, 7);\n    return C2(u4.__H, r3) && (u4.__ = n2(), u4.__H = r3, u4.__h = n2), u4.__;\n  }\n  function j2() {\n    for (var n2; n2 = f2.shift(); ) {\n      var t3 = n2.__H;\n      if (n2.__P && t3) try {\n        t3.__h.some(z2), t3.__h.some(B2), t3.__h = [];\n      } catch (r3) {\n        t3.__h = [], c2.__e(r3, n2.__v);\n      }\n    }\n  }\n  c2.__b = function(n2) {\n    r2 = null, e2 && e2(n2);\n  }, c2.__ = function(n2, t3) {\n    n2 && t3.__k && t3.__k.__m && (n2.__m = t3.__k.__m), s2 && s2(n2, t3);\n  }, c2.__r = function(n2) {\n    a2 && a2(n2), t2 = 0;\n    var i4 = (r2 = n2.__c).__H;\n    i4 && (u2 === r2 ? (i4.__h = [], r2.__h = [], i4.__.some(function(n3) {\n      n3.__N && (n3.__ = n3.__N), n3.u = n3.__N = void 0;\n    })) : (i4.__h.some(z2), i4.__h.some(B2), i4.__h = [], t2 = 0)), u2 = r2;\n  }, c2.diffed = function(n2) {\n    v2 && v2(n2);\n    var t3 = n2.__c;\n    t3 && t3.__H && (t3.__H.__h.length && (1 !== f2.push(t3) && i2 === c2.requestAnimationFrame || ((i2 = c2.requestAnimationFrame) || w2)(j2)), t3.__H.__.some(function(n3) {\n      n3.u && (n3.__H = n3.u), n3.u = void 0;\n    })), u2 = r2 = null;\n  }, c2.__c = function(n2, t3) {\n    t3.some(function(n3) {\n      try {\n        n3.__h.some(z2), n3.__h = n3.__h.filter(function(n4) {\n          return !n4.__ || B2(n4);\n        });\n      } catch (r3) {\n        t3.some(function(n4) {\n          n4.__h && (n4.__h = []);\n        }), t3 = [], c2.__e(r3, n3.__v);\n      }\n    }), l2 && l2(n2, t3);\n  }, c2.unmount = function(n2) {\n    m2 && m2(n2);\n    var t3, r3 = n2.__c;\n    r3 && r3.__H && (r3.__H.__.some(function(n3) {\n      try {\n        z2(n3);\n      } catch (n4) {\n        t3 = n4;\n      }\n    }), r3.__H = void 0, t3 && c2.__e(t3, r3.__v));\n  };\n  var k2 = "function" == typeof requestAnimationFrame;\n  function w2(n2) {\n    var t3, r3 = function() {\n      clearTimeout(u4), k2 && cancelAnimationFrame(t3), setTimeout(n2);\n    }, u4 = setTimeout(r3, 35);\n    k2 && (t3 = requestAnimationFrame(r3));\n  }\n  function z2(n2) {\n    var t3 = r2, u4 = n2.__c;\n    "function" == typeof u4 && (n2.__c = void 0, u4()), r2 = t3;\n  }\n  function B2(n2) {\n    var t3 = r2;\n    n2.__c = n2.__(), r2 = t3;\n  }\n  function C2(n2, t3) {\n    return !n2 || n2.length !== t3.length || t3.some(function(t4, r3) {\n      return t4 !== n2[r3];\n    });\n  }\n  function D2(n2, t3) {\n    return "function" == typeof t3 ? t3(n2) : t3;\n  }\n\n  // src/settings.ts\n  var defaultSettings = {\n    includeHidden: false,\n    includeLocked: false,\n    textSizeMin: 12,\n    strictTextSize: false\n  };\n\n  // node_modules/preact/jsx-runtime/dist/jsxRuntime.module.js\n  var f3 = 0;\n  var i3 = Array.isArray;\n  function u3(e3, t3, n2, o3, i4, u4) {\n    t3 || (t3 = {});\n    var a3, c3, p3 = t3;\n    if ("ref" in p3) for (c3 in p3 = {}, t3) "ref" == c3 ? a3 = t3[c3] : p3[c3] = t3[c3];\n    var l3 = { type: e3, props: p3, key: n2, ref: a3, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: void 0, __v: --f3, __i: -1, __u: 0, __source: i4, __self: u4 };\n    if ("function" == typeof e3 && (a3 = e3.defaultProps)) for (c3 in a3) void 0 === p3[c3] && (p3[c3] = a3[c3]);\n    return l.vnode && l.vnode(l3), l3;\n  }\n\n  // src/ui.tsx\n  function rgbToHex(rgb) {\n    if (!rgb) return "--";\n    const to255 = (v3) => Math.round((v3 != null ? v3 : 0) * 255);\n    const r3 = to255(rgb.r);\n    const g2 = to255(rgb.g);\n    const b = to255(rgb.b);\n    return `#${[r3, g2, b].map((n2) => n2.toString(16).padStart(2, "0")).join("").toUpperCase()}`;\n  }\n  function App() {\n    var _a;\n    const [scope, setScope] = d2("selection");\n    const [state, setState] = d2("idle");\n    const [progress, setProgress] = d2({ scanned: 0, total: 0, percent: 0 });\n    const [issues, setIssues] = d2([]);\n    const [selectedIssueId, setSelectedIssueId] = d2(null);\n    const [summary, setSummary] = d2(null);\n    const [error, setError] = d2(null);\n    const [includeHidden, setIncludeHidden] = d2(defaultSettings.includeHidden);\n    const [includeLocked, setIncludeLocked] = d2(defaultSettings.includeLocked);\n    const [textSizeMin, setTextSizeMin] = d2(defaultSettings.textSizeMin);\n    const [strictTextSize, setStrictTextSize] = d2(defaultSettings.strictTextSize);\n    const [filters, setFilters] = d2({ severity: "all", ref: "all", search: "", issueType: "all" });\n    const [showSettings, setShowSettings] = d2(false);\n    y2(() => {\n      window.onmessage = (event) => {\n        var _a2, _b;\n        const { type, payload } = event.data.pluginMessage || {};\n        if (!type) return;\n        switch (type) {\n          case "SCAN_PROGRESS":\n            setState("scanning");\n            setProgress(payload);\n            break;\n          case "SCAN_COMPLETE":\n            setIssues(payload.issues);\n            setSummary(payload.summary);\n            setState(payload.issues.length === 0 ? "empty" : "complete");\n            setSelectedIssueId((_b = (_a2 = payload.issues[0]) == null ? void 0 : _a2.id) != null ? _b : null);\n            break;\n          case "SCAN_ERROR":\n            setError(payload.message);\n            setState("error");\n            break;\n          case "SCAN_CANCELLED":\n            setState("cancelled");\n            break;\n          default:\n            break;\n        }\n      };\n    }, []);\n    const filteredIssues = T2(() => {\n      return issues.filter((i4) => {\n        if (filters.severity !== "all" && i4.severity !== filters.severity) return false;\n        if (filters.ref !== "all" && i4.wcagRef !== filters.ref) return false;\n        if (filters.issueType !== "all" && i4.issueType !== filters.issueType) return false;\n        if (filters.search && !i4.nodeName.toLowerCase().includes(filters.search.toLowerCase())) return false;\n        return true;\n      });\n    }, [issues, filters]);\n    const startScan = () => {\n      setState("scanning");\n      setIssues([]);\n      setError(null);\n      setSelectedIssueId(null);\n      parent.postMessage(\n        {\n          pluginMessage: {\n            type: "START_SCAN",\n            payload: {\n              scope,\n              includeHidden,\n              includeLocked,\n              textSizeMin,\n              strictTextSize\n            }\n          }\n        },\n        "*"\n      );\n    };\n    const cancelScan = () => {\n      parent.postMessage({ pluginMessage: { type: "CANCEL_SCAN" } }, "*");\n    };\n    const goToNode = (id) => {\n      parent.postMessage({ pluginMessage: { type: "GO_TO_NODE", payload: { id } } }, "*");\n    };\n    const onChipClick = (severity) => {\n      setFilters((f4) => ({\n        ...f4,\n        severity: f4.severity === severity ? "all" : severity\n      }));\n    };\n    const resetFilters = () => setFilters({ severity: "all", ref: "all", search: "", issueType: "all" });\n    const selectedIssue = (_a = issues.find((i4) => i4.id === selectedIssueId)) != null ? _a : filteredIssues[0];\n    const issueTypeCounts = T2(() => {\n      const base = { "text-size": 0, contrast: 0, "target-size": 0 };\n      issues.forEach((i4) => {\n        var _a2;\n        base[i4.issueType] = ((_a2 = base[i4.issueType]) != null ? _a2 : 0) + 1;\n      });\n      return base;\n    }, [issues]);\n    const compliance = getComplianceStatus(issues);\n    const scopeLabel = scope === "selection" ? "Results for Selected Layers" : "Results for This Page";\n    return /* @__PURE__ */ u3("div", { className: "app", children: /* @__PURE__ */ u3("div", { className: "shell", children: [\n      /* @__PURE__ */ u3("header", { className: "header", children: [\n        /* @__PURE__ */ u3("div", { className: "title-block", children: [\n          /* @__PURE__ */ u3("h1", { children: "WCAG 2.2 Checker" }),\n          /* @__PURE__ */ u3("div", { className: "subtitle", children: "Target size \\u2022 Contrast \\u2022 Text size" })\n        ] }),\n        /* @__PURE__ */ u3("div", { className: "segmented", children: [\n          /* @__PURE__ */ u3("button", { className: scope === "selection" ? "active" : "", onClick: () => setScope("selection"), children: "Selection" }),\n          /* @__PURE__ */ u3("button", { className: scope === "page" ? "active" : "", onClick: () => setScope("page"), children: "Page" })\n        ] })\n      ] }),\n      /* @__PURE__ */ u3("div", { className: "actions", children: [\n        /* @__PURE__ */ u3("div", { style: { display: "flex", gap: 8, alignItems: "center" }, children: [\n          /* @__PURE__ */ u3("button", { className: "btn btn-primary", onClick: startScan, disabled: state === "scanning", children: state === "scanning" ? /* @__PURE__ */ u3(k, { children: [\n            /* @__PURE__ */ u3("span", { className: "spinner" }),\n            " Scanning\\u2026"\n          ] }) : "Scan" }),\n          /* @__PURE__ */ u3("button", { className: "btn btn-secondary", onClick: cancelScan, disabled: state !== "scanning", children: "Cancel" }),\n          state === "scanning" && /* @__PURE__ */ u3("span", { className: "progress-text", children: [\n            "Scanned ",\n            progress.scanned,\n            "/",\n            progress.total,\n            " nodes"\n          ] })\n        ] }),\n        /* @__PURE__ */ u3("button", { className: "btn btn-ghost", onClick: () => setShowSettings((v3) => !v3), "aria-label": "Settings", children: "\\u2699 Settings" })\n      ] }),\n      showSettings && /* @__PURE__ */ u3("div", { className: "card", style: { padding: 12, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }, children: [\n        /* @__PURE__ */ u3("label", { children: [\n          /* @__PURE__ */ u3("input", { type: "checkbox", checked: includeHidden, onChange: (e3) => setIncludeHidden(e3.target.checked) }),\n          " Include hidden"\n        ] }),\n        /* @__PURE__ */ u3("label", { children: [\n          /* @__PURE__ */ u3("input", { type: "checkbox", checked: includeLocked, onChange: (e3) => setIncludeLocked(e3.target.checked) }),\n          " Include locked"\n        ] }),\n        /* @__PURE__ */ u3("label", { children: [\n          "Text min px: ",\n          /* @__PURE__ */ u3("input", { className: "field", type: "number", min: 10, value: textSizeMin, onChange: (e3) => setTextSizeMin(Number(e3.target.value)), style: { width: 80 } })\n        ] }),\n        /* @__PURE__ */ u3("label", { children: [\n          /* @__PURE__ */ u3("input", { type: "checkbox", checked: strictTextSize, onChange: (e3) => setStrictTextSize(e3.target.checked) }),\n          " Strict text size (errors)"\n        ] })\n      ] }),\n      /* @__PURE__ */ u3("div", { className: "filters", children: [\n        /* @__PURE__ */ u3("select", { className: "select", value: filters.severity, onChange: (e3) => setFilters({ ...filters, severity: e3.target.value }), children: [\n          /* @__PURE__ */ u3("option", { value: "all", children: "Severity: All" }),\n          /* @__PURE__ */ u3("option", { value: "error", children: "Error" }),\n          /* @__PURE__ */ u3("option", { value: "warning", children: "Warning" }),\n          /* @__PURE__ */ u3("option", { value: "manual", children: "Manual" })\n        ] }),\n        /* @__PURE__ */ u3("select", { className: "select", value: filters.ref, onChange: (e3) => setFilters({ ...filters, ref: e3.target.value }), children: [\n          /* @__PURE__ */ u3("option", { value: "all", children: "Criteria: All" }),\n          /* @__PURE__ */ u3("option", { value: "2.5.8", children: "2.5.8" }),\n          /* @__PURE__ */ u3("option", { value: "1.4.3", children: "1.4.3" }),\n          /* @__PURE__ */ u3("option", { value: "1.4.11", children: "1.4.11" }),\n          /* @__PURE__ */ u3("option", { value: "DS-TextSize", children: "Text size heuristic" })\n        ] }),\n        /* @__PURE__ */ u3("select", { className: "select", value: filters.issueType, onChange: (e3) => setFilters({ ...filters, issueType: e3.target.value }), children: [\n          /* @__PURE__ */ u3("option", { value: "all", children: "Issue type: All" }),\n          /* @__PURE__ */ u3("option", { value: "text-size", children: "Text size" }),\n          /* @__PURE__ */ u3("option", { value: "contrast", children: "Contrast" }),\n          /* @__PURE__ */ u3("option", { value: "target-size", children: "Target size" })\n        ] }),\n        /* @__PURE__ */ u3(\n          "input",\n          {\n            className: "field",\n            type: "search",\n            placeholder: "Search node",\n            value: filters.search,\n            onInput: (e3) => setFilters({ ...filters, search: e3.target.value })\n          }\n        ),\n        /* @__PURE__ */ u3("button", { className: "btn btn-secondary", onClick: resetFilters, children: "Reset" })\n      ] }),\n      summary && /* @__PURE__ */ u3("div", { className: "status-row", children: [\n        /* @__PURE__ */ u3("div", { className: `status-card ${compliance === "PASS" ? "pass" : ""}`, children: [\n          /* @__PURE__ */ u3("div", { className: "status-title", children: [\n            compliance === "FAIL" && "WCAG 2.2 AA \\u2013 Failed",\n            compliance === "REVIEW" && "WCAG 2.2 AA \\u2013 Needs Review",\n            compliance === "PASS" && "WCAG 2.2 AA \\u2013 Pass"\n          ] }),\n          /* @__PURE__ */ u3("div", { className: "status-sub", children: [\n            scopeLabel,\n            " \\u2022 Nodes scanned: ",\n            summary.nodesScanned\n          ] })\n        ] }),\n        /* @__PURE__ */ u3(\n          TypeCard,\n          {\n            label: "Text Size Issues",\n            count: issueTypeCounts["text-size"],\n            tone: "text",\n            active: filters.issueType === "text-size",\n            onClick: () => setFilters((f4) => ({ ...f4, issueType: f4.issueType === "text-size" ? "all" : "text-size" }))\n          }\n        ),\n        /* @__PURE__ */ u3(\n          TypeCard,\n          {\n            label: "Contrast Issues",\n            count: issueTypeCounts["contrast"],\n            tone: "contrast",\n            active: filters.issueType === "contrast",\n            onClick: () => setFilters((f4) => ({ ...f4, issueType: f4.issueType === "contrast" ? "all" : "contrast" }))\n          }\n        ),\n        /* @__PURE__ */ u3(\n          TypeCard,\n          {\n            label: "Target Size Issues",\n            count: issueTypeCounts["target-size"],\n            tone: "target",\n            active: filters.issueType === "target-size",\n            onClick: () => setFilters((f4) => ({ ...f4, issueType: f4.issueType === "target-size" ? "all" : "target-size" }))\n          }\n        )\n      ] }),\n      summary && /* @__PURE__ */ u3("div", { className: "chips", children: [\n        /* @__PURE__ */ u3(Chip, { label: "Errors", count: summary.errors, severity: "error", active: filters.severity === "error", onClick: () => onChipClick("error") }),\n        /* @__PURE__ */ u3(Chip, { label: "Warnings", count: summary.warnings, severity: "warning", active: filters.severity === "warning", onClick: () => onChipClick("warning") }),\n        /* @__PURE__ */ u3(Chip, { label: "Manual", count: summary.manual, severity: "manual", active: filters.severity === "manual", onClick: () => onChipClick("manual") })\n      ] }),\n      /* @__PURE__ */ u3("main", { className: "content", children: [\n        /* @__PURE__ */ u3("div", { className: "table-card", children: [\n          state === "error" && /* @__PURE__ */ u3("div", { className: "empty", children: [\n            "\\u26A0 ",\n            error\n          ] }),\n          state === "cancelled" && /* @__PURE__ */ u3("div", { className: "empty", children: "\\u2716 Scan cancelled" }),\n          state !== "error" && filteredIssues.length === 0 && /* @__PURE__ */ u3("div", { className: "empty", children: "\\u{1F50D} No issues found. Try scanning another scope." }),\n          filteredIssues.length > 0 && /* @__PURE__ */ u3("table", { className: "table", children: [\n            /* @__PURE__ */ u3("thead", { children: /* @__PURE__ */ u3("tr", { children: [\n              /* @__PURE__ */ u3("th", { children: "Severity" }),\n              /* @__PURE__ */ u3("th", { children: "Ref" }),\n              /* @__PURE__ */ u3("th", { children: "Node" }),\n              /* @__PURE__ */ u3("th", { children: "Issue" }),\n              /* @__PURE__ */ u3("th", { children: "Action" })\n            ] }) }),\n            /* @__PURE__ */ u3("tbody", { children: filteredIssues.map((issue) => /* @__PURE__ */ u3(\n              "tr",\n              {\n                className: selectedIssueId === issue.id ? "selected" : "",\n                onClick: () => setSelectedIssueId(issue.id),\n                children: [\n                  /* @__PURE__ */ u3("td", { children: /* @__PURE__ */ u3(SeverityPill, { severity: issue.severity }) }),\n                  /* @__PURE__ */ u3("td", { children: /* @__PURE__ */ u3("span", { className: "ref-chip", children: issue.wcagRef }) }),\n                  /* @__PURE__ */ u3("td", { children: [\n                    /* @__PURE__ */ u3("div", { children: issue.nodeName }),\n                    /* @__PURE__ */ u3("div", { className: "muted", style: { fontSize: 12 }, children: issue.nodeType })\n                  ] }),\n                  /* @__PURE__ */ u3("td", { children: issue.message }),\n                  /* @__PURE__ */ u3("td", { children: /* @__PURE__ */ u3("button", { className: "small-btn", onClick: (e3) => {\n                    e3.stopPropagation();\n                    goToNode(issue.nodeId);\n                  }, children: "\\u2197 Go" }) })\n                ]\n              },\n              issue.id\n            )) })\n          ] })\n        ] }),\n        /* @__PURE__ */ u3("div", { className: "detail-card", children: /* @__PURE__ */ u3(DetailPanel, { issue: selectedIssue, onGo: () => selectedIssue && goToNode(selectedIssue.nodeId) }) })\n      ] })\n    ] }) });\n  }\n  function Chip({ label, count, severity, active, onClick }) {\n    return /* @__PURE__ */ u3("button", { className: `chip ${severity} ${active ? "active" : ""}`, onClick, children: [\n      /* @__PURE__ */ u3("span", { children: label }),\n      /* @__PURE__ */ u3("strong", { children: count })\n    ] });\n  }\n  function TypeCard({ label, count, tone, active, onClick }) {\n    return /* @__PURE__ */ u3("div", { className: `type-card ${tone === "text" ? "text" : tone === "contrast" ? "contrast" : "target"} ${active ? "active" : ""}`, onClick, children: [\n      /* @__PURE__ */ u3("div", { className: "label", children: label }),\n      /* @__PURE__ */ u3("div", { className: "count", children: count })\n    ] });\n  }\n  function DetailPanel({ issue, onGo }) {\n    var _a, _b, _c, _d, _e, _f;\n    if (!issue) return /* @__PURE__ */ u3("div", { className: "empty", children: "Select an issue to see details." });\n    const ratio = (_a = issue.evidence) == null ? void 0 : _a.ratio;\n    const fg = ((_b = issue.evidence) == null ? void 0 : _b.textColor) || ((_c = issue.evidence) == null ? void 0 : _c.fg);\n    const bg = (_d = issue.evidence) == null ? void 0 : _d.bgColor;\n    const sizeW = (_e = issue.evidence) == null ? void 0 : _e.width;\n    const sizeH = (_f = issue.evidence) == null ? void 0 : _f.height;\n    const ratioText = ratio ? `${ratio.toFixed(2)}:1` : "\\u2014";\n    const normalPass = ratio !== void 0 ? ratio >= 4.5 : void 0;\n    const largePass = ratio !== void 0 ? ratio >= 3 : void 0;\n    const evidenceItems = [];\n    if (ratio) evidenceItems.push(`Contrast: ${ratioText}`);\n    if (sizeW && sizeH) evidenceItems.push(`Size: ${Math.round(sizeW)}\\xD7${Math.round(sizeH)}px`);\n    if (fg) evidenceItems.push(`FG ${rgbToHex(fg)}`);\n    if (bg) evidenceItems.push(`BG ${rgbToHex(bg)}`);\n    return /* @__PURE__ */ u3("div", { className: "detail", children: [\n      /* @__PURE__ */ u3("div", { className: "detail-header", children: [\n        /* @__PURE__ */ u3("div", { children: [\n          /* @__PURE__ */ u3("div", { className: "detail-title", children: issue.title }),\n          /* @__PURE__ */ u3("div", { className: "badge-line", children: issue.wcagRef })\n        ] }),\n        /* @__PURE__ */ u3(SeverityPill, { severity: issue.severity })\n      ] }),\n      evidenceItems.length > 0 && /* @__PURE__ */ u3("div", { className: "evidence", children: evidenceItems.map((item) => /* @__PURE__ */ u3("div", { children: item }, item)) }),\n      /* @__PURE__ */ u3("div", { style: { textAlign: "center" }, children: [\n        /* @__PURE__ */ u3("div", { style: { fontSize: 32, fontWeight: 800 }, children: ratioText }),\n        /* @__PURE__ */ u3("div", { className: "muted", style: { fontSize: 12 }, children: "Simple Contrast (WCAG)" })\n      ] }),\n      /* @__PURE__ */ u3("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }, children: [\n        /* @__PURE__ */ u3(ThresholdCard, { label: "Normal Text", threshold: "4.5:1", pass: normalPass }),\n        /* @__PURE__ */ u3(ThresholdCard, { label: "Large Text", threshold: "3:1", pass: largePass })\n      ] }),\n      /* @__PURE__ */ u3("details", { className: "suggestion", children: [\n        /* @__PURE__ */ u3("summary", { children: "Suggestion" }),\n        /* @__PURE__ */ u3("div", { children: issue.suggestion })\n      ] }),\n      /* @__PURE__ */ u3("div", { style: { marginTop: "auto" }, children: /* @__PURE__ */ u3("button", { className: "btn btn-primary", onClick: onGo, children: "Go to node" }) })\n    ] });\n  }\n  function ThresholdCard({ label, threshold, pass }) {\n    const color = pass === void 0 ? "var(--muted)" : pass ? "var(--primary)" : "var(--danger)";\n    const icon = pass === void 0 ? "\\u2022" : pass ? "\\u2714" : "\\u2716";\n    return /* @__PURE__ */ u3("div", { className: "card", style: { padding: 10, boxShadow: "none" }, children: [\n      /* @__PURE__ */ u3("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [\n        /* @__PURE__ */ u3("div", { style: { fontWeight: 600 }, children: label }),\n        /* @__PURE__ */ u3("span", { style: { color }, children: icon })\n      ] }),\n      /* @__PURE__ */ u3("div", { className: "muted", style: { fontSize: 12 }, children: [\n        "Threshold ",\n        threshold\n      ] })\n    ] });\n  }\n  function SeverityPill({ severity }) {\n    return /* @__PURE__ */ u3("span", { className: `pill ${severity}`, children: severity });\n  }\n  function getComplianceStatus(issues) {\n    const hasError = issues.some((i4) => i4.severity === "error");\n    const hasWarnOrManual = issues.some((i4) => i4.severity === "warning" || i4.severity === "manual");\n    if (hasError) return "FAIL";\n    if (hasWarnOrManual) return "REVIEW";\n    return "PASS";\n  }\n  J(/* @__PURE__ */ u3(App, {}), document.getElementById("root"));\n})();\n//# sourceMappingURL=ui.js.map\n</script></body></html>', { width: 960, height: 760 });
var cancelToken = null;
function summarize(issues, durationMs, nodesScanned) {
  return {
    errors: issues.filter((i) => i.severity === "error").length,
    warnings: issues.filter((i) => i.severity === "warning").length,
    manual: issues.filter((i) => i.severity === "manual").length,
    total: issues.length,
    durationMs,
    nodesScanned
  };
}
function postProgress(scanned, total, lastNodeId) {
  figma.ui.postMessage({
    type: "SCAN_PROGRESS",
    payload: { scanned, total, percent: total === 0 ? 0 : scanned / total, lastNodeId }
  });
}
function postComplete(issues, summary) {
  figma.ui.postMessage({ type: "SCAN_COMPLETE", payload: { issues, summary } });
}
function postError(message) {
  figma.ui.postMessage({ type: "SCAN_ERROR", payload: { message } });
}
figma.ui.onmessage = async (msg) => {
  var _a, _b, _c, _d, _e;
  if (msg.type === "START_SCAN") {
    const payload = msg.payload;
    const settings = {
      includeHidden: (_a = payload.includeHidden) != null ? _a : defaultSettings.includeHidden,
      includeLocked: (_b = payload.includeLocked) != null ? _b : defaultSettings.includeLocked,
      textSizeMin: (_c = payload.textSizeMin) != null ? _c : defaultSettings.textSizeMin,
      strictTextSize: (_d = payload.strictTextSize) != null ? _d : defaultSettings.strictTextSize
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
    }, 2e4);
    const issues = [];
    try {
      const traversalResult = await traverse(
        payload.scope,
        settings.includeHidden,
        settings.includeLocked,
        cancelToken,
        async (node, scanned, total) => {
          issues.push(...await runRules(node, { textSizeMin: settings.textSizeMin, strictTextSize: settings.strictTextSize }));
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
    } catch (err) {
      postError((_e = err == null ? void 0 : err.message) != null ? _e : String(err));
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
//# sourceMappingURL=code.js.map
