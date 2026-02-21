"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { X, LayoutDashboard, BarChart3, MapPin, Users, LogOut, Truck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/types/domain";
import { useEffect } from "react";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: UserRole;
  userEmail?: string;
  userName: string;
}

export function MobileMenu({
  isOpen,
  onClose,
  userRole,
  userEmail,
  userName,
}: MobileMenuProps) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const navItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["dispatcher", "manager", "driver"],
    },
    {
      label: "Live Tracking",
      href: "/tracking",
      icon: MapPin,
      roles: ["dispatcher", "manager"],
    },
    {
      label: "Analytics",
      href: "/analytics",
      icon: BarChart3,
      roles: ["dispatcher", "manager"],
    },
    {
      label: "Crew Management",
      href: "/crews",
      icon: Users,
      roles: ["dispatcher", "manager"],
    },
  ];

  const visibleItems = navItems.filter((item) => item.roles.includes(userRole));

  const getRoleDisplay = (role: UserRole) => {
    switch (role) {
      case "dispatcher":
        return "Senior Dispatcher";
      case "manager":
        return "Administrator";
      case "driver":
        return "Driver";
      default:
        return role;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 md:hidden"
        onClick={onClose}
      />

      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[#1a1f2e] text-gray-100 flex flex-col z-50 md:hidden animate-slide-in">
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Truck size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Move Ready</h2>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                Operations Center
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                    : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
                }`}
              >
                <Icon size={18} />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
              {userName ? getInitials(userName) : "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {userName || "User"}
              </p>
              <p className="text-xs text-gray-400">{getRoleDisplay(userRole)}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800/50 hover:text-white transition-colors w-full text-sm"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
