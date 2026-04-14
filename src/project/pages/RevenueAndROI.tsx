import { useState, useMemo } from "react";
import { cn } from "@lib/utils";
import { ArrowUpRight, ArrowDownRight, ChevronUp, ChevronDown, Sparkles } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  revenueKPIs,
  attributionRevenue,
  dealSizeBySource,
  costKPIs,
  campaignROI,
  aiRevenueSynthesis,
  formatCurrency,
  formatCompact,
  formatDelta,
  formatNumber,
} from "@/data/mock-data";

const TOOLTIP_STYLE = {
  background: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: 6,
  fontSize: 13,
};

const AXIS_TICK = { fontSize: 12, fill: "var(--color-muted-foreground)" };

function DeltaBadge({ value }: { value: number }) {
  const positive = value >= 0;
  const Icon = positive ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-[13px] font-medium tabular-nums",
        positive ? "text-success" : "text-destructive"
      )}
    >
      <Icon size={14} />
      {formatDelta(value)}
    </span>
  );
}

const portfolioROI = (() => {
  const totalSpend = campaignROI.reduce((s, c) => s + c.spend, 0);
  const totalARR = campaignROI.reduce((s, c) => s + c.attributedARR, 0);
  return totalSpend > 0 ? Math.round(((totalARR - totalSpend) / totalSpend) * 100) : 0;
})();

type Tab = "revenue" | "cost";
type SortKey = "campaign" | "type" | "spend" | "attributedARR" | "roi" | "costPerMQL" | "costPerOpp" | "mqls" | "opportunities";
type SortDir = "asc" | "desc";

const TABS: { id: Tab; label: string }[] = [
  { id: "revenue", label: "Revenue" },
  { id: "cost", label: "Cost & ROI" },
];

const TABLE_COLUMNS: { key: SortKey; label: string; align?: "right" }[] = [
  { key: "campaign", label: "Campaign" },
  { key: "type", label: "Type" },
  { key: "spend", label: "Spend", align: "right" },
  { key: "attributedARR", label: "Attr. ARR", align: "right" },
  { key: "roi", label: "ROI %", align: "right" },
  { key: "costPerMQL", label: "Cost/MQL", align: "right" },
  { key: "costPerOpp", label: "Cost/Opp", align: "right" },
  { key: "mqls", label: "MQLs", align: "right" },
  { key: "opportunities", label: "Opps", align: "right" },
];

function formatCell(key: SortKey, value: number | string): string {
  if (key === "spend" || key === "attributedARR") return formatCurrency(value as number);
  if (key === "costPerMQL" || key === "costPerOpp") return `$${value}`;
  if (key === "roi") return `${(value as number).toLocaleString()}%`;
  if (key === "mqls" || key === "opportunities") return formatNumber(value as number);
  return String(value);
}

