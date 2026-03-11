"use client";

import { useState } from "react";
import { Bell, Moon, Sun, Menu } from "lucide-react";
import { useTheme } from "@/lib/theme-provider";
import { NotificationsDropdown } from "@/components/notifications/notifications-dropdown";

interface DashboardHeaderProps {
  className?: string;
  onMenuClick?: () => void;
}

export function DashboardHeader({ className, onMenuClick }: DashboardHeaderProps) {
  const { theme, toggle } = useTheme();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <header
      style={{
        background: "var(--bg-surface)",
        borderBottom: "1px solid var(--border)",
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        transition: "background 0.25s, border-color 0.2s",
      }}
      className={className}
    >
      <button
        onClick={onMenuClick}
        className="md:hidden p-2 rounded-lg transition-colors"
        style={{
          color: "var(--text-secondary)",
          background: "transparent",
          border: "1px solid var(--border)",
          cursor: "pointer",
        }}
        aria-label="Open menu"
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "var(--bg-elevated)";
          e.currentTarget.style.color = "var(--text-primary)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "var(--text-secondary)";
        }}
      >
        <Menu size={24} />
      </button>

      <div style={{ flex: 1 }} />

      <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative" }}>
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            style={{
              position: "relative",
              padding: 8,
              color: "var(--text-secondary)",
              background: "transparent",
              border: "1px solid var(--border)",
              borderRadius: 8,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            aria-label="View notifications"
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--bg-elevated)";
              e.currentTarget.style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
          >
            <Bell size={20} />
            <span
              style={{
                position: "absolute",
                top: 6,
                right: 6,
                width: 8,
                height: 8,
                background: "var(--red)",
                borderRadius: "50%",
              }}
            ></span>
          </button>

          {notificationsOpen && (
            <NotificationsDropdown onClose={() => setNotificationsOpen(false)} />
          )}
        </div>

        <button
          onClick={toggle}
          style={{
            padding: 8,
            color: "var(--text-secondary)",
            background: "transparent",
            border: "1px solid var(--border)",
            borderRadius: 8,
            cursor: "pointer",
            transition: "all 0.15s",
          }}
          aria-label="Toggle dark mode"
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--bg-elevated)";
            e.currentTarget.style.color = "var(--text-primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--text-secondary)";
          }}
        >
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </div>
    </header>
  );
}
