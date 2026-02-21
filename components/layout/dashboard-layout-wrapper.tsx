"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { DashboardHeader } from "./dashboard-header";
import { MobileMenu } from "./mobile-menu";
import type { UserRole } from "@/types/domain";

interface DashboardLayoutWrapperProps {
  children: React.ReactNode;
  userRole: UserRole;
  userEmail?: string;
  userName: string;
}

export function DashboardLayoutWrapper({
  children,
  userRole,
  userEmail,
  userName,
}: DashboardLayoutWrapperProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <div className="grid grid-cols-[auto_1fr] grid-rows-[auto_1fr] h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
        <Sidebar
          userRole={userRole}
          userEmail={userEmail}
          className="row-span-2"
        />
        <DashboardHeader
          className="col-start-2"
          onMenuClick={() => setMobileMenuOpen(true)}
        />
        <main className="col-start-2 overflow-auto">
          <div className="max-w-7xl mx-auto p-4 md:p-6">{children}</div>
        </main>
      </div>

      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        userRole={userRole}
        userEmail={userEmail}
        userName={userName}
      />
    </>
  );
}