export default function RevenueAndROI() {
  const [activeTab, setActiveTab] = useState<Tab>("revenue");
  const [sortKey, setSortKey] = useState<SortKey>("roi");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const sortedCampaigns = useMemo(() => {
    const sorted = [...campaignROI].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === "string") return sortDir === "asc" ? aVal.localeCompare(bVal as string) : (bVal as string).localeCompare(aVal);
      return sortDir === "asc" ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
    return sorted;
  }, [sortKey, sortDir]);

  return (
    <div className="flex flex-col" style={{ gap: "var(--section-gap)" }}>
      {/* Page heading */}
      <div>
        <h1 className="t-h1">Revenue & ROI</h1>
        <p className="t-body text-muted-foreground" style={{ marginTop: "var(--element-gap)" }}>
          Closed-won ARR, deal quality, and campaign return on investment
        </p>
      </div>

      {/* 3 KPIs */}
      <div className="grid grid-cols-3" style={{ gap: "var(--component-gap)" }}>
        <div
          className="rounded-[var(--radius-lg)]"
          style={{
            padding: "var(--card-padding)",
            background: "linear-gradient(135deg, var(--color-primary) 0%, #2C56C9 100%)",
          }}
          data-sigma-notes="Closed-Won ARR KPI, currency $#,##0"
        >
          <p className="t-caption font-medium text-white/70">Closed-Won ARR</p>
          <p className="t-h2 text-white tabular-nums" style={{ marginTop: 4 }}>
            {formatCurrency(revenueKPIs.closedWonARR.value)}
          </p>
          <span className="inline-flex items-center gap-1 mt-1 text-xs font-medium text-white/80 tabular-nums">
            <ArrowUpRight size={13} />
            +{revenueKPIs.closedWonARR.delta.toFixed(1)}% vs prior
          </span>
        </div>

        <div
          className="bg-card rounded-[var(--radius-lg)] shadow-card"
          style={{ padding: "var(--card-padding)" }}
          data-sigma-notes="Marketing-attributed ARR KPI"
        >
          <p className="t-caption text-muted-foreground">Mktg-Attributed ARR</p>
          <p className="t-h2 tabular-nums" style={{ marginTop: 4 }}>
            {formatCurrency(revenueKPIs.marketingAttributedARR.value)}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <DeltaBadge value={revenueKPIs.marketingAttributedARR.delta} />
            <span className="t-caption text-muted-foreground tabular-nums">
              {revenueKPIs.marketingAttributedARR.sharePercent}% of total
            </span>
          </div>
        </div>

        <div
          className="bg-card rounded-[var(--radius-lg)] shadow-card"
          style={{ padding: "var(--card-padding)" }}
          data-sigma-notes="Average deal size KPI"
        >
          <p className="t-caption text-muted-foreground">Average Deal Size</p>
          <p className="t-h2 tabular-nums" style={{ marginTop: 4 }}>
            ${(revenueKPIs.avgDealSize.value / 1000).toFixed(1)}K
          </p>
          <DeltaBadge value={revenueKPIs.avgDealSize.delta} />
        </div>
      </div>

      {/* Tab strip */}
      <div
        className="inline-flex bg-surface-200 rounded-[var(--radius-md)] p-1"
        style={{ alignSelf: "flex-start" }}
        data-sigma-notes="Tabbed container: Revenue (attribution chart + deal size chart + AI synthesis) | Cost & ROI (cost KPIs + campaign ROI table)"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-1.5 rounded-[var(--radius-sm)] text-sm font-medium transition-colors cursor-pointer",
              activeTab === tab.id
                ? "bg-card shadow-card text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ═══ Revenue Tab ═══ */}
      {activeTab === "revenue" && (
      <>
      {/* Attribution channel chart */}
      <div
        className="bg-card rounded-[var(--radius-lg)] shadow-card"
        style={{ padding: "var(--card-padding)" }}
        data-sigma-notes="Closed-won by attribution channel, grouped bar chart current vs prior period ARR per channel"
      >
        <h3 className="t-h3">Closed-Won by Attribution Channel</h3>
        <p className="t-caption text-muted-foreground" style={{ marginTop: 2 }}>
          ARR per marketing channel — current vs. prior period
        </p>
        <div style={{ marginTop: "var(--component-gap)" }}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={attributionRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="channel" tick={AXIS_TICK} axisLine={{ stroke: "var(--color-border)" }} tickLine={false} />
              <YAxis tickFormatter={(v: number) => `$${formatCompact(v)}`} tick={AXIS_TICK} axisLine={false} tickLine={false} width={60} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value: number) => [formatCurrency(value), undefined]} />
              <Legend verticalAlign="top" align="right" iconType="square" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="currentARR" name="Current Period" fill="var(--color-chart-1)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="priorARR" name="Prior Period" fill="var(--color-chart-5)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Deal size by source */}
      <div
        className="bg-card border border-border rounded-[var(--radius-lg)]"
        style={{ padding: "var(--card-padding)" }}
        data-sigma-notes="Average deal size by attribution source, horizontal bar chart sorted descending"
      >
        <h3 className="t-h3">Average Deal Size by Source</h3>
        <p className="t-caption text-muted-foreground" style={{ marginTop: 2 }}>
          Which channels produce the largest deals
        </p>
        <div style={{ marginTop: "var(--component-gap)" }}>
          <ResponsiveContainer width="100%" height={dealSizeBySource.length * 38 + 20}>
            <BarChart data={dealSizeBySource} layout="vertical" barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
              <XAxis type="number" tickFormatter={(v: number) => `$${formatCompact(v)}`} tick={AXIS_TICK} axisLine={false} tickLine={false} />
              <YAxis dataKey="source" type="category" width={90} tick={AXIS_TICK} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value: number) => [formatCurrency(value), "Avg Deal Size"]} />
              <Bar dataKey="avgDealSize" fill="var(--color-chart-2)" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Revenue Synthesis */}
      <div
        className="bg-ai-surface border border-ai/20 rounded-[var(--radius-lg)]"
        style={{ padding: "var(--card-padding)" }}
        data-sigma-notes="AI revenue synthesis — LLM-generated narrative with AI visual language"
      >
        <div className="flex items-center" style={{ gap: "8px", marginBottom: "16px" }}>
          <Sparkles size={16} className="text-ai" />
          <span className="t-overline text-ai">AI Synthesis</span>
        </div>
        <h3 className="t-h3" style={{ marginBottom: "8px" }}>
          {aiRevenueSynthesis.headline}
        </h3>
        <p className="t-body text-muted-foreground" style={{ marginBottom: "16px" }}>
          {aiRevenueSynthesis.body}
        </p>
        <ul className="flex flex-col" style={{ gap: "8px" }}>
          {aiRevenueSynthesis.callouts.map((c, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-ai mt-0.5 shrink-0">•</span>
              <span className="t-caption text-foreground">{c}</span>
            </li>
          ))}
        </ul>
      </div>
      </>
      )}

      {/* ═══ Cost & ROI Tab ═══ */}
      {activeTab === "cost" && (
      <>
      {/* 3 Cost KPIs */}
      <div
        className="grid grid-cols-3 gap-px bg-border rounded-[var(--radius-lg)] overflow-hidden"
        data-sigma-notes="Cost KPI strip: Cost per MQL, Cost per Opportunity, Portfolio Campaign ROI"
      >
        {[
          { label: "Cost per MQL", value: `$${costKPIs.costPerMQL.value}`, delta: costKPIs.costPerMQL.delta, note: "Spend ÷ MQLs" },
          { label: "Cost per Opportunity", value: `$${costKPIs.costPerOpp.value}`, delta: costKPIs.costPerOpp.delta, note: "Spend ÷ Opps" },
          { label: "Portfolio Campaign ROI", value: `${portfolioROI.toLocaleString()}%`, delta: 8.3, note: "(ARR − Spend) ÷ Spend" },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="bg-card flex flex-col justify-center"
            style={{ padding: "var(--card-padding)" }}
            data-sigma-notes={`${kpi.label} KPI with period-over-period delta`}
          >
            <p className="t-overline">{kpi.label}</p>
            <p className="t-h2 tabular-nums" style={{ marginTop: 4 }}>{kpi.value}</p>
            <div className="flex items-center gap-3">
              <DeltaBadge value={kpi.delta} />
              <span className="t-caption text-muted-foreground">{kpi.note}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Campaign ROI Table */}
      <div
        className="bg-card border border-border rounded-[var(--radius-lg)] overflow-hidden"
        data-sigma-notes="Campaign ROI sortable table — columns: Campaign, Type, Spend, Attributed ARR, ROI%, Cost/MQL, Cost/Opp, MQLs, Opps. Click column headers to sort."
      >
        <div style={{ padding: "var(--card-padding)", paddingBottom: 0 }}>
          <h3 className="t-h3">Campaign ROI</h3>
          <p className="t-caption text-muted-foreground" style={{ marginTop: 2, marginBottom: "var(--component-gap)" }}>
            All campaigns sorted by {TABLE_COLUMNS.find((c) => c.key === sortKey)?.label ?? sortKey}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ minWidth: 780 }}>
            <thead>
              <tr className="border-b border-border">
                {TABLE_COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className={cn(
                      "t-overline font-medium cursor-pointer select-none hover:text-foreground transition-colors",
                      col.align === "right" ? "text-right" : "text-left"
                    )}
                    style={{ padding: "10px 16px", whiteSpace: "nowrap" }}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      {sortKey === col.key && (
                        sortDir === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedCampaigns.map((row, i) => (
                <tr
                  key={row.campaign}
                  className={cn(
                    "transition-colors hover:bg-primary/[0.04]",
                    i % 2 === 0 ? "bg-card" : "bg-surface-200"
                  )}
                >
                  {TABLE_COLUMNS.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        "t-caption tabular-nums",
                        col.align === "right" ? "text-right" : "text-left",
                        col.key === "campaign" ? "font-medium text-foreground" : "text-muted-foreground",
                        col.key === "roi" && row.roi >= 1000 && "text-success font-medium"
                      )}
                      style={{ padding: "10px 16px", whiteSpace: "nowrap" }}
                    >
                      {formatCell(col.key, row[col.key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}
    </div>
  );
}
