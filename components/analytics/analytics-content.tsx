"use client";

import { useState } from "react";
import { MetricsCard } from "./metrics-card";
import { RiskWidget } from "./risk-widget";
import { Briefcase, CheckCircle2, AlertTriangle, Users, ChevronDown } from "lucide-react";
import type { Job, Crew } from "@/types/domain";
import { generateCSV, downloadFile, type ExportData } from "@/lib/export-utils";
import toast from "react-hot-toast";

interface AnalyticsContentProps {
  allJobs: Job[];
  completedJobs: Job[];
  riskJobs: Job[];
  crews: Crew[];
}

type DateRange = "7days" | "30days" | "90days";

export function AnalyticsContent({
  allJobs,
  completedJobs,
  riskJobs,
  crews,
}: AnalyticsContentProps) {
  const [dateRange, setDateRange] = useState<DateRange>("7days");
  const [showDateMenu, setShowDateMenu] = useState(false);

  const totalJobs = allJobs.length;
  const completed = completedJobs.length;
  const atRisk = riskJobs.length;
  const totalCrews = crews.length;
  const activeCrews = crews.filter((c) => c.status === "assigned").length;

  const completionRate = totalJobs > 0 ? (completed / totalJobs) * 100 : 0;
  const crewUtilization = totalCrews > 0 ? (activeCrews / totalCrews) * 100 : 0;

  const jobsChart = [45, 52, 38, 65, 72, 58, 80, 75];
  const completionChart = [65, 70, 68, 75, 80, 85, 82, 88];
  const riskChart = [5, 8, 6, 10, 7, 4, 3, 6];
  const utilizationChart = [60, 70, 75, 80, 85, 78, 82, 84];

  const weekData = [
    { day: "Mon", completed: 12, target: 15 },
    { day: "Tue", completed: 14, target: 15 },
    { day: "Wed", completed: 11, target: 15 },
    { day: "Thu", completed: 16, target: 15 },
    { day: "Fri", completed: 15, target: 15 },
    { day: "Sat", completed: 8, target: 10 },
    { day: "Sun", completed: 5, target: 8 },
  ];

  function handleExportReport() {
    const exportData: ExportData = {
      dateRange: getDateRangeLabel(dateRange),
      totalJobs,
      completedJobs: completed,
      completionRate,
      atRiskJobs: atRisk,
      crewUtilization,
      activeCrews,
      totalCrews,
    };

    const csvContent = generateCSV(exportData);
    const filename = `move-ready-report-${new Date().toISOString().split("T")[0]}.csv`;

    downloadFile(csvContent, filename);
    toast.success("Report exported successfully!");
  }

  function getDateRangeLabel(range: DateRange): string {
    switch (range) {
      case "7days":
        return "Last 7 Days";
      case "30days":
        return "Last 30 Days";
      case "90days":
        return "Last 90 Days";
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Analytics
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Performance metrics and operational insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setShowDateMenu(!showDateMenu)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {getDateRangeLabel(dateRange)}
              <ChevronDown size={16} />
            </button>
            {showDateMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-10 min-w-[150px]">
                {(["7days", "30days", "90days"] as DateRange[]).map((range) => (
                  <button
                    key={range}
                    onClick={() => {
                      setDateRange(range);
                      setShowDateMenu(false);
                      toast.success(`Filter updated to ${getDateRangeLabel(range)}`);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    {getDateRangeLabel(range)}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={handleExportReport}
            className="px-4 py-1.5 text-sm text-white bg-blue-600 hover:bg-blue-700 active:scale-98 rounded-lg transition-all flex items-center gap-2"
          >
            Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <MetricsCard
          label="Total Jobs"
          value={totalJobs}
          icon={<Briefcase size={20} />}
          trend={{ value: "12%", direction: "up" }}
          chart={jobsChart}
        />
        <MetricsCard
          label="Completion Rate"
          value={`${completionRate.toFixed(1)}%`}
          variant="success"
          icon={<CheckCircle2 size={20} />}
          trend={{ value: "2.4%", direction: "up" }}
          chart={completionChart}
        />
        <MetricsCard
          label="At-Risk Jobs"
          value={atRisk}
          variant="warning"
          icon={<AlertTriangle size={20} />}
          trend={{ value: "1", direction: "down" }}
          chart={riskChart}
        />
        <MetricsCard
          label="Crew Utilization"
          value={`${crewUtilization.toFixed(1)}%`}
          icon={<Users size={20} />}
          trend={{ value: "3%", direction: "down" }}
          chart={utilizationChart}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <RiskWidget riskJobs={riskJobs} />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Crew Status
            </h2>
          </div>
          <div className="space-y-4">
            {crews.map((crew) => {
              const utilization =
                crew.status === "assigned" ? 75 : crew.status === "available" ? 42 : 0;
              return (
                <div key={crew.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          crew.status === "available"
                            ? "bg-green-500"
                            : crew.status === "assigned"
                            ? "bg-blue-500"
                            : "bg-gray-400"
                        }`}
                      ></span>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {crew.name}
                      </p>
                    </div>
                    <span
                      className={`text-xs uppercase font-semibold ${
                        crew.status === "available"
                          ? "text-green-600"
                          : crew.status === "assigned"
                          ? "text-blue-600"
                          : "text-gray-500"
                      }`}
                    >
                      {crew.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {crew.current_lat.toFixed(4)}, {crew.current_lng.toFixed(4)}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                      <span className="uppercase font-medium">Utilization</span>
                      <span className="font-semibold">{utilization}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all"
                        style={{ width: `${utilization}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Daily Job Performance
          </h2>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-blue-600 rounded-sm"></span>
              <span className="text-gray-600 dark:text-gray-400">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-sm"></span>
              <span className="text-gray-600 dark:text-gray-400">Target</span>
            </div>
          </div>
        </div>
        <div className="flex items-end justify-between h-64 gap-3 px-4">
          {weekData.map(({ day, completed, target }) => {
            const completedHeight = (completed / Math.max(target, completed)) * 100;
            const targetHeight = 100;

            return (
              <div key={day} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex gap-1 items-end h-48">
                  <div
                    className="flex-1 bg-blue-600 rounded-t hover:bg-blue-700 transition-colors cursor-pointer"
                    style={{ height: `${completedHeight}%` }}
                    title={`Completed: ${completed}`}
                  />
                  <div
                    className="flex-1 bg-gray-300 dark:bg-gray-600 rounded-t"
                    style={{ height: `${targetHeight}%` }}
                    title={`Target: ${target}`}
                  />
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                  {day}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
