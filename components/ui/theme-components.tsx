"use client";

import { CSSProperties, ReactNode, MouseEventHandler } from "react";

/* ── KPI Card ── */
interface KpiProps {
  label: string;
  value: string | number;
  sub: string;
  delta: string;
  deltaDir: "up" | "down" | "warn";
  accent: "green" | "blue" | "amber" | "red";
}

const ACCENT_COLORS = {
  green: "var(--green)",
  blue: "var(--accent-bright)",
  amber: "var(--amber)",
  red: "var(--red)",
};

export function KpiCard({
  label,
  value,
  sub,
  delta,
  deltaDir,
  accent,
}: KpiProps) {
  const deltaColor =
    deltaDir === "up"
      ? "var(--green)"
      : deltaDir === "down"
        ? "var(--red)"
        : "var(--amber)";

  const deltaBg =
    deltaDir === "up"
      ? "var(--green-dim)"
      : deltaDir === "down"
        ? "var(--red-dim)"
        : "var(--amber-dim)";

  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "18px 20px",
        position: "relative",
        overflow: "hidden",
        transition: "border-color 0.2s, background 0.25s, transform 0.2s",
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
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 2,
          borderRadius: "0 0 12px 12px",
          background: ACCENT_COLORS[accent],
        }}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontFamily: "DM Mono, monospace",
            color: "var(--text-secondary)",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontSize: 10,
            fontFamily: "DM Mono, monospace",
            padding: "2px 7px",
            borderRadius: 99,
            fontWeight: 500,
            color: deltaColor,
            background: deltaBg,
          }}
        >
          {delta}
        </span>
      </div>
      <div
        style={{
          fontFamily: "Syne, sans-serif",
          fontSize: 30,
          fontWeight: 800,
          letterSpacing: "-0.03em",
          lineHeight: 1,
          marginBottom: 4,
          color: ACCENT_COLORS[accent],
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 11,
          color: "var(--text-secondary)",
        }}
      >
        {sub}
      </div>
    </div>
  );
}

/* ── Card ── */
export function Card({
  children,
  style,
  onMouseEnter,
  onMouseLeave,
  className = "",
}: {
  children: ReactNode;
  style?: CSSProperties;
  onMouseEnter?: MouseEventHandler<HTMLDivElement>;
  onMouseLeave?: MouseEventHandler<HTMLDivElement>;
  className?: string;
}) {
  return (
    <div
      className={className}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        transition: "background 0.25s, border-color 0.2s",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ── Section header ── */
export function SectionHeader({
  title,
  badge,
  action,
}: {
  title: string;
  badge?: string | number;
  action?: ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 14,
      }}
    >
      <div
        style={{
          fontFamily: "Syne, sans-serif",
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: "-0.01em",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        {title}
        {badge !== undefined && (
          <span
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
              fontFamily: "DM Mono, monospace",
              fontSize: 10,
              padding: "2px 7px",
              borderRadius: 99,
            }}
          >
            {badge}
          </span>
        )}
      </div>
      {action}
    </div>
  );
}

/* ── View All ── */
export function ViewAll({
  label = "View All →",
  onClick,
}: {
  label?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
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
      {label}
    </button>
  );
}

/* ── Status chip ── */
interface StatusChipProps {
  status: string;
  color?: string;
  bg?: string;
  border?: string;
  label?: string;
}

export function StatusChip({
  status,
  color,
  bg,
  border: borderColor,
  label,
}: StatusChipProps) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontSize: 10,
        fontFamily: "DM Mono, monospace",
        fontWeight: 500,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        padding: "3px 9px",
        borderRadius: 5,
        color: color || "var(--text-secondary)",
        background: bg || "var(--bg-elevated)",
        border: borderColor ? `1px solid ${borderColor}` : "1px solid var(--border)",
      }}
    >
      {label || status}
    </span>
  );
}

/* ── Progress bar ── */
export function ProgressBar({
  value,
  color = "var(--accent-bright)",
}: {
  value: number;
  color?: string;
}) {
  return (
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
          width: `${value}%`,
          background: color,
          borderRadius: 99,
          transition: "width 0.4s ease",
        }}
      />
    </div>
  );
}

/* ── Primary button ── */
export function PrimaryBtn({
  children,
  onClick,
  style,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={className}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: "var(--accent)",
        color: "white",
        fontFamily: "DM Mono, monospace",
        fontSize: 12,
        fontWeight: 500,
        padding: "8px 16px",
        borderRadius: 8,
        cursor: "pointer",
        border: "none",
        boxShadow: "0 0 16px var(--accent-glow)",
        transition: "all 0.15s",
        ...style,
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
      {children}
    </button>
  );
}

/* ── Ghost button ── */
export function GhostBtn({
  children,
  onClick,
  style,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={className}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        background: "var(--bg-elevated)",
        color: "var(--text-secondary)",
        fontFamily: "DM Mono, monospace",
        fontSize: 11,
        fontWeight: 400,
        padding: "7px 14px",
        borderRadius: 8,
        cursor: "pointer",
        border: "1px solid var(--border)",
        transition: "all 0.15s",
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--bg-hover)";
        e.currentTarget.style.color = "var(--text-primary)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "var(--bg-elevated)";
        e.currentTarget.style.color = "var(--text-secondary)";
      }}
    >
      {children}
    </button>
  );
}

/* ── Crew icon ── */
export function CrewIcon({
  status,
  icon,
  size = 40,
}: {
  status: string;
  icon: string;
  size?: number;
}) {
  const bg =
    status === "available"
      ? "var(--green-dim)"
      : status === "assigned"
        ? "var(--blue-dim)"
        : "var(--bg-elevated)";

  const borderColor =
    status === "available"
      ? "rgba(16,185,129,0.2)"
      : status === "assigned"
        ? "rgba(59,130,246,0.2)"
        : "var(--border)";

  const dotColor =
    status === "available"
      ? "var(--green)"
      : status === "assigned"
        ? "var(--accent-bright)"
        : "#475569";

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: 10,
          background: bg,
          border: `1px solid ${borderColor}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: size * 0.4,
        }}
      >
        {icon}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: -2,
          right: -2,
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: dotColor,
          border: "2px solid var(--bg-card)",
          boxShadow: `0 0 6px ${dotColor}`,
        }}
      />
    </div>
  );
}
