"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Pitch Board", href: "/", icon: "📋" },
  { label: "Find Students", href: "/students", icon: "🔍" },
  { label: "Applications", href: "/applications", icon: "🙋" },
  { label: "Chat", href: "/chat", icon: "💬" },
  { label: "Notifications", href: "/notifications", icon: "🔔" },
  { label: "Profile", href: "/profile", icon: "👤" },
];

interface SidebarProps {
  userProfile?: { display_name?: string | null };
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ userProfile, isMobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const renderNavContent = () => (
    <>
      <div className="h-14 flex items-center justify-between px-4 border-b border-[rgba(255,255,255,0.08)] shrink-0">
        <Link href="/" onClick={onMobileClose} className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-tertiary flex items-center justify-center text-white font-bold text-sm shadow-[0_0_15px_var(--color-accent-glow)] group-hover:shadow-[0_0_25px_var(--color-accent-glow)] transition-shadow">
            CJ
          </div>
          <span className="font-semibold text-[#F3F4F6] tracking-tight group-hover:text-white transition-colors">
            CollabSpace
          </span>
        </Link>

        {/* Mobile close button */}
        {onMobileClose && (
          <button 
            onClick={onMobileClose} 
            className="md:hidden p-1.5 text-white/50 hover:text-white rounded-lg hover:bg-white/10"
            aria-label="Close menu"
          >
            ✕
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1 custom-scrollbar">
        {NAV_ITEMS.map((item) => {
          const isActive = mounted && (pathname === item.href || (item.href !== "/" && pathname?.startsWith(`${item.href}`)));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileClose}
              className={cn(
                "relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group",
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
              <span className="text-lg opacity-80 group-hover:opacity-100 transition-all">
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

      <div className="px-4 py-3 border-t border-[rgba(255,255,255,0.08)] bg-white/[0.02] text-xs text-[#9CA3AF] shrink-0 space-y-1">
        <div className="font-medium text-white/80 flex items-center gap-1.5">
          <span>🐛</span> Bugs & Suggestions?
        </div>
        <p className="text-[11px] leading-tight text-white/50">
          Contact <a href="mailto:nehuljajoo@gmail.com?subject=CollabSpace%20Feedback" className="text-accent hover:underline font-mono">nehuljajoo@gmail.com</a>
        </p>
      </div>

      <div className="p-4 border-t border-[rgba(255,255,255,0.08)] shrink-0">
        <Link 
          href="/profile"
          onClick={onMobileClose}
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#171920] transition-colors group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-white font-medium shadow-inner shrink-0">
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
        </Link>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden md:flex w-[240px] flex-shrink-0 border-r border-[rgba(255,255,255,0.08)] bg-[#0F1115] flex-col h-screen sticky top-0">
        {renderNavContent()}
      </aside>

      {/* Mobile Slide-Over Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
            onClick={onMobileClose}
          />
          {/* Drawer container */}
          <aside className="relative w-[270px] max-w-[80vw] bg-[#0F1115] border-r border-[rgba(255,255,255,0.08)] flex flex-col h-full z-50 shadow-2xl">
            {renderNavContent()}
          </aside>
        </div>
      )}
    </>
  );
}
