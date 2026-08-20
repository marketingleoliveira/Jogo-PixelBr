import { useEffect, useMemo, useRef, useState } from "react";
import { AvatarSprite, type Figure, directionFromDelta } from "./avatar";
import { toast } from "sonner";
import { findPath, type Point } from "./pathfind";
import { getLinePoints, canPlaceFurniture } from "./movement.utils";

export type Furniture = {
  id: string;
  x: number;
  y: number;
  type: 'chair' | 'table' | 'plant' | 'sofa' | 'rug';
  direction: number;
};

const TILE_W = 48;
const TILE_H = 48;
const WALL_H = 120;

export type ChatBubble = { id: string | number; text: string; ts: number; habboName?: string };

export function IsoRoom({
  width = 10,
  height = 10,
  figure,
  habboName,
  motto,
  startX = 5,
  startY = 5,
  onPositionChange,
  others = {},
  onStateChange,
  onChatSent,
  externalBubbles = [],
  unlockTrigger,
  furniture = [],
  onFurnitureClick,
  isDebug = false,
  isEditMode = false,
  onFurnitureMove,
  onFurnitureRotate,
  onEmote,
}: {
  width?: number;
  height?: number;
  figure: Figure;
  habboName: string;
  motto: string;
  startX?: number;
  startY?: number;
  onPositionChange?: (x: number, y: number) => void;
  others?: Record<string, any>;
  onStateChange?: (state: { x: number; y: number; direction: number; walking: boolean; sitting: boolean }) => void;
  onChatSent?: (text: string) => void;
  onEmote?: (emote: string | null) => void;
  externalBubbles?: ChatBubble[];
  unlockTrigger?: number;
  furniture?: Furniture[];
  onFurnitureClick?: (f: Furniture) => void;
  isDebug?: boolean;
  isEditMode?: boolean;
  onFurnitureMove?: (id: string, x: number, y: number) => void;
  onFurnitureRotate?: (id: string, dir: number) => void;
}) {
  const [pos, setPos] = useState<Point>({ x: startX, y: startY });
  const [direction, setDirection] = useState<0|1|2|3|4|5|6|7>(0);
  const [walking, setWalking] = useState(false);
  const [isSitting, setIsSitting] = useState(false);
  const [hoverTile, setHoverTile] = useState<Point | null>(null);
  const [currentEmote, setCurrentEmote] = useState<string | null>(null);
  const [bubbles, setBubbles] = useState<ChatBubble[]>([]);
  const [input, setInput] = useState("");
  const pathRef = useRef<Point[]>([]);
  const bubbleId = useRef(0);
  const lastStateSent = useRef<{ x: number; y: number; direction: number; walking: boolean; sitting?: boolean } | null>(null);


  // Walk animation loop
  useEffect(() => {
    if (!walking) return;
    const timer = setInterval(() => {
      // Get current path step
      const next = pathRef.current[0];
      
      if (!next) {
        setWalking(false);
        const finalState = { x: pos.x, y: pos.y, direction, walking: false, sitting: isSitting };
        onStateChange?.(finalState);
        lastStateSent.current = finalState;
        return;
      }

      // Check if next tile is actually reachable (adjacent)
      const dx = Math.abs(next.x - pos.x);
      const dy = Math.abs(next.y - pos.y);
      
      // If the character is "jumping" (not adjacent), recalculate path from current real position
      if (dx > 1 || dy > 1) {
        console.warn("Movement gap detected, recalculating path");
        const newPath = findPath(pos, pathRef.current[pathRef.current.length - 1], width, height);
        if (newPath.length) {
          pathRef.current = newPath;
          return; // Wait for next tick
        } else {
          setWalking(false);
          pathRef.current = [];
          return;
        }
      }

      // Remove the step we are about to take
      pathRef.current.shift();

      setPos((prev) => {
        const newDir = directionFromDelta(next.x - prev.x, next.y - prev.y);
        setDirection(newDir);
        onPositionChange?.(next.x, next.y);
        
        const newState = { x: next.x, y: next.y, direction: newDir, walking: true, sitting: false };
        if (JSON.stringify(lastStateSent.current) !== JSON.stringify(newState)) {
          onStateChange?.(newState);
          lastStateSent.current = newState;
        }
        setIsSitting(false);
        return next;
      });
    }, 240); // Slightly slower to match the interpolation
    return () => clearInterval(timer);
  }, [walking, onPositionChange, onStateChange, pos.x, pos.y, direction, width, height]);
  
  // Handle external unlock trigger
  useEffect(() => {
    if (unlockTrigger) {
      setWalking(false);
      pathRef.current = [];
      // Force position to stay where it is but stop movement
      onStateChange?.({ x: pos.x, y: pos.y, direction, walking: false, sitting: isSitting });
    }
  }, [unlockTrigger]);

  // Clean expired bubbles
  useEffect(() => {
    const t = setInterval(() => {
      const now = Date.now();
      setBubbles((b) => b.filter((x) => now - x.ts < 6000));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const handleTileClick = (x: number, y: number) => {
    if (isEditMode) {
      return;
    }
    
    // Grid snapping/Collision check for walking
    const isBlocked = furniture.some(f => f.x === x && f.y === y && f.type !== 'rug');
    if (isBlocked) {
      toast.error("Caminho bloqueado!");
      return;
    }

    const path = findPath(pos, { x, y }, width, height);
    if (!path.length) return;
    pathRef.current = path;
    setWalking(true);
    setIsSitting(false);
    onStateChange?.({ x: pos.x, y: pos.y, direction, walking: true, sitting: false });
  };

  const handleFurniClick = (e: React.MouseEvent, f: Furniture) => {
    e.stopPropagation();
    if (isEditMode) {
      onFurnitureClick?.(f);
      return;
    }

    if (f.type === 'chair' || f.type === 'sofa') {
      // Walk to it then sit
      const path = findPath(pos, { x: f.x, y: f.y }, width, height);
      if (path.length > 0) {
        pathRef.current = path;
        setWalking(true);
        // We'll set sitting=true when we arrive
      } else if (pos.x === f.x && pos.y === f.y) {
        setIsSitting(true);
        setDirection(f.direction as any);
        onStateChange?.({ x: pos.x, y: pos.y, direction: f.direction as any, walking: false, sitting: true });
      }
    }
  };

  // Add a specific arrival check in the walk loop
  useEffect(() => {
    if (!walking && !pathRef.current.length) {
      // Check if we are on a seat
      const seat = furniture.find(f => f.x === pos.x && f.y === pos.y && (f.type === 'chair' || f.type === 'sofa'));
      if (seat) {
        setIsSitting(true);
        setDirection(seat.direction as any);
      }
    }
  }, [walking, pos, furniture]);

  const sendChat = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim().toLowerCase();
    if (!text) return;

    if (text === "/dance" || text === ":dance") {
      const e = currentEmote === "dance" ? null : "dance";
      setCurrentEmote(e);
      onEmote?.(e);
      setInput("");
      return;
    }
    if (text === "/wave" || text === ":wave") {
      const e = currentEmote === "wave" ? null : "wave";
      setCurrentEmote(e);
      onEmote?.(e);
      setInput("");
      return;
    }
    if (text === "/jump" || text === ":jump") {
      const e = currentEmote === "jump" ? null : "jump";
      setCurrentEmote(e);
      onEmote?.(e);
      setInput("");
      return;
    }
    if (text === "/stop") {
      setCurrentEmote(null);
      onEmote?.(null);
      setInput("");
      return;
    }

    setBubbles((b) => [...b, { id: ++bubbleId.current, text: input.trim().slice(0, 120), ts: Date.now() }]);
    onChatSent?.(input.trim().slice(0, 120));
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

          {/* furniture */}
          {furniture
            .sort((a, b) => (a.x + a.y) - (b.x + b.y))
            .map((f) => (
              <div
                key={f.id}
                className={`iso-furniture ${isEditMode ? 'cursor-move hover:ring-2 ring-white/50' : ''}`}
                onClick={(e) => handleFurniClick(e, f)}
                onContextMenu={(e) => {
                  if (isEditMode) {
                    e.preventDefault();
                    onFurnitureRotate?.(f.id, (f.direction + 2) % 8);
                  }
                }}
                style={{
                  ...tileStyle(f.x, f.y),
                  zIndex: f.x + f.y + (f.type === 'rug' ? 0 : 5),
                  pointerEvents: "auto",
                }}
              >
                <div className="flex items-center justify-center w-full h-full text-4xl select-none">
                  {f.type === 'chair' && (f.direction === 0 ? '🪑' : '🛋️')}
                  {f.type === 'table' && '🧱'}
                  {f.type === 'plant' && '🌵'}
                  {f.type === 'sofa' && (f.direction === 0 ? '🛋️' : '🛏️')}
                  {f.type === 'rug' && '🧶'}
                </div>
              </div>
            ))}

          {/* other players */}
          {[...Object.values(others)]
            .sort((a, b) => (a.x + a.y) - (b.x + b.y))
            .map((other: any) => {
              const oLeft = other.x * TILE_W + TILE_W / 2;
              const oTop = other.y * TILE_H + TILE_H / 2;
              const otherBubbles = externalBubbles
                .filter((b) => b.habboName === other.habbo_name)
                .slice(-2);

              return (
                <div key={other.id}>
                  <div className="iso-shadow" style={{ left: oLeft, top: oTop }} />
                  <div
                    className="iso-avatar"
                    data-walking={other.walking}
                    data-sitting={other.sitting}
                    style={{
                      left: oLeft,
                      top: oTop,
                      marginLeft: -20,
                      marginTop: other.sitting ? -45 : -60,
                      transition: "all 0.22s linear", // Client-side prediction / interpolation
                      zIndex: other.x + other.y + 10,
                    }}
                  >

                    <div style={{ position: "relative" }}>
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
                        {otherBubbles.map((b) => (
                          <div key={b.id} className="chat-bubble bubble-anim">
                            <b>{b.habboName}:</b> {b.text}
                          </div>
                        ))}
                      </div>
                      <div className={other.emote ? `avatar-${other.emote}` : ""}>
                        <AvatarSprite figure={other.figure} direction={other.direction} size={40} />
                      </div>
                      <div className="habbo-name-plate">
                        {other.habbo_name}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

          {/* my avatar */}
          <div className="iso-shadow" style={{ left: avatarLeft, top: avatarTop }} />
          <div
            className="iso-avatar"
            data-walking={walking}
            data-sitting={isSitting}
            style={{
              left: avatarLeft,
              top: avatarTop,
              marginLeft: -20,
              marginTop: isSitting ? -45 : -60,
              zIndex: pos.x + pos.y + 11,
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
              <div className={currentEmote ? `avatar-${currentEmote}` : ""}>
                <AvatarSprite figure={figure} direction={direction} size={40} />
              </div>
              <div className="habbo-name-plate">
                {habboName}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Debug Panel */}
      {isDebug && (
        <div className="absolute top-20 left-4 bg-black/70 text-green-400 p-3 text-[10px] font-mono z-50 rounded border border-green-400/30">
          <div>POS: {pos.x}, {pos.y}</div>
          <div>DIR: {direction}</div>
          <div>WALK: {walking ? 'YES' : 'NO'}</div>
          <div>SIT: {isSitting ? 'YES' : 'NO'}</div>
          <div>PATH: {pathRef.current.length} steps left</div>
        </div>
      )}

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