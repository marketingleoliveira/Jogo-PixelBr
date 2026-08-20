import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const getFurnitureCatalog = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("furniture" as any)
      .select("*");
    if (error) throw new Error(error.message);
    return data || [];
  });

export const getMyInventory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("inventory" as any)
      .select("*, furniture(*)")
      .eq("profile_id", context.userId);
    if (error) throw new Error(error.message);
    return data || [];
  });

export const buyFurniture = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ furnitureId: z.string() }).parse(data))
  .handler(async ({ data, context }) => {
    const { data: furniture, error: fError } = await context.supabase
      .from("furniture" as any)
      .select("price")
      .eq("id", data.furnitureId)
      .single();
    
    if (fError || !furniture) throw new Error("Item não encontrado");

    const { data: profile, error: pError } = await context.supabase
      .from("profiles")
      .select("coins" as any)
      .eq("id", context.userId)
      .single();
    
    if (pError || !profile) throw new Error("Perfil não encontrado");

    const currentCoins = (profile as any).coins || 0;
    const price = (furniture as any).price;

    if (currentCoins < price) {
      throw new Error("Saldo insuficiente");
    }

    const { error: updateError } = await context.supabase
      .from("profiles")
      .update({ coins: currentCoins - price } as any)
      .eq("id", context.userId);

    if (updateError) throw new Error("Erro ao processar pagamento");

    const { error: invError } = await context.supabase
      .from("inventory" as any)
      .insert({
        profile_id: context.userId,
        furniture_id: data.furnitureId
      });

    if (invError) throw new Error("Erro ao adicionar ao inventário");

    return { ok: true };
  });

export const rewardTimeCoins = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: profile, error } = await context.supabase
      .from("profiles")
      .select("coins, last_coin_reward" as any)
      .eq("id", context.userId)
      .single();

    if (error || !profile) return { rewarded: false, coins: 0 };

    const lastReward = new Date((profile as any).last_coin_reward || 0).getTime();
    const now = Date.now();
    const tenMinutes = 10 * 60 * 1000;

    if (now - lastReward >= tenMinutes) {
      const newCoins = ((profile as any).coins || 0) + 100;
      await context.supabase
        .from("profiles")
        .update({ 
          coins: newCoins,
          last_coin_reward: new Date(now).toISOString()
        } as any)
        .eq("id", context.userId);
      
      return { rewarded: true, coins: newCoins };
    }

    return { rewarded: false, coins: (profile as any).coins || 0 };
  });
