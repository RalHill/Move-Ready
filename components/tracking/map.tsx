'use client';
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Crew } from '@/lib/data';

interface MapProps {
  crews: Crew[];
  zoom: number;
  mapMode: string;
}

const TORONTO_CENTER: [number, number] = [43.6629, -79.3957];

const TILE_LAYERS: Record<string, { url: string; attribution: string }> = {
  Map: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors'
  },
  Satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '© Esri'
  },
  Hybrid: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '© Esri'
  }
};

export default function MapComponent({ crews, zoom, mapMode }: MapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  useEffect(() => {
    if (mapRef.current) return;

    // Initialize map
    const map = L.map('map', {
      center: TORONTO_CENTER,
      zoom: zoom,
      zoomControl: false,
      attributionControl: true,
    });

    mapRef.current = map;

    // Add initial tile layer
    tileLayerRef.current = L.tileLayer(TILE_LAYERS[mapMode].url, {
      attribution: TILE_LAYERS[mapMode].attribution,
      maxZoom: 19,
    }).addTo(map);

    // Add crew markers
    crews.forEach(crew => {
      const lat = parseFloat(crew.lat);
      const lng = parseFloat(crew.lng);

      if (!isNaN(lat) && !isNaN(lng)) {
        const statusColor = 
          crew.status === 'available' ? '#10b981' :
          crew.status === 'assigned' ? '#3b82f6' : '#64748b';

        const circleMarker = L.circleMarker([lat, lng], {
          radius: 8,
          fillColor: statusColor,
          color: statusColor,
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8,
        })
          .bindPopup(`<div style="font-family: Syne, sans-serif; padding: 8px;">
            <div style="font-weight: 700; margin-bottom: 4px;">${crew.name}</div>
            <div style="font-family: DM Mono, monospace; font-size: 12px; color: #666;">
              Status: <strong>${crew.status}</strong><br/>
              Location: ${crew.lat}, ${crew.lng}<br/>
              Utilization: ${crew.utilization}%
            </div>
          </div>`)
          .openPopup();

        markersRef.current.set(crew.id, circleMarker as any);
        circleMarker.addTo(map);
      }
    });

  }, []);

  // Update zoom
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setZoom(zoom);
    }
  }, [zoom]);

  // Update tile layer on map mode change
  useEffect(() => {
    if (mapRef.current && tileLayerRef.current) {
      const newLayer = TILE_LAYERS[mapMode];
      mapRef.current.removeLayer(tileLayerRef.current);
      tileLayerRef.current = L.tileLayer(newLayer.url, {
        attribution: newLayer.attribution,
        maxZoom: 19,
      }).addTo(mapRef.current);
    }
  }, [mapMode]);

  return (
    <div
      id="map"
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        zIndex: 1,
      }}
    />
  );
}
