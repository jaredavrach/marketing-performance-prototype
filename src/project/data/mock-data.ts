// Marketing Performance — Mock Data
// Production Sigma app covering full marketing funnel:
// Web traffic → Leads → MQLs → SQLs → Pipeline → Closed-Won ARR

// ─── Types ───────────────────────────────────────────────────────

export interface FunnelStage {
  stage: string;
  value: number;
  priorValue: number;
  delta: number;
  deltaPercent: number;
}

export interface ConversionRate {
  from: string;
  to: string;
  rate: number;
  priorRate: number;
  delta: number;
}

export interface WeeklyFunnelTrend {
  week: string;
  leads: number;
  mqls: number;
  sqls: number;
  closedWonARR: number;
}

export interface CampaignTraffic {
  campaign: string;
  type: string;
  sessions: number;
  visitors: number;
  netNewLeads: number;
  optInLeads: number;
  optInRate: number;
}

export interface TrafficTrend {
  week: string;
  sessions: number;
  visitors: number;
  priorSessions: number;
  priorVisitors: number;
}

export interface LeadSource {
  source: string;
  count: number;
  percentage: number;
}

export interface MQLTrend {
  week: string;
  mqls: number;
  priorMQLs: number;
}

export interface ConversionTrend {
  week: string;
  leadToMQL: number;
  mqlToOpp: number;
}

export interface CampaignMemberStatus {
  campaign: string;
  sent: number;
  responded: number;
  engaged: number;
  mql: number;
  converted: number;
  disqualified: number;
  total: number;
}

export interface CampaignConversion {
  campaign: string;
  type: string;
  totalLeads: number;
  mqls: number;
  leadToMQLRate: number;
  opportunities: number;
  mqlToOppRate: number;
  costPerMQL: number;
}

export interface PipelineStage {
  stage: string;
  count: number;
  value: number;
  conversionFromPrior: number;
  avgDwellDays: number;
}

export interface AttributionAnomaly {
  id: string;
  opportunity: string;
  account: string;
  originalSource: string;
  newSource: string;
  changeDate: string;
  confidence: number;
  value: number;
  stage: string;
}

export interface OpportunityRow {
  id: string;
  name: string;
  account: string;
  stage: string;
  daysInStage: number;
  value: number;
  attribution: string;
  attributionChanges: number;
  flagStatus: "unflagged" | "flagged" | "acknowledged";
  rep: string;
}

export interface AttributionRevenue {
  channel: string;
  currentARR: number;
  priorARR: number;
  delta: number;
  sharePercent: number;
}

export interface DealSizeBySource {
  source: string;
  avgDealSize: number;
}

export interface DealSizeTrend {
  period: string;
  avgDealSize: number;
}

export interface CostTrend {
  period: string;
  costPerMQL: number;
  costPerOpp: number;
}

export interface CampaignROI {
  campaign: string;
  type: string;
  spend: number;
  attributedARR: number;
  roi: number;
  costPerMQL: number;
  costPerOpp: number;
  mqls: number;
  opportunities: number;
}

// ─── Funnel Summary (Executive Hub) ──────────────────────────────

export const funnelStages: FunnelStage[] = [
  { stage: "Leads", value: 4832, priorValue: 4291, delta: 541, deltaPercent: 12.6 },
  { stage: "MQLs", value: 1247, priorValue: 1089, delta: 158, deltaPercent: 14.5 },
  { stage: "SQLs", value: 389, priorValue: 362, delta: 27, deltaPercent: 7.5 },
  { stage: "Closed-Won ARR", value: 2840000, priorValue: 2510000, delta: 330000, deltaPercent: 13.1 },
];

export const conversionRates: ConversionRate[] = [
  { from: "Leads", to: "MQLs", rate: 25.8, priorRate: 25.4, delta: 0.4 },
  { from: "MQLs", to: "SQLs", rate: 31.2, priorRate: 33.2, delta: -2.0 },
  { from: "SQLs", to: "Closed-Won", rate: 18.5, priorRate: 17.1, delta: 1.4 },
];

