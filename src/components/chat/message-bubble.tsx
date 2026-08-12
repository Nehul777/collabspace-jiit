import { cn } from '@/lib/utils/cn';
import { motion } from 'framer-motion';
import { formatTimeAgo } from '@/lib/utils/matchmaking';

interface MessageBubbleProps {
  message: any;
  isOwn: boolean;
  onReply?: (message: any) => void;
  replyTo?: any;
}

export function MessageBubble({ message, isOwn, onReply, replyTo }: MessageBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex w-full group mb-4", isOwn ? "justify-end" : "justify-start")}
    >
      <div className={cn("flex max-w-[75%] flex-col", isOwn ? "items-end" : "items-start")}>
        {!isOwn && (
          <div className="flex items-center gap-2 mb-1 ml-1">
            <div className="w-6 h-6 rounded-full bg-surface border border-white/10 flex items-center justify-center text-[10px] font-bold text-white/70">
              {message.profiles?.display_name?.charAt(0) || 'U'}
            </div>
            <span className="text-xs font-medium text-white/70">{message.profiles?.display_name || 'User'}</span>
            <span className="text-[10px] text-white/40">{formatTimeAgo(message.created_at)}</span>
          </div>
        )}
        
        {replyTo && (
          <div className={cn("text-[10px] text-white/50 bg-surface/50 border border-white/5 rounded pl-2 pr-4 py-1 mb-1 truncate max-w-full opacity-70", isOwn ? "mr-1" : "ml-1")}>
            <span className="text-accent mr-1">@{replyTo.profiles?.display_name}</span>
            {replyTo.content}
          </div>
        )}

        <div className="relative group">
          <div
            className={cn(
              "px-4 py-2 rounded-2xl text-sm whitespace-pre-wrap break-words",
              isOwn 
                ? "bg-accent/10 text-white border border-accent/20 rounded-tr-sm" 
                : "bg-elevated text-white/90 border border-white/5 rounded-tl-sm"
            )}
          >
            {message.content}
          </div>
          
          <button 
            onClick={() => onReply?.(message)}
            className={cn(
              "absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full bg-surface border border-white/10 text-white/50 hover:text-white",
              isOwn ? "-left-10" : "-right-10"
            )}
            title="Reply"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 17 4 12 9 7"></polyline><path d="M20 18v-2a4 4 0 0 0-4-4H4"></path></svg>
          </button>
        </div>
        
        {isOwn && (
          <span className="text-[10px] text-white/40 mt-1 mr-1">
            {formatTimeAgo(message.created_at)}
          </span>
        )}
      </div>
    </motion.div>
  );
}
