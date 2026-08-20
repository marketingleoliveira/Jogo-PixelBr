import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AvatarSprite, type Figure } from "./avatar";
import { Link } from "@tanstack/react-router";

export function Navigator({ currentRoomId, onClose }: { currentRoomId: string; onClose: () => void }) {
  const [onlineUsers, setOnlineUsers] = useState<{ id: string; habbo_name: string; figure: Figure; motto: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOnline = async () => {
      // In a real app, we'd use presence for a global list, 
      // but for this MVP we'll fetch recently active profiles
      const { data, error } = await supabase
        .from('profiles')
        .select('id, habbo_name, figure, motto')
        .eq('onboarded', true)
        .limit(10);
      
      if (!error && data) {
        setOnlineUsers(data as any);
      }
      setLoading(false);
    };

    fetchOnline();
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="panel w-full max-w-md max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-3 border-b-2 border-border bg-primary/10">
          <span className="display text-xs">NAVEGADOR DE QUARTOS</span>
          <button onClick={onClose} className="btn-pixel !p-1 !min-h-0">X</button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3">
          <h3 className="display text-[0.6rem] mb-3">QUARTOS ONLINE AGORA</h3>
          {loading ? (
            <div className="text-center py-4 opacity-70 italic">Buscando quartos...</div>
          ) : onlineUsers.length === 0 ? (
            <div className="text-center py-4 opacity-70 italic">Nenhum quarto ativo no momento.</div>
          ) : (
            <div className="grid gap-2">
              {onlineUsers.map((user) => (
                <Link
                  key={user.id}
                  to="/room"
                  search={{ owner: user.id }}
                  onClick={onClose}
                  className={`card-pixel p-3 flex items-center gap-3 hover:bg-primary/5 transition-colors ${currentRoomId === user.id ? 'border-primary' : ''}`}
                >
                  <div className="scale-75 -ml-2 -mr-2">
                    <AvatarSprite figure={user.figure} size={40} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="display text-[0.55rem] truncate">Quarto de {user.habbo_name}</div>
                    <div className="text-sm opacity-60 truncate">"{user.motto}"</div>
                  </div>
                  {currentRoomId === user.id && (
                    <span className="tag-pixel !text-[0.4rem]">VOCÊ ESTÁ AQUI</span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-3 border-t-2 border-border bg-black/5 flex justify-end">
          <button onClick={onClose} className="btn-pixel" data-variant="secondary">Fechar</button>
        </div>
      </div>
    </div>
  );
}