export const weeklyFunnelTrend: WeeklyFunnelTrend[] = [
  { week: "W1", leads: 340, mqls: 86, sqls: 28, closedWonARR: 185000 },
  { week: "W2", leads: 378, mqls: 92, sqls: 25, closedWonARR: 210000 },
  { week: "W3", leads: 425, mqls: 108, sqls: 33, closedWonARR: 195000 },
  { week: "W4", leads: 390, mqls: 95, sqls: 30, closedWonARR: 240000 },
  { week: "W5", leads: 412, mqls: 110, sqls: 35, closedWonARR: 230000 },
  { week: "W6", leads: 448, mqls: 102, sqls: 29, closedWonARR: 265000 },
  { week: "W7", leads: 460, mqls: 118, sqls: 38, closedWonARR: 280000 },
  { week: "W8", leads: 435, mqls: 105, sqls: 31, closedWonARR: 255000 },
  { week: "W9", leads: 470, mqls: 122, sqls: 36, closedWonARR: 290000 },
  { week: "W10", leads: 445, mqls: 115, sqls: 34, closedWonARR: 275000 },
  { week: "W11", leads: 490, mqls: 128, sqls: 40, closedWonARR: 310000 },
  { week: "W12", leads: 480, mqls: 120, sqls: 37, closedWonARR: 305000 },
];

export const stageSignals = [
  { page: "Traffic & Leads", metric: "Net New Leads", value: 4832, delta: 12.6, path: "/traffic-and-leads" },
  { page: "Demand & Qualification", metric: "Lead → MQL Rate", value: 25.8, delta: 0.4, path: "/demand-and-qualification", isRate: true },
  { page: "Pipeline & Attribution", metric: "Pipeline Value", value: 8420000, delta: 5.2, path: "/pipeline-and-attribution", isCurrency: true },
  { page: "Revenue & ROI", metric: "Campaign ROI", value: 340, delta: 8.3, path: "/revenue-and-roi", isRate: true, suffix: "%" },
];

// ─── Traffic & Leads ─────────────────────────────────────────────

export const trafficKPIs = {
  sessions: { value: 82450, delta: 8.3 },
  visitors: { value: 41200, delta: 6.1 },
  netNewLeads: { value: 4832, delta: 12.6 },
  optInLeads: { value: 2890, delta: 9.4 },
  optInRate: { value: 59.8, delta: 1.2 },
};

export const campaignTraffic: CampaignTraffic[] = [
  { campaign: "Spring Product Launch", type: "Product", sessions: 14200, visitors: 7100, netNewLeads: 892, optInLeads: 534, optInRate: 59.9 },
  { campaign: "Q1 Webinar Series", type: "Content", sessions: 11800, visitors: 5900, netNewLeads: 748, optInLeads: 486, optInRate: 65.0 },
  { campaign: "Paid Search — Brand", type: "Paid Search", sessions: 9600, visitors: 4800, netNewLeads: 624, optInLeads: 368, optInRate: 59.0 },
  { campaign: "LinkedIn ABM Tier 1", type: "ABM", sessions: 8400, visitors: 4200, netNewLeads: 510, optInLeads: 332, optInRate: 65.1 },
  { campaign: "Field Events NYC", type: "Events", sessions: 7200, visitors: 3600, netNewLeads: 456, optInLeads: 297, optInRate: 65.1 },
  { campaign: "Paid Social — Meta", type: "Paid Social", sessions: 6800, visitors: 3400, netNewLeads: 398, optInLeads: 215, optInRate: 54.0 },
  { campaign: "Partner Co-Marketing", type: "Partner", sessions: 5200, visitors: 2600, netNewLeads: 312, optInLeads: 187, optInRate: 59.9 },
  { campaign: "Content Syndication", type: "Content", sessions: 4800, visitors: 2400, netNewLeads: 286, optInLeads: 172, optInRate: 60.1 },
  { campaign: "Email Nurture Q1", type: "Email", sessions: 3900, visitors: 1950, netNewLeads: 234, optInLeads: 152, optInRate: 65.0 },
  { campaign: "SEO Content Hub", type: "Organic", sessions: 10550, visitors: 5250, netNewLeads: 372, optInLeads: 147, optInRate: 39.5 },
];

