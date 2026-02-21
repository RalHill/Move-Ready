"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { WifiOff } from "lucide-react";

export function RealtimeStatus() {
  const [isConnected, setIsConnected] = useState(true);
  const [disconnectedSince, setDisconnectedSince] = useState<number | null>(
    null
  );

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase.channel("heartbeat").subscribe((status) => {
      if (status === "SUBSCRIBED") {
        setIsConnected(true);
        setDisconnectedSince(null);
      } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        setIsConnected(false);
        if (!disconnectedSince) {
          setDisconnectedSince(Date.now());
        }
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [disconnectedSince]);

  useEffect(() => {
    if (!isConnected && !disconnectedSince) {
      setDisconnectedSince(Date.now());
    }
  }, [isConnected, disconnectedSince]);

  if (isConnected) {
    return null;
  }

  const showDegradedMode =
    disconnectedSince && Date.now() - disconnectedSince > 5000;

  if (!showDegradedMode) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-warning-500 text-white px-4 py-3 z-50">
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        <WifiOff size={20} />
        <p className="text-sm font-medium">
          Realtime connection lost. Operating in degraded mode (polling every 15
          seconds).
        </p>
      </div>
    </div>
  );
}
