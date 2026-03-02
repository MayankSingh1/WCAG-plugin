import { Issue } from "../types";
import { targetSizeRule } from "../rules/targetSize";
import { textSizeRule } from "../rules/textSize";
import { textContrastRule } from "../rules/textContrast";
import { nonTextContrastRule } from "../rules/nonTextContrast";

const rules = [targetSizeRule, textSizeRule, textContrastRule, nonTextContrastRule] as const;

type RuleCtx = {
  textSizeMin: number;
  strictTextSize: boolean;
};

export async function runRules(node: SceneNode, ctx: RuleCtx): Promise<Issue[]> {
  const issues: Issue[] = [];
  for (const rule of rules) {
    try {
      const res = await (rule as any)(node, ctx);
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
        evidence: {},
      });
    }
  }
  return issues;
}
