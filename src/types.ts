export type Severity = "error" | "warning" | "manual";
export type IssueType = "text-size" | "contrast" | "target-size";

export interface Issue {
  id: string;
  severity: Severity;
  wcagRef: "1.4.3" | "1.4.11" | "2.5.8" | "DS-TextSize";
  issueType: IssueType;
  title: string;
  nodeId: string;
  nodeName: string;
  nodeType: string;
  message: string;
  suggestion: string;
  evidence: Record<string, unknown>;
}

export interface ScanRequest {
  scope: "selection" | "page";
  includeHidden?: boolean;
  includeLocked?: boolean;
  textSizeMin?: number;
  strictTextSize?: boolean;
}

export interface ScanProgress {
  scanned: number;
  total: number;
  percent: number;
  lastNodeId?: string;
}

export interface ScanSummary {
  errors: number;
  warnings: number;
  manual: number;
  total: number;
  durationMs: number;
  nodesScanned: number;
}

export interface ScanResult {
  issues: Issue[];
  summary: ScanSummary;
}