export const trafficTrend: TrafficTrend[] = [
  { week: "W1", sessions: 5800, visitors: 2900, priorSessions: 5400, priorVisitors: 2700 },
  { week: "W2", sessions: 6200, visitors: 3100, priorSessions: 5600, priorVisitors: 2800 },
  { week: "W3", sessions: 6800, visitors: 3400, priorSessions: 5900, priorVisitors: 2950 },
  { week: "W4", sessions: 6500, visitors: 3250, priorSessions: 6100, priorVisitors: 3050 },
  { week: "W5", sessions: 7100, visitors: 3550, priorSessions: 6300, priorVisitors: 3150 },
  { week: "W6", sessions: 7400, visitors: 3700, priorSessions: 6500, priorVisitors: 3250 },
  { week: "W7", sessions: 7200, visitors: 3600, priorSessions: 6700, priorVisitors: 3350 },
  { week: "W8", sessions: 6900, visitors: 3450, priorSessions: 6200, priorVisitors: 3100 },
  { week: "W9", sessions: 7600, visitors: 3800, priorSessions: 6400, priorVisitors: 3200 },
  { week: "W10", sessions: 7300, visitors: 3650, priorSessions: 6600, priorVisitors: 3300 },
  { week: "W11", sessions: 7800, visitors: 3900, priorSessions: 6800, priorVisitors: 3400 },
  { week: "W12", sessions: 7850, visitors: 3900, priorSessions: 6900, priorVisitors: 3450 },
];

export const leadSources: LeadSource[] = [
  { source: "Paid Search", count: 1352, percentage: 28.0 },
  { source: "Organic Search", count: 869, percentage: 18.0 },
  { source: "Paid Social", count: 724, percentage: 15.0 },
  { source: "Events", count: 628, percentage: 13.0 },
  { source: "Referral", count: 483, percentage: 10.0 },
  { source: "Direct", count: 435, percentage: 9.0 },
  { source: "Email", count: 341, percentage: 7.0 },
];

// ─── Demand & Qualification ──────────────────────────────────────

export const demandKPIs = {
  mqlCount: { value: 1247, delta: 14.5 },
  leadToMQLRate: { value: 25.8, delta: 0.4 },
  mqlToOppRate: { value: 31.2, delta: -2.0 },
};

export const mqlTrend: MQLTrend[] = [
  { week: "W1", mqls: 86, priorMQLs: 78 },
  { week: "W2", mqls: 92, priorMQLs: 82 },
  { week: "W3", mqls: 108, priorMQLs: 88 },
  { week: "W4", mqls: 95, priorMQLs: 90 },
  { week: "W5", mqls: 110, priorMQLs: 85 },
  { week: "W6", mqls: 102, priorMQLs: 92 },
  { week: "W7", mqls: 118, priorMQLs: 95 },
  { week: "W8", mqls: 105, priorMQLs: 88 },
  { week: "W9", mqls: 122, priorMQLs: 96 },
  { week: "W10", mqls: 115, priorMQLs: 93 },
  { week: "W11", mqls: 128, priorMQLs: 100 },
  { week: "W12", mqls: 120, priorMQLs: 97 },
];

export const conversionTrend: ConversionTrend[] = [
  { week: "W1", leadToMQL: 25.3, mqlToOpp: 32.6 },
  { week: "W2", leadToMQL: 24.3, mqlToOpp: 27.2 },
  { week: "W3", leadToMQL: 25.4, mqlToOpp: 30.6 },
  { week: "W4", leadToMQL: 24.4, mqlToOpp: 31.6 },
  { week: "W5", leadToMQL: 26.7, mqlToOpp: 31.8 },
  { week: "W6", leadToMQL: 22.8, mqlToOpp: 28.4 },
  { week: "W7", leadToMQL: 25.7, mqlToOpp: 32.2 },
  { week: "W8", leadToMQL: 24.1, mqlToOpp: 29.5 },
  { week: "W9", leadToMQL: 26.0, mqlToOpp: 29.5 },
  { week: "W10", leadToMQL: 25.8, mqlToOpp: 29.6 },
  { week: "W11", leadToMQL: 26.1, mqlToOpp: 30.0 },
  { week: "W12", leadToMQL: 25.0, mqlToOpp: 30.8 },
];

