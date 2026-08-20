import { useEffect, useMemo, useRef, useState } from "react";
import { AvatarSprite, type Figure, directionFromDelta } from "./avatar";
import { findPath, type Point } from "./pathfind";

const TILE_W = 48;
const TILE_H = 48;

export type ChatBubble = { id: number; text: string; ts: number };

export function IsoRoom({
  width = 10,
  height = 10,
  figure,
  habboName,
  motto,
  startX = 5,
  startY = 5,
  onPositionChange,
}: {
  width?: number;
  height?: number;
  figure: Figure;
  habboName: string;
  motto: string;
  startX?: number;
  startY?: number;
  onPositionChange?: (x: number, y: number) => void;
}) {
  const [pos, setPos] = useState<Point>({ x: startX, y: startY });
  const [direction, setDirection] = useState<0|1|2|3|4|5|6|7>(0);
  const [walking, setWalking] = useState(false);
  const [hoverTile, setHoverTile] = useState<Point | null>(null);
  const [bubbles, setBubbles] = useState<ChatBubble[]>([]);
  const [input, setInput] = useState("");
  const pathRef = useRef<Point[]>([]);
  const bubbleId = useRef(0);

  // Walk animation loop
  useEffect(() => {
    if (!walking) return;
    const timer = setInterval(() => {
      const next = pathRef.current.shift();
      if (!next) {
        setWalking(false);
        return;
      }
      setPos((prev) => {
        setDirection(directionFromDelta(next.x - prev.x, next.y - prev.y));
        onPositionChange?.(next.x, next.y);
        return next;
      });
    }, 220);
    return () => clearInterval(timer);
  }, [walking, onPositionChange]);

  // Clean expired bubbles
  useEffect(() => {
    const t = setInterval(() => {
      const now = Date.now();
      setBubbles((b) => b.filter((x) => now - x.ts < 6000));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const handleTileClick = (x: number, y: number) => {
    const path = findPath(pos, { x, y }, width, height);
    if (!path.length) return;
    pathRef.current = path;
    setWalking(true);
  };

  const sendChat = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setBubbles((b) => [...b, { id: ++bubbleId.current, text: text.slice(0, 120), ts: Date.now() }]);
    setInput("");
  };

  // Convert grid (x,y) to screen (left,top) — isometric done via CSS rotate on scene wrapper.
  const tileStyle = (x: number, y: number) => ({
    left: x * TILE_W,
    top: y * TILE_H,
    width: TILE_W,
    height: TILE_H,
  });

  const avatarLeft = pos.x * TILE_W + TILE_W / 2;
  const avatarTop = pos.y * TILE_H + TILE_H / 2;

  const sceneSize = { w: width * TILE_W, h: height * TILE_H };

  // Latest bubble to display above avatar
  const activeBubbles = useMemo(() => bubbles.slice(-3), [bubbles]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-4">
      {/* Sky clouds */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="cloud" style={{ top: "8%", left: "10%", width: 120, height: 30 }} />
        <div className="cloud" style={{ top: "20%", left: "70%", width: 160, height: 34 }} />
        <div className="cloud" style={{ top: "40%", left: "30%", width: 90, height: 24 }} />
      </div>

      {/* Room stage */}
      <div
        className="relative"
        style={{
          width: sceneSize.w * 1.4,
          height: sceneSize.h * 1.2,
          perspective: 1200,
        }}
      >
        <div
          className="iso-scene absolute"
          style={{
            left: "50%",
            top: "40%",
            width: sceneSize.w,
            height: sceneSize.h,
            marginLeft: -sceneSize.w / 2,
            marginTop: -sceneSize.h / 2,
          }}
        >
          {/* tiles */}
          {/* depth: ground shadow + floor slab + walls */}
          <div className="iso-floor-shadow" />
          <div className="iso-slab" />
          <div
            className="iso-wall"
            data-side="north"
            style={{
              left: 0,
              top: 0,
              width: sceneSize.w,
              height: WALL_H,
              transform: "rotateX(-90deg)",
            }}
          >
            <div className="iso-wall-band" />
          </div>
          <div
            className="iso-wall"
            data-side="west"
            style={{
              left: 0,
              top: 0,
              width: sceneSize.h,
              height: WALL_H,
              transform: "rotateZ(90deg) rotateX(-90deg)",
            }}
          >
            <div className="iso-wall-band" />
          </div>

          {Array.from({ length: height }).map((_, y) =>
            Array.from({ length: width }).map((__, x) => {
              const isHover = hoverTile?.x === x && hoverTile?.y === y;
              const bg = isHover
                ? "var(--color-tile-hover)"
                : (x + y) % 2 === 0
                ? "var(--color-tile)"
                : "var(--color-tile-alt)";
              return (
                <div
                  key={`${x}-${y}`}
                  className="iso-tile"
                  style={{ ...tileStyle(x, y), background: bg }}
                  onMouseEnter={() => setHoverTile({ x, y })}
                  onMouseLeave={() => setHoverTile(null)}
                  onClick={() => handleTileClick(x, y)}
                />
              );
            }),
          )}

          {/* avatar */}
          <div className="iso-shadow" style={{ left: avatarLeft, top: avatarTop }} />
          <div
            className="iso-avatar"
            data-walking={walking}
            style={{
              left: avatarLeft,
              top: avatarTop,
              marginLeft: -20,
              marginTop: -60,
            }}
          >
            <div style={{ position: "relative" }}>
              {/* Chat bubbles + name plate live inside so they get counter-rotated with the avatar */}
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: -8,
                  transform: "translateX(-50%)",
                  display: "flex",
                  flexDirection: "column-reverse",
                  gap: 4,
                  alignItems: "center",
                  pointerEvents: "none",
                }}
              >
                {activeBubbles.map((b) => (
                  <div key={b.id} className="chat-bubble bubble-anim">
                    <b>{habboName}:</b> {b.text}
                  </div>
                ))}
              </div>
              <AvatarSprite figure={figure} direction={direction} size={40} />
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "100%",
                  transform: "translateX(-50%)",
                  marginTop: 2,
                  background: "var(--color-border)",
                  color: "white",
                  padding: "2px 6px",
                  fontFamily: "var(--font-sans)",
                  fontSize: 14,
                  whiteSpace: "nowrap",
                }}
              >
                {habboName}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* HUD */}
      <div className="w-full max-w-2xl panel p-3 flex items-center gap-3 relative z-10">
        <div className="hidden sm:block">
          <AvatarSprite figure={figure} size={40} />
        </div>
        <form onSubmit={sendChat} className="flex-1 flex gap-2">
          <input
            className="pixel-input"
            placeholder={`Falar como ${habboName}...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={120}
          />
          <button type="submit" className="btn-pixel">Falar</button>
        </form>
      </div>
      <div className="text-sm opacity-80 italic mt-1">"{motto}"</div>
    </div>
  );
}