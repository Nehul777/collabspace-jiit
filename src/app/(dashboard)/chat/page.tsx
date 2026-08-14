'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useUser } from '@/hooks/use-user';
import { createClient } from '@/lib/supabase/client';
import { getOrCreateDirectChat } from '@/lib/utils/direct-chat';
import { ChatSidebar } from '@/components/chat/chat-sidebar';
import { ChatRoom } from '@/components/chat/chat-room';
import { cn } from '@/lib/utils/cn';

function ChatContent() {
  const { user, loading } = useUser();
  const searchParams = useSearchParams();
  const roomParam = searchParams.get('room');
  const userParam = searchParams.get('user');
  const [activeRoomId, setActiveRoomId] = useState<string | null>(roomParam);

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (roomParam) {
      setActiveRoomId(roomParam);
    } else if (userParam && user) {
      const resolveUserDm = async () => {
        const roomId = await getOrCreateDirectChat(supabase, user.id, userParam);
        if (roomId) setActiveRoomId(roomId);
      };
      resolveUserDm();
    }
  }, [roomParam, userParam, user, supabase]);

  if (loading) return <div className="p-8 text-white/50">Loading...</div>;
  if (!user) return <div className="p-8 text-white/50">Please log in.</div>;

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-canvas overflow-hidden w-full relative">
      {/* Mobile view logic */}
      <div className={cn(
        "h-full shrink-0 w-full md:w-72 border-r border-white/5",
        activeRoomId ? "hidden md:block" : "block"
      )}>
        <ChatSidebar 
          userId={user.id} 
          activeRoomId={activeRoomId || undefined} 
          onSelectRoom={setActiveRoomId} 
        />
      </div>
      
      <div className={cn(
        "flex-1 h-full relative w-full flex flex-col",
        !activeRoomId ? "hidden md:flex" : "flex"
      )}>
        {activeRoomId ? (
          <div className="h-full flex flex-col w-full">
            {/* Mobile back button header */}
            <div className="md:hidden p-3 bg-surface/90 border-b border-white/5 flex items-center gap-2">
              <button
                onClick={() => setActiveRoomId(null)}
                className="px-3 py-1 bg-elevated hover:bg-white/10 text-xs font-medium text-white rounded-lg flex items-center gap-1 border border-white/10"
              >
                <span>←</span> Back to Chats
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <ChatRoom roomId={activeRoomId} userId={user.id} />
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-white/40 space-y-3 p-6 text-center">
            <span className="text-4xl">💬</span>
            <p className="text-base font-medium">Select a chat from the sidebar or start a new DM</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="p-8 text-white/50">Loading chat...</div>}>
      <ChatContent />
    </Suspense>
  );
}