export const campaignMemberStatus: CampaignMemberStatus[] = [
  { campaign: "Spring Product Launch", sent: 2400, responded: 1680, engaged: 1120, mql: 448, converted: 156, disqualified: 89, total: 5893 },
  { campaign: "Q1 Webinar Series", sent: 1800, responded: 1260, engaged: 840, mql: 374, converted: 134, disqualified: 67, total: 4475 },
  { campaign: "LinkedIn ABM Tier 1", sent: 1200, responded: 780, engaged: 580, mql: 255, converted: 98, disqualified: 45, total: 2958 },
  { campaign: "Paid Search — Brand", sent: 0, responded: 0, engaged: 1450, mql: 312, converted: 112, disqualified: 78, total: 1952 },
  { campaign: "Field Events NYC", sent: 800, responded: 640, engaged: 420, mql: 228, converted: 82, disqualified: 34, total: 2204 },
  { campaign: "Paid Social — Meta", sent: 0, responded: 0, engaged: 980, mql: 199, converted: 68, disqualified: 56, total: 1303 },
];

export const campaignConversions: CampaignConversion[] = [
  { campaign: "Spring Product Launch", type: "Product", totalLeads: 892, mqls: 230, leadToMQLRate: 25.8, opportunities: 72, mqlToOppRate: 31.3, costPerMQL: 145 },
  { campaign: "Q1 Webinar Series", type: "Content", totalLeads: 748, mqls: 206, leadToMQLRate: 27.5, opportunities: 64, mqlToOppRate: 31.1, costPerMQL: 118 },
  { campaign: "Paid Search — Brand", type: "Paid Search", totalLeads: 624, mqls: 162, leadToMQLRate: 26.0, opportunities: 52, mqlToOppRate: 32.1, costPerMQL: 195 },
  { campaign: "LinkedIn ABM Tier 1", type: "ABM", totalLeads: 510, mqls: 148, leadToMQLRate: 29.0, opportunities: 48, mqlToOppRate: 32.4, costPerMQL: 210 },
  { campaign: "Field Events NYC", type: "Events", totalLeads: 456, mqls: 125, leadToMQLRate: 27.4, opportunities: 38, mqlToOppRate: 30.4, costPerMQL: 280 },
  { campaign: "Paid Social — Meta", type: "Paid Social", totalLeads: 398, mqls: 96, leadToMQLRate: 24.1, opportunities: 28, mqlToOppRate: 29.2, costPerMQL: 165 },
  { campaign: "Partner Co-Marketing", type: "Partner", totalLeads: 312, mqls: 84, leadToMQLRate: 26.9, opportunities: 26, mqlToOppRate: 31.0, costPerMQL: 135 },
  { campaign: "Content Syndication", type: "Content", totalLeads: 286, mqls: 72, leadToMQLRate: 25.2, opportunities: 22, mqlToOppRate: 30.6, costPerMQL: 152 },
  { campaign: "Email Nurture Q1", type: "Email", totalLeads: 234, mqls: 68, leadToMQLRate: 29.1, opportunities: 22, mqlToOppRate: 32.4, costPerMQL: 85 },
  { campaign: "SEO Content Hub", type: "Organic", totalLeads: 372, mqls: 56, leadToMQLRate: 15.1, opportunities: 17, mqlToOppRate: 30.4, costPerMQL: 42 },
];

// ─── Pipeline & Attribution ──────────────────────────────────────

export const pipelineKPIs = {
  sqls: { value: 389, delta: 7.5 },
  totalPipeline: { value: 8420000, delta: 5.2 },
  weightedPipeline: { value: 4680000, delta: 3.8 },
  attributionMatchRate: { value: 94.1, delta: -0.8 },
};

