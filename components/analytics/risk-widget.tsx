"use client";

import type { Job } from "@/types/domain";
import { AlertTriangle } from "lucide-react";
import { format } from "date-fns";

interface RiskWidgetProps {
  riskJobs: Job[];
}

export function RiskWidget({ riskJobs }: RiskWidgetProps) {
  function getRiskBadge(job: Job) {
    const scheduledTime = new Date(job.scheduled_time);
    const now = new Date();
    const hoursDiff = (now.getTime() - scheduledTime.getTime()) / (1000 * 60 * 60);

    if (hoursDiff > 2) {
      return { label: "Overdue", color: "bg-red-100 text-red-700" };
    } else if (hoursDiff > 0.5) {
      return { label: "Delayed", color: "bg-amber-100 text-amber-700" };
    } else {
      return { label: "Expiring", color: "bg-yellow-100 text-yellow-700" };
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle size={20} className="text-amber-600" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">At-Risk Jobs</h2>
        </div>
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          View All
        </button>
      </div>

      {riskJobs.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm py-4">No jobs currently at risk</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 dark:border-gray-700">
              <tr className="text-left">
                <th className="pb-2 text-xs font-semibold text-gray-600 uppercase">
                  Client
                </th>
                <th className="pb-2 text-xs font-semibold text-gray-600 uppercase">
                  Address
                </th>
                <th className="pb-2 text-xs font-semibold text-gray-600 uppercase">
                  Scheduled
                </th>
                <th className="pb-2 text-xs font-semibold text-gray-600 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {riskJobs.slice(0, 3).map((job) => {
                const badge = getRiskBadge(job);
                return (
                  <tr key={job.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="py-3">
                      <p className="text-sm font-medium text-gray-900">
                        {job.customer_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        ID: #{job.id.slice(0, 8)}
                      </p>
                    </td>
                    <td className="py-3 text-sm text-gray-600">
                      {job.address}
                    </td>
                    <td className="py-3 text-sm text-gray-900">
                      {format(new Date(job.scheduled_time), "MMM dd, HH:mm")}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${badge.color}`}
                      >
                        {badge.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
