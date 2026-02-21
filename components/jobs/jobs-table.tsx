"use client";

import { format } from "date-fns";
import type { Job, UserRole } from "@/types/domain";
import { AlertTriangle } from "lucide-react";

interface JobsTableProps {
  jobs: Job[];
  userRole: UserRole;
}

export function JobsTable({ jobs, userRole: _userRole }: JobsTableProps) {
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
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                Customer
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                Address
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                Scheduled
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                Status
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                Crew
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                Risk
              </th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job, index) => (
              <tr
                key={job.id}
                className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                }`}
              >
                <td className="px-4 py-3 text-sm text-gray-700">
                  {job.customer_name}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {job.address}
                </td>
                <td className="px-4 py-3 text-sm font-mono text-gray-700">
                  {format(new Date(job.scheduled_time), "MMM dd, HH:mm")}
                </td>
                <td className="px-4 py-3">
                  <span className={getStatusBadgeClass(job.status)}>
                    {job.status.replace("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {job.crew_id ? "Assigned" : "—"}
                </td>
                <td className="px-4 py-3">
                  {job.risk_flag && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-danger-100 text-danger-700 text-xs font-medium border border-danger-600">
                      <AlertTriangle size={14} />
                      At Risk
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
