import type { CSSProperties } from "react";

export type Figure = {
  skin: string;
  hair: "short" | "long" | "cap" | "bald";
  hair_color: string;
  shirt: "tee" | "hoodie" | "dress";
  shirt_color: string;
  pants_color: string;
};

export const DEFAULT_FIGURE: Figure = {
  skin: "#f5c99a",
  hair: "short",
  hair_color: "#5a2f14",
  shirt: "tee",
  shirt_color: "#e0483d",
  pants_color: "#2b3a67",
};

export const SKIN_TONES = ["#fbe0c4", "#f5c99a", "#e0a97a", "#b57a4c", "#7a4a2a", "#3d2416"];
export const HAIR_COLORS = ["#1a1a1a", "#5a2f14", "#a86432", "#e6b74a", "#d94a4a", "#4d5bf9", "#ffffff"];
export const SHIRT_COLORS = ["#e0483d", "#f2a93b", "#6bc06b", "#3d8bd9", "#8a4dd6", "#ffffff", "#1a1a1a"];
export const PANTS_COLORS = ["#2b3a67", "#1a1a1a", "#5a2f14", "#3a7d4c", "#8a4dd6", "#c25757"];
export const HAIR_STYLES: Figure["hair"][] = ["short", "long", "cap", "bald"];
export const SHIRT_STYLES: Figure["shirt"][] = ["tee", "hoodie", "dress"];

type Direction = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7; // 0=south, cw

export function AvatarSprite({
  figure,
  size = 64,
  direction = 0,
  style,
}: {
  figure: Figure;
  size?: number;
  direction?: Direction;
  style?: CSSProperties;
}) {
  const flip = direction >= 3 && direction <= 5; // west-ish faces left
  return (
    <svg
      viewBox="0 0 32 48"
      width={size}
      height={(size * 48) / 32}
      shapeRendering="crispEdges"
      style={{ transform: flip ? "scaleX(-1)" : undefined, ...style }}
    >
      {/* shadow */}
      <ellipse cx="16" cy="46" rx="8" ry="1.5" fill="rgba(0,0,0,0.35)" />

      {/* legs */}
      <rect x="11" y="30" width="4" height="12" fill={figure.pants_color} />
      <rect x="17" y="30" width="4" height="12" fill={figure.pants_color} />
      <rect x="19" y="30" width="2" height="12" fill="#000" opacity={0.22} />
      <rect x="13" y="30" width="2" height="12" fill="#000" opacity={0.22} />
      <rect x="11" y="42" width="4" height="3" fill="#1a1a1a" />
      <rect x="17" y="42" width="4" height="3" fill="#1a1a1a" />

      {/* body (shirt) */}
      {figure.shirt === "dress" ? (
        <polygon points="8,20 24,20 27,34 5,34" fill={figure.shirt_color} />
      ) : (
        <rect x="9" y="18" width="14" height="14" fill={figure.shirt_color} />
      )}
      {/* body shading: light from top-left, shade on right */}
      <rect x="19" y="18" width="4" height="14" fill="#000" opacity={0.16} />
      <rect x="9" y="18" width="3" height="14" fill="#fff" opacity={0.16} />
      {figure.shirt === "hoodie" && (
        <rect x="9" y="17" width="14" height="3" fill={figure.shirt_color} opacity={0.8} />
      )}

      {/* arms */}
      <rect x="6" y="18" width="4" height="12" fill={figure.shirt_color} />
      <rect x="22" y="18" width="4" height="12" fill={figure.shirt_color} />
      <rect x="24" y="18" width="2" height="12" fill="#000" opacity={0.2} />
      <rect x="6" y="18" width="1" height="12" fill="#fff" opacity={0.18} />
      <rect x="6" y="28" width="4" height="3" fill={figure.skin} />
      <rect x="22" y="28" width="4" height="3" fill={figure.skin} />

      {/* neck */}
      <rect x="14" y="16" width="4" height="3" fill={figure.skin} />
      <rect x="9" y="16" width="14" height="2" fill="#000" opacity={0.18} />

      {/* head */}
      <rect x="9" y="4" width="14" height="14" fill={figure.skin} />
      <rect x="20" y="4" width="3" height="14" fill="#000" opacity={0.14} />
      <rect x="9" y="4" width="2" height="14" fill="#fff" opacity={0.14} />
      {/* cheeks */}
      <rect x="10" y="12" width="2" height="2" fill="#e08a7a" opacity={0.5} />
      <rect x="20" y="12" width="2" height="2" fill="#e08a7a" opacity={0.5} />

      {/* eyes — front-facing only for south/east/west; back = no eyes */}
      {direction !== 4 && (
        <>
          <rect x="12" y="10" width="2" height="2" fill="#1a1a1a" />
          <rect x="18" y="10" width="2" height="2" fill="#1a1a1a" />
          <rect x="13" y="14" width="6" height="1" fill="#a83a3a" />
        </>
      )}

      {/* hair */}
      {figure.hair === "short" && (
        <>
          <rect x="9" y="3" width="14" height="4" fill={figure.hair_color} />
          <rect x="8" y="5" width="2" height="4" fill={figure.hair_color} />
          <rect x="22" y="5" width="2" height="4" fill={figure.hair_color} />
        </>
      )}
      {figure.hair === "long" && (
        <>
          <rect x="9" y="3" width="14" height="5" fill={figure.hair_color} />
          <rect x="7" y="5" width="3" height="12" fill={figure.hair_color} />
          <rect x="22" y="5" width="3" height="12" fill={figure.hair_color} />
        </>
      )}
      {figure.hair === "cap" && (
        <>
          <rect x="8" y="4" width="16" height="4" fill={figure.hair_color} />
          <rect x="18" y="8" width="8" height="2" fill={figure.hair_color} />
        </>
      )}
      {figure.hair === "bald" && null}
    </svg>
  );
}

export function directionFromDelta(dx: number, dy: number): Direction {
  if (dx === 0 && dy > 0) return 0;
  if (dx > 0 && dy > 0) return 1;
  if (dx > 0 && dy === 0) return 2;
  if (dx > 0 && dy < 0) return 3;
  if (dx === 0 && dy < 0) return 4;
  if (dx < 0 && dy < 0) return 5;
  if (dx < 0 && dy === 0) return 6;
  return 7;
}