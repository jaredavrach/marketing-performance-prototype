import { useState, useMemo } from "react";
import { cn } from "@lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import {
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  ChevronRight,
  X,
} from "lucide-react";
import {
  pipelineKPIs,
  pipelineStages,
  overallAvgDwell,
  attributionAnomalies,
  opportunities,
  formatCurrency,
  formatNumber,
  formatDelta,
  formatPercent,
} from "@/data/mock-data";

const STAGE_COLORS_HEX = ["#1F3F99", "#2C56C9", "#366FE9", "#5B8CF2", "#87ABF7"];

const TOOLTIP_STYLE = {
  background: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: 6,
  fontSize: 13,
};

const AXIS_TICK = { fontSize: 12, fill: "var(--color-muted-foreground)" };

function DeltaBadge({ value }: { value: number }) {
  const Icon = value >= 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-[13px] font-medium tabular-nums", value >= 0 ? "text-success" : "text-destructive")}>
      <Icon size={14} />
      {formatDelta(value)}
    </span>
  );
}

export default function PipelineAndAttribution() {
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [selectedOppId, setSelectedOppId] = useState<string>(opportunities[0].id);

  const filteredOpps = useMemo(() => {
    if (!selectedStage) return opportunities;
    return opportunities.filter((o) => o.stage === selectedStage);
  }, [selectedStage]);

  const selectedOpp = opportunities.find((o) => o.id === selectedOppId) ?? opportunities[0];

  const velocityData = useMemo(
    () =>
      pipelineStages.map((s) => ({
        stage: s.stage,
        avgDays: s.avgDwellDays,
        isAboveThreshold: s.avgDwellDays > overallAvgDwell,
        isSelected: selectedStage === s.stage,
      })),
    [selectedStage]
  );

  function handleStageClick(stage: string) {
    setSelectedStage((prev) => (prev === stage ? null : stage));
  }

  return (
    <div className="flex flex-col" style={{ gap: "var(--section-gap)" }}>
      {/* Page heading */}
      <div>
        <h1 className="t-h1">Pipeline &amp; Attribution</h1>
        <div className="flex items-center gap-3" style={{ marginTop: "var(--element-gap)" }}>
          <p className="t-body text-muted-foreground">
            Pipeline health, stage velocity, and attribution changes
          </p>
          {selectedStage && (
            <button
              onClick={() => setSelectedStage(null)}
              className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium"
            >
              {selectedStage}
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Pipeline stage distribution — signature element */}
      <div
        className="rounded-[var(--radius-lg)]"
        style={{
          padding: "24px 28px",
          background: "linear-gradient(135deg, #f0f6ff 0%, #ffffff 40%, #ffffff 100%)",
        }}
        data-sigma-notes="Pipeline stage distribution — signature element with inline SQLs KPI. 5-stage funnel (Discovery → Qualification → Proposal → Negotiation → Closed-Won) with count, value, and inter-stage conversion rates. Click stage to filter velocity + opportunity list."
      >
        <div className="flex items-start justify-between" style={{ marginBottom: 20 }}>
          <div>
            <p className="t-overline" style={{ marginBottom: 4 }}>Pipeline Health</p>
            <p className="t-caption text-muted-foreground">
              Opportunity flow by stage — click to investigate
            </p>
          </div>
          <div className="text-right shrink-0" style={{ marginLeft: 24 }}>
            <p className="t-overline">SQLs</p>
            <div className="flex items-baseline gap-2" style={{ marginTop: 2 }}>
              <span className="t-h2 tabular-nums">{formatNumber(pipelineKPIs.sqls.value)}</span>
              <DeltaBadge value={pipelineKPIs.sqls.delta} />
            </div>
          </div>
        </div>

        <div className="flex items-end" style={{ gap: 0 }}>
          {pipelineStages.map((stage, i) => {
            const isActive = selectedStage === stage.stage;
            const nextStage = pipelineStages[i + 1];
            return (
              <div key={stage.stage} className="flex items-end flex-1">
                <button
                  onClick={() => handleStageClick(stage.stage)}
                  className={cn(
                    "flex-1 flex flex-col rounded-[var(--radius-lg)] text-left transition-all duration-150 cursor-pointer",
                    isActive
                      ? "ring-2 ring-primary bg-primary/[0.06] shadow-float"
                      : "bg-card border border-border hover:border-primary/30 shadow-card"
                  )}
                  style={{ padding: "var(--card-padding)", minHeight: 120 }}
                >
                  <p className="t-overline">{stage.stage}</p>
                  <p className="t-h2 tabular-nums" style={{ marginTop: 8 }}>{stage.count}</p>
                  <p className="t-caption text-muted-foreground tabular-nums" style={{ marginTop: 2 }}>
                    {formatCurrency(stage.value)}
                  </p>
                </button>
                {nextStage && (
                  <div className="flex flex-col items-center justify-center shrink-0" style={{ width: 56, paddingBottom: 32 }}>
                    <div className="w-full border-t border-dashed" style={{ borderColor: "var(--color-border)", marginBottom: 6 }} />
                    <span className="tabular-nums font-semibold" style={{ fontSize: 14, color: "var(--color-primary)" }}>
                      {nextStage.conversionFromPrior}%
                    </span>
                    <ChevronRight size={14} className="text-muted-foreground" style={{ marginTop: 2 }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex overflow-hidden rounded-full" style={{ height: 8, marginTop: 16 }}>
          {pipelineStages.map((stage, i) => (
            <div
              key={stage.stage}
              className="transition-opacity duration-150"
              style={{
                flex: stage.count,
                background: STAGE_COLORS_HEX[i],
                opacity: !selectedStage || selectedStage === stage.stage ? 1 : 0.25,
              }}
            />
          ))}
        </div>
      </div>

      {/* Stage velocity */}
      <div
        className="bg-card border border-border rounded-[var(--radius-lg)]"
        style={{ padding: "var(--card-padding)" }}
        data-sigma-notes="Stage velocity analysis, horizontal bar chart showing avg days-in-stage per stage with threshold reference line at overall average. Stages above threshold in warning color."
      >
        <h3 className="t-h3">Stage Velocity</h3>
        <p className="t-caption text-muted-foreground" style={{ marginTop: 2 }}>
          Average days-in-stage — stages above {overallAvgDwell}-day threshold may be bottlenecks
        </p>
        <div style={{ marginTop: "var(--element-gap)" }}>
          <ResponsiveContainer width="100%" height={velocityData.length * 44 + 32}>
            <BarChart data={velocityData} layout="vertical" onClick={(e) => { if (e?.activeLabel) handleStageClick(String(e.activeLabel)); }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
              <XAxis type="number" tick={AXIS_TICK} axisLine={false} tickLine={false} domain={[0, "dataMax + 5"]} unit="d" />
              <YAxis dataKey="stage" type="category" width={100} tick={AXIS_TICK} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [`${v} days`, "Avg Dwell Time"]} />
              <ReferenceLine x={overallAvgDwell} stroke="var(--color-muted-foreground)" strokeDasharray="4 4" strokeWidth={1} label={{ value: `Avg: ${overallAvgDwell}d`, position: "top", fontSize: 11, fill: "var(--color-muted-foreground)" }} />
              <Bar dataKey="avgDays" radius={[0, 3, 3, 0]} barSize={22} className="cursor-pointer">
                {velocityData.map((entry, i) => (
                  <Cell key={i} fill={entry.isAboveThreshold ? "var(--color-warning)" : "var(--color-chart-2)"} fillOpacity={!selectedStage || entry.isSelected ? 1 : 0.3} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Opportunity repeater + detail */}
      <div
        className="grid"
        style={{ gridTemplateColumns: "35fr 65fr", gap: "var(--component-gap)" }}
        data-sigma-notes="Opportunity repeater list with detail panel — click opportunity to see full detail including account, stage, days in stage, value, attribution source, velocity context"
      >
        {/* Left: opportunity list */}
        <div
          className="bg-card border border-border rounded-[var(--radius-lg)] overflow-hidden flex flex-col"
          style={{ maxHeight: 420 }}
        >
          <div className="px-4 pt-3 pb-2 border-b border-border">
            <p className="t-overline">
              Opportunities{selectedStage ? ` — ${selectedStage}` : ""}
            </p>
          </div>
          <div className="overflow-y-auto flex-1">
            {filteredOpps.map((opp) => {
              const isActive = opp.id === selectedOppId;
              return (
                <button
                  key={opp.id}
                  onClick={() => setSelectedOppId(opp.id)}
                  className={cn(
                    "w-full text-left px-4 py-3 border-b border-border last:border-0 transition-colors cursor-pointer",
                    isActive ? "bg-primary/[0.06]" : "hover:bg-muted/60"
                  )}
                >
                  <p className={cn("text-sm truncate", isActive ? "font-semibold text-foreground" : "font-medium text-foreground")}>
                    {opp.name}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="t-caption text-muted-foreground">{opp.stage}</span>
                    <span className="t-caption tabular-nums text-muted-foreground">{formatCurrency(opp.value)}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: selected opportunity detail */}
        <div
          className="bg-card border border-border rounded-[var(--radius-lg)]"
          style={{ padding: "var(--card-padding)" }}
        >
          <div style={{ marginBottom: "var(--component-gap)" }}>
            <h3 className="t-h3">{selectedOpp.name}</h3>
            <p className="t-caption text-muted-foreground">{selectedOpp.account} · {selectedOpp.rep}</p>
          </div>

          <div className="grid grid-cols-3 gap-px bg-border rounded-[var(--radius-md)] overflow-hidden">
            {[
              { label: "Stage", value: selectedOpp.stage },
              { label: "Days in Stage", value: `${selectedOpp.daysInStage}d` },
              { label: "Value", value: formatCurrency(selectedOpp.value) },
              { label: "Attribution", value: selectedOpp.attribution },
              { label: "Attribution Changes", value: String(selectedOpp.attributionChanges) },
              { label: "Avg Stage Dwell", value: `${pipelineStages.find((s) => s.stage === selectedOpp.stage)?.avgDwellDays ?? "—"}d` },
            ].map((m) => (
              <div key={m.label} className="bg-surface-200 px-4 py-3">
                <p className="t-overline">{m.label}</p>
                <p className="t-h3 tabular-nums" style={{ marginTop: 2 }}>{m.value}</p>
              </div>
            ))}
          </div>

          {/* Attribution shift callout (conditional) */}
          {(() => {
            const shift = attributionAnomalies.find((a) => a.opportunity === selectedOpp.name);
            if (!shift) return null;
            return (
              <div
                className="bg-warning/5 border border-warning/20 rounded-[var(--radius-md)] px-4 py-3"
                style={{ marginTop: "var(--component-gap)" }}
              >
                <p className="t-caption font-semibold text-foreground" style={{ marginBottom: 4 }}>
                  Attribution Shift
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="t-caption text-muted-foreground">{shift.originalSource}</span>
                  <ArrowRight size={12} className="text-muted-foreground" />
                  <span className="t-caption font-medium text-foreground">{shift.newSource}</span>
                  <span className="t-caption text-muted-foreground ml-2">{shift.changeDate}</span>
                </div>
              </div>
            );
          })()}

          {/* Stage progression inline */}
          <div style={{ marginTop: "var(--section-gap)" }}>
            <p className="t-caption font-semibold text-foreground" style={{ marginBottom: "var(--element-gap)" }}>
              Stage Progression
            </p>
            <div className="flex items-center flex-wrap" style={{ gap: 4 }}>
              {(() => {
                const order = ["Discovery", "Qualification", "Proposal", "Negotiation", "Closed-Won"];
                const idx = order.indexOf(selectedOpp.stage);
                return order.slice(0, idx + 1).map((stage, i, arr) => {
                  const info = pipelineStages.find((s) => s.stage === stage);
                  const days = i === idx ? selectedOpp.daysInStage : (info?.avgDwellDays ?? 10);
                  const isCurrent = i === idx;
                  const aboveAvg = days > (info?.avgDwellDays ?? overallAvgDwell);
                  return (
                    <div key={stage} className="flex items-center">
                      <div
                        className={cn(
                          "flex flex-col items-center justify-center rounded-[var(--radius-md)]",
                          isCurrent ? "bg-primary/10 ring-1 ring-primary" : "bg-surface-200"
                        )}
                        style={{ padding: "6px 10px", minWidth: 72 }}
                      >
                        <span className="t-caption font-medium">{stage}</span>
                        <span className={cn("tabular-nums text-sm font-semibold", aboveAvg ? "text-warning" : "text-foreground")}>
                          {days}d
                        </span>
                      </div>
                      {i < arr.length - 1 && <ChevronRight size={14} className="text-muted-foreground mx-1 shrink-0" />}
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
