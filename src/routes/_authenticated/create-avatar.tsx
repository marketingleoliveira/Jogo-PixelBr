import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import {
  AvatarSprite, DEFAULT_FIGURE, type Figure,
  SKIN_TONES, HAIR_COLORS, SHIRT_COLORS, PANTS_COLORS, HAIR_STYLES, SHIRT_STYLES,
} from "@/game/avatar";
import { getMyProfile, saveAvatar } from "@/lib/profile.functions";

export const Route = createFileRoute("/_authenticated/create-avatar")({
  component: CreateAvatar,
});

function Swatches<T extends string>({
  values, current, onPick,
}: { values: readonly T[]; current: T; onPick: (v: T) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {values.map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onPick(v)}
          className="w-8 h-8 border-[3px]"
          style={{
            background: v,
            outline: current === v ? "3px solid var(--color-accent)" : "none",
            borderColor: "var(--color-border)",
          }}
          aria-label={v}
        />
      ))}
    </div>
  );
}

function CreateAvatar() {
  const navigate = useNavigate();
  const fetchProfile = useServerFn(getMyProfile);
  const save = useServerFn(saveAvatar);
  const [figure, setFigure] = useState<Figure>(DEFAULT_FIGURE);
  const [habboName, setHabboName] = useState("");
  const [gender, setGender] = useState<"M" | "F">("M");
  const [motto, setMotto] = useState("Novato no hotel!");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile().then((p) => {
      if (p?.onboarded) navigate({ to: "/room" });
      if (p?.figure) setFigure(p.figure as Figure);
      if (p?.habbo_name) setHabboName(p.habbo_name);
      if (p?.motto) setMotto(p.motto);
      if (p?.gender === "M" || p?.gender === "F") setGender(p.gender);
    });
  }, [fetchProfile, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await save({ data: { habbo_name: habboName, gender, motto, figure } });
      navigate({ to: "/room" });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally { setLoading(false); }
  };

  const update = <K extends keyof Figure>(k: K, v: Figure[K]) => setFigure((f) => ({ ...f, [k]: v }));

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto grid md:grid-cols-[280px_1fr] gap-6">
        <div className="panel p-4 flex flex-col items-center gap-4">
          <div className="display text-sm opacity-70">Prévia</div>
          <div className="scale-[2] my-6">
            <AvatarSprite figure={figure} size={80} />
          </div>
          <div className="text-center">
            <div className="display text-sm">{habboName || "sem nome"}</div>
            <div className="text-sm opacity-70 italic">"{motto}"</div>
          </div>
        </div>

        <form onSubmit={submit} className="panel p-6 space-y-4">
          <h1 className="display text-xl">Crie seu avatar</h1>

          <label className="block">
            <span className="display text-sm">Nome no hotel</span>
            <input className="pixel-input" value={habboName} onChange={(e) => setHabboName(e.target.value)}
              minLength={3} maxLength={20} pattern="[A-Za-z0-9_.-]+" required />
          </label>

          <label className="block">
            <span className="display text-sm">Missão</span>
            <input className="pixel-input" value={motto} maxLength={60} onChange={(e) => setMotto(e.target.value)} />
          </label>

          <div>
            <span className="display text-sm block mb-1">Gênero</span>
            <div className="flex gap-2">
              <button type="button" onClick={() => setGender("M")}
                className="btn-pixel" data-variant={gender === "M" ? undefined : "ghost"}>Masc</button>
              <button type="button" onClick={() => setGender("F")}
                className="btn-pixel" data-variant={gender === "F" ? undefined : "ghost"}>Fem</button>
            </div>
          </div>

          <div>
            <span className="display text-sm block mb-1">Tom de pele</span>
            <Swatches values={SKIN_TONES} current={figure.skin} onPick={(v) => update("skin", v)} />
          </div>

          <div>
            <span className="display text-sm block mb-1">Cabelo</span>
            <div className="flex gap-2 mb-2">
              {HAIR_STYLES.map((s) => (
                <button key={s} type="button" onClick={() => update("hair", s)}
                  className="btn-pixel" data-variant={figure.hair === s ? "secondary" : "ghost"}>{s}</button>
              ))}
            </div>
            <Swatches values={HAIR_COLORS} current={figure.hair_color} onPick={(v) => update("hair_color", v)} />
          </div>

          <div>
            <span className="display text-sm block mb-1">Roupa</span>
            <div className="flex gap-2 mb-2">
              {SHIRT_STYLES.map((s) => (
                <button key={s} type="button" onClick={() => update("shirt", s)}
                  className="btn-pixel" data-variant={figure.shirt === s ? "secondary" : "ghost"}>{s}</button>
              ))}
            </div>
            <Swatches values={SHIRT_COLORS} current={figure.shirt_color} onPick={(v) => update("shirt_color", v)} />
          </div>

          <div>
            <span className="display text-sm block mb-1">Calça / saia</span>
            <Swatches values={PANTS_COLORS} current={figure.pants_color} onPick={(v) => update("pants_color", v)} />
          </div>

          {error && <div className="text-destructive text-sm">{error}</div>}
          <button className="btn-pixel w-full" disabled={loading}>
            {loading ? "Entrando no hotel..." : "Entrar no meu quarto"}
          </button>
        </form>
      </div>
    </div>
  );
}