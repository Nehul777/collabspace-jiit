'use client';

import { useState } from 'react';
import { useUser } from '@/hooks/use-user';
import { ChatSidebar } from '@/components/chat/chat-sidebar';
import { ChatRoom } from '@/components/chat/chat-room';

export default function ChatPage() {
  const { user, loading } = useUser();
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);

  if (loading) return <div className="p-8 text-white/50">Loading...</div>;
  if (!user) return <div className="p-8 text-white/50">Please log in.</div>;

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-canvas overflow-hidden">
      <div className="hidden md:block h-full shrink-0">
        <ChatSidebar 
          userId={user.id} 
          activeRoomId={activeRoomId || undefined} 
          onSelectRoom={setActiveRoomId} 
        />
      </div>
      
      {/* Mobile view logic would go here if needed */}
      
      <div className="flex-1 h-full relative">
        {activeRoomId ? (
          <ChatRoom roomId={activeRoomId} userId={user.id} />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-white/40">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-50"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            <p>Select a team chat from the sidebar</p>
          </div>
        )}
      </div>
    </div>
  );
}
