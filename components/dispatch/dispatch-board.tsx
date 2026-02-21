"use client";

import { useState, useEffect, DragEvent } from "react";
import type { Job, Crew, UserRole } from "@/types/domain";
import { createClient } from "@/lib/supabase/client";
import { format, differenceInHours } from "date-fns";
import { AlertTriangle, MapPin, Calendar, Clock, Truck, MoreVertical } from "lucide-react";

interface DispatchBoardProps {
  initialJobs: Job[];
  initialCrews: Crew[];
  userRole: UserRole;
}

export function DispatchBoard({
  initialJobs,
  initialCrews,
  userRole,
}: DispatchBoardProps) {
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [crews, setCrews] = useState<Crew[]>(initialCrews);
  const [draggedJob, setDraggedJob] = useState<Job | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [showAllJobs, setShowAllJobs] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    const jobsChannel = supabase
      .channel("jobs-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "jobs",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setJobs((prev) => [...prev, payload.new as Job]);
          } else if (payload.eventType === "UPDATE") {
            setJobs((prev) =>
              prev.map((job) =>
                job.id === payload.new.id ? (payload.new as Job) : job
              )
            );
          } else if (payload.eventType === "DELETE") {
            setJobs((prev) => prev.filter((job) => job.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    const crewsChannel = supabase
      .channel("crews-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "crews",
        },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            setCrews((prev) =>
              prev.map((crew) =>
                crew.id === payload.new.id ? (payload.new as Crew) : crew
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(jobsChannel);
      supabase.removeChannel(crewsChannel);
    };
  }, []);

  function handleDragStart(e: DragEvent, job: Job) {
    setDraggedJob(job);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragEnd() {
    setDraggedJob(null);
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  async function handleDrop(e: DragEvent, crewId: string) {
    e.preventDefault();

    if (!draggedJob || isAssigning) {
      return;
    }

    setIsAssigning(true);
    setError(null);

    const previousJobs = [...jobs];
    const previousCrews = [...crews];

    setJobs((prev) =>
      prev.map((job) =>
        job.id === draggedJob.id
          ? { ...job, crew_id: crewId, status: "assigned" as const }
          : job
      )
    );

    setCrews((prev) =>
      prev.map((crew) =>
        crew.id === crewId ? { ...crew, status: "assigned" as const } : crew
      )
    );

    try {
      const response = await fetch("/api/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_id: draggedJob.id,
          crew_id: crewId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        setJobs(previousJobs);
        setCrews(previousCrews);

        if (response.status === 409) {
          setError(
            errorData.error || "Crew already assigned to an overlapping job"
          );
        } else {
          setError(errorData.error || "Failed to assign job");
        }

        setTimeout(() => setError(null), 5000);
      }
    } catch {
      setJobs(previousJobs);
      setCrews(previousCrews);
      setError("Network error - please try again");
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsAssigning(false);
      setDraggedJob(null);
    }
  }

  const unassignedJobs = jobs.filter((job) => !job.crew_id);
  const displayedJobs = showAllJobs ? jobs : unassignedJobs;

  function getJobPriority(scheduledTime: string): "urgent" | "pending" | "scheduled" {
    const hoursUntil = differenceInHours(new Date(scheduledTime), new Date());
    if (hoursUntil < 0) return "urgent";
    if (hoursUntil <= 4) return "urgent";
    if (hoursUntil <= 12) return "pending";
    return "scheduled";
  }

  function getPriorityBadge(priority: "urgent" | "pending" | "scheduled") {
    switch (priority) {
      case "urgent":
        return "bg-red-50 text-red-600 border border-red-200";
      case "pending":
        return "bg-blue-50 text-blue-600 border border-blue-200";
      case "scheduled":
        return "bg-purple-50 text-purple-600 border border-purple-200";
    }
  }

  async function handleAssignClick(jobId: string, crewId: string) {
    if (isAssigning) return;

    setIsAssigning(true);
    setError(null);

    const previousJobs = [...jobs];
    const previousCrews = [...crews];

    setJobs((prev) =>
      prev.map((job) =>
        job.id === jobId
          ? { ...job, crew_id: crewId, status: "assigned" as const }
          : job
      )
    );

    setCrews((prev) =>
      prev.map((crew) =>
        crew.id === crewId ? { ...crew, status: "assigned" as const } : crew
      )
    );

    try {
      const response = await fetch("/api/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_id: jobId, crew_id: crewId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setJobs(previousJobs);
        setCrews(previousCrews);
        setError(errorData.error || "Failed to assign job");
        setTimeout(() => setError(null), 5000);
      }
    } catch {
      setJobs(previousJobs);
      setCrews(previousCrews);
      setError("Network error - please try again");
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsAssigning(false);
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertTriangle size={16} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            {showAllJobs ? "All Jobs" : "Unassigned Jobs"}
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
              {displayedJobs.length}
            </span>
          </h2>
        </div>
        <button
          onClick={() => setShowAllJobs(!showAllJobs)}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
        >
          {showAllJobs ? "Show Unassigned Only" : "View All"} →
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        {displayedJobs.length === 0 ? (
          <div className="col-span-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              {showAllJobs ? "No jobs available" : "No unassigned jobs"}
            </p>
          </div>
        ) : (
          displayedJobs.map((job) => {
            const priority = getJobPriority(job.scheduled_time);
            return (
              <div
                key={job.id}
                draggable={userRole === "dispatcher"}
                onDragStart={(e) => handleDragStart(e, job)}
                onDragEnd={handleDragEnd}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:border-blue-400 hover:shadow-md transition-all cursor-move group"
              >
                <div className="flex items-start justify-between mb-3">
                  <span
                    className={`px-2.5 py-1 rounded text-[10px] font-semibold uppercase tracking-wide ${getPriorityBadge(
                      priority
                    )}`}
                  >
                    {priority}
                  </span>
                  <button className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical size={16} />
                  </button>
                </div>

                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {job.customer_name}
                </h3>

                <div className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-start gap-2">
                    <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                    <span className="text-xs leading-relaxed">
                      {job.address}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="flex-shrink-0" />
                    <span className="text-xs">
                      {format(new Date(job.scheduled_time), "MMM dd")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="flex-shrink-0" />
                    <span className="text-xs">
                      {format(new Date(job.scheduled_time), "HH:mm")}
                    </span>
                  </div>
                </div>

                {job.risk_flag && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <span className="inline-flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                      <AlertTriangle size={12} />
                      At Risk: Running late
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Crews</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {crews.map((crew) => {
          const crewJobs = jobs.filter((job) => job.crew_id === crew.id);
          const hasJobs = crewJobs.length > 0;

          return (
            <div
              key={crew.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, crew.id)}
              className={`bg-white dark:bg-gray-800 rounded-lg border-2 dark:border-gray-700 p-4 transition-all ${
                draggedJob
                  ? "border-blue-400 border-dashed shadow-lg"
                  : "border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      crew.status === "available"
                        ? "bg-green-100"
                        : crew.status === "assigned"
                        ? "bg-blue-100"
                        : "bg-gray-100"
                    }`}
                  >
                    <Truck
                      size={20}
                      className={
                        crew.status === "available"
                          ? "text-green-600"
                          : crew.status === "assigned"
                          ? "text-blue-600"
                          : "text-gray-400"
                      }
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                      {crew.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          crew.status === "available"
                            ? "bg-green-500"
                            : crew.status === "assigned"
                            ? "bg-blue-500"
                            : "bg-gray-400"
                        }`}
                      ></span>
                      <span className="text-xs text-gray-600 uppercase">
                        {crew.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {hasJobs ? (
                <div className="space-y-3">
                  {crewJobs.map((job) => (
                    <div
                      key={job.id}
                      className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                        {job.customer_name}
                      </p>
                      <p className="text-xs text-gray-600 mb-2">
                        {job.address}
                      </p>
                      {job.risk_flag && (
                        <div className="flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50 px-2 py-1 rounded border border-amber-200 mb-2">
                          <AlertTriangle size={12} />
                          <span>At Risk: Running late</span>
                        </div>
                      )}
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium uppercase ${
                          job.status === "assigned"
                            ? "bg-blue-100 text-blue-700"
                            : job.status === "en_route"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {job.status === "en_route" ? "In Progress" : job.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-xs text-gray-400 italic mb-3">
                    {draggedJob ? "Drop job here" : "No assigned jobs"}
                  </p>
                  {draggedJob && (
                    <button
                      onClick={() => handleAssignClick(draggedJob.id, crew.id)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Assign
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