export const pipelineStages: PipelineStage[] = [
  { stage: "Discovery", count: 142, value: 2840000, conversionFromPrior: 100, avgDwellDays: 12 },
  { stage: "Qualification", count: 98, value: 2156000, conversionFromPrior: 69, avgDwellDays: 18 },
  { stage: "Proposal", count: 72, value: 1800000, conversionFromPrior: 73, avgDwellDays: 22 },
  { stage: "Negotiation", count: 48, value: 1200000, conversionFromPrior: 67, avgDwellDays: 15 },
  { stage: "Closed-Won", count: 29, value: 424000, conversionFromPrior: 60, avgDwellDays: 8 },
];

export const overallAvgDwell = 15;

export const attributionAnomalies: AttributionAnomaly[] = [
  { id: "AA-001", opportunity: "Acme Corp — Enterprise Suite", account: "Acme Corp", originalSource: "Paid Search", newSource: "Partner", changeDate: "2026-04-08", confidence: 94, value: 185000, stage: "Negotiation" },
  { id: "AA-002", opportunity: "GlobalTech — Platform Upgrade", account: "GlobalTech", originalSource: "Content", newSource: "Partner", changeDate: "2026-04-07", confidence: 88, value: 142000, stage: "Proposal" },
  { id: "AA-003", opportunity: "Meridian Inc — Analytics Module", account: "Meridian Inc", originalSource: "Events", newSource: "Direct", changeDate: "2026-04-09", confidence: 82, value: 96000, stage: "Qualification" },
  { id: "AA-004", opportunity: "Pinnacle Systems — Full Stack", account: "Pinnacle Systems", originalSource: "Paid Social", newSource: "Partner", changeDate: "2026-04-06", confidence: 79, value: 210000, stage: "Negotiation" },
  { id: "AA-005", opportunity: "BlueWave — Starter Package", account: "BlueWave", originalSource: "Email", newSource: "Organic", changeDate: "2026-04-10", confidence: 71, value: 45000, stage: "Discovery" },
];

export const opportunities: OpportunityRow[] = [
  { id: "OPP-1001", name: "Acme Corp — Enterprise Suite", account: "Acme Corp", stage: "Negotiation", daysInStage: 22, value: 185000, attribution: "Partner", attributionChanges: 1, flagStatus: "flagged", rep: "Sarah Chen" },
  { id: "OPP-1002", name: "GlobalTech — Platform Upgrade", account: "GlobalTech", stage: "Proposal", daysInStage: 28, value: 142000, attribution: "Partner", attributionChanges: 1, flagStatus: "unflagged", rep: "Marcus Rivera" },
  { id: "OPP-1003", name: "Pinnacle Systems — Full Stack", account: "Pinnacle Systems", stage: "Negotiation", daysInStage: 19, value: 210000, attribution: "Partner", attributionChanges: 1, flagStatus: "unflagged", rep: "Sarah Chen" },
  { id: "OPP-1004", name: "Meridian Inc — Analytics Module", account: "Meridian Inc", stage: "Qualification", daysInStage: 25, value: 96000, attribution: "Direct", attributionChanges: 1, flagStatus: "unflagged", rep: "Jordan Park" },
  { id: "OPP-1005", name: "NovaStar — Growth Plan", account: "NovaStar", stage: "Discovery", daysInStage: 8, value: 78000, attribution: "Paid Search", attributionChanges: 0, flagStatus: "unflagged", rep: "Marcus Rivera" },
  { id: "OPP-1006", name: "CrestLine — Enterprise", account: "CrestLine", stage: "Proposal", daysInStage: 31, value: 165000, attribution: "Events", attributionChanges: 0, flagStatus: "unflagged", rep: "Jordan Park" },
  { id: "OPP-1007", name: "DataFlow — Pro Tier", account: "DataFlow", stage: "Qualification", daysInStage: 20, value: 58000, attribution: "Content", attributionChanges: 0, flagStatus: "unflagged", rep: "Sarah Chen" },
  { id: "OPP-1008", name: "Apex Industries — Platform", account: "Apex Industries", stage: "Discovery", daysInStage: 5, value: 120000, attribution: "ABM", attributionChanges: 0, flagStatus: "unflagged", rep: "Ava Nguyen" },
  { id: "OPP-1009", name: "Summit Group — Analytics", account: "Summit Group", stage: "Negotiation", daysInStage: 14, value: 92000, attribution: "Webinar", attributionChanges: 0, flagStatus: "acknowledged", rep: "Marcus Rivera" },
  { id: "OPP-1010", name: "Orbit Labs — Starter", account: "Orbit Labs", stage: "Discovery", daysInStage: 3, value: 35000, attribution: "Organic", attributionChanges: 0, flagStatus: "unflagged", rep: "Ava Nguyen" },
  { id: "OPP-1011", name: "TerraVault — Enterprise Expand", account: "TerraVault", stage: "Proposal", daysInStage: 18, value: 230000, attribution: "Paid Search", attributionChanges: 0, flagStatus: "unflagged", rep: "Sarah Chen" },
  { id: "OPP-1012", name: "BlueWave — Starter Package", account: "BlueWave", stage: "Discovery", daysInStage: 6, value: 45000, attribution: "Organic", attributionChanges: 1, flagStatus: "unflagged", rep: "Jordan Park" },
];

