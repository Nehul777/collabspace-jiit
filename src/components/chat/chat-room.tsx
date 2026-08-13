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


  if (loading) {
    return <div className="flex-1 flex items-center justify-center text-white/50">Loading messages...</div>;
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-canvas relative">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 custom-scrollbar"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-white/50 space-y-4">
            <span className="text-4xl">👋</span>
            <p>No messages yet. Say hello to your team!</p>
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
