import { getProfile, createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CrewsList } from "@/components/crews/crews-list";

export default async function CrewsPage() {
  const profile = await getProfile();

  if (!profile) {
    redirect("/login");
  }

  if (profile.role !== "dispatcher" && profile.role !== "manager") {
    redirect("/dashboard");
  }

  const supabase = await createClient();
  const { data: crews } = await supabase.from("crews").select("*").order("name");
  const { data: jobs } = await supabase.from("jobs").select("*");

  return <CrewsList initialCrews={crews || []} initialJobs={jobs || []} />;
}
