'use client';

import { useEffect, useState, useMemo } from 'react';
import { cn } from '@/lib/utils/cn';
import { createClient } from '@/lib/supabase/client';
import { formatTimeAgo } from '@/lib/utils/matchmaking';
import { getOrCreateDirectChat } from '@/lib/utils/direct-chat';

interface ChatSidebarProps {
  userId: string;
  activeRoomId?: string;
  onSelectRoom: (roomId: string) => void;
}

export function ChatSidebar({ userId, activeRoomId, onSelectRoom }: ChatSidebarProps) {
  const [projectRooms, setProjectRooms] = useState<any[]>([]);
  const [directRooms, setDirectRooms] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'teams' | 'dms'>('all');
  const [loading, setLoading] = useState(true);
  
  // New DM Modal state
  const [showNewDmModal, setShowNewDmModal] = useState(false);
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [startingDm, setStartingDm] = useState(false);

  const supabase = useMemo(() => createClient(), []);

  const fetchRooms = async () => {
    setLoading(true);

    // 1. Fetch Project / Team Chats
    const { data: projectMembersData } = await supabase
      .from('project_members')
      .select(`
        project_id,
        projects (
          id,
          title,
          chat_rooms (
            id,
            messages (
              content,
              created_at
            )
          )
        )
      `)
      .eq('user_id', userId);

    if (projectMembersData) {
      const formattedProjectRooms = projectMembersData.map((item: any) => {
        const project = Array.isArray(item.projects) ? item.projects[0] : item.projects;
        if (!project) return null;
        
        const chatRoom = Array.isArray(project.chat_rooms) ? project.chat_rooms[0] : project.chat_rooms;
        const roomId = chatRoom?.id || project.id;
        const msgs = Array.isArray(chatRoom?.messages) ? chatRoom.messages : [];
        const lastMsg = msgs.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

        return {
          id: roomId,
          type: 'TEAM',
          title: project.title,
          lastMessage: lastMsg?.content,
          lastMessageAt: lastMsg?.created_at,
        };
      }).filter(Boolean);

      setProjectRooms(formattedProjectRooms as any[]);
    }

    // 2. Fetch Direct Message Chats
    const { data: directChatsData } = await supabase
      .from('direct_chats')
      .select(`
        id,
        room_id,
        user1_id,
        user2_id,
        user1:profiles!direct_chats_user1_id_fkey(id, display_name, avatar_url),
        user2:profiles!direct_chats_user2_id_fkey(id, display_name, avatar_url),
        chat_rooms:room_id (
          messages (
            content,
            created_at
          )
        )
      `)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

    if (directChatsData) {
      const formattedDirectRooms = directChatsData.map((item: any) => {
        const partner = item.user1_id === userId ? item.user2 : item.user1;
        const partnerObj = Array.isArray(partner) ? partner[0] : partner;
        const chatRoom = Array.isArray(item.chat_rooms) ? item.chat_rooms[0] : item.chat_rooms;
        const msgs = Array.isArray(chatRoom?.messages) ? chatRoom.messages : [];
        const lastMsg = msgs.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

        return {
          id: item.room_id,
          type: 'DM',
          title: partnerObj?.display_name || 'Student',
          partnerId: partnerObj?.id,
          avatarUrl: partnerObj?.avatar_url,
          lastMessage: lastMsg?.content,
          lastMessageAt: lastMsg?.created_at,
        };
      });

      setDirectRooms(formattedDirectRooms);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchRooms();
  }, [userId, supabase]);

  // Combined and sorted rooms
  const allRooms = useMemo(() => {
    let combined = [];
    if (activeTab === 'all' || activeTab === 'teams') combined.push(...projectRooms);
    if (activeTab === 'all' || activeTab === 'dms') combined.push(...directRooms);

    return combined.sort((a, b) => {
      if (!a.lastMessageAt) return 1;
      if (!b.lastMessageAt) return -1;
      return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
    });
  }, [projectRooms, directRooms, activeTab]);

  // Fetch students list for New DM Modal
  const openNewDmModal = async () => {
    setShowNewDmModal(true);
    const { data } = await supabase
      .from('profiles')
      .select('id, display_name, batch, enrollment_no, avatar_url')
      .neq('id', userId)
      .not('enrollment_no', 'is', null)
      .order('display_name');

    if (data) setStudentsList(data);
  };

  const startDmWithStudent = async (targetStudentId: string) => {
    setStartingDm(true);
    const roomId = await getOrCreateDirectChat(supabase, userId, targetStudentId);
    setStartingDm(false);
    setShowNewDmModal(false);

    if (roomId) {
      fetchRooms();
      onSelectRoom(roomId);
    }
  };

  const filteredStudents = studentsList.filter(s => 
    s.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.enrollment_no?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="w-72 border-r border-white/5 bg-surface p-4 text-white/50 text-sm">Loading chats...</div>;

  return (
    <div className="w-72 border-r border-white/5 bg-surface flex flex-col h-full relative">
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <h2 className="font-semibold text-white">Messages</h2>
        <button 
          onClick={openNewDmModal}
          className="p-1.5 rounded-lg bg-accent/10 hover:bg-accent text-accent hover:text-white border border-accent/20 transition-all text-xs font-medium flex items-center gap-1"
          title="New Direct Message"
        >
          <span>💬</span>
          <span>+ DM</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 bg-surface/50 p-1 text-xs">
        <button
          onClick={() => setActiveTab('all')}
          className={cn("flex-1 py-1.5 rounded text-center transition-colors", activeTab === 'all' ? "bg-elevated text-white font-medium" : "text-white/50 hover:text-white")}
        >
          All
        </button>
        <button
          onClick={() => setActiveTab('teams')}
          className={cn("flex-1 py-1.5 rounded text-center transition-colors", activeTab === 'teams' ? "bg-elevated text-white font-medium" : "text-white/50 hover:text-white")}
        >
          Teams ({projectRooms.length})
        </button>
        <button
          onClick={() => setActiveTab('dms')}
          className={cn("flex-1 py-1.5 rounded text-center transition-colors", activeTab === 'dms' ? "bg-elevated text-white font-medium" : "text-white/50 hover:text-white")}
        >
          DMs ({directRooms.length})
        </button>
      </div>

      {/* Room list */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {allRooms.length === 0 ? (
          <div className="p-4 text-sm text-white/50 text-center mt-6 flex flex-col items-center gap-2">
            <span>💬</span>
            <p>No messages yet.</p>
            <button onClick={openNewDmModal} className="text-xs text-accent hover:underline mt-1">
              Start a DM with a student
            </button>
          </div>
        ) : (
          <div className="flex flex-col">
            {allRooms.map(room => (
              <button
                key={room.id}
                onClick={() => onSelectRoom(room.id)}
                className={cn(
                  "w-full text-left p-3.5 border-b border-white/5 transition-colors hover:bg-elevated/50 flex flex-col gap-1",
                  activeRoomId === room.id ? "bg-elevated border-l-2 border-l-accent" : "border-l-2 border-l-transparent"
                )}
              >
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center gap-2 truncate pr-2">
                    <span className="text-xs">{room.type === 'DM' ? '💬' : '🚀'}</span>
                    <span className="font-medium text-sm text-white truncate">{room.title}</span>
                  </div>
                  {room.lastMessageAt && (
                    <span className="text-[10px] text-white/40 whitespace-nowrap">
                      {formatTimeAgo(room.lastMessageAt)}
                    </span>
                  )}
                </div>
                <div className="text-xs text-white/50 truncate w-full pl-5">
                  {room.lastMessage || 'No messages yet'}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* New DM Student Picker Modal */}
      {showNewDmModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-white/10 rounded-2xl w-full max-w-md p-5 flex flex-col max-h-[80vh] shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-white/10 mb-4">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <span>💬</span> Direct Message a Student
              </h3>
              <button 
                onClick={() => setShowNewDmModal(false)}
                className="text-white/40 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            <input
              type="text"
              placeholder="Search student by name or enrollment..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-elevated border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent mb-3"
            />

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 min-h-[200px]">
              {filteredStudents.length === 0 ? (
                <div className="p-6 text-center text-white/40 text-sm">No students found</div>
              ) : (
                filteredStudents.map(student => (
                  <button
                    key={student.id}
                    disabled={startingDm}
                    onClick={() => startDmWithStudent(student.id)}
                    className="w-full text-left p-3 hover:bg-elevated rounded-xl transition-colors flex items-center justify-between group border border-transparent hover:border-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-tertiary flex items-center justify-center text-xs font-bold text-white">
                        {student.display_name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white group-hover:text-accent transition-colors">
                          {student.display_name}
                        </div>
                        <div className="text-xs text-white/40">
                          Batch {student.batch} • {student.enrollment_no}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                      Chat →
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

