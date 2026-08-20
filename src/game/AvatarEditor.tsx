import { useState } from "react";
import { 
  AvatarSprite, type Figure, 
  SKIN_TONES, HAIR_COLORS, SHIRT_COLORS, PANTS_COLORS, HAIR_STYLES, SHIRT_STYLES 
} from "./avatar";

function Swatches<T extends string>({
  values, current, onPick,
}: { values: readonly T[]; current: T; onPick: (v: T) => void }) {
  return (
    <div className="flex flex-wrap gap-1">
      {values.map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onPick(v)}
          className="w-6 h-6 border-2"
          style={{
            background: v,
            outline: current === v ? "2px solid var(--color-accent)" : "none",
            borderColor: "var(--color-border)",
          }}
        />
      ))}
    </div>
  );
}

export function AvatarEditor({ 
  initialFigure, 
  onSave, 
  onClose 
}: { 
  initialFigure: Figure; 
  onSave: (f: Figure) => void; 
  onClose: () => void 
}) {
  const [figure, setFigure] = useState<Figure>(initialFigure);

  const update = <K extends keyof Figure>(k: K, v: Figure[K]) => 
    setFigure((f) => ({ ...f, [k]: v }));

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="panel w-full max-w-sm flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border/20">
          <div className="display text-lg">Trocar Visual</div>
          <button onClick={onClose} className="btn-pixel" data-variant="ghost">X</button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex justify-center py-4 bg-white/20 rounded">
            <AvatarSprite figure={figure} size={80} />
          </div>

          <div>
            <span className="display text-[10px] block mb-1">Pele</span>
            <Swatches values={SKIN_TONES} current={figure.skin} onPick={(v) => update("skin", v)} />
          </div>

          <div>
            <span className="display text-[10px] block mb-1">Cabelo</span>
            <div className="flex gap-1 mb-2">
              {HAIR_STYLES.map((s) => (
                <button key={s} type="button" onClick={() => update("hair", s)}
                  className="btn-pixel text-[10px] py-1 px-2" data-variant={figure.hair === s ? "secondary" : "ghost"}>{s}</button>
              ))}
            </div>
            <Swatches values={HAIR_COLORS} current={figure.hair_color} onPick={(v) => update("hair_color", v)} />
          </div>

          <div>
            <span className="display text-[10px] block mb-1">Roupa</span>
            <div className="flex gap-1 mb-2">
              {SHIRT_STYLES.map((s) => (
                <button key={s} type="button" onClick={() => update("shirt", s)}
                  className="btn-pixel text-[10px] py-1 px-2" data-variant={figure.shirt === s ? "secondary" : "ghost"}>{s}</button>
              ))}
            </div>
            <Swatches values={SHIRT_COLORS} current={figure.shirt_color} onPick={(v) => update("shirt_color", v)} />
          </div>

          <div>
            <span className="display text-[10px] block mb-1">Calça</span>
            <Swatches values={PANTS_COLORS} current={figure.pants_color} onPick={(v) => update("pants_color", v)} />
          </div>
        </div>

        <div className="p-4 border-t border-border/20">
          <button 
            onClick={() => onSave(figure)} 
            className="btn-pixel w-full"
          >
            Salvar Visual
          </button>
        </div>
      </div>
    </div>
  );
}
