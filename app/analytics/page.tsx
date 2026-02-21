import { Suspense } from "react";
import { getProfile, createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AnalyticsContent } from "@/components/analytics/analytics-content";
import { MetricCardSkeleton } from "@/components/ui/skeleton";

async function AnalyticsData() {
  const supabase = await createClient();

  const [
    { data: allJobs },
    { data: completedJobs },
    { data: riskJobs },
    { data: crews },
  ] = await Promise.all([
    supabase.from("jobs").select("*"),
    supabase.from("jobs").select("*").eq("status", "completed"),
    supabase.from("jobs").select("*").eq("risk_flag", true),
    supabase.from("crews").select("*"),
  ]);

  return (
    <AnalyticsContent
      allJobs={allJobs || []}
      completedJobs={completedJobs || []}
      riskJobs={riskJobs || []}
      crews={crews || []}
    />
  );
}

function AnalyticsLoadingState() {
  return (
    <div>
      <div className="mb-6">
        <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
        <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
      </div>
      <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
    </div>
  );
}

export default async function AnalyticsPage() {
  const profile = await getProfile();

  if (!profile) {
    redirect("/login");
  }

  if (profile.role !== "dispatcher" && profile.role !== "manager") {
    redirect("/dashboard");
  }

  return (
    <Suspense fallback={<AnalyticsLoadingState />}>
      <AnalyticsData />
    </Suspense>
  );
}
