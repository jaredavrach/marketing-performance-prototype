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
  Legend,
} from "recharts";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import {
  trafficKPIs,
  campaignTraffic,
  campaignConversions,
  demandKPIs,
  trafficTrend,
  leadSources,
  formatNumber,
  formatCompact,
  formatPercent,
  formatDelta,
  type TrafficTrend,
  type LeadSource,
} from "@/data/mock-data";

function DeltaBadge({ value }: { value: number }) {
  const Icon = value >= 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-[13px] font-medium tabular-nums",
        value >= 0 ? "text-success" : "text-destructive"
      )}
    >
      <Icon size={14} />
      {formatDelta(value)}
    </span>
  );
}

// Join campaign traffic with conversion data for lead-to-MQL rate
const campaignsWithRate = campaignTraffic.map((c) => {
  const conv = campaignConversions.find((cc) => cc.campaign === c.campaign);
  return { ...c, leadToMQLRate: conv?.leadToMQLRate ?? 0 };
});

export default function TrafficAndLeads() {
  const [selectedCampaign, setSelectedCampaign] = useState<string>(
    campaignsWithRate[0].campaign
  );

  const selected = campaignsWithRate.find(
    (c) => c.campaign === selectedCampaign
  )!;

  const filteredTrend: TrafficTrend[] = useMemo(() => {
    const factor =
      (campaignTraffic.find((c) => c.campaign === selectedCampaign)
        ?.sessions ?? 0) / trafficKPIs.sessions.value;
    return trafficTrend.map((w) => ({
      ...w,
      sessions: Math.round(w.sessions * factor),
      visitors: Math.round(w.visitors * factor),
      priorSessions: Math.round(w.priorSessions * factor),
      priorVisitors: Math.round(w.priorVisitors * factor),
    }));
  }, [selectedCampaign]);

  const filteredLeadSources: LeadSource[] = useMemo(() => {
    const campaign = campaignTraffic.find(
      (c) => c.campaign === selectedCampaign
    );
    if (!campaign) return leadSources;
    const ratio = campaign.netNewLeads / trafficKPIs.netNewLeads.value;
    const scaled = leadSources.map((s) => ({
      ...s,
      count: Math.round(s.count * ratio),
    }));
    const total = scaled.reduce((sum, s) => sum + s.count, 0);
    return scaled
      .map((s) => ({
        ...s,
        percentage: total > 0 ? Math.round((s.count / total) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [selectedCampaign]);

  const kpis = [
    { label: "Web Sessions", value: formatNumber(trafficKPIs.sessions.value), delta: trafficKPIs.sessions.delta },
    { label: "Net New Leads", value: formatNumber(trafficKPIs.netNewLeads.value), delta: trafficKPIs.netNewLeads.delta },
    { label: "Opt-In Leads", value: formatNumber(trafficKPIs.optInLeads.value), delta: trafficKPIs.optInLeads.delta },
    { label: "Lead-to-MQL Rate", value: formatPercent(demandKPIs.leadToMQLRate.value), delta: demandKPIs.leadToMQLRate.delta },
  ];

  return (
    <div className="flex flex-col" style={{ gap: "var(--section-gap)" }}>
      <div>
        <h1 className="t-h1">Traffic & Leads</h1>
        <p className="t-body text-muted-foreground" style={{ marginTop: "var(--element-gap)" }}>
          Campaign-level web traffic and lead generation across the active period
        </p>
      </div>

      {/* KPI strip */}
      <div
        className="grid grid-cols-4 gap-px bg-border rounded-[var(--radius-lg)] overflow-hidden"
        data-sigma-notes="KPI summary: Web Sessions, Net New Leads, Opt-In Leads, Lead-to-MQL Rate — each with period-over-period delta"
      >
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-card flex flex-col justify-center" style={{ padding: "var(--card-padding)" }}>
            <span className="t-overline">{kpi.label}</span>
            <span className="t-h2 tabular-nums" style={{ marginTop: 4 }}>{kpi.value}</span>
            <DeltaBadge value={kpi.delta} />
          </div>
        ))}
      </div>

      {/* Repeater + Detail */}
      <div
        className="grid"
        style={{ gridTemplateColumns: "35fr 65fr", gap: "var(--component-gap)" }}
        data-sigma-notes="Campaign repeater list with detail panel — click a campaign to see full traffic and lead metrics. Sessions, net new leads, opt-in leads, opt-in rate, lead-to-MQL rate per campaign."
      >
        {/* Left: campaign list */}
        <div
          className="bg-card border border-border rounded-[var(--radius-lg)] overflow-hidden flex flex-col"
          style={{ maxHeight: 560 }}
        >
          <div className="px-4 pt-3 pb-2 border-b border-border">
            <p className="t-overline">Campaigns</p>
          </div>
          <div className="overflow-y-auto flex-1">
            {campaignsWithRate.map((c) => {
              const isActive = c.campaign === selectedCampaign;
              return (
                <button
                  key={c.campaign}
                  onClick={() => setSelectedCampaign(c.campaign)}
                  className={cn(
                    "w-full text-left px-4 py-3 border-b border-border last:border-0 transition-colors cursor-pointer",
                    isActive ? "bg-primary/[0.06]" : "hover:bg-muted/60"
                  )}
                >
                  <p className={cn("text-sm", isActive ? "font-semibold text-foreground" : "font-medium text-foreground")}>
                    {c.campaign}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="t-caption text-muted-foreground">{c.type}</span>
                    <span className="t-caption tabular-nums text-muted-foreground">
                      {formatNumber(c.netNewLeads)} leads
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: selected campaign detail */}
        <div
          className="bg-card border border-border rounded-[var(--radius-lg)]"
          style={{ padding: "var(--card-padding)" }}
        >
          <div style={{ marginBottom: "var(--component-gap)" }}>
            <h3 className="t-h3">{selected.campaign}</h3>
            <p className="t-caption text-muted-foreground">{selected.type} campaign</p>
          </div>

          <div className="grid grid-cols-3 gap-px bg-border rounded-[var(--radius-md)] overflow-hidden">
            {[
              { label: "Web Sessions", value: formatNumber(selected.sessions) },
              { label: "Net New Leads", value: formatNumber(selected.netNewLeads) },
              { label: "Opt-In Leads", value: formatNumber(selected.optInLeads) },
              { label: "Opt-In Rate", value: formatPercent(selected.optInRate) },
              { label: "Lead-to-MQL Rate", value: formatPercent(selected.leadToMQLRate) },
              { label: "Visitors", value: formatNumber(selected.visitors) },
            ].map((m) => (
              <div key={m.label} className="bg-surface-200 px-4 py-3">
                <p className="t-overline">{m.label}</p>
                <p className="t-h3 tabular-nums" style={{ marginTop: 2 }}>{m.value}</p>
              </div>
            ))}
          </div>

          {/* Inline lead source breakdown for selected campaign */}
          <div style={{ marginTop: "var(--section-gap)" }}>
            <h4 className="t-caption font-semibold text-foreground" style={{ marginBottom: "var(--element-gap)" }}>
              Lead Source Breakdown
            </h4>
            <div className="flex flex-col" style={{ gap: 6 }}>
              {filteredLeadSources.slice(0, 5).map((s) => (
                <div key={s.source} className="flex items-center gap-3">
                  <span className="t-caption text-muted-foreground w-24 shrink-0">{s.source}</span>
                  <div className="flex-1 h-2 rounded-full bg-surface-300 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(s.count / filteredLeadSources[0].count) * 100}%`,
                        background: "var(--color-chart-2)",
                      }}
                    />
                  </div>
                  <span className="t-caption tabular-nums text-muted-foreground w-12 text-right">
                    {formatNumber(s.count)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Traffic trend chart (filtered to selected campaign) */}
          <div
            style={{ marginTop: "var(--section-gap)" }}
            data-sigma-notes="Traffic trend area chart, sessions and visitors over 12 weeks, prior period dashed overlay, filtered to selected campaign"
          >
            <h4 className="t-caption font-semibold text-foreground">Traffic Trend</h4>
            <p className="t-caption text-muted-foreground" style={{ marginBottom: "var(--element-gap)" }}>
              Weekly sessions & visitors — vs. prior period
            </p>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={filteredTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={{ stroke: "var(--color-border)" }} tickLine={false} />
                <YAxis tickFormatter={formatCompact} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} width={44} />
                <Tooltip
                  contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 6, fontSize: 13 }}
                  formatter={(value: number, name: string) => [
                    formatCompact(value),
                    name === "sessions" ? "Sessions" : name === "visitors" ? "Visitors" : name === "priorSessions" ? "Prior Sessions" : "Prior Visitors",
                  ]}
                />
                <Legend verticalAlign="top" align="right" iconType="plainline" wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="sessions" name="Sessions" stroke="var(--color-chart-1)" fill="var(--color-chart-1)" fillOpacity={0.15} strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="visitors" name="Visitors" stroke="var(--color-chart-3)" fill="var(--color-chart-3)" fillOpacity={0.1} strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="priorSessions" name="Prior Sessions" stroke="var(--color-chart-5)" fill="none" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                <Area type="monotone" dataKey="priorVisitors" name="Prior Visitors" stroke="var(--color-chart-6)" fill="none" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
