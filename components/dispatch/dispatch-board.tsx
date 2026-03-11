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
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {error && (
        <div
          style={{
            background: "var(--red-dim)",
            border: "1px solid rgba(239,68,68,0.25)",
            color: "var(--red)",
            padding: "12px 16px",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          <AlertTriangle size={16} />
          <p>{error}</p>
        </div>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <div>
          <h2
            style={{
              fontSize: 18,
              fontWeight: 600,
              fontFamily: "Syne, sans-serif",
              color: "var(--text-primary)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {showAllJobs ? "All Jobs" : "Unassigned Jobs"}
            <span
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: "var(--text-secondary)",
                background: "var(--bg-elevated)",
                padding: "2px 8px",
                borderRadius: 99,
                fontFamily: "DM Mono, monospace",
              }}
            >
              {displayedJobs.length}
            </span>
          </h2>
        </div>
        <button
          onClick={() => setShowAllJobs(!showAllJobs)}
          style={{
            fontSize: 11,
            color: "var(--text-accent)",
            cursor: "pointer",
            fontFamily: "DM Mono, monospace",
            display: "flex",
            alignItems: "center",
            gap: 4,
            padding: "4px 8px",
            borderRadius: 6,
            border: "1px solid rgba(59,130,246,0.2)",
            background: "transparent",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--accent-subtle)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          {showAllJobs ? "Show Unassigned Only" : "View All"} →
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 12,
          marginBottom: 32,
        }}
      >
        {displayedJobs.length === 0 ? (
          <div
            style={{
              gridColumn: "1 / -1",
              background: "var(--bg-card)",
              borderRadius: 12,
              border: "1px solid var(--border)",
              padding: 48,
              textAlign: "center",
            }}
          >
            <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
              {showAllJobs ? "No jobs available" : "No unassigned jobs"}
            </p>
          </div>
        ) : (
          displayedJobs.map((job) => {
            const priority = getJobPriority(job.scheduled_time);
            const priorityColor =
              priority === "urgent"
                ? { color: "var(--red)", bg: "var(--red-dim)", border: "rgba(239,68,68,0.25)" }
                : priority === "pending"
                  ? { color: "var(--accent-bright)", bg: "var(--blue-dim)", border: "rgba(59,130,246,0.25)" }
                  : { color: "var(--purple)", bg: "var(--purple-dim)", border: "rgba(124,58,237,0.25)" };

            return (
              <div
                key={job.id}
                draggable={userRole === "dispatcher"}
                onDragStart={(e) => handleDragStart(e, job)}
                onDragEnd={handleDragEnd}
                style={{
                  background: "var(--bg-card)",
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                  padding: 16,
                  position: "relative",
                  overflow: "hidden",
                  cursor: "move",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-bright)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.transform = "";
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: 3,
                    background: priorityColor.color,
                    borderRadius: "12px 0 0 12px",
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    marginBottom: 12,
                  }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 9,
                      fontFamily: "DM Mono, monospace",
                      fontWeight: 500,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      padding: "2px 7px",
                      borderRadius: 4,
                      color: priorityColor.color,
                      background: priorityColor.bg,
                      border: `1px solid ${priorityColor.border}`,
                    }}
                  >
                    ⚠ {priority.toUpperCase()}
                  </span>
                  <button
                    style={{
                      color: "var(--text-muted)",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      padding: 4,
                      transition: "color 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "var(--text-secondary)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "var(--text-muted)";
                    }}
                  >
                    <MoreVertical size={16} />
                  </button>
                </div>

                <h3
                  style={{
                    fontFamily: "Syne, sans-serif",
                    fontSize: 15,
                    fontWeight: 700,
                    marginBottom: 10,
                    color: "var(--text-primary)",
                  }}
                >
                  {job.customer_name}
                </h3>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                    <MapPin size={14} style={{ marginTop: 2, flexShrink: 0, color: "var(--text-secondary)" }} />
                    <span style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "DM Mono, monospace", lineHeight: 1.4 }}>
                      {job.address}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Calendar size={14} style={{ flexShrink: 0, color: "var(--text-secondary)" }} />
                    <span style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "DM Mono, monospace" }}>
                      {format(new Date(job.scheduled_time), "MMM dd")}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Clock size={14} style={{ flexShrink: 0, color: "var(--text-secondary)" }} />
                    <span style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "DM Mono, monospace" }}>
                      {format(new Date(job.scheduled_time), "HH:mm")}
                    </span>
                  </div>
                </div>

                {job.risk_flag && (
                  <div
                    style={{
                      marginTop: 12,
                      paddingTop: 12,
                      borderTop: "1px solid var(--border)",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 10,
                        fontFamily: "DM Mono, monospace",
                        fontWeight: 500,
                        color: "var(--amber)",
                        background: "var(--amber-dim)",
                        padding: "4px 8px",
                        borderRadius: 4,
                        border: "1px solid rgba(245,158,11,0.25)",
                      }}
                    >
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

      <h2
        style={{
          fontSize: 18,
          fontWeight: 600,
          fontFamily: "Syne, sans-serif",
          color: "var(--text-primary)",
          marginBottom: 16,
        }}
      >
        Crews
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 12,
        }}
      >
        {crews.map((crew) => {
          const crewJobs = jobs.filter((job) => job.crew_id === crew.id);
          const hasJobs = crewJobs.length > 0;
          const bg =
            crew.status === "available"
              ? "var(--green-dim)"
              : crew.status === "assigned"
                ? "var(--blue-dim)"
                : "var(--bg-elevated)";

          return (
            <div
              key={crew.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, crew.id)}
              style={{
                background: "var(--bg-card)",
                borderRadius: 12,
                border: draggedJob
                  ? "2px dashed var(--accent-bright)"
                  : "1px solid var(--border)",
                padding: 16,
                transition: "all 0.2s",
                cursor: draggedJob ? "drop" : "default",
              }}
              onDragLeave={(e) => {
                if (draggedJob) {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.background = "var(--bg-card)";
                }
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 16,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: bg,
                      border: `1px solid ${crew.status === "available" ? "rgba(16,185,129,0.2)" : crew.status === "assigned" ? "rgba(59,130,246,0.2)" : "var(--border)"}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 16,
                    }}
                  >
                    <Truck
                      size={20}
                      style={{
                        color:
                          crew.status === "available"
                            ? "var(--green)"
                            : crew.status === "assigned"
                              ? "var(--accent-bright)"
                              : "var(--text-muted)",
                      }}
                    />
                  </div>
                  <div>
                    <h3
                      style={{
                        fontFamily: "Syne, sans-serif",
                        fontSize: 14,
                        fontWeight: 600,
                        color: "var(--text-primary)",
                      }}
                    >
                      {crew.name}
                    </h3>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background:
                            crew.status === "available"
                              ? "var(--green)"
                              : crew.status === "assigned"
                                ? "var(--accent-bright)"
                                : "var(--text-muted)",
                        }}
                      ></span>
                      <span
                        style={{
                          fontSize: 10,
                          fontFamily: "DM Mono, monospace",
                          textTransform: "uppercase",
                          color: "var(--text-secondary)",
                          fontWeight: 500,
                        }}
                      >
                        {crew.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {hasJobs ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {crewJobs.map((job) => (
                    <div
                      key={job.id}
                      style={{
                        padding: 12,
                        background: "var(--bg-elevated)",
                        borderRadius: 8,
                        border: "1px solid var(--border)",
                      }}
                    >
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "var(--text-primary)",
                          marginBottom: 4,
                          fontFamily: "Syne, sans-serif",
                        }}
                      >
                        {job.customer_name}
                      </p>
                      <p
                        style={{
                          fontSize: 11,
                          color: "var(--text-secondary)",
                          marginBottom: 8,
                          fontFamily: "DM Mono, monospace",
                        }}
                      >
                        {job.address}
                      </p>
                      {job.risk_flag && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            fontSize: 10,
                            fontFamily: "DM Mono, monospace",
                            color: "var(--amber)",
                            background: "var(--amber-dim)",
                            padding: "4px 8px",
                            borderRadius: 4,
                            border: "1px solid rgba(245,158,11,0.25)",
                            marginBottom: 8,
                          }}
                        >
                          <AlertTriangle size={12} />
                          <span>At Risk: Running late</span>
                        </div>
                      )}
                      <span
                        style={{
                          display: "inline-block",
                          padding: "2px 8px",
                          borderRadius: 4,
                          fontSize: 9,
                          fontFamily: "DM Mono, monospace",
                          fontWeight: 500,
                          textTransform: "uppercase",
                          color:
                            job.status === "assigned"
                              ? "var(--accent-bright)"
                              : job.status === "en_route"
                                ? "var(--purple)"
                                : "var(--green)",
                          background:
                            job.status === "assigned"
                              ? "var(--blue-dim)"
                              : job.status === "en_route"
                                ? "var(--purple-dim)"
                                : "var(--green-dim)",
                          border:
                            job.status === "assigned"
                              ? "1px solid rgba(59,130,246,0.25)"
                              : job.status === "en_route"
                                ? "1px solid rgba(124,58,237,0.25)"
                                : "1px solid rgba(16,185,129,0.25)",
                        }}
                      >
                        {job.status === "en_route" ? "In Progress" : job.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "32px 0" }}>
                  <p
                    style={{
                      fontSize: 11,
                      fontStyle: "italic",
                      marginBottom: 12,
                      color: "var(--text-muted)",
                    }}
                  >
                    {draggedJob ? "Drop job here" : "No assigned jobs"}
                  </p>
                  {draggedJob && (
                    <button
                      onClick={() => handleAssignClick(draggedJob.id, crew.id)}
                      style={{
                        padding: "8px 16px",
                        background: "var(--accent)",
                        color: "white",
                        fontSize: 12,
                        fontWeight: 500,
                        borderRadius: 8,
                        border: "none",
                        cursor: "pointer",
                        transition: "all 0.15s",
                        boxShadow: "0 0 16px var(--accent-glow)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "var(--accent-bright)";
                        e.currentTarget.style.transform = "translateY(-1px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "var(--accent)";
                        e.currentTarget.style.transform = "";
                      }}
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
