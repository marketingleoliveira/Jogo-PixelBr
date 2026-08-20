import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Figure } from '@/game/avatar';

export type PlayerState = {
  id: string;
  habbo_name: string;
  figure: Figure;
  motto: string;
  x: number;
  y: number;
  direction: number;
  walking: boolean;
  lastUpdate: number;
};

export type ChatMessage = {
  playerId: string;
  habboName: string;
  text: string;
  ts: number;
};

export function useMultiplayer(
  myProfile: { id: string; habbo_name: string; figure: Figure; motto: string } | null,
  initialPos: { x: number; y: number },
  onChatReceived: (msg: ChatMessage) => void,
  roomId: string = 'lobby'
) {
  const [players, setPlayers] = useState<Record<string, PlayerState>>({});
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const updateMyState = useCallback((state: Partial<PlayerState>) => {
    if (!channelRef.current || !myProfile) return;
    
    channelRef.current.track({
      id: myProfile.id,
      habbo_name: myProfile.habbo_name,
      figure: myProfile.figure,
      motto: myProfile.motto,
      x: state.x ?? initialPos.x,
      y: state.y ?? initialPos.y,
      direction: state.direction ?? 0,
      walking: state.walking ?? false,
      lastUpdate: Date.now(),
    });
  }, [myProfile, initialPos]);

  const sendBroadcastChat = useCallback((text: string) => {
    if (!channelRef.current || !myProfile) return;
    
    channelRef.current.send({
      type: 'broadcast',
      event: 'chat',
      payload: {
        playerId: myProfile.id,
        habboName: myProfile.habbo_name,
        text,
        ts: Date.now(),
      },
    });
  }, [myProfile]);

  useEffect(() => {
    if (!myProfile) return;

    const channel = supabase.channel(`room:${roomId}`, {
      config: {
        presence: {
          key: myProfile.id,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState<PlayerState>();
        const flatPlayers: Record<string, PlayerState> = {};
        
        for (const key in newState) {
          const p = newState[key][0];
          if (p.id !== myProfile.id) {
            flatPlayers[p.id] = p;
          }
        }
        setPlayers(flatPlayers);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        // Optional: toast or log "user joined"
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        // Optional: toast or log "user left"
      })
      .on('broadcast', { event: 'chat' }, ({ payload }) => {
        onChatReceived(payload as ChatMessage);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            id: myProfile.id,
            habbo_name: myProfile.habbo_name,
            figure: myProfile.figure,
            motto: myProfile.motto,
            x: initialPos.x,
            y: initialPos.y,
            direction: 0,
            walking: false,
            lastUpdate: Date.now(),
          });
        }
      });

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [myProfile, initialPos.x, initialPos.y, onChatReceived, roomId]);

  return {
    players,
    updateMyState,
    sendBroadcastChat,
  };
}
