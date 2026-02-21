"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import type { Crew, Job } from "@/types/domain";
import { createClient } from "@/lib/supabase/client";
import { MapPin, Clock, Navigation, RefreshCw, Truck } from "lucide-react";
import { format } from "date-fns";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const CircleMarker = dynamic(
  () => import("react-leaflet").then((mod) => mod.CircleMarker),
  { ssr: false }
);

interface LiveTrackingViewProps {
  initialCrews: Crew[];
  initialJobs: Job[];
}

export function LiveTrackingView({
  initialCrews,
  initialJobs,
}: LiveTrackingViewProps) {
  const [crews, setCrews] = useState<Crew[]>(initialCrews);
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [mounted, setMounted] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [mapType, setMapType] = useState<"map" | "satellite" | "hybrid">("map");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const supabase = createClient();

    const crewsChannel = supabase
      .channel("crews-tracking")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "crews" },
        (payload) => {
          setCrews((prev) =>
            prev.map((crew) =>
              crew.id === payload.new.id ? (payload.new as Crew) : crew
            )
          );
          setLastUpdated(new Date());
        }
      )
      .subscribe();

    const jobsChannel = supabase
      .channel("jobs-tracking")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "jobs" },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            setJobs((prev) =>
              prev.map((job) =>
                job.id === payload.new.id ? (payload.new as Job) : job
              )
            );
          }
          setLastUpdated(new Date());
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(crewsChannel);
      supabase.removeChannel(jobsChannel);
    };
  }, []);

  function handleRefresh() {
    window.location.reload();
  }

  const activeCrews = crews.filter((c) => c.status !== "offline");
  const filteredCrews = activeCrews.filter((crew) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const crewJob = jobs.find((j) => j.crew_id === crew.id);
    return (
      crew.name.toLowerCase().includes(query) ||
      crewJob?.customer_name.toLowerCase().includes(query) ||
      crewJob?.address.toLowerCase().includes(query)
    );
  });
  const onlineCount = activeCrews.length;

  const center: [number, number] = crews.length > 0
    ? [crews[0].current_lat, crews[0].current_lng]
    : [43.6532, -79.3832];

  if (!mounted) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="flex h-full relative">
      <div className="absolute top-6 left-6 z-[1000] bg-white rounded-lg shadow-lg px-4 py-3">
        <h2 className="text-lg font-semibold text-gray-900">Live Tracking</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Real-time crew locations and active routes
        </p>
      </div>

      <div className="flex-1 relative">
        <MapContainer
          center={center}
          zoom={12}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {crews.map((crew) => {
            const color =
              crew.status === "available"
                ? "#22c55e"
                : crew.status === "assigned"
                ? "#3b82f6"
                : "#f59e0b";

            return (
              <CircleMarker
                key={crew.id}
                center={[crew.current_lat, crew.current_lng]}
                radius={12}
                pathOptions={{
                  fillColor: color,
                  color: "#ffffff",
                  weight: 3,
                  opacity: 1,
                  fillOpacity: 1,
                }}
              />
            );
          })}
        </MapContainer>

        <div className="absolute bottom-6 left-6 z-[1000] bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="flex">
            <button
              onClick={() => setMapType("map")}
              className={`px-4 py-2 text-sm font-medium ${
                mapType === "map"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Map
            </button>
            <button
              onClick={() => setMapType("satellite")}
              className={`px-4 py-2 text-sm font-medium border-x border-gray-200 ${
                mapType === "satellite"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Satellite
            </button>
            <button
              onClick={() => setMapType("hybrid")}
              className={`px-4 py-2 text-sm font-medium ${
                mapType === "hybrid"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Hybrid
            </button>
          </div>
        </div>

        <div className="absolute bottom-24 left-6 z-[1000] bg-white rounded-lg shadow-lg p-3">
          <button className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors mb-2">
            <span className="text-xl">+</span>
          </button>
          <button className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
            <span className="text-xl">−</span>
          </button>
        </div>

        <div className="absolute bottom-6 right-6 z-[1000] bg-white rounded-lg shadow-lg p-3">
          <button className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
            <Navigation size={20} />
          </button>
        </div>
      </div>

      <aside className="w-96 bg-white border-l border-gray-200 overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Active Crews
            </h3>
            <span className="text-sm text-blue-600 font-medium">
              {onlineCount} ONLINE
            </span>
          </div>
          <div className="relative">
            <MapPin
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search crews or jobs..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredCrews.length === 0 && searchQuery && (
            <div className="text-center py-8 px-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No crews found matching "{searchQuery}"
              </p>
            </div>
          )}
          {filteredCrews.map((crew) => {
            const crewJob = jobs.find((j) => j.crew_id === crew.id);
            const statusColor =
              crew.status === "available"
                ? "text-green-600"
                : crew.status === "assigned"
                ? "text-blue-600"
                : "text-amber-600";
            const statusBg =
              crew.status === "available"
                ? "bg-green-50"
                : crew.status === "assigned"
                ? "bg-blue-50"
                : "bg-amber-50";

            return (
              <div key={crew.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${statusBg} flex items-center justify-center`}>
                      <Truck size={20} className={statusColor} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">
                        {crew.name}
                      </h4>
                      <p className={`text-xs ${statusColor} font-medium flex items-center gap-1`}>
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            crew.status === "available"
                              ? "bg-green-500"
                              : crew.status === "assigned"
                              ? "bg-blue-500"
                              : "bg-amber-500"
                          }`}
                        ></span>
                        {crew.status === "available"
                          ? "Available"
                          : crew.status === "assigned" && crewJob
                          ? crewJob.status === "en_route"
                            ? "In Transit"
                            : crewJob.status === "on_site"
                            ? "On Site"
                            : "Assigned"
                          : "Idle / Delayed"}
                      </p>
                    </div>
                  </div>
                </div>

                {crewJob && (
                  <div className="ml-13 space-y-2">
                    <div className="flex items-start gap-2">
                      <MapPin size={14} className="mt-0.5 text-gray-400 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-gray-900">
                          {crewJob.customer_name}
                        </p>
                        <p className="text-xs text-gray-600">
                          Job: #{crewJob.id.slice(0, 8)} • {crewJob.address}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1 text-blue-600">
                        <Clock size={12} />
                        <span className="font-medium">ETA 12 MINS</span>
                      </div>
                      <span className="text-gray-500">1.2 km away</span>
                    </div>
                    {crewJob.risk_flag && (
                      <div className="flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                        <Navigation size={12} />
                        <span>Traffic delay reported near Bloor St</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-3 ml-13">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span className="uppercase text-[10px] font-medium">
                      Utilization
                    </span>
                    <span className="font-semibold">
                      {crew.status === "assigned" ? "75%" : "0%"}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all"
                      style={{
                        width: crew.status === "assigned" ? "75%" : "0%",
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500 mb-2">
            Updated {format(lastUpdated, "HH:mm:ss")}
          </p>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <RefreshCw size={14} />
            Force Refresh
          </button>
        </div>
      </aside>
    </div>
  );
}
