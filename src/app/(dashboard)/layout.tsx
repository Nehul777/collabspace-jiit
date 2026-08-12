import React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { CommandPalette } from "@/components/layout/command-palette";
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
    .select("enrollment_no, display_name")
    .eq("id", user.id)
    .single();

  if (!profile?.enrollment_no) {
    redirect("/setup");
  }

  return (
    <div className="flex h-screen bg-[#08090A] text-[#F3F4F6] overflow-hidden">
      <Sidebar userProfile={profile} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-6 md:p-8">
            {children}
          </div>
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}
