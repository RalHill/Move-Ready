import { redirect } from "next/navigation";
import { getProfile, createClient } from "@/lib/supabase/server";
import { SettingsContent } from "@/components/settings/settings-content";

export default async function SettingsPage() {
  const profile = await getProfile();

  if (!profile) {
    redirect("/login");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <SettingsContent
      userEmail={user?.email || ""}
      userRole={profile.role}
    />
  );
}
