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
  sitting: boolean;
  emote: string | null;
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
  const [status, setStatus] = useState<'SUBSCRIBED' | 'TIMED_OUT' | 'CLOSED' | 'CHANNEL_ERROR' | 'CONNECTING'>('CONNECTING');
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const lastSentStateRef = useRef<string>("");

  const myProfileRef = useRef(myProfile);

  useEffect(() => {
    myProfileRef.current = myProfile;
  }, [myProfile]);

  const updateMyState = useCallback((state: Partial<PlayerState>) => {
    const currentProfile = myProfileRef.current;
    if (!channelRef.current || !currentProfile) return;
    
    const newState = {
      id: currentProfile.id,
      habbo_name: currentProfile.habbo_name,
      figure: currentProfile.figure,
      motto: currentProfile.motto,
      x: typeof state.x === 'number' ? state.x : initialPos.x,
      y: typeof state.y === 'number' ? state.y : initialPos.y,
      direction: typeof state.direction === 'number' ? state.direction : 0,
      walking: typeof state.walking === 'boolean' ? state.walking : false,
      sitting: typeof (state as any).sitting === 'boolean' ? (state as any).sitting : false,
      emote: (state as any).emote !== undefined ? (state as any).emote : null,
    };

    // Compression: Only send if essential fields changed
    const stateKey = `${newState.x},${newState.y},${newState.direction},${newState.walking},${newState.sitting},${newState.emote}`;

    if (stateKey === lastSentStateRef.current) return;
    lastSentStateRef.current = stateKey;

    channelRef.current.track({
      ...newState,
      lastUpdate: Date.now(),
    });
  }, [myProfile, initialPos.x, initialPos.y]);

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
        setPlayers((prev) => {
          const next = { ...prev };
          leftPresences.forEach(p => {
            delete next[(p as any).id];
          });
          return next;
        });
      })
      .on('broadcast', { event: 'chat' }, ({ payload }) => {
        onChatReceived(payload as ChatMessage);
      })
      .subscribe(async (status, err) => {
        setStatus(status);
        if (err) {
          console.error("Realtime subscription error:", err);
          return;
        }

        if (status === 'SUBSCRIBED') {
          // Send initial position after subscription
          await channel.track({
            id: myProfile.id,
            habbo_name: myProfile.habbo_name,
            figure: myProfile.figure,
            motto: myProfile.motto,
            x: initialPos.x,
            y: initialPos.y,
            direction: 0,
            walking: false,
            sitting: false,
            emote: null,
            lastUpdate: Date.now(),
          });
          // Also set local ref to prevent immediate resend if nothing changed
          lastSentStateRef.current = `${initialPos.x},${initialPos.y},0,false,false,null`;
        }
      });

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [myProfile, initialPos.x, initialPos.y, onChatReceived, roomId]);

  return {
    players,
    status,
    updateMyState,
    sendBroadcastChat,
  };
}
