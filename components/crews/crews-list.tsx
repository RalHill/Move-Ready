"use client";

import { useState, useEffect } from "react";
import { Truck, MapPin } from "lucide-react";
import type { Crew, Job } from "@/types/domain";
import { createClient } from "@/lib/supabase/client";
import { AddCrewModal } from "@/components/modals/add-crew-modal";

interface CrewsListProps {
  initialCrews: Crew[];
  initialJobs: Job[];
}

export function CrewsList({ initialCrews, initialJobs }: CrewsListProps) {
  const [crews, setCrews] = useState<Crew[]>(initialCrews);
  const [jobs] = useState<Job[]>(initialJobs);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    const crewsChannel = supabase
      .channel("crews-list")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "crews" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setCrews((prev) => [...prev, payload.new as Crew]);
          } else if (payload.eventType === "UPDATE") {
            setCrews((prev) =>
              prev.map((crew) =>
                crew.id === payload.new.id ? (payload.new as Crew) : crew
              )
            );
          } else if (payload.eventType === "DELETE") {
            setCrews((prev) => prev.filter((c) => c.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(crewsChannel);
    };
  }, []);

  function handleCrewAdded() {
    const supabase = createClient();
    supabase
      .from("crews")
      .select("*")
      .order("name")
      .then(({ data }) => {
        if (data) setCrews(data);
      });
  }

  return (
    <>
      <div style={{ marginBottom: 24, display: "flex", flexDirection: "column", gap: 16, justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: 700,
              fontFamily: "Syne, sans-serif",
              color: "var(--text-primary)",
              letterSpacing: "-0.01em",
            }}
          >
            Crew Management
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: "var(--text-secondary)",
              marginTop: "8px",
              fontFamily: "DM Sans, sans-serif",
            }}
          >
            Manage crew details and assignments
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
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
          Add Crew
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 12 }}>
        {crews?.map((crew) => {
          const crewJobs = jobs?.filter((j) => j.crew_id === crew.id) || [];
          const utilization = crew.status === "assigned" ? 75 : 0;
          const bg =
            crew.status === "available"
              ? "var(--green-dim)"
              : crew.status === "assigned"
                ? "var(--blue-dim)"
                : "var(--bg-elevated)";
          const color =
            crew.status === "available"
              ? "var(--green)"
              : crew.status === "assigned"
                ? "var(--accent-bright)"
                : "var(--text-muted)";

          return (
            <div
              key={crew.id}
              style={{
                background: "var(--bg-card)",
                borderRadius: 12,
                border: "1px solid var(--border)",
                padding: 20,
                transition: "all 0.15s",
                cursor: "pointer",
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
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 10,
                      background: bg,
                      border: `1px solid ${crew.status === "available" ? "rgba(16,185,129,0.2)" : crew.status === "assigned" ? "rgba(59,130,246,0.2)" : "var(--border)"}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Truck size={24} style={{ color }} />
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
                    <p
                      style={{
                        fontSize: 11,
                        color: "var(--text-secondary)",
                        marginTop: 4,
                        fontFamily: "DM Mono, monospace",
                        textTransform: "uppercase",
                      }}
                    >
                      {crew.status === "available"
                        ? "Available"
                        : crew.status === "assigned"
                          ? "On Assignment"
                          : "Offline"}
                    </p>
                  </div>
                </div>
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: color,
                    boxShadow: `0 0 6px ${color}`,
                  }}
                ></span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <MapPin size={14} style={{ marginTop: 2, color: "var(--text-secondary)", flexShrink: 0 }} />
                  <div>
                    <p
                      style={{
                        fontSize: 11,
                        color: "var(--text-secondary)",
                        fontFamily: "DM Mono, monospace",
                        textTransform: "uppercase",
                      }}
                    >
                      Current Location
                    </p>
                    <p
                      style={{
                        fontSize: 11,
                        fontFamily: "DM Mono, monospace",
                        color: "var(--text-primary)",
                        marginTop: 4,
                      }}
                    >
                      {crew.current_lat.toFixed(4)}, {crew.current_lng.toFixed(4)}
                    </p>
                  </div>
                </div>

                {crewJobs.length > 0 && (
                  <div style={{ paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                    <p
                      style={{
                        fontSize: 11,
                        color: "var(--text-secondary)",
                        marginBottom: 8,
                        fontFamily: "DM Mono, monospace",
                        textTransform: "uppercase",
                      }}
                    >
                      Active Jobs
                    </p>
                    {crewJobs.map((job) => (
                      <div
                        key={job.id}
                        style={{
                          fontSize: 11,
                          background: "var(--bg-elevated)",
                          borderRadius: 6,
                          padding: "8px 10px",
                          marginBottom: 6,
                          border: "1px solid var(--border)",
                        }}
                      >
                        <p
                          style={{
                            fontWeight: 600,
                            color: "var(--text-primary)",
                            marginBottom: 2,
                            fontFamily: "Syne, sans-serif",
                          }}
                        >
                          {job.customer_name}
                        </p>
                        <p
                          style={{
                            color: "var(--text-secondary)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            fontFamily: "DM Mono, monospace",
                            fontSize: 10,
                          }}
                        >
                          {job.address}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: 11,
                    color: "var(--text-secondary)",
                    marginBottom: 8,
                    fontFamily: "DM Mono, monospace",
                    fontWeight: 500,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                  }}
                >
                  <span>Utilization</span>
                  <span style={{ color: "var(--accent-bright)" }}>{utilization}%</span>
                </div>
                <div
                  style={{
                    height: 3,
                    background: "var(--border)",
                    borderRadius: 99,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      background: "var(--accent-bright)",
                      borderRadius: 99,
                      transition: "width 0.4s ease",
                      width: `${utilization}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <AddCrewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCrewAdded={handleCrewAdded}
      />
    </>
  );
}
