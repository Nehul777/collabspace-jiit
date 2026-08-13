'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils/cn';

interface MessageInputProps {
  roomId: string;
  userId: string;
  replyTo?: any | null;
  onCancelReply?: () => void;
  onOptimisticSubmit?: (message: any) => void;
}

export function MessageInput({ roomId, userId, replyTo, onCancelReply, onOptimisticSubmit }: MessageInputProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();

  const handleSend = async () => {
    if (!content.trim() || isSubmitting) return;
    setIsSubmitting(true);
    
    const messageContent = content.trim();
    const tempId = `temp-${Date.now()}`;
    
    // Optimistic UI update
    if (onOptimisticSubmit) {
      onOptimisticSubmit({
        id: tempId,
        room_id: roomId,
        user_id: userId,
        content: messageContent,
        reply_to: replyTo?.id || null,
        created_at: new Date().toISOString(),
        isPending: true,
      });
    }

    try {
      setContent('');
      onCancelReply?.();
      
      const { error } = await supabase.from('messages').insert({
        room_id: roomId,
        user_id: userId,
        content: messageContent,
        reply_to: replyTo?.id || null,
      });
      
      if (error) throw error;
    } catch (e) {
      console.error("Failed to send message", e);
      // Ideally we would trigger a rollback here
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full bg-surface/90 backdrop-blur border-t border-white/5 p-4 flex flex-col gap-2 relative">
      {replyTo && (
        <div className="flex items-center justify-between bg-elevated border border-white/5 rounded-md px-3 py-2 text-xs text-white/70">
          <div className="truncate flex-1 pr-4">
            <span className="text-accent font-medium mr-1">Replying to {replyTo.profiles?.display_name || 'User'}:</span>
            {replyTo.content}
          </div>
          <button onClick={onCancelReply} className="text-white/40 hover:text-white shrink-0">
            &times;
          </button>
        </div>
      )}
      <div className="flex gap-2 items-end">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 bg-elevated border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-accent resize-none min-h-[44px] max-h-32 custom-scrollbar"
          rows={1}
          style={{ height: 'auto' }}
        />
        <button
          onClick={handleSend}
          disabled={!content.trim() || isSubmitting}
          className={cn(
            "p-3 rounded-xl flex items-center justify-center transition-colors",
            content.trim() && !isSubmitting
              ? "bg-accent text-white hover:bg-accent/90"
              : "bg-elevated text-white/30 cursor-not-allowed"
          )}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
        </button>
      </div>
    </div>
  );
}
