import { useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getFurnitureCatalog, buyFurniture, getMyInventory } from "@/lib/shop.functions";
import { toast } from "sonner";

export function Shop({ onClose, coins, onPurchase, roomId }: { onClose: () => void; coins: number; onPurchase: () => void; roomId: string }) {
  const fetchCatalog = useServerFn(getFurnitureCatalog);
  const fetchInventory = useServerFn(getMyInventory);
  const doBuy = useServerFn(buyFurniture);
  const doPlace = useServerFn(placeFurniture);

  
  const [catalog, setCatalog] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'shop' | 'inventory'>('shop');

  useEffect(() => {
    Promise.all([fetchCatalog(), fetchInventory()]).then(([c, i]) => {
      setCatalog(c);
      setInventory(i);
      setLoading(false);
    });
  }, []);

  const handleBuy = async (id: string, price: number) => {
    if (coins < price) {
      toast.error("Moedas insuficientes!");
      return;
    }
    try {
      await doBuy({ data: { furnitureId: id } });
      toast.success("Comprado com sucesso!");
      onPurchase();
      // Refresh inventory
      const i = await fetchInventory();
      setInventory(i);
    } catch (e: any) {
      toast.error(e.message || "Erro ao comprar");
    }
  };

  const handlePlace = async (inventoryId: string) => {
    try {
      // Place at a default location (e.g. 5,5) - normally we'd pick a location
      await doPlace({ 
        data: { 
          inventoryId, 
          roomId, 
          x: 5, 
          y: 5,
          direction: 0 
        } 
      });
      toast.success("Móvel colocado no quarto!");
      onPurchase(); // This will trigger refresh in room
      const i = await fetchInventory();
      setInventory(i);
    } catch (e: any) {
      toast.error(e.message || "Erro ao colocar móvel");
    }
  };


  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="panel w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border/20">
          <div className="display text-xl">Catálogo</div>
          <button onClick={onClose} className="btn-pixel" data-variant="ghost">X</button>
        </div>

        <div className="flex bg-white/30 p-1">
          <button 
            onClick={() => setTab('shop')} 
            className={`flex-1 py-2 btn-pixel ${tab === 'shop' ? '' : '!bg-transparent'}`}
            data-variant={tab === 'shop' ? 'secondary' : 'ghost'}
          >
            Loja
          </button>
          <button 
            onClick={() => setTab('inventory')} 
            className={`flex-1 py-2 btn-pixel ${tab === 'inventory' ? '' : '!bg-transparent'}`}
            data-variant={tab === 'inventory' ? 'secondary' : 'ghost'}
          >
            Meu Inventário ({inventory.length})
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex justify-between items-center bg-accent/20 p-2 rounded pixel-border">
            <span className="text-sm font-bold">Suas Moedas:</span>
            <span className="text-yellow-600 font-bold flex items-center gap-1">
              🪙 {coins}
            </span>
          </div>

          {loading ? (
            <div className="text-center py-8 opacity-50">Carregando catálogo...</div>
          ) : tab === 'shop' ? (
            <div className="grid grid-cols-2 gap-3">
              {catalog.map((item) => (
                <div key={item.id} className="card-pixel p-3 flex flex-col items-center gap-2 text-center">
                  <div className="w-12 h-12 bg-white/50 rounded flex items-center justify-center text-2xl">
                    {item.sprite_type === 'chair' && '🪑'}
                    {item.sprite_type === 'table' && '🧱'}
                    {item.sprite_type === 'plant' && '🌵'}
                    {item.sprite_type === 'sofa' && '🛋️'}
                    {item.sprite_type === 'rug' && '🧶'}
                  </div>
                  <div className="text-xs font-bold truncate w-full">{item.name}</div>
                  <button 
                    onClick={() => handleBuy(item.id, item.price)}
                    className="btn-pixel w-full text-[10px] py-1"
                    data-variant="secondary"
                  >
                    {item.price} Moedas
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {inventory.map((item) => (
                <div key={item.id} className="card-pixel p-2 flex flex-col items-center gap-1">
                  <div className="text-xl">
                    {item.furniture?.sprite_type === 'chair' && '🪑'}
                    {item.furniture?.sprite_type === 'table' && '🧱'}
                    {item.furniture?.sprite_type === 'plant' && '🌵'}
                    {item.furniture?.sprite_type === 'sofa' && '🛋️'}
                    {item.furniture?.sprite_type === 'rug' && '🧶'}
                  </div>
                  <div className="text-[8px] truncate w-full text-center">{item.furniture?.name}</div>
                  <button 
                    onClick={() => handlePlace(item.id)}
                    className="btn-pixel w-full text-[8px] py-0.5 mt-1"
                    data-variant="primary"
                  >
                    Colocar
                  </button>
                </div>

              ))}
              {inventory.length === 0 && (
                <div className="col-span-3 text-center py-4 opacity-50 text-xs">Seu inventário está vazio.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
