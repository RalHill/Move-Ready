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
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Crew Management
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage crew details and assignments
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-sm font-medium rounded-lg transition-all"
        >
          Add Crew
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {crews?.map((crew) => {
          const crewJobs = jobs?.filter((j) => j.crew_id === crew.id) || [];
          const utilization = crew.status === "assigned" ? 75 : 0;

          return (
            <div
              key={crew.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      crew.status === "available"
                        ? "bg-green-100 dark:bg-green-900/30"
                        : crew.status === "assigned"
                        ? "bg-blue-100 dark:bg-blue-900/30"
                        : "bg-gray-100 dark:bg-gray-700"
                    }`}
                  >
                    <Truck
                      size={24}
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
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {crew.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {crew.status === "available"
                        ? "Available"
                        : crew.status === "assigned"
                        ? "On Assignment"
                        : "Offline"}
                    </p>
                  </div>
                </div>
                <span
                  className={`w-3 h-3 rounded-full ${
                    crew.status === "available"
                      ? "bg-green-500"
                      : crew.status === "assigned"
                      ? "bg-blue-500"
                      : "bg-gray-400"
                  }`}
                ></span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-start gap-2 text-sm">
                  <MapPin size={14} className="mt-0.5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Current Location
                    </p>
                    <p className="text-xs font-mono text-gray-900 dark:text-gray-100">
                      {crew.current_lat.toFixed(4)}, {crew.current_lng.toFixed(4)}
                    </p>
                  </div>
                </div>

                {crewJobs.length > 0 && (
                  <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      Active Jobs
                    </p>
                    {crewJobs.map((job) => (
                      <div
                        key={job.id}
                        className="text-xs bg-gray-50 dark:bg-gray-900 rounded px-2 py-1.5 mb-1"
                      >
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {job.customer_name}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 truncate">
                          {job.address}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-2">
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

      <AddCrewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCrewAdded={handleCrewAdded}
      />
    </>
  );
}
