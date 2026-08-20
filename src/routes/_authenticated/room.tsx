import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useRef, useState } from "react";
import { IsoRoom, type ChatBubble, type Furniture } from "@/game/IsoRoom";
import { DEFAULT_FIGURE, type Figure } from "@/game/avatar";
import { getMyProfile, saveLastPosition, saveAvatar } from "@/lib/profile.functions";
import { supabase } from "@/integrations/supabase/client";
import { useMultiplayer, type ChatMessage } from "@/game/useMultiplayer";
import { Navigator } from "@/game/Navigator";
import { Tutorial } from "@/game/Tutorial";
import { Shop } from "@/game/Shop";
import { AvatarEditor } from "@/game/AvatarEditor";
import { rewardTimeCoins } from "@/lib/shop.functions";
import { getRoomFurniture, pickupFurniture, placeFurniture } from "@/lib/furniture.functions";
import { toast } from "sonner";
import { z } from "zod";

const roomSearchSchema = z.object({
  owner: z.string().optional(),
});

export const Route = createFileRoute("/_authenticated/room")({
  validateSearch: roomSearchSchema,
  component: RoomPage,
});

function RoomPage() {
  const navigate = useNavigate();
  const { owner } = useSearch({ from: "/_authenticated/room" });
  const fetchProfile = useServerFn(getMyProfile);
  const savePos = useServerFn(saveLastPosition);
  const saveProfileAvatar = useServerFn(saveAvatar);
  const fetchFurniture = useServerFn(getRoomFurniture);
  const doPickup = useServerFn(pickupFurniture);
  
  const [profile, setProfile] = useState<null | {
    id: string; habbo_name: string; motto: string; figure: Figure; last_x: number; last_y: number; onboarded: boolean; coins?: number; gender?: string;
  }>(null);
  
  const [externalBubbles, setExternalBubbles] = useState<ChatBubble[]>([]);
  const [isNavigatorOpen, setIsNavigatorOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isAvatarEditorOpen, setIsAvatarEditorOpen] = useState(false);
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [roomFurniture, setRoomFurniture] = useState<Furniture[]>([]);
  const [showTutorial, setShowTutorial] = useState(false);
  const saveTimer = useRef<number | null>(null);
  const [unlockTrigger, setUnlockTrigger] = useState(0);
  const rewardFn = useServerFn(rewardTimeCoins);


  const activeRoomId = owner || profile?.id || 'lobby';

  const onChatReceived = useCallback((msg: ChatMessage) => {
    setExternalBubbles((prev) => [
      ...prev,
      { id: `${msg.playerId}-${msg.ts}`, text: msg.text, ts: msg.ts, habboName: msg.habboName }
    ]);
  }, []);

  const { players, status, updateMyState, sendBroadcastChat } = useMultiplayer(
    profile ? { id: profile.id, habbo_name: profile.habbo_name, figure: profile.figure, motto: profile.motto } : null,
    { x: profile?.last_x ?? 5, y: profile?.last_y ?? 5 },
    onChatReceived,
    activeRoomId
  );

  const refreshFurniture = useCallback(async () => {
    try {
      const furni = await fetchFurniture({ roomId: activeRoomId });
      setRoomFurniture(furni.map((f: any) => ({
        id: f.id,
        x: f.x,
        y: f.y,
        type: f.furniture_type || 'chair', // Fallback for testing
        direction: f.direction || 0
      })));
    } catch (e) {
      console.error("Error fetching furniture:", e);
    }
  }, [fetchFurniture, activeRoomId]);

  useEffect(() => {
    refreshFurniture();
  }, [refreshFurniture]);

  const handleStateChange = useCallback((s: { x: number; y: number; direction: number; walking: boolean; sitting: boolean }) => {
    updateMyState(s);
  }, [updateMyState]);


  useEffect(() => {
    fetchProfile().then((p) => {
      if (!p) return;
      if (!p.onboarded || !p.habbo_name) {
        navigate({ to: "/create-avatar" });
        return;
      }
      setProfile({
        id: p.id,
        habbo_name: p.habbo_name,
        motto: p.motto ?? "",
        figure: (p.figure as Figure) ?? DEFAULT_FIGURE,
        last_x: p.last_x ?? 5,
        last_y: p.last_y ?? 5,
        onboarded: p.onboarded,
        coins: (p as any).coins ?? 0,
        gender: (p as any).gender ?? "M",
      });

      // Show tutorial on first visit
      const hasSeenTutorial = localStorage.getItem('ph_tutorial_seen');
      if (!hasSeenTutorial) {
        setShowTutorial(true);
      }
    });
  }, [fetchProfile, navigate]);

  useEffect(() => {
    const t = setInterval(async () => {
      const now = Date.now();
      setExternalBubbles((b) => b.filter((x) => now - x.ts < 6000));
      
      // Try to reward coins
      try {
        const res = await rewardFn();
        if (res.rewarded) {
          toast.success("Você ganhou 100 moedas por tempo de jogo!");
          setProfile(prev => prev ? { ...prev, coins: res.coins } : null);
        }
      } catch (e) {}
    }, 60000); // Check every minute
    return () => clearInterval(t);
  }, [rewardFn]);

  const onPositionChange = useCallback((x: number, y: number) => {
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      savePos({ data: { x, y } }).catch(() => {});
    }, 800);
  }, [savePos]);

  const handleSaveAvatar = async (newFigure: Figure) => {
    try {
      await saveProfileAvatar({ 
        data: { 
          habbo_name: profile!.habbo_name, 
          gender: (profile!.gender as any) || "M", 
          motto: profile!.motto, 
          figure: newFigure 
        } 
      });
      setProfile(prev => prev ? { ...prev, figure: newFigure } : null);
      setIsAvatarEditorOpen(false);
      toast.success("Visual atualizado!");
    } catch (e) {
      toast.error("Erro ao salvar visual");
    }
  };

  const handleFurnitureClick = async (f: Furniture) => {
    if (isEditMode) {
      try {
        await doPickup({ data: { roomFurnitureId: f.id } });
        toast.success("Móvel recolhido!");
        refreshFurniture();
      } catch (e) {
        toast.error("Erro ao recolher móvel");
      }
    }
  };

  const finishTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem('ph_tutorial_seen', 'true');
  };

  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };


  if (!profile) {
    return <div className="min-h-screen grid place-items-center display">Carregando quarto...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 bg-white/50 backdrop-blur-sm z-20 border-b border-border/20">
        <div className="display text-lg flex items-center gap-2">
          Pixel Hotel 
          {owner && owner !== profile.id && (
            <span className="text-xs tag-pixel !bg-accent !text-white ml-2">VISITANDO</span>
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsShopOpen(true)} className="btn-pixel" data-variant="secondary">
            Loja 🪙 {profile.coins ?? 0}
          </button>
          <button onClick={() => setIsNavigatorOpen(true)} className="btn-pixel" data-variant="secondary">
            Navegador
          </button>
          <button onClick={() => setUnlockTrigger(t => t + 1)} className="btn-pixel" data-variant="secondary" title="Destravar posição">
            Destravar
          </button>
          <button onClick={() => navigate({ to: "/create-avatar" })} className="btn-pixel" data-variant="ghost">
            Meu Perfil
          </button>
          <button onClick={logout} className="btn-pixel" data-variant="ghost">Sair</button>
        </div>
      </header>
      
      <div className="flex-1 relative">
        <IsoRoom
          figure={profile.figure}
          habboName={profile.habbo_name}
          motto={profile.motto}
          startX={profile.last_x}
          startY={profile.last_y}
          onPositionChange={onPositionChange}
          others={players}
          onStateChange={handleStateChange}
          onChatSent={(t) => sendBroadcastChat(t)}
          externalBubbles={externalBubbles}
          unlockTrigger={unlockTrigger}
        />
        
        {isNavigatorOpen && (
          <Navigator 
            currentRoomId={activeRoomId} 
            onClose={() => setIsNavigatorOpen(false)} 
          />
        )}
        
        {isShopOpen && (
          <Shop 
            coins={profile.coins ?? 0}
            onClose={() => setIsShopOpen(false)}
            onPurchase={() => {
              fetchProfile().then(p => setProfile(prev => prev ? { ...prev, coins: (p as any).coins } : null));
              refreshFurniture();
            }}
            roomId={activeRoomId}
          />
        )}


        {showTutorial && (
          <Tutorial onComplete={finishTutorial} />
        )}
      </div>
    </div>
  );
}
