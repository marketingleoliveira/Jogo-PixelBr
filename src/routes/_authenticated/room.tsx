import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useRef, useState } from "react";
import { IsoRoom } from "@/game/IsoRoom";
import { DEFAULT_FIGURE, type Figure } from "@/game/avatar";
import { getMyProfile, saveLastPosition } from "@/lib/profile.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/room")({
  component: RoomPage,
});

function RoomPage() {
  const navigate = useNavigate();
  const fetchProfile = useServerFn(getMyProfile);
  const savePos = useServerFn(saveLastPosition);
  const [profile, setProfile] = useState<null | {
    habbo_name: string | null; motto: string; figure: Figure; last_x: number; last_y: number; onboarded: boolean;
  }>(null);
  const saveTimer = useRef<number | null>(null);

  useEffect(() => {
    fetchProfile().then((p) => {
      if (!p) return;
      if (!p.onboarded || !p.habbo_name) {
        navigate({ to: "/create-avatar" });
        return;
      }
      setProfile({
        habbo_name: p.habbo_name,
        motto: p.motto ?? "",
        figure: (p.figure as Figure) ?? DEFAULT_FIGURE,
        last_x: p.last_x ?? 5,
        last_y: p.last_y ?? 5,
        onboarded: p.onboarded,
      });
    });
  }, [fetchProfile, navigate]);

  const onPositionChange = useCallback((x: number, y: number) => {
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      savePos({ data: { x, y } }).catch(() => {});
    }, 800);
  }, [savePos]);

  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  if (!profile) {
    return <div className="min-h-screen grid place-items-center display">Carregando quarto...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-4 py-3">
        <div className="display text-lg">Pixel Hotel</div>
        <div className="flex gap-2">
          <button onClick={() => navigate({ to: "/create-avatar" })} className="btn-pixel" data-variant="ghost">
            Editar avatar
          </button>
          <button onClick={logout} className="btn-pixel" data-variant="secondary">Sair</button>
        </div>
      </header>
      <div className="flex-1">
        <IsoRoom
          figure={profile.figure}
          habboName={profile.habbo_name ?? "Visitante"}
          motto={profile.motto}
          startX={profile.last_x}
          startY={profile.last_y}
          onPositionChange={onPositionChange}
        />
      </div>
    </div>
  );
}