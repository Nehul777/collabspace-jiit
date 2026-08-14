import React from "react";
import { DashboardLayoutClient } from "@/components/layout/dashboard-layout-client";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  // Check if profile is fully set up
  const { data: profile } = await supabase
    .from("profiles")
    .select("batch, display_name")
    .eq("id", user.id)
    .single();

  if (!profile?.batch) {
    redirect("/setup");
  }

  return (
    <DashboardLayoutClient userProfile={profile}>
      {children}
    </DashboardLayoutClient>
  );
}
