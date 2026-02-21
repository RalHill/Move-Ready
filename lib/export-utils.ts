export interface ExportData {
  dateRange: string;
  totalJobs: number;
  completedJobs: number;
  completionRate: number;
  atRiskJobs: number;
  crewUtilization: number;
  activeCrews: number;
  totalCrews: number;
}

export function generateCSV(data: ExportData): string {
  const rows = [
    ["Move Ready Plus - Analytics Report"],
    ["Generated:", new Date().toISOString()],
    ["Date Range:", data.dateRange],
    [""],
    ["Metric", "Value"],
    ["Total Jobs", data.totalJobs.toString()],
    ["Completed Jobs", data.completedJobs.toString()],
    ["Completion Rate", `${data.completionRate.toFixed(1)}%`],
    ["At-Risk Jobs", data.atRiskJobs.toString()],
    ["Crew Utilization", `${data.crewUtilization.toFixed(1)}%`],
    ["Active Crews", `${data.activeCrews} / ${data.totalCrews}`],
  ];

  return rows.map((row) => row.join(",")).join("\n");
}

export function downloadFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
