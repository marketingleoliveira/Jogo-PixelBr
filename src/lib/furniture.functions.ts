import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const getRoomFurniture = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ roomId: z.string() }).parse(data))
  .handler(async ({ data, context }) => {
    const { data: furni, error } = await context.supabase
      .from("room_furniture" as any)
      .select("*")
      .eq("room_id", data.roomId);
    if (error) throw new Error(error.message);
    return furni || [];
  });

export const placeFurniture = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ 
    inventoryId: z.string(), 
    roomId: z.string(), 
    x: z.number(), 
    y: z.number(),
    direction: z.number()
  }).parse(data))
  .handler(async ({ data, context }) => {
    // 1. Check ownership of inventory item
    const { data: invItem, error: invError } = await context.supabase
      .from("inventory" as any)
      .select("furniture_id")
      .eq("id", data.inventoryId)
      .eq("profile_id", context.userId)
      .single();

    if (invError || !invItem) throw new Error("Item não encontrado no inventário");

    // 2. Insert into room_furniture
    const { error: placeError } = await context.supabase
      .from("room_furniture" as any)
      .insert({
        room_id: data.roomId,
        furniture_id: (invItem as any).furniture_id,
        profile_id: context.userId,
        x: data.x,
        y: data.y,
        direction: data.direction
      });

    if (placeError) throw new Error("Erro ao colocar móvel");

    // 3. Remove from inventory
    await context.supabase
      .from("inventory" as any)
      .delete()
      .eq("id", data.inventoryId);

    return { ok: true };
  });

export const pickupFurniture = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ 
    roomFurnitureId: z.string() 
  }).parse(data))
  .handler(async ({ data, context }) => {
    // 1. Get furniture info
    const { data: furni, error: getError } = await context.supabase
      .from("room_furniture" as any)
      .select("furniture_id")
      .eq("id", data.roomFurnitureId)
      .eq("profile_id", context.userId)
      .single();

    if (getError || !furni) throw new Error("Móvel não encontrado ou não pertence a você");

    // 2. Add back to inventory
    const { error: invError } = await context.supabase
      .from("inventory" as any)
      .insert({
        profile_id: context.userId,
        furniture_id: (furni as any).furniture_id
      });

    if (invError) throw new Error("Erro ao devolver para o inventário");

    // 3. Remove from room
    await context.supabase
      .from("room_furniture" as any)
      .delete()
      .eq("id", data.roomFurnitureId);

    return { ok: true };
  });
