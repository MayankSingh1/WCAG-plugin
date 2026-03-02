import { h, render } from "preact";
import { useEffect, useMemo, useState } from "preact/hooks";
import { Issue, ScanSummary } from "./types";
import { defaultSettings } from "./settings";

type ScanState = "idle" | "scanning" | "complete" | "empty" | "error" | "cancelled";
type Compliance = "FAIL" | "REVIEW" | "PASS";

interface Progress {
  scanned: number;
  total: number;
  percent: number;
}

function rgbToHex(rgb: any): string {
  if (!rgb) return "--";
  const to255 = (v: number) => Math.round((v ?? 0) * 255);
  const r = to255(rgb.r);
  const g = to255(rgb.g);
  const b = to255(rgb.b);
  return `#${[r, g, b]
    .map((n) => n.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()}`;
}

function App() {
  const [scope, setScope] = useState<"selection" | "page">("selection");
  const [state, setState] = useState<ScanState>("idle");
  const [progress, setProgress] = useState<Progress>({ scanned: 0, total: 0, percent: 0 });
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [summary, setSummary] = useState<ScanSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [includeHidden, setIncludeHidden] = useState(defaultSettings.includeHidden);
  const [includeLocked, setIncludeLocked] = useState(defaultSettings.includeLocked);
  const [textSizeMin, setTextSizeMin] = useState(defaultSettings.textSizeMin);
  const [strictTextSize, setStrictTextSize] = useState(defaultSettings.strictTextSize);
  const [filters, setFilters] = useState({ severity: "all", ref: "all", search: "", issueType: "all" });
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    window.onmessage = (event) => {
      const { type, payload } = event.data.pluginMessage || {};
      if (!type) return;
      switch (type) {
        case "SCAN_PROGRESS":
          setState("scanning");
          setProgress(payload);
          break;
        case "SCAN_COMPLETE":
          setIssues(payload.issues);
          setSummary(payload.summary);
          setState(payload.issues.length === 0 ? "empty" : "complete");
          setSelectedIssueId(payload.issues[0]?.id ?? null);
          break;
        case "SCAN_ERROR":
          setError(payload.message);
          setState("error");
          break;
        case "SCAN_CANCELLED":
          setState("cancelled");
          break;
        default:
          break;
      }
    };
  }, []);

  const filteredIssues = useMemo(() => {
    return issues.filter((i) => {
      if (filters.severity !== "all" && i.severity !== filters.severity) return false;
      if (filters.ref !== "all" && i.wcagRef !== filters.ref) return false;
      if (filters.issueType !== "all" && i.issueType !== filters.issueType) return false;
      if (filters.search && !i.nodeName.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });
  }, [issues, filters]);

  const startScan = () => {
    setState("scanning");
    setIssues([]);
    setError(null);
    setSelectedIssueId(null);
    parent.postMessage(
      {
        pluginMessage: {
          type: "START_SCAN",
          payload: {
            scope,
            includeHidden,
            includeLocked,
            textSizeMin,
            strictTextSize,
          },
        },
      },
      "*"
    );
  };

  const cancelScan = () => {
    parent.postMessage({ pluginMessage: { type: "CANCEL_SCAN" } }, "*");
  };

  const goToNode = (id: string) => {
    parent.postMessage({ pluginMessage: { type: "GO_TO_NODE", payload: { id } } }, "*");
  };

  const onChipClick = (severity: "error" | "warning" | "manual") => {
    setFilters((f) => ({
      ...f,
      severity: f.severity === severity ? "all" : severity,
    }));
  };

  const resetFilters = () => setFilters({ severity: "all", ref: "all", search: "", issueType: "all" });

  const selectedIssue = issues.find((i) => i.id === selectedIssueId) ?? filteredIssues[0];

  const issueTypeCounts = useMemo(() => {
    const base: Record<Issue["issueType"], number> = { "text-size": 0, contrast: 0, "target-size": 0 };
    issues.forEach((i) => {
      base[i.issueType] = (base[i.issueType] ?? 0) + 1;
    });
    return base;
  }, [issues]);

  const compliance = getComplianceStatus(issues);

  const scopeLabel = scope === "selection" ? "Results for Selected Layers" : "Results for This Page";

  return (
    <div className="app">
      <div className="shell">
        <header className="header">
          <div className="title-block">
            <h1>WCAG 2.2 Checker</h1>
            <div className="subtitle">Target size • Contrast • Text size</div>
          </div>
          <div className="segmented">
            <button className={scope === "selection" ? "active" : ""} onClick={() => setScope("selection")}>Selection</button>
            <button className={scope === "page" ? "active" : ""} onClick={() => setScope("page")}>Page</button>
          </div>
        </header>

        <div className="actions">
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button className="btn btn-primary" onClick={startScan} disabled={state === "scanning"}>
              {state === "scanning" ? <><span className="spinner" /> Scanning…</> : "Scan"}
            </button>
            <button className="btn btn-secondary" onClick={cancelScan} disabled={state !== "scanning"}>
              Cancel
            </button>
            {state === "scanning" && (
              <span className="progress-text">Scanned {progress.scanned}/{progress.total} nodes</span>
            )}
          </div>
          <button className="btn btn-ghost" onClick={() => setShowSettings((v) => !v)} aria-label="Settings">
            ⚙ Settings
          </button>
        </div>

        {showSettings && (
          <div className="card" style={{ padding: 12, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>
            <label><input type="checkbox" checked={includeHidden} onChange={(e) => setIncludeHidden((e.target as HTMLInputElement).checked)} /> Include hidden</label>
            <label><input type="checkbox" checked={includeLocked} onChange={(e) => setIncludeLocked((e.target as HTMLInputElement).checked)} /> Include locked</label>
            <label>Text min px: <input className="field" type="number" min={10} value={textSizeMin} onChange={(e) => setTextSizeMin(Number((e.target as HTMLInputElement).value))} style={{ width: 80 }} /></label>
            <label><input type="checkbox" checked={strictTextSize} onChange={(e) => setStrictTextSize((e.target as HTMLInputElement).checked)} /> Strict text size (errors)</label>
          </div>
        )}

        <div className="filters">
          <select className="select" value={filters.severity} onChange={(e) => setFilters({ ...filters, severity: (e.target as HTMLSelectElement).value })}>
            <option value="all">Severity: All</option>
            <option value="error">Error</option>
            <option value="warning">Warning</option>
            <option value="manual">Manual</option>
          </select>
          <select className="select" value={filters.ref} onChange={(e) => setFilters({ ...filters, ref: (e.target as HTMLSelectElement).value })}>
            <option value="all">Criteria: All</option>
            <option value="2.5.8">2.5.8</option>
            <option value="1.4.3">1.4.3</option>
            <option value="1.4.11">1.4.11</option>
            <option value="DS-TextSize">Text size heuristic</option>
          </select>
          <select className="select" value={filters.issueType} onChange={(e) => setFilters({ ...filters, issueType: (e.target as HTMLSelectElement).value })}>
            <option value="all">Issue type: All</option>
            <option value="text-size">Text size</option>
            <option value="contrast">Contrast</option>
            <option value="target-size">Target size</option>
          </select>
          <input
            className="field"
            type="search"
            placeholder="Search node"
            value={filters.search}
            onInput={(e) => setFilters({ ...filters, search: (e.target as HTMLInputElement).value })}
          />
          <button className="btn btn-secondary" onClick={resetFilters}>Reset</button>
        </div>

        {summary && (
          <div className="status-row">
            <div className={`status-card ${compliance === "PASS" ? "pass" : ""}`}>
              <div className="status-title">
                {compliance === "FAIL" && "WCAG 2.2 AA – Failed"}
                {compliance === "REVIEW" && "WCAG 2.2 AA – Needs Review"}
                {compliance === "PASS" && "WCAG 2.2 AA – Pass"}
              </div>
              <div className="status-sub">
                {scopeLabel} • Nodes scanned: {summary.nodesScanned}
              </div>
            </div>
            <TypeCard
              label="Text Size Issues"
              count={issueTypeCounts["text-size"]}
              tone="text"
              active={filters.issueType === "text-size"}
              onClick={() => setFilters((f) => ({ ...f, issueType: f.issueType === "text-size" ? "all" : "text-size" }))}
            />
            <TypeCard
              label="Contrast Issues"
              count={issueTypeCounts["contrast"]}
              tone="contrast"
              active={filters.issueType === "contrast"}
              onClick={() => setFilters((f) => ({ ...f, issueType: f.issueType === "contrast" ? "all" : "contrast" }))}
            />
            <TypeCard
              label="Target Size Issues"
              count={issueTypeCounts["target-size"]}
              tone="target"
              active={filters.issueType === "target-size"}
              onClick={() => setFilters((f) => ({ ...f, issueType: f.issueType === "target-size" ? "all" : "target-size" }))}
            />
          </div>
        )}

        {summary && (
          <div className="chips">
            <Chip label="Errors" count={summary.errors} severity="error" active={filters.severity === "error"} onClick={() => onChipClick("error")} />
            <Chip label="Warnings" count={summary.warnings} severity="warning" active={filters.severity === "warning"} onClick={() => onChipClick("warning")} />
            <Chip label="Manual" count={summary.manual} severity="manual" active={filters.severity === "manual"} onClick={() => onChipClick("manual")} />
          </div>
        )}

        <main className="content">
          <div className="table-card">
            {state === "error" && <div className="empty">⚠ {error}</div>}
            {state === "cancelled" && <div className="empty">✖ Scan cancelled</div>}
            {state !== "error" && filteredIssues.length === 0 && (
              <div className="empty">🔍 No issues found. Try scanning another scope.</div>
            )}
            {filteredIssues.length > 0 && (
              <table className="table">
                <thead>
                  <tr>
                    <th>Severity</th>
                    <th>Ref</th>
                    <th>Node</th>
                    <th>Issue</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIssues.map((issue) => (
                    <tr
                      key={issue.id}
                      className={selectedIssueId === issue.id ? "selected" : ""}
                      onClick={() => setSelectedIssueId(issue.id)}
                    >
                      <td><SeverityPill severity={issue.severity} /></td>
                      <td><span className="ref-chip">{issue.wcagRef}</span></td>
                      <td>
                        <div>{issue.nodeName}</div>
                        <div className="muted" style={{ fontSize: 12 }}>{issue.nodeType}</div>
                      </td>
                      <td>{issue.message}</td>
                      <td>
                        <button className="small-btn" onClick={(e) => { e.stopPropagation(); goToNode(issue.nodeId); }}>↗ Go</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="detail-card">
            <DetailPanel issue={selectedIssue} onGo={() => selectedIssue && goToNode(selectedIssue.nodeId)} />
          </div>
        </main>
      </div>
    </div>
  );
}

function Chip({ label, count, severity, active, onClick }: { label: string; count: number; severity: "error" | "warning" | "manual"; active: boolean; onClick: () => void }) {
  return (
    <button className={`chip ${severity} ${active ? "active" : ""}`} onClick={onClick}>
      <span>{label}</span>
      <strong>{count}</strong>
    </button>
  );
}

function TypeCard({ label, count, tone, active, onClick }: { label: string; count: number; tone: "text" | "contrast" | "target"; active: boolean; onClick: () => void }) {
  return (
    <div className={`type-card ${tone === "text" ? "text" : tone === "contrast" ? "contrast" : "target"} ${active ? "active" : ""}`} onClick={onClick}>
      <div className="label">{label}</div>
      <div className="count">{count}</div>
    </div>
  );
}

function DetailPanel({ issue, onGo }: { issue?: Issue; onGo: () => void }) {
  if (!issue) return <div className="empty">Select an issue to see details.</div>;

  const ratio = (issue.evidence as any)?.ratio as number | undefined;
  const fg = (issue.evidence as any)?.textColor || (issue.evidence as any)?.fg;
  const bg = (issue.evidence as any)?.bgColor;
  const sizeW = (issue.evidence as any)?.width;
  const sizeH = (issue.evidence as any)?.height;
  const ratioText = ratio ? `${ratio.toFixed(2)}:1` : "—";
  const normalPass = ratio !== undefined ? ratio >= 4.5 : undefined;
  const largePass = ratio !== undefined ? ratio >= 3 : undefined;

  const evidenceItems = [];
  if (ratio) evidenceItems.push(`Contrast: ${ratioText}`);
  if (sizeW && sizeH) evidenceItems.push(`Size: ${Math.round(sizeW)}×${Math.round(sizeH)}px`);
  if (fg) evidenceItems.push(`FG ${rgbToHex(fg)}`);
  if (bg) evidenceItems.push(`BG ${rgbToHex(bg)}`);

  return (
    <div className="detail">
      <div className="detail-header">
        <div>
          <div className="detail-title">{issue.title}</div>
          <div className="badge-line">{issue.wcagRef}</div>
        </div>
        <SeverityPill severity={issue.severity} />
      </div>

      {evidenceItems.length > 0 && (
        <div className="evidence">
          {evidenceItems.map((item) => (
            <div key={item}>{item}</div>
          ))}
        </div>
      )}

      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 32, fontWeight: 800 }}>{ratioText}</div>
        <div className="muted" style={{ fontSize: 12 }}>Simple Contrast (WCAG)</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <ThresholdCard label="Normal Text" threshold="4.5:1" pass={normalPass} />
        <ThresholdCard label="Large Text" threshold="3:1" pass={largePass} />
      </div>

      <details className="suggestion">
        <summary>Suggestion</summary>
        <div>{issue.suggestion}</div>
      </details>

      <div style={{ marginTop: "auto" }}>
        <button className="btn btn-primary" onClick={onGo}>Go to node</button>
      </div>
    </div>
  );
}

function ThresholdCard({ label, threshold, pass }: { label: string; threshold: string; pass?: boolean }) {
  const color = pass === undefined ? "var(--muted)" : pass ? "var(--primary)" : "var(--danger)";
  const icon = pass === undefined ? "•" : pass ? "✔" : "✖";
  return (
    <div className="card" style={{ padding: 10, boxShadow: "none" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontWeight: 600 }}>{label}</div>
        <span style={{ color }}>{icon}</span>
      </div>
      <div className="muted" style={{ fontSize: 12 }}>Threshold {threshold}</div>
    </div>
  );
}

function SeverityPill({ severity }: { severity: Issue["severity"] }) {
  return <span className={`pill ${severity}`}>{severity}</span>;
}

function getComplianceStatus(issues: Issue[]): Compliance {
  const hasError = issues.some((i) => i.severity === "error");
  const hasWarnOrManual = issues.some((i) => i.severity === "warning" || i.severity === "manual");
  if (hasError) return "FAIL";
  if (hasWarnOrManual) return "REVIEW";
  return "PASS";
}

render(<App />, document.getElementById("root") as HTMLElement);
