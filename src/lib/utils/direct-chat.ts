import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Gets an existing direct chat room ID between current user and target user,
 * or creates a new one if it doesn't exist yet.
 */
export async function getOrCreateDirectChat(
  supabase: SupabaseClient,
  currentUserId: string,
  targetUserId: string
): Promise<string | null> {
  if (!currentUserId || !targetUserId || currentUserId === targetUserId) {
    return null;
  }

  // 1. Try RPC function first
  try {
    const { data: roomId, error } = await supabase.rpc('get_or_create_direct_chat', {
      p_other_user_id: targetUserId,
    });

    if (!error && roomId) {
      return roomId;
    }
  } catch {
    // Fall back to query if RPC not yet created in DB
  }

  // 2. Client-side query fallback
  const user1 = currentUserId < targetUserId ? currentUserId : targetUserId;
  const user2 = currentUserId < targetUserId ? targetUserId : currentUserId;

  const { data: existingChat } = await supabase
    .from('direct_chats')
    .select('room_id')
    .eq('user1_id', user1)
    .eq('user2_id', user2)
    .maybeSingle();

  if (existingChat?.room_id) {
    return existingChat.room_id;
  }

  // Create new chat room (project_id IS NULL for DMs)
  const { data: newRoom, error: roomErr } = await supabase
    .from('chat_rooms')
    .insert({})
    .select('id')
    .single();

  if (roomErr || !newRoom) {
    console.error('Failed to create chat room:', roomErr);
    return null;
  }

  const { error: directErr } = await supabase.from('direct_chats').insert({
    room_id: newRoom.id,
    user1_id: user1,
    user2_id: user2,
  });

  if (directErr) {
    console.error('Failed to link direct_chats:', directErr);
  }

  return newRoom.id;
}
