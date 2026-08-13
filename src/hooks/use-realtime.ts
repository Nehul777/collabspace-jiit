import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

type UseRealtimeProps = {
  table: string;
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
  schema?: string;
};

export function useRealtime<T extends { [key: string]: any }>({ table, event, filter, schema = 'public' }: UseRealtimeProps) {
  const [payloads, setPayloads] = useState<RealtimePostgresChangesPayload<T>[]>([]);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let channel: RealtimeChannel;
    
    channel = supabase.channel(`realtime:${schema}:${table}`)
      .on(
        'postgres_changes' as any,
        { event, schema, table, filter },
        (payload: RealtimePostgresChangesPayload<T>) => {
          setPayloads((prev) => [...prev, payload]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, event, filter, schema, supabase]);

  return payloads;
}
