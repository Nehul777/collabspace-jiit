"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

const NAV_ITEMS = [
  { label: "Pitch Board", href: "/", icon: "📋" },
  { label: "Find Students", href: "/students", icon: "🔍" },
  { label: "Chat", href: "/chat", icon: "💬" },
  { label: "Notifications", href: "/notifications", icon: "🔔", badge: 3 },
  { label: "Profile", href: "/profile", icon: "👤" },
];

export function Sidebar({ userProfile }: { userProfile?: { display_name?: string | null } }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <aside className="w-[240px] flex-shrink-0 border-r border-[rgba(255,255,255,0.08)] bg-[#0F1115] flex flex-col h-screen sticky top-0">
      <div className="h-14 flex items-center px-4 border-b border-[rgba(255,255,255,0.08)]">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-tertiary flex items-center justify-center text-white font-bold text-sm shadow-[0_0_15px_var(--color-accent-glow)] group-hover:shadow-[0_0_25px_var(--color-accent-glow)] transition-shadow">
            JM
          </div>
          <span className="font-semibold text-[#F3F4F6] tracking-tight group-hover:text-white transition-colors">
            Matchmaker
          </span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = mounted && (pathname === item.href || pathname?.startsWith(`${item.href}/`));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 group",
                isActive 
                  ? "text-[#F3F4F6] bg-[#21242D]" 
                  : "text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-[#171920]"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-pill"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-gradient-to-b from-accent to-tertiary rounded-r-full shadow-[0_0_10px_var(--color-accent-glow)]"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span className="text-lg grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                {item.icon}
              </span>
              <span className="font-medium">{item.label}</span>
              
              {item.badge && (
                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[rgba(255,255,255,0.08)]">
        <Link 
          href="/profile"
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#171920] transition-colors group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-white font-medium shadow-inner">
            {userProfile?.display_name ? userProfile.display_name.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="flex flex-col flex-1 overflow-hidden">
            <span className="text-sm font-medium text-[#F3F4F6] truncate group-hover:text-white transition-colors">
              {userProfile?.display_name || "User Profile"}
            </span>
            <span className="text-xs text-[#9CA3AF] truncate">
              Settings & Account
            </span>
          </div>
          <svg className="w-4 h-4 text-[#9CA3AF] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </Link>
      </div>
    </aside>
  );
}
