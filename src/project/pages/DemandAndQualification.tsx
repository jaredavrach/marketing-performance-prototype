import { useState, useMemo } from "react";
import { cn } from "@lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown, ChevronDown } from "lucide-react";
import {
  demandKPIs,
  mqlTrend,
  campaignMemberStatus,
  formatNumber,
  formatPercent,
  formatDelta,
} from "@/data/mock-data";

const STATUS_KEYS = [
  "sent",
  "responded",
  "engaged",
  "mql",
  "converted",
  "disqualified",
] as const;

const STATUS_LABELS: Record<string, string> = {
  sent: "Sent",
  responded: "Responded",
  engaged: "Engaged",
  mql: "MQL",
  converted: "Converted",
  disqualified: "Disqualified",
};

const STATUS_COLORS: Record<string, string> = {
  sent: "var(--color-chart-7)",
  responded: "var(--color-chart-6)",
  engaged: "var(--color-chart-5)",
  mql: "var(--color-chart-3)",
  converted: "var(--color-chart-1)",
  disqualified: "var(--color-destructive)",
};

const TOOLTIP_STYLE = {
  background: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: 6,
  fontSize: 13,
};

const ALL_CAMPAIGNS = "All Campaigns";

export default function DemandAndQualification() {
  const [selectedCampaign, setSelectedCampaign] = useState(ALL_CAMPAIGNS);
  const [filterOpen, setFilterOpen] = useState(false);

  const { mqlCount, mqlToOppRate } = demandKPIs;

  const funnelData = useMemo(() => {
    if (selectedCampaign === ALL_CAMPAIGNS) {
      const totals: Record<string, number> = {};
      let total = 0;
      for (const c of campaignMemberStatus) {
        total += c.total;
        for (const key of STATUS_KEYS) {
          totals[key] = (totals[key] ?? 0) + c[key];
        }
      }
      return { totals, total };
    }
    const c = campaignMemberStatus.find((x) => x.campaign === selectedCampaign);
    if (!c) return { totals: {} as Record<string, number>, total: 0 };
    const totals: Record<string, number> = {};
    for (const key of STATUS_KEYS) totals[key] = c[key];
    return { totals, total: c.total };
  }, [selectedCampaign]);

  const maxCount = Math.max(...STATUS_KEYS.map((k) => funnelData.totals[k] ?? 0), 1);

  const engagementRate = funnelData.total > 0
    ? ((funnelData.totals.engaged ?? 0) + (funnelData.totals.mql ?? 0) + (funnelData.totals.converted ?? 0)) / funnelData.total * 100
    : 0;
  const mqlRate = funnelData.total > 0
    ? (funnelData.totals.mql ?? 0) / funnelData.total * 100
    : 0;
  const disqualifiedRate = funnelData.total > 0
    ? (funnelData.totals.disqualified ?? 0) / funnelData.total * 100
    : 0;

  return (
    <div className="flex flex-col" style={{ gap: "var(--section-gap)" }}>
      {/* Page heading */}
      <div>
        <h1 className="t-h1">Demand &amp; Qualification</h1>
        <p
          className="t-body text-muted-foreground"
          style={{ marginTop: "var(--element-gap)" }}
        >
          MQL conversion health and campaign member qualification status
        </p>
      </div>

      {/* KPIs + MQL Trajectory side-by-side */}
      <div
        className="grid"
        style={{ gridTemplateColumns: "30fr 70fr", gap: "var(--component-gap)" }}
      >
        {/* Left: stacked KPIs */}
        <div className="flex flex-col" style={{ gap: "var(--component-gap)" }}>
          <div
            className="rounded-[var(--radius-lg)] bg-primary/5 border border-primary/15 flex-1"
            style={{ padding: "var(--card-padding)" }}
            data-sigma-notes="MQL count KPI, current-period total with prior-period delta percentage"
          >
            <p className="t-overline">MQLs</p>
            <p className="t-h1 tabular-nums" style={{ marginTop: 6 }}>
              {formatNumber(mqlCount.value)}
            </p>
            <span
              className={cn(
                "inline-flex items-center gap-1 mt-1",
                mqlCount.delta >= 0 ? "text-success" : "text-destructive"
              )}
            >
              {mqlCount.delta >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span className="t-caption tabular-nums font-medium">
                {formatDelta(mqlCount.delta)}
              </span>
            </span>
          </div>

          <div
            className="bg-card border border-border rounded-[var(--radius-lg)] flex-1"
            style={{ padding: "var(--card-padding)" }}
            data-sigma-notes="MQL-to-opportunity conversion rate KPI, percentage with prior-period delta"
          >
            <p className="t-overline">MQL → Opportunity Rate</p>
            <p className="t-h1 tabular-nums" style={{ marginTop: 6 }}>
              {formatPercent(mqlToOppRate.value)}
            </p>
            <span
              className={cn(
                "inline-flex items-center gap-1 mt-1",
                mqlToOppRate.delta >= 0 ? "text-success" : "text-destructive"
              )}
            >
              {mqlToOppRate.delta >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span className="t-caption tabular-nums font-medium">
                {formatDelta(mqlToOppRate.delta)}
              </span>
            </span>
          </div>
        </div>

        {/* Right: MQL Trajectory chart */}
        <div
          className="bg-card border border-border rounded-[var(--radius-lg)]"
          style={{ padding: "20px 24px 16px" }}
          data-sigma-notes="MQL trajectory over time, area chart with prior-period comparison overlay, weekly granularity, signature element"
        >
          <h3 className="t-h3">MQL Trajectory</h3>
          <p className="t-caption text-muted-foreground" style={{ marginTop: 2 }}>
            Weekly MQL volume with prior-period overlay
          </p>
          <div style={{ marginTop: "var(--component-gap)" }}>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={mqlTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} axisLine={{ stroke: "var(--color-border)" }} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} width={50} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value: number, name: string) => [formatNumber(value), name === "mqls" ? "Current Period" : "Prior Period"]} />
                <Area type="monotone" dataKey="mqls" stroke="var(--color-chart-1)" fill="var(--color-chart-1)" fillOpacity={0.12} strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 2 }} />
                <Area type="monotone" dataKey="priorMQLs" stroke="var(--color-chart-5)" fill="var(--color-chart-5)" fillOpacity={0} strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-6 mt-3">
            <div className="flex items-center gap-2">
              <svg width="20" height="3"><line x1="0" y1="1.5" x2="20" y2="1.5" stroke="var(--color-chart-1)" strokeWidth="2" /></svg>
              <span className="t-caption">Current period</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="20" height="3"><line x1="0" y1="1.5" x2="20" y2="1.5" stroke="var(--color-chart-5)" strokeWidth="1.5" strokeDasharray="4 3" /></svg>
              <span className="t-caption">Prior period</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Campaign filter + funnel ── */}
      <div
        className="bg-card border border-border rounded-[var(--radius-lg)]"
        style={{ padding: "var(--card-padding)" }}
        data-sigma-notes="Campaign member status funnel — dropdown filter selects campaign or All Campaigns. Horizontal funnel visualization showing 6 statuses (Sent/Responded/Engaged/MQL/Converted/Disqualified) with counts and percentages. Summary KPIs below: Engagement Rate, MQL Rate, Disqualified Rate."
      >
        <div className="flex items-center justify-between" style={{ marginBottom: "var(--component-gap)" }}>
          <div>
            <h3 className="t-h3">Member Qualification Funnel</h3>
            <p className="t-caption text-muted-foreground" style={{ marginTop: 2 }}>
              {formatNumber(funnelData.total)} total members across {selectedCampaign === ALL_CAMPAIGNS ? `${campaignMemberStatus.length} campaigns` : "1 campaign"}
            </p>
          </div>

          {/* Campaign dropdown */}
          <div className="relative">
            <button
              onClick={() => setFilterOpen((o) => !o)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-md)] border border-border bg-surface-200 text-sm font-medium text-foreground hover:bg-surface-300 transition-colors cursor-pointer"
            >
              {selectedCampaign}
              <ChevronDown size={14} className="text-muted-foreground" />
            </button>
            {filterOpen && (
              <div
                className="absolute right-0 top-full mt-1 z-10 bg-card border border-border rounded-[var(--radius-md)] shadow-float overflow-hidden"
                style={{ minWidth: 220 }}
              >
                {[ALL_CAMPAIGNS, ...campaignMemberStatus.map((c) => c.campaign)].map((name) => (
                  <button
                    key={name}
                    onClick={() => { setSelectedCampaign(name); setFilterOpen(false); }}
                    className={cn(
                      "w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer",
                      name === selectedCampaign
                        ? "bg-primary/[0.06] font-semibold text-foreground"
                        : "hover:bg-muted/60 text-foreground"
                    )}
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Funnel bars */}
        <div className="flex flex-col" style={{ gap: "var(--element-gap)" }}>
          {STATUS_KEYS.map((key) => {
            const count = funnelData.totals[key] ?? 0;
            const pct = funnelData.total > 0 ? (count / funnelData.total) * 100 : 0;
            const widthPct = (count / maxCount) * 100;
            return (
              <div key={key} className="flex items-center gap-3">
                <span className="t-caption text-muted-foreground w-24 shrink-0">
                  {STATUS_LABELS[key]}
                </span>
                <div className="flex-1 h-7 rounded-[var(--radius-sm)] bg-surface-300 overflow-hidden relative">
                  <div
                    className="h-full rounded-[var(--radius-sm)] transition-all duration-300"
                    style={{
                      width: `${widthPct}%`,
                      background: STATUS_COLORS[key],
                      minWidth: count > 0 ? 4 : 0,
                    }}
                  />
                  {count > 0 && (
                    <span
                      className="absolute top-1/2 -translate-y-1/2 text-xs font-medium tabular-nums"
                      style={{ left: `min(${widthPct}% + 8px, calc(100% - 48px))`, color: "var(--color-foreground)" }}
                    >
                      {formatNumber(count)}
                    </span>
                  )}
                </div>
                <span className="t-caption tabular-nums text-muted-foreground w-12 text-right">
                  {pct.toFixed(0)}%
                </span>
              </div>
            );
          })}
        </div>

        {/* Summary KPIs */}
        <div
          className="grid grid-cols-3 gap-px bg-border rounded-[var(--radius-md)] overflow-hidden"
          style={{ marginTop: "var(--section-gap)" }}
        >
          {[
            { label: "Engagement Rate", value: formatPercent(engagementRate) },
            { label: "MQL Rate", value: formatPercent(mqlRate) },
            { label: "Disqualified", value: formatPercent(disqualifiedRate) },
          ].map((m) => (
            <div key={m.label} className="bg-surface-200 px-4 py-3">
              <p className="t-overline">{m.label}</p>
              <p className="t-h3 tabular-nums" style={{ marginTop: 2 }}>{m.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
