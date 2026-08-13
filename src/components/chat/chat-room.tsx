'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MessageBubble } from './message-bubble';
import { MessageInput } from './message-input';

interface ChatRoomProps {
  roomId: string;
  userId: string;
}

export function ChatRoom({ roomId, userId }: ChatRoomProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyTo, setReplyTo] = useState<any | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    let channel: any;
    
    const fetchMessages = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          profiles(display_name, avatar_url)
        `)
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setMessages(data);
      }
      setLoading(false);
      scrollToBottom();
    };

    fetchMessages();

    channel = supabase.channel(`room_${roomId}`)
      .on(
        'postgres_changes' as any,
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${roomId}` },
        async (payload: any) => {
          // Fetch the profile for the new message
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name, avatar_url')
            .eq('id', payload.new.user_id)
            .single();
            
          const newMessage = { ...payload.new, profiles: profile };
          setMessages(prev => {
            const filtered = prev.filter(m => !(m.isPending && m.content === payload.new.content && m.user_id === payload.new.user_id));
            return [...filtered, newMessage];
          });
          setTimeout(scrollToBottom, 50);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, supabase]);


  const [roomHeaderInfo, setRoomHeaderInfo] = useState<{ title: string; subtitle?: string } | null>(null);

  useEffect(() => {
    const fetchRoomInfo = async () => {
      // 1. Check if direct chat
      const { data: directChat } = await supabase
        .from('direct_chats')
        .select(`
          user1:profiles!direct_chats_user1_id_fkey(id, display_name, batch, enrollment_no),
          user2:profiles!direct_chats_user2_id_fkey(id, display_name, batch, enrollment_no)
        `)
        .eq('room_id', roomId)
        .maybeSingle();

      if (directChat) {
        const partner = (directChat.user1 as any)?.id === userId ? (directChat.user2 as any) : (directChat.user1 as any);
        const partnerObj = Array.isArray(partner) ? partner[0] : partner;
        setRoomHeaderInfo({
          title: partnerObj?.display_name || 'Student',
          subtitle: partnerObj?.enrollment_no ? `Direct Message • Batch ${partnerObj.batch}` : 'Direct Message',
        });
        return;
      }

      // 2. Check if project chat
      const { data: chatRoom } = await supabase
        .from('chat_rooms')
        .select('project_id, projects(title)')
        .eq('id', roomId)
        .maybeSingle();

      if (chatRoom?.projects) {
        const proj = Array.isArray(chatRoom.projects) ? chatRoom.projects[0] : chatRoom.projects;
        setRoomHeaderInfo({
          title: proj?.title || 'Team Chat',
          subtitle: 'Team Project Chat',
        });
      }
    };

    fetchRoomInfo();
  }, [roomId, userId, supabase]);

  if (loading) {
    return <div className="flex-1 flex items-center justify-center text-white/50">Loading messages...</div>;
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-canvas relative">
      {/* Header Bar */}
      {roomHeaderInfo && (
        <div className="px-5 py-3 border-b border-white/5 bg-surface/80 backdrop-blur-sm flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent/20 to-tertiary/20 border border-accent/30 flex items-center justify-center text-sm font-bold text-accent">
            {roomHeaderInfo.title.charAt(0)}
          </div>
          <div>
            <h3 className="font-semibold text-sm text-white">{roomHeaderInfo.title}</h3>
            {roomHeaderInfo.subtitle && (
              <p className="text-[11px] text-white/50">{roomHeaderInfo.subtitle}</p>
            )}
          </div>
        </div>
      )}

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 custom-scrollbar"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-white/50 space-y-4">
            <span className="text-4xl">👋</span>
            <p>No messages yet. Say hello!</p>
          </div>
        ) : (
          <div className="space-y-1 mt-auto">
            {messages.map((msg) => (
              <MessageBubble 
                key={msg.id} 
                message={msg} 
                isOwn={msg.user_id === userId}
                onReply={setReplyTo}
                replyTo={msg.reply_to ? messages.find(m => m.id === msg.reply_to) : null}
              />
            ))}
          </div>
        )}
      </div>
      
      <MessageInput 
        roomId={roomId} 
        userId={userId} 
        replyTo={replyTo} 
        onCancelReply={() => setReplyTo(null)}
        onOptimisticSubmit={(msg) => {
          setMessages(prev => [...prev, { ...msg, profiles: { display_name: "You" } }]);
          setTimeout(scrollToBottom, 50);
        }}
      />
    </div>
  );
}
