"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";

// Note: Assuming a basic Modal or rendering our own since it's a specific palette pattern
const PALETTE_ITEMS = [
  { id: "home", label: "Go to Dashboard", icon: "🏠", group: "Navigation", shortcut: "G H", href: "/" },
  { id: "pitches", label: "Go to Pitch Board", icon: "📋", group: "Navigation", shortcut: "G P", href: "/" },
  { id: "students", label: "Find Students", icon: "🔍", group: "Navigation", shortcut: "G S", href: "/students" },
  { id: "create-pitch", label: "Create New Pitch", icon: "✨", group: "Quick Actions", shortcut: "C P", href: "/projects/new" },
  { id: "edit-profile", label: "Edit Profile", icon: "👤", group: "Quick Actions", shortcut: "E P", href: "/profile/edit" },
];

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    const handleOpenEvent = () => setIsOpen(true);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-command-palette", handleOpenEvent);
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-command-palette", handleOpenEvent);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const filteredItems = PALETTE_ITEMS.filter(item => 
    item.label.toLowerCase().includes(query.toLowerCase()) || 
    item.group.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % filteredItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === "Enter" && filteredItems[activeIndex]) {
      e.preventDefault();
      handleSelect(filteredItems[activeIndex]);
    }
  };

  const handleSelect = (item: typeof PALETTE_ITEMS[0]) => {
    setIsOpen(false);
    router.push(item.href);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#08090A]/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] pointer-events-none px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="w-full max-w-lg bg-[#0F1115] border border-[rgba(255,255,255,0.1)] rounded-xl shadow-2xl overflow-hidden pointer-events-auto"
            >
              <div className="flex items-center px-4 border-b border-[rgba(255,255,255,0.08)]">
                <svg className="w-5 h-5 text-[#9CA3AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search commands, skills, or pages..."
                  className="w-full bg-transparent border-none text-[#F3F4F6] placeholder-[#9CA3AF] px-3 py-4 focus:outline-none focus:ring-0 text-sm"
                />
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#21242D] border border-[rgba(255,255,255,0.05)] text-[#9CA3AF]">
                  ESC
                </kbd>
              </div>

              <div className="max-h-[60vh] overflow-y-auto p-2">
                {filteredItems.length === 0 ? (
                  <div className="py-8 text-center text-sm text-[#9CA3AF]">
                    No results found for "{query}"
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredItems.map((item, index) => {
                      const isActive = index === activeIndex;
                      return (
                        <div
                          key={item.id}
                          className={cn(
                            "flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors",
                            isActive ? "bg-[#6366F1]/10 text-[#F3F4F6]" : "text-[#9CA3AF] hover:bg-[#171920] hover:text-[#F3F4F6]"
                          )}
                          onClick={() => handleSelect(item)}
                          onMouseEnter={() => setActiveIndex(index)}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-base">{item.icon}</span>
                            <span className="text-sm font-medium">{item.label}</span>
                          </div>
                          {item.shortcut && (
                            <span className="text-[10px] font-mono tracking-widest text-[#9CA3AF] bg-[#171920] px-1.5 py-0.5 rounded">
                              {item.shortcut}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
