'use client';

import { useState } from 'react';
import { useNotifications } from '@/hooks/use-notifications';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { formatTimeAgo } from '@/lib/utils/matchmaking';

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-white/70 hover:text-white transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"
          />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-80 bg-surface border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-4 border-b border-white/10 flex justify-between items-center bg-elevated">
                <h3 className="font-semibold text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full">{unreadCount} new</span>
                )}
              </div>
              
              <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-white/50 text-sm">
                    No notifications yet
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {notifications.slice(0, 5).map(notif => (
                      <Link 
                        href="/notifications" 
                        key={notif.id}
                        onClick={() => {
                          if (!notif.is_read) markAsRead(notif.id);
                          setIsOpen(false);
                        }}
                        className={`p-4 border-b border-white/5 hover:bg-elevated/50 transition-colors flex gap-3 ${!notif.is_read ? 'bg-accent/5' : ''}`}
                      >
                        {!notif.is_read && <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white/90 font-medium mb-0.5 truncate">{notif.type.replace('_', ' ')}</p>
                          <p className="text-xs text-white/50 line-clamp-2">{notif.content}</p>
                          <span className="text-[10px] text-white/40 mt-1 block">{formatTimeAgo(notif.created_at)}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="p-3 border-t border-white/10 text-center bg-elevated/50">
                <Link href="/notifications" onClick={() => setIsOpen(false)} className="text-xs text-accent hover:text-accent/80 font-medium">
                  View all notifications
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
