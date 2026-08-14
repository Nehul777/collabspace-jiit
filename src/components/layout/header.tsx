"use client";

import React from "react";
import { cn } from "@/lib/utils/cn";

interface HeaderProps {
  title?: string;
  onToggleMobileSidebar?: () => void;
}

export function Header({ title = "Dashboard", onToggleMobileSidebar }: HeaderProps) {
  const handleSearchOpen = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("open-command-palette"));
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between px-4 sm:px-6 bg-[#08090A]/80 backdrop-blur-md border-b border-[rgba(255,255,255,0.08)] shrink-0 w-full">
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile hamburger menu toggle */}
        <button
          onClick={onToggleMobileSidebar}
          className="p-2 -ml-2 text-[#9CA3AF] hover:text-[#F3F4F6] md:hidden rounded-lg hover:bg-[#171920] transition-colors"
          aria-label="Open mobile menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <h1 className="text-base sm:text-lg font-semibold text-[#F3F4F6] tracking-tight truncate">{title}</h1>
      </div>
      
      <div className="flex-1 max-w-md mx-2 sm:mx-6">
        <button
          onClick={handleSearchOpen}
          className="w-full flex items-center gap-2 px-3 py-1.5 bg-[#0F1115] hover:bg-[#171920] border border-[rgba(255,255,255,0.08)] rounded-md text-xs sm:text-sm text-[#9CA3AF] transition-colors focus:outline-none focus:ring-1 focus:ring-[#6366F1]"
        >
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="flex-1 text-left truncate">Search skills, projects...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#21242D] border border-[rgba(255,255,255,0.05)] text-[#9CA3AF]">
            Ctrl K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button className="relative p-2 text-[#9CA3AF] hover:text-[#F3F4F6] transition-colors rounded-full hover:bg-[#171920]">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#08090A]"></span>
        </button>
      </div>
    </header>
  );
}
