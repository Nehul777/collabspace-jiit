'use client';

import React, { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { CommandPalette } from "@/components/layout/command-palette";

export function DashboardLayoutClient({
  children,
  userProfile,
}: {
  children: React.ReactNode;
  userProfile?: { display_name?: string | null };
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#08090A] text-[#F3F4F6] overflow-hidden w-full relative">
      <Sidebar 
        userProfile={userProfile} 
        isMobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden w-full">
        <Header 
          onToggleMobileSidebar={() => setMobileSidebarOpen(prev => !prev)}
        />
        <main className="flex-1 overflow-y-auto w-full">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8 w-full overflow-x-hidden">
            {children}
          </div>
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}
