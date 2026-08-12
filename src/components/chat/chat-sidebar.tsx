'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { createClient } from '@/lib/supabase/client';
import { formatTimeAgo } from '@/lib/utils/matchmaking';

interface ChatSidebarProps {
  userId: string;
  activeRoomId?: string;
  onSelectRoom: (roomId: string) => void;
}

export function ChatSidebar({ userId, activeRoomId, onSelectRoom }: ChatSidebarProps) {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchRooms = async () => {
      // Fetch projects where user is a member, these are the chat rooms
      const { data, error } = await supabase
        .from('project_members')
        .select(`
          project_id,
          projects (
            id,
            title,
            messages (
              content,
              created_at
            )
          )
        `)
        .eq('user_id', userId);

      if (!error && data) {
        // Format and sort rooms by latest message
        const formattedRooms = data.map((item: any) => {
          const project = Array.isArray(item.projects) ? item.projects[0] : item.projects;
          const msgs = Array.isArray(project.messages) ? project.messages : [];
          const lastMsg = msgs.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
          
          return {
            id: project.id,
            title: project.title,
            lastMessage: lastMsg?.content,
            lastMessageAt: lastMsg?.created_at,
          };
        }).sort((a: any, b: any) => {
          if (!a.lastMessageAt) return 1;
          if (!b.lastMessageAt) return -1;
          return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
        });
        
        setRooms(formattedRooms);
      }
      setLoading(false);
    };

    fetchRooms();
  }, [userId, supabase]);

  if (loading) return <div className="w-72 border-r border-white/5 bg-surface p-4 text-white/50 text-sm">Loading chats...</div>;

  return (
    <div className="w-72 border-r border-white/5 bg-surface flex flex-col h-full">
      <div className="p-4 border-b border-white/5">
        <h2 className="font-semibold text-white">Messages</h2>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {rooms.length === 0 ? (
          <div className="p-4 text-sm text-white/50 text-center mt-4">
            No active chats yet. Join a project to start chatting!
          </div>
        ) : (
          <div className="flex flex-col">
            {rooms.map(room => (
              <button
                key={room.id}
                onClick={() => onSelectRoom(room.id)}
                className={cn(
                  "w-full text-left p-4 border-b border-white/5 transition-colors hover:bg-elevated/50 flex flex-col gap-1",
                  activeRoomId === room.id ? "bg-elevated border-l-2 border-l-accent" : "border-l-2 border-l-transparent"
                )}
              >
                <div className="flex justify-between items-start w-full">
                  <span className="font-medium text-sm text-white truncate pr-2">{room.title}</span>
                  {room.lastMessageAt && (
                    <span className="text-[10px] text-white/40 whitespace-nowrap mt-0.5">
                      {formatTimeAgo(room.lastMessageAt)}
                    </span>
                  )}
                </div>
                <div className="text-xs text-white/50 truncate w-full">
                  {room.lastMessage || 'No messages yet'}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
