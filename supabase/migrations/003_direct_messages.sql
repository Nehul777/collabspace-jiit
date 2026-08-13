-- 003_direct_messages.sql
-- Enables 1-on-1 Direct Messaging (DMs) between students without project affiliation

-- 1. Create direct_chats table to track 1-on-1 chat room participants
CREATE TABLE IF NOT EXISTS public.direct_chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID UNIQUE REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    user1_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    user2_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT user_order CHECK (user1_id < user2_id),
    UNIQUE(user1_id, user2_id)
);

-- Enable Row Level Security
ALTER TABLE public.direct_chats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for direct_chats
CREATE POLICY "Direct chats viewable by participants" ON public.direct_chats
    FOR SELECT TO authenticated 
    USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Direct chats insertable by participants" ON public.direct_chats
    FOR INSERT TO authenticated 
    WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- 2. Update is_room_member function to handle both Project chats and Direct Messages
CREATE OR REPLACE FUNCTION public.is_room_member(room_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    associated_project_id UUID;
BEGIN
    SELECT project_id INTO associated_project_id
    FROM public.chat_rooms cr
    WHERE cr.id = is_room_member.room_id;

    IF associated_project_id IS NOT NULL THEN
        RETURN public.is_project_member(associated_project_id, is_room_member.user_id);
    ELSE
        RETURN EXISTS (
            SELECT 1 FROM public.direct_chats dc
            WHERE dc.room_id = is_room_member.room_id
            AND (dc.user1_id = is_room_member.user_id OR dc.user2_id = is_room_member.user_id)
        );
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. RPC Function to deterministically get or create a direct chat room between two users
CREATE OR REPLACE FUNCTION public.get_or_create_direct_chat(p_other_user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user1 UUID;
    v_user2 UUID;
    v_room_id UUID;
    v_curr_user UUID := auth.uid();
BEGIN
    IF v_curr_user IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;
    IF v_curr_user = p_other_user_id THEN
        RAISE EXCEPTION 'Cannot DM yourself';
    END IF;

    -- Sort UUIDs to enforce user_order constraint (user1_id < user2_id)
    IF v_curr_user < p_other_user_id THEN
        v_user1 := v_curr_user;
        v_user2 := p_other_user_id;
    ELSE
        v_user1 := p_other_user_id;
        v_user2 := v_curr_user;
    END IF;

    -- Check if direct chat room already exists
    SELECT room_id INTO v_room_id
    FROM public.direct_chats
    WHERE user1_id = v_user1 AND user2_id = v_user2;

    -- If no chat room exists, create one
    IF v_room_id IS NULL THEN
        INSERT INTO public.chat_rooms (project_id) VALUES (NULL) RETURNING id INTO v_room_id;
        INSERT INTO public.direct_chats (room_id, user1_id, user2_id)
        VALUES (v_room_id, v_user1, v_user2);
    END IF;

    RETURN v_room_id;
END;
$$;

-- Index for fast lookup of user direct chats
CREATE INDEX IF NOT EXISTS idx_direct_chats_user1 ON public.direct_chats(user1_id);
CREATE INDEX IF NOT EXISTS idx_direct_chats_user2 ON public.direct_chats(user2_id);
