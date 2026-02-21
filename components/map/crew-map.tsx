"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { Crew } from "@/types/domain";
import { createClient } from "@/lib/supabase/client";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

interface CrewMapProps {
  initialCrews: Crew[];
}

export function CrewMap({ initialCrews }: CrewMapProps) {
  const [crews, setCrews] = useState<Crew[]>(initialCrews);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const supabase = createClient();

    const crewsChannel = supabase
      .channel("crews-location-updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "crews",
        },
        (payload) => {
          setCrews((prev) =>
            prev.map((crew) =>
              crew.id === payload.new.id ? (payload.new as Crew) : crew
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(crewsChannel);
    };
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Loading map...</p>
      </div>
    );
  }

  const center: [number, number] =
    crews.length > 0
      ? [crews[0].current_lat, crews[0].current_lng]
      : [43.6532, -79.3832];

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden border border-gray-200">
      <MapContainer
        center={center}
        zoom={11}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {crews.map((crew) => (
          <Marker
            key={crew.id}
            position={[crew.current_lat, crew.current_lng]}
          >
            <Popup>
              <div className="p-2">
                <p className="font-semibold">{crew.name}</p>
                <p className="text-sm text-gray-600">{crew.status}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
