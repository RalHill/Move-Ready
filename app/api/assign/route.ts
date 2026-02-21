import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const JOB_DURATION_HOURS = 2;

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "dispatcher") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { job_id, crew_id } = body;

    if (!job_id || !crew_id) {
      return NextResponse.json(
        { error: "job_id and crew_id are required" },
        { status: 400 }
      );
    }

    const { data: job } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", job_id)
      .single();

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.crew_id) {
      return NextResponse.json(
        { error: "Job already assigned" },
        { status: 409 }
      );
    }

    const jobStart = new Date(job.scheduled_time);
    const jobEnd = new Date(jobStart.getTime() + JOB_DURATION_HOURS * 60 * 60 * 1000);

    const { data: conflictingJobs } = await supabase
      .from("jobs")
      .select("*")
      .eq("crew_id", crew_id)
      .neq("status", "completed");

    if (conflictingJobs && conflictingJobs.length > 0) {
      for (const conflictJob of conflictingJobs) {
        const conflictStart = new Date(conflictJob.scheduled_time);
        const conflictEnd = new Date(
          conflictStart.getTime() + JOB_DURATION_HOURS * 60 * 60 * 1000
        );

        const hasOverlap =
          (jobStart >= conflictStart && jobStart < conflictEnd) ||
          (jobEnd > conflictStart && jobEnd <= conflictEnd) ||
          (jobStart <= conflictStart && jobEnd >= conflictEnd);

        if (hasOverlap) {
          return NextResponse.json(
            {
              error: "Crew already assigned to overlapping job",
              conflicting_job: conflictJob,
            },
            { status: 409 }
          );
        }
      }
    }

    const [{ error: updateJobError }, { error: updateCrewError }] =
      await Promise.all([
        supabase
          .from("jobs")
          .update({ crew_id, status: "assigned" })
          .eq("id", job_id),
        supabase
          .from("crews")
          .update({ status: "assigned" })
          .eq("id", crew_id),
      ]);

    if (updateJobError || updateCrewError) {
      console.error("Error updating job or crew:", {
        updateJobError,
        updateCrewError,
      });
      return NextResponse.json(
        { error: "Failed to assign job" },
        { status: 500 }
      );
    }

    const { error: assignmentEventError } = await supabase
      .from("assignment_events")
      .insert({
        job_id,
        crew_id,
        assigned_by: user.id,
      });

    if (assignmentEventError) {
      console.error("Error logging assignment event:", assignmentEventError);
    }

    const { data: updatedJob } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", job_id)
      .single();

    return NextResponse.json({ job: updatedJob }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