// ─── Revenue & ROI ───────────────────────────────────────────────

export const revenueKPIs = {
  closedWonARR: { value: 2840000, delta: 13.1 },
  marketingAttributedARR: { value: 2130000, delta: 15.2, sharePercent: 75.0 },
  avgDealSize: { value: 97931, delta: 4.8 },
};

export const attributionRevenue: AttributionRevenue[] = [
  { channel: "Paid Search", currentARR: 520000, priorARR: 440000, delta: 18.2, sharePercent: 24.4 },
  { channel: "Events", currentARR: 385000, priorARR: 360000, delta: 6.9, sharePercent: 18.1 },
  { channel: "Content", currentARR: 340000, priorARR: 310000, delta: 9.7, sharePercent: 16.0 },
  { channel: "ABM", currentARR: 295000, priorARR: 245000, delta: 20.4, sharePercent: 13.8 },
  { channel: "Partner", currentARR: 250000, priorARR: 215000, delta: 16.3, sharePercent: 11.7 },
  { channel: "Paid Social", currentARR: 185000, priorARR: 200000, delta: -7.5, sharePercent: 8.7 },
  { channel: "Email", currentARR: 155000, priorARR: 140000, delta: 10.7, sharePercent: 7.3 },
];

export const dealSizeBySource: DealSizeBySource[] = [
  { source: "ABM", avgDealSize: 142000 },
  { source: "Events", avgDealSize: 118000 },
  { source: "Partner", avgDealSize: 105000 },
  { source: "Paid Search", avgDealSize: 96000 },
  { source: "Content", avgDealSize: 82000 },
  { source: "Email", avgDealSize: 68000 },
  { source: "Paid Social", avgDealSize: 54000 },
];

export const dealSizeTrend: DealSizeTrend[] = [
  { period: "Oct", avgDealSize: 85000 },
  { period: "Nov", avgDealSize: 88000 },
  { period: "Dec", avgDealSize: 82000 },
  { period: "Jan", avgDealSize: 91000 },
  { period: "Feb", avgDealSize: 94000 },
  { period: "Mar", avgDealSize: 98000 },
];

export const costTrend: CostTrend[] = [
  { period: "Oct", costPerMQL: 172, costPerOpp: 548 },
  { period: "Nov", costPerMQL: 168, costPerOpp: 535 },
  { period: "Dec", costPerMQL: 175, costPerOpp: 560 },
  { period: "Jan", costPerMQL: 162, costPerOpp: 518 },
  { period: "Feb", costPerMQL: 158, costPerOpp: 505 },
  { period: "Mar", costPerMQL: 155, costPerOpp: 495 },
];

export const costKPIs = {
  costPerMQL: { value: 155, delta: -4.3 },
  costPerOpp: { value: 495, delta: -3.8 },
};

