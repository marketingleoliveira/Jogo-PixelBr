import { createFileRoute, Link } from "@tanstack/react-router";
import { AvatarSprite, DEFAULT_FIGURE } from "@/game/avatar";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 grid place-items-center bg-primary border-[3px] border-border">
            <span className="display text-xs">PH</span>
          </div>
          <span className="display text-lg">Pixel Hotel</span>
        </div>
        <nav className="flex gap-2">
          <Link to="/auth" className="btn-pixel" data-variant="ghost">Entrar</Link>
          <Link to="/auth" className="btn-pixel">Criar conta</Link>
        </nav>
      </header>

      {/* Hero */}
      <main className="flex-1 grid md:grid-cols-2 gap-8 px-6 py-8 max-w-6xl mx-auto w-full items-center">
        <div>
          <h1 className="display text-3xl md:text-5xl leading-tight mb-4">
            O hotel virtual em <span className="text-primary">pixel art</span> voltou.
          </h1>
          <p className="text-xl mb-6 max-w-md">
            Crie seu avatar, entre no seu quarto isométrico e converse com balões flutuantes.
            Um MMO em construção — comece agora e cresça junto.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/auth" className="btn-pixel">Entrar no Hotel</Link>
            <a href="#features" className="btn-pixel" data-variant="secondary">Saiba mais</a>
          </div>
          <div className="mt-8 flex items-center gap-4 opacity-80">
            <AvatarSprite figure={DEFAULT_FIGURE} size={48} />
            <AvatarSprite figure={{ ...DEFAULT_FIGURE, shirt_color: "#3d8bd9", hair: "long", hair_color: "#e6b74a" }} size={48} />
            <AvatarSprite figure={{ ...DEFAULT_FIGURE, shirt_color: "#6bc06b", hair: "cap", skin: "#b57a4c" }} size={48} />
            <span className="text-sm">Mais de <b>0</b> habitantes online agora.</span>
          </div>
        </div>

        {/* Preview room */}
        <div className="panel p-4">
          <div className="text-xs display mb-2 opacity-70">Prévia do quarto</div>
          <div style={{ perspective: 1000 }} className="h-64 relative overflow-hidden">
            <div
              style={{
                transform: "rotateX(60deg) rotateZ(-45deg)",
                transformStyle: "preserve-3d",
                width: 300, height: 300,
                position: "absolute", left: "50%", top: "40%",
                marginLeft: -150, marginTop: -150,
              }}
            >
              {Array.from({ length: 6 }).map((_, y) =>
                Array.from({ length: 6 }).map((_, x) => (
                  <div key={`${x}-${y}`} className="iso-tile" style={{
                    left: x * 50, top: y * 50, width: 50, height: 50,
                    background: (x + y) % 2 ? "var(--color-tile-alt)" : "var(--color-tile)",
                  }}/>
                )),
              )}
              <div className="iso-avatar" style={{ left: 150, top: 150, marginLeft: -20, marginTop: -60 }}>
                <AvatarSprite figure={DEFAULT_FIGURE} size={40} />
              </div>
            </div>
          </div>
        </div>
      </main>

      <section id="features" className="max-w-5xl mx-auto w-full px-6 py-12 grid md:grid-cols-3 gap-4">
        {[
          { t: "Avatar customizável", d: "Cabelo, roupa, pele e cor. Você escolhe." },
          { t: "Quarto isométrico", d: "Ande clicando nos tiles. Puro pixel art." },
          { t: "Chat com balões", d: "Fale e apareça em cima da sua cabeça." },
        ].map((f) => (
          <div key={f.t} className="panel p-4">
            <div className="display text-sm mb-2">{f.t}</div>
            <p className="text-lg">{f.d}</p>
          </div>
        ))}
      </section>

      <footer className="text-center py-6 text-sm opacity-70">
        Pixel Hotel © {new Date().getFullYear()} — feito com pixels e saudade.
      </footer>
    </div>
  );
}
