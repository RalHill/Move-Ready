import { getProfile, createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LiveTrackingView } from "@/components/tracking/live-tracking-view";

export default async function TrackingPage() {
  const profile = await getProfile();

  if (!profile) {
    redirect("/login");
  }

  if (profile.role !== "dispatcher" && profile.role !== "manager") {
    redirect("/dashboard");
  }

  const supabase = await createClient();
  const [{ data: crews }, { data: jobs }] = await Promise.all([
    supabase.from("crews").select("*"),
    supabase.from("jobs").select("*").neq("status", "completed"),
  ]);

  return (
    <LiveTrackingView
      initialCrews={crews || []}
      initialJobs={jobs || []}
    />
  );
}
