"use client";

import { useState } from "react";
import { format } from "date-fns";
import type { Job } from "@/types/domain";
import { AlertTriangle, MapPin, Clock } from "lucide-react";

interface DriverJobsListProps {
  initialJobs: Job[];
}

export function DriverJobsList({ initialJobs }: DriverJobsListProps) {
  const [jobs] = useState<Job[]>(initialJobs);

  async function updateJobStatus(jobId: string, newStatus: Job["status"]) {
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update job status");
      }
    } catch (error) {
      console.error("Error updating job status:", error);
    }
  }

  if (jobs.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <p className="text-gray-500">No assigned jobs</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <div
          key={job.id}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {job.customer_name}
              </h3>
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                <MapPin size={16} />
                <span>{job.address}</span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                <Clock size={16} />
                <span className="font-mono">
                  {format(new Date(job.scheduled_time), "MMM dd, HH:mm")}
                </span>
              </div>
            </div>
            {job.risk_flag && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-danger-100 text-danger-700 text-xs font-medium border border-danger-600">
                <AlertTriangle size={14} />
                At Risk
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => updateJobStatus(job.id, "en_route")}
              disabled={job.status !== "assigned"}
              className="px-4 py-2 bg-primary-800 hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm rounded-md transition-colors"
            >
              En Route
            </button>
            <button
              onClick={() => updateJobStatus(job.id, "on_site")}
              disabled={job.status !== "en_route"}
              className="px-4 py-2 bg-warning-500 hover:bg-warning-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm rounded-md transition-colors"
            >
              On Site
            </button>
            <button
              onClick={() => updateJobStatus(job.id, "completed")}
              disabled={job.status !== "on_site"}
              className="px-4 py-2 bg-success-600 hover:bg-success-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm rounded-md transition-colors"
            >
              Complete
            </button>
            <span
              className={`ml-auto px-3 py-1 rounded-full text-xs font-medium ${
                job.status === "assigned"
                  ? "bg-primary-100 text-primary-800"
                  : job.status === "en_route"
                  ? "bg-warning-100 text-warning-700"
                  : job.status === "on_site"
                  ? "bg-warning-50 text-warning-600"
                  : "bg-success-100 text-success-700"
              }`}
            >
              {job.status.replace("_", " ")}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