export const campaignROI: CampaignROI[] = [
  { campaign: "Email Nurture Q1", type: "Email", spend: 5780, attributedARR: 155000, roi: 2581, costPerMQL: 85, costPerOpp: 263, mqls: 68, opportunities: 22 },
  { campaign: "SEO Content Hub", type: "Organic", spend: 2352, attributedARR: 62000, roi: 2535, costPerMQL: 42, costPerOpp: 138, mqls: 56, opportunities: 17 },
  { campaign: "Q1 Webinar Series", type: "Content", spend: 24308, attributedARR: 340000, roi: 1299, costPerMQL: 118, costPerOpp: 380, mqls: 206, opportunities: 64 },
  { campaign: "Partner Co-Marketing", type: "Partner", spend: 11340, attributedARR: 145000, roi: 1179, costPerMQL: 135, costPerOpp: 436, mqls: 84, opportunities: 26 },
  { campaign: "Spring Product Launch", type: "Product", spend: 33350, attributedARR: 380000, roi: 1039, costPerMQL: 145, costPerOpp: 463, mqls: 230, opportunities: 72 },
  { campaign: "LinkedIn ABM Tier 1", type: "ABM", spend: 31080, attributedARR: 295000, roi: 849, costPerMQL: 210, costPerOpp: 648, mqls: 148, opportunities: 48 },
  { campaign: "Field Events NYC", type: "Events", spend: 35000, attributedARR: 285000, roi: 714, costPerMQL: 280, costPerOpp: 921, mqls: 125, opportunities: 38 },
  { campaign: "Content Syndication", type: "Content", spend: 10944, attributedARR: 68000, roi: 521, costPerMQL: 152, costPerOpp: 497, mqls: 72, opportunities: 22 },
  { campaign: "Paid Search — Brand", type: "Paid Search", spend: 31590, attributedARR: 180000, roi: 470, costPerMQL: 195, costPerOpp: 607, mqls: 162, opportunities: 52 },
  { campaign: "Paid Social — Meta", type: "Paid Social", spend: 15840, attributedARR: 82000, roi: 418, costPerMQL: 165, costPerOpp: 566, mqls: 96, opportunities: 28 },
];

// ─── AI Content ──────────────────────────────────────────────────

export const aiTrendSynthesis = {
  headline: "MQL volume up 14.5% — strongest growth in Demand stage",
  body: "Lead generation accelerated this period with net new leads up 12.6% MoM, driven primarily by the Spring Product Launch and Q1 Webinar Series. The MQL conversion rate held steady at 25.8%, translating the lead volume increase into a 14.5% MQL gain. However, MQL-to-SQL conversion dipped 2.0 points to 31.2% — worth monitoring as pipeline efficiency softened despite volume gains. Closed-won ARR grew 13.1% to $2.84M, suggesting deals entering the pipeline earlier in the quarter are closing well.",
  suggestedDrillDown: { page: "Demand & Qualification", reason: "MQL-to-SQL conversion decline needs investigation" },
};

export const aiRevenueSynthesis = {
  headline: "Marketing-attributed ARR up 15.2% — ABM emerges as fastest-growing channel",
  body: "Closed-won ARR reached $2.84M this period, with marketing-attributed revenue accounting for 75% ($2.13M). ABM saw the strongest channel growth at +20.4%, reflecting the LinkedIn ABM Tier 1 campaign's success in generating high-value enterprise deals with a $142K average deal size. Paid Social was the only declining channel at -7.5%, suggesting Meta campaign fatigue. Cost efficiency improved across the board — cost per MQL dropped 4.3% to $155 and cost per opportunity fell 3.8% to $495, indicating the portfolio is scaling without proportional spend increases.",
  callouts: [
    "ABM average deal size ($142K) is 2.6× the portfolio average — highest-quality channel",
    "Paid Social ROI declined to 418% — lowest in portfolio, down from 520% prior period",
    "Email Nurture delivers best ROI at 2,581% on minimal spend — opportunity to scale",
  ],
};

// ─── Formatting Helpers ──────────────────────────────────────────

export function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

export function formatNumber(value: number): string {
  return value.toLocaleString();
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return value.toFixed(0);
}

export function formatDelta(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}
