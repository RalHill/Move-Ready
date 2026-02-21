import { getProfile, createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DriverJobsList } from "@/components/driver/driver-jobs-list";

export default async function DriverJobsPage() {
  const profile = await getProfile();

  if (!profile) {
    redirect("/login");
  }

  if (profile.role !== "driver") {
    redirect("/dashboard");
  }

  const supabase = await createClient();

  const { data: jobs } = await supabase
    .from("jobs")
    .select("*")
    .order("scheduled_time", { ascending: true });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-gray-900">My Jobs</h1>
        <p className="text-gray-600 mt-1">Your assigned moving jobs</p>
      </div>
      <DriverJobsList initialJobs={jobs || []} />
    </div>
  );
}
