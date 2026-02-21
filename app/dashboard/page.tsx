import { getProfile, createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { JobsTable } from "@/components/jobs/jobs-table";
import { DispatchBoard } from "@/components/dispatch/dispatch-board";

export default async function DashboardPage() {
  const profile = await getProfile();

  if (!profile) {
    redirect("/login");
  }

  const supabase = await createClient();

  if (profile.role === "dispatcher") {
    const [{ data: jobs }, { data: crews }] = await Promise.all([
      supabase.from("jobs").select("*").order("scheduled_time", { ascending: true }),
      supabase.from("crews").select("*").order("name"),
    ]);

    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Dispatch Board
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Assign and manage crew operations in real-time
          </p>
        </div>
        <DispatchBoard
          initialJobs={jobs || []}
          initialCrews={crews || []}
          userRole={profile.role}
        />
      </div>
    );
  }

  if (profile.role === "manager") {
    const { data: jobs } = await supabase
      .from("jobs")
      .select("*")
      .order("scheduled_time", { ascending: true });

    return (
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-gray-900">
            Operations Overview
          </h1>
          <p className="text-gray-600 mt-1">Monitor all jobs and crews</p>
        </div>
        <JobsTable jobs={jobs || []} userRole={profile.role} />
      </div>
    );
  }

  if (profile.role === "driver") {
    redirect("/driver/jobs");
  }

  return null;
}
