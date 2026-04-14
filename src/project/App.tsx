import { Routes, Route, Navigate, NavLink } from "react-router-dom";
import { cn } from "@lib/utils";
import {
  LayoutDashboard,
  MousePointerClick,
  Target,
  GitBranch,
  DollarSign,
} from "lucide-react";

import ExecutiveHub from "./pages/ExecutiveHub";
import TrafficAndLeads from "./pages/TrafficAndLeads";
import DemandAndQualification from "./pages/DemandAndQualification";
import PipelineAndAttribution from "./pages/PipelineAndAttribution";
import RevenueAndROI from "./pages/RevenueAndROI";

const navItems = [
  { path: "/executive-hub", label: "Executive Hub", icon: LayoutDashboard },
  { path: "/traffic-and-leads", label: "Traffic & Leads", icon: MousePointerClick },
  { path: "/demand-and-qualification", label: "Demand & Qualification", icon: Target },
  { path: "/pipeline-and-attribution", label: "Pipeline & Attribution", icon: GitBranch },
  { path: "/revenue-and-roi", label: "Revenue & ROI", icon: DollarSign },
];

export default function App() {
  return (
    <div className="flex min-h-screen">
      <aside
        className="shrink-0 border-r border-border bg-nav-bg flex flex-col"
        style={{ width: "var(--sidebar-width)" }}
      >
        <div className="px-5 pt-6 pb-8">
          <span className="t-overline tracking-widest text-primary">
            Marketing Performance
          </span>
        </div>

        <nav className="flex flex-col gap-0.5 px-3 flex-1">
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-sm font-medium transition-colors",
                  isActive
                    ? "text-primary bg-primary/8"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )
              }
            >
              <Icon size={18} strokeWidth={1.8} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <main
        className="flex-1 overflow-y-auto bg-background"
        style={{ padding: "var(--page-padding)", minWidth: 1024 }}
      >
        <Routes>
          <Route path="/" element={<Navigate to="/executive-hub" replace />} />
          <Route path="/executive-hub" element={<ExecutiveHub />} />
          <Route path="/traffic-and-leads" element={<TrafficAndLeads />} />
          <Route path="/demand-and-qualification" element={<DemandAndQualification />} />
          <Route path="/pipeline-and-attribution" element={<PipelineAndAttribution />} />
          <Route path="/revenue-and-roi" element={<RevenueAndROI />} />
        </Routes>
      </main>
    </div>
  );
}
