import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Sparkles,
} from "lucide-react";
import { cn } from "@lib/utils";
import {
  funnelStages,
  conversionRates,
  weeklyFunnelTrend,
  stageSignals,
  aiTrendSynthesis,
  formatCurrency,
  formatNumber,
  formatDelta,
} from "@/data/mock-data";

function formatMetricValue(stage: string, value: number): string {
  if (stage === "Closed-Won ARR") return formatCurrency(value);
  return formatNumber(value);
}

function formatChartValue(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return String(value);
}

const stageRoutes: Record<string, string> = {
  Leads: "/traffic-and-leads",
  MQLs: "/demand-and-qualification",
  SQLs: "/pipeline-and-attribution",
  "Closed-Won ARR": "/revenue-and-roi",
};

export default function ExecutiveHub() {
  const navigate = useNavigate();

  return (
    <div
      className="flex flex-col"
      style={{ gap: "var(--section-gap)" }}
    >
      {/* Page heading */}
      <div>
        <h1 className="t-h1">Executive Hub</h1>
        <p
          className="t-body text-muted-foreground"
          style={{ marginTop: "var(--element-gap)" }}
        >
          Scan funnel health and route to the stage that needs attention
        </p>
      </div>

      {/* ── Bento top: Hero 65% | AI Synthesis 35% ── */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: "65fr 35fr",
          gap: "var(--component-gap)",
        }}
      >
      {/* Hero: Funnel Health Summary */}
      <div
        className="rounded-[var(--radius-lg)] shadow-card"
        style={{
          padding: "28px 32px",
          background:
            "linear-gradient(135deg, #f0f6ff 0%, #ffffff 40%, #ffffff 100%)",
        }}
        data-sigma-notes="Funnel health summary — horizontal 4-stage funnel (Leads → MQLs → SQLs → Closed-Won ARR) with period-over-period deltas and inter-stage conversion rates. KPI chart with 4 metrics, currency $#,##0 for ARR, integer for counts, percentage for deltas. Click stage to navigate to detail page."
      >
        <p className="t-overline" style={{ marginBottom: "4px" }}>
          Funnel Health
        </p>
        <p
          className="t-caption text-muted-foreground"
          style={{ marginBottom: "24px" }}
        >
          Current period vs. prior — all stages with conversion throughput
        </p>

        <div className="flex items-stretch" style={{ gap: 0 }}>
          {funnelStages.map((stage, i) => {
            const isPositive = stage.delta >= 0;
            const conversion = conversionRates[i];

            return (
              <div key={stage.stage} className="flex items-stretch flex-1">
                <button
                  onClick={() => navigate(stageRoutes[stage.stage] ?? "/")}
                  className={cn(
                    "flex-1 rounded-[var(--radius-lg)] text-left transition-colors",
                    "hover:bg-[var(--color-surface-300)] cursor-pointer"
                  )}
                  style={{ padding: "20px 16px" }}
                >
                  <p className="t-caption text-muted-foreground font-medium">
                    {stage.stage}
                  </p>
                  <p
                    className="t-display tabular-nums"
                    style={{ marginTop: "8px" }}
                  >
                    {formatMetricValue(stage.stage, stage.value)}
                  </p>
                  <div
                    className="flex items-center"
                    style={{ gap: "6px", marginTop: "8px" }}
                  >
                    {isPositive ? (
                      <ArrowUpRight
                        size={14}
                        className="text-success"
                        strokeWidth={2.5}
                      />
                    ) : (
                      <ArrowDownRight
                        size={14}
                        className="text-destructive"
                        strokeWidth={2.5}
                      />
                    )}
                    <span
                      className={cn(
                        "t-caption tabular-nums font-medium",
                        isPositive ? "text-success" : "text-destructive"
                      )}
                    >
                      {formatDelta(stage.deltaPercent)}
                    </span>
                    <span className="t-caption text-muted-foreground">
                      MoM
                    </span>
                  </div>
                  <p
                    className="t-caption text-muted-foreground tabular-nums"
                    style={{ marginTop: "4px" }}
                  >
                    Prior: {formatMetricValue(stage.stage, stage.priorValue)}
                  </p>
                </button>

                {conversion && (
                  <div
                    className="flex flex-col items-center justify-center shrink-0"
                    style={{ width: "72px" }}
                  >
                    <div
                      className="w-full border-t-2 border-dashed"
                      style={{
                        borderColor: "var(--color-border)",
                        marginBottom: "6px",
                      }}
                    />
                    <span
                      className="tabular-nums font-semibold"
                      style={{ fontSize: "15px", color: "var(--color-primary)" }}
                    >
                      {conversion.rate.toFixed(1)}%
                    </span>
                    <span
                      className={cn(
                        "t-caption tabular-nums",
                        conversion.delta >= 0
                          ? "text-success"
                          : "text-destructive"
                      )}
                      style={{ fontSize: "11px" }}
                    >
                      {conversion.delta >= 0 ? "+" : ""}
                      {conversion.delta.toFixed(1)}pp
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Trend Synthesis */}
      <div
        className="bg-ai-surface border border-ai/20 rounded-[var(--radius-lg)] flex flex-col"
        style={{ padding: "var(--card-padding)" }}
        data-sigma-notes="AI trend synthesis — LLM-generated narrative summarizing cross-stage funnel movements, anomalies, and recommended actions. Text element with AI visual language (violet surface, sparkle badge)."
      >
        <div className="flex items-center" style={{ gap: "8px", marginBottom: "16px" }}>
          <Sparkles size={16} className="text-ai" />
          <span className="t-overline text-ai">AI Synthesis</span>
        </div>
        <h3 className="t-h3" style={{ marginBottom: "8px" }}>
          {aiTrendSynthesis.headline}
        </h3>
        <p className="t-body text-muted-foreground flex-1">
          {aiTrendSynthesis.body}
        </p>
        <button
          onClick={() => navigate("/demand-and-qualification")}
          className="flex items-center text-ai font-medium hover:underline cursor-pointer"
          style={{ gap: "4px", marginTop: "16px", fontSize: "13px" }}
        >
          Drill into MQL stage <ArrowRight size={14} />
        </button>
      </div>
      </div>

      {/* Bottom row: stage signals + funnel trend */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: "35fr 65fr",
          gap: "var(--component-gap)",
        }}
      >
        {/* ── Stage Signal Cards ── */}
        <div
          className="flex flex-col"
          style={{ gap: "var(--element-gap)" }}
          data-sigma-notes="Stage signal cards — one navigable card per funnel-stage page (Traffic & Leads, Demand & Qualification, Pipeline & Attribution, Revenue & ROI). Each shows page name, micro-metric, directional delta. Click navigates to page."
        >
          {stageSignals.map((signal) => {
            const isPositive = signal.delta >= 0;
            return (
              <button
                key={signal.page}
                onClick={() => navigate(signal.path)}
                className={cn(
                  "bg-card rounded-[var(--radius-lg)] shadow-card text-left",
                  "flex items-center justify-between",
                  "hover:bg-[var(--color-surface-200)] transition-colors cursor-pointer"
                )}
                style={{ padding: "14px var(--card-padding)" }}
              >
                <div>
                  <p className="t-caption font-medium text-foreground">
                    {signal.page}
                  </p>
                  <div
                    className="flex items-center"
                    style={{ gap: "6px", marginTop: "4px" }}
                  >
                    <span
                      className="tabular-nums font-semibold text-foreground"
                      style={{ fontSize: "17px" }}
                    >
                      {signal.isCurrency
                        ? formatCurrency(signal.value)
                        : signal.isRate
                          ? `${signal.value}${signal.suffix ?? "%"}`
                          : formatNumber(signal.value)}
                    </span>
                    <span className="t-caption text-muted-foreground">
                      {signal.metric}
                    </span>
                  </div>
                </div>
                <div className="flex items-center" style={{ gap: "6px" }}>
                  {isPositive ? (
                    <TrendingUp size={14} className="text-success" />
                  ) : (
                    <TrendingDown size={14} className="text-destructive" />
                  )}
                  <span
                    className={cn(
                      "t-caption tabular-nums font-medium",
                      isPositive ? "text-success" : "text-destructive"
                    )}
                  >
                    {formatDelta(signal.delta)}
                  </span>
                  <ChevronRight
                    size={16}
                    className="text-muted-foreground ml-1"
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* ── Funnel Trend ── */}
        <div
          className="bg-card rounded-[var(--radius-lg)] shadow-card"
          style={{ padding: "var(--card-padding)" }}
          data-sigma-notes="Funnel trend — multi-metric time series showing Leads, MQLs, SQLs, Closed-Won ARR over trailing 12 weeks at weekly granularity. Line chart, 4 series, left Y-axis for counts, right Y-axis for ARR currency."
        >
          <h3 className="t-h3">Funnel Trajectory</h3>
          <p
            className="t-caption text-muted-foreground"
            style={{ marginTop: "2px", marginBottom: "var(--component-gap)" }}
          >
            Trailing 12 weeks — all four funnel metrics
          </p>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={weeklyFunnelTrend}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border)"
                vertical={false}
              />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
                axisLine={{ stroke: "var(--color-border)" }}
                tickLine={false}
              />
              <YAxis
                yAxisId="count"
                tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                width={50}
              />
              <YAxis
                yAxisId="arr"
                orientation="right"
                tickFormatter={formatChartValue}
                tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                width={55}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 6,
                  fontSize: 13,
                }}
                formatter={(value: number, name: string) => {
                  if (name === "Closed-Won ARR")
                    return [formatChartValue(value), name];
                  return [formatNumber(value), name];
                }}
              />
              <Legend
                verticalAlign="top"
                height={32}
                iconType="plainline"
                wrapperStyle={{ fontSize: 12 }}
              />
              <Line yAxisId="count" type="monotone" dataKey="leads" name="Leads" stroke="var(--color-chart-1)" strokeWidth={2} dot={false} />
              <Line yAxisId="count" type="monotone" dataKey="mqls" name="MQLs" stroke="var(--color-chart-3)" strokeWidth={2} dot={false} />
              <Line yAxisId="count" type="monotone" dataKey="sqls" name="SQLs" stroke="var(--color-chart-5)" strokeWidth={2} dot={false} />
              <Line yAxisId="arr" type="monotone" dataKey="closedWonARR" name="Closed-Won ARR" stroke="var(--color-chart-2)" strokeWidth={2} strokeDasharray="6 3" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
