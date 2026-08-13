'use client';

import { useRouter } from 'next/navigation';
import { useNotifications } from '@/hooks/use-notifications';
import { motion } from 'framer-motion';
import { formatTimeAgo } from '@/lib/utils/matchmaking';
import { cn } from '@/lib/utils/cn';
import { createClient } from '@/lib/supabase/client';

export function NotificationList() {
  const router = useRouter();
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const supabase = createClient();

  const handleAction = async (notifId: string, action: 'accept' | 'decline') => {
    await markAsRead(notifId);
    alert(`Action ${action} handled for notification.`);
  };

  const handleNotifClick = (notif: any) => {
    if (!notif.is_read) markAsRead(notif.id);
    if (notif.link) {
      router.push(notif.link);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Notifications</h1>
        <button 
          onClick={markAllAsRead}
          className="text-sm text-accent hover:text-accent/80 font-medium px-3 py-1.5 rounded-lg hover:bg-accent/10 transition-colors"
        >
          Mark all as read
        </button>
      </div>

      <div className="bg-surface border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-white/50 flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-50"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            <p>You have no notifications yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {notifications.map((notif, i) => (
              <motion.div 
                key={notif.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  "p-6 flex gap-4 transition-colors",
                  !notif.is_read ? "bg-accent/5" : "hover:bg-elevated/30"
                )}
                onClick={() => handleNotifClick(notif)}
              >
                <div className="mt-1">
                  {notif.type === 'JOIN_REQUEST' && <span className="text-xl">👋</span>}
                  {notif.type === 'INVITATION' && <span className="text-xl">💌</span>}
                  {notif.type === 'PROJECT_UPDATE' && <span className="text-xl">🎉</span>}
                  {notif.type === 'SYSTEM' && <span className="text-xl">ℹ️</span>}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={cn("font-medium", !notif.is_read ? "text-white" : "text-white/80")}>
                      {notif.type.replace('_', ' ')}
                    </h3>
                    <span className="text-xs text-white/40 whitespace-nowrap ml-4">
                      {formatTimeAgo(notif.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-white/60 mb-3">{notif.content}</p>
                  
                  {(notif.type === 'JOIN_REQUEST' || notif.type === 'INVITATION') && (
                    <div className="flex gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleAction(notif.id, 'accept'); }}
                        className="px-4 py-1.5 bg-accent/20 hover:bg-accent text-accent hover:text-white border border-accent/30 rounded-md text-xs font-medium transition-colors"
                      >
                        Accept
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleAction(notif.id, 'decline'); }}
                        className="px-4 py-1.5 bg-surface hover:bg-elevated text-white/70 border border-white/10 rounded-md text-xs font-medium transition-colors"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
                {!notif.is_read && (
                  <div className="w-2 h-2 rounded-full bg-accent mt-2 shrink-0" />
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
