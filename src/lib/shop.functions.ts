import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const getFurnitureCatalog = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("furniture")
      .select("*");
    if (error) throw new Error(error.message);
    return data || [];
  });

export const getMyInventory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("inventory")
      .select("*, furniture(*)")
      .eq("profile_id", context.userId);
    if (error) throw new Error(error.message);
    return data || [];
  });

export const buyFurniture = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ furnitureId: z.string() }).parse(data))
  .handler(async ({ data, context }) => {
    // 1. Get furniture price
    const { data: furniture, error: fError } = await context.supabase
      .from("furniture")
      .select("price")
      .eq("id", data.furnitureId)
      .single();
    
    if (fError || !furniture) throw new Error("Item não encontrado");

    // 2. Get profile coins
    const { data: profile, error: pError } = await context.supabase
      .from("profiles")
      .select("coins")
      .eq("id", context.userId)
      .single();
    
    if (pError || !profile) throw new Error("Perfil não encontrado");

    if ((profile.coins || 0) < furniture.price) {
      throw new Error("Saldo insuficiente");
    }

    // 3. Deduct coins and add to inventory
    const { error: updateError } = await context.supabase
      .from("profiles")
      .update({ coins: (profile.coins || 0) - furniture.price })
      .eq("id", context.userId);

    if (updateError) throw new Error("Erro ao processar pagamento");

    const { error: invError } = await context.supabase
      .from("inventory")
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
      .select("coins, last_coin_reward")
      .eq("id", context.userId)
      .single();

    if (error || !profile) return { coins: 0 };

    const lastReward = new Date(profile.last_coin_reward || 0).getTime();
    const now = Date.now();
    const tenMinutes = 10 * 60 * 1000;

    if (now - lastReward >= tenMinutes) {
      const newCoins = (profile.coins || 0) + 100;
      await context.supabase
        .from("profiles")
        .update({ 
          coins: newCoins,
          last_coin_reward: new Date(now).toISOString()
        })
        .eq("id", context.userId);
      
      return { rewarded: true, coins: newCoins };
    }

    return { rewarded: false, coins: profile.coins };
  });
