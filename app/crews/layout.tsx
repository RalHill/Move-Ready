import { redirect } from "next/navigation";
import { getProfile, createClient } from "@/lib/supabase/server";
import { DashboardLayoutWrapper } from "@/components/layout/dashboard-layout-wrapper";

export default async function CrewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();

  if (!profile) {
    redirect("/login");
  }

  if (profile.role !== "dispatcher" && profile.role !== "manager") {
    redirect("/dashboard");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userName = user?.email
    ? user.email.split("@")[0].charAt(0).toUpperCase() +
      user.email.split("@")[0].slice(1).replace(/[._-]/g, " ")
    : "User";

  return (
    <DashboardLayoutWrapper
      userRole={profile.role}
      userEmail={user?.email}
      userName={userName}
    >
      {children}
    </DashboardLayoutWrapper>
  );
}
