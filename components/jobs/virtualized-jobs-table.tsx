"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";
import { format } from "date-fns";
import type { Job, UserRole } from "@/types/domain";
import { AlertTriangle } from "lucide-react";

interface VirtualizedJobsTableProps {
  jobs: Job[];
  userRole: UserRole;
}

export function VirtualizedJobsTable({
  jobs,
  userRole: _userRole,
}: VirtualizedJobsTableProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: jobs.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
    overscan: 10,
  });

  function getStatusBadgeClass(status: Job["status"]) {
    const baseClass = "px-3 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case "unassigned":
        return `${baseClass} bg-gray-100 text-gray-700`;
      case "assigned":
        return `${baseClass} bg-primary-100 text-primary-800`;
      case "en_route":
        return `${baseClass} bg-warning-100 text-warning-700`;
      case "on_site":
        return `${baseClass} bg-warning-50 text-warning-600`;
      case "completed":
        return `${baseClass} bg-success-100 text-success-700`;
      default:
        return `${baseClass} bg-gray-100 text-gray-700`;
    }
  }

  if (jobs.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <p className="text-gray-500">No jobs found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
        <div className="grid grid-cols-6 gap-4 px-4 py-3">
          <div className="text-sm font-semibold text-gray-900">Customer</div>
          <div className="text-sm font-semibold text-gray-900">Address</div>
          <div className="text-sm font-semibold text-gray-900">Scheduled</div>
          <div className="text-sm font-semibold text-gray-900">Status</div>
          <div className="text-sm font-semibold text-gray-900">Crew</div>
          <div className="text-sm font-semibold text-gray-900">Risk</div>
        </div>
      </div>

      <div ref={parentRef} className="h-[600px] overflow-auto">
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const job = jobs[virtualRow.index];
            return (
              <div
                key={job.id}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  virtualRow.index % 2 === 0 ? "bg-white" : "bg-gray-50"
                }`}
              >
                <div className="grid grid-cols-6 gap-4 px-4 py-3 h-full items-center">
                  <div className="text-sm text-gray-700">
                    {job.customer_name}
                  </div>
                  <div className="text-sm text-gray-700 truncate">
                    {job.address}
                  </div>
                  <div className="text-sm font-mono text-gray-700">
                    {format(new Date(job.scheduled_time), "MMM dd, HH:mm")}
                  </div>
                  <div>
                    <span className={getStatusBadgeClass(job.status)}>
                      {job.status.replace("_", " ")}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700">
                    {job.crew_id ? "Assigned" : "—"}
                  </div>
                  <div>
                    {job.risk_flag && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-danger-100 text-danger-700 text-xs font-medium border border-danger-600">
                        <AlertTriangle size={14} />
                        At Risk
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
