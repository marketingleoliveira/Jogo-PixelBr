import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const figureSchema = z.object({
  skin: z.string(),
  hair: z.enum(["short", "long", "cap", "bald"]),
  hair_color: z.string(),
  shirt: z.enum(["tee", "hoodie", "dress"]),
  shirt_color: z.string(),
  pants_color: z.string(),
});

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select("*")
      .eq("id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  });

const saveInput = z.object({
  habbo_name: z.string().min(3).max(20).regex(/^[A-Za-z0-9_.-]+$/),
  gender: z.enum(["M", "F"]),
  motto: z.string().max(60).optional().default("Novato no hotel!"),
  figure: figureSchema,
});

export const saveAvatar = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => saveInput.parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("profiles")
      .update({
        habbo_name: data.habbo_name,
        gender: data.gender,
        motto: data.motto,
        figure: data.figure,
        onboarded: true,
      })
      .eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const saveLastPosition = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ x: z.number().int().min(0).max(50), y: z.number().int().min(0).max(50) }).parse(data))
  .handler(async ({ data, context }) => {
    await context.supabase.from("profiles").update({ last_x: data.x, last_y: data.y }).eq("id", context.userId);
    return { ok: true };
  });