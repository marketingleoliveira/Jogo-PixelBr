import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AvatarSprite, DEFAULT_FIGURE, type Figure } from "@/game/avatar";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pixel Hotel — o hotel virtual em pixel art" },
      {
        name: "description",
        content:
          "Crie seu avatar, decore seu quarto isométrico e converse com balões no Pixel Hotel, o hotel virtual em pixel art inspirado nos clássicos.",
      },
      { property: "og:title", content: "Pixel Hotel — o hotel virtual em pixel art" },
      {
        property: "og:description",
        content: "Avatar customizável, quartos isométricos e chat com balões. Entre no hotel.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const CREWS: { name: string; figure: Figure }[] = [
  { name: "Lua", figure: { ...DEFAULT_FIGURE, hair: "long", hair_color: "#e6b74a", shirt_color: "#e0483d" } },
  { name: "Duda", figure: { ...DEFAULT_FIGURE, skin: "#b57a4c", hair: "cap", shirt_color: "#3d8bd9" } },
  { name: "Zeca", figure: { ...DEFAULT_FIGURE, hair: "short", hair_color: "#1a1a1a", shirt_color: "#6bc06b" } },
  { name: "Nina", figure: { ...DEFAULT_FIGURE, skin: "#7a4a2a", hair: "long", hair_color: "#d94a4a", shirt: "dress" } },
];

const NEWS = [
  { tag: "NOVO", title: "O Hotel abriu as portas", text: "Crie sua conta, monte seu visual e conheça o lobby isométrico." },
  { tag: "EVENTO", title: "Festa de inauguração", text: "Encontre os primeiros habitantes e ganhe o distintivo de pioneiro." },
  { tag: "DICA", title: "Como andar pelo quarto", text: "Clique em qualquer piso e seu avatar traça o caminho sozinho." },
];

const ROOMS = [
  { name: "Lobby Principal", people: 0, color: "var(--color-tile)" },
  { name: "Café do Hotel", people: 0, color: "var(--color-accent)" },
  { name: "Piscina", people: 0, color: "var(--color-sky-a)" },
];

function RoomScene() {
  return (
    <div style={{ perspective: 1100 }} className="h-72 md:h-96 relative overflow-hidden">
      <div
        style={{
          transform: "rotateX(60deg) rotateZ(-45deg)",
          transformStyle: "preserve-3d",
          width: 400,
          height: 400,
          position: "absolute",
          left: "50%",
          top: "45%",
          marginLeft: -200,
          marginTop: -200,
        }}
      >
        {Array.from({ length: 8 }).map((_, y) =>
          Array.from({ length: 8 }).map((_, x) => (
            <div
              key={`${x}-${y}`}
              className="iso-tile"
              style={{
                left: x * 50,
                top: y * 50,
                width: 50,
                height: 50,
                background: (x + y) % 2 ? "var(--color-tile-alt)" : "var(--color-tile)",
              }}
            />
          )),
        )}
        {CREWS.map((c, i) => {
          const spots = [
            [2, 3],
            [4, 2],
            [5, 5],
            [3, 6],
          ][i] as [number, number];
          return (
            <div
              key={c.name}
              className="iso-avatar"
              style={{ left: spots[0] * 50 + 25, top: spots[1] * 50 + 25, marginLeft: -20, marginTop: -58 }}
            >
              <AvatarSprite figure={c.figure} size={44} />
            </div>
          );
        })}
      </div>

      <div className="chat-bubble absolute left-8 top-6 floaty">Bem-vindo ao hotel!</div>
      <div className="chat-bubble absolute right-6 top-24 floaty" style={{ animationDelay: "1.2s" }}>
        alguém pra dançar? :)
      </div>
    </div>
  );
}

function Landing() {
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    // Basic presence tracking for the landing page
    const channel = supabase.channel('online-count');
    
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setOnlineCount(Object.keys(state).length);
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* clouds */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {[
          { top: 60, w: 120, h: 34, dur: 70 },
          { top: 180, w: 180, h: 44, dur: 95 },
          { top: 330, w: 90, h: 26, dur: 55 },
        ].map((c, i) => (
          <div
            key={i}
            className="cloud cloud-drift"
            style={{ top: c.top, width: c.w, height: c.h, animationDuration: `${c.dur}s`, animationDelay: `${i * -12}s` }}
          />
        ))}
      </div>

      {/* Top bar */}
      <div className="topbar relative z-10">
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between text-sm">
          <span className="display text-[0.55rem]">PIXEL HOTEL BRASIL</span>
          <span className="opacity-80">Hotel aberto · versão beta</span>
        </div>
      </div>

      {/* Nav */}
      <header className="relative z-10 max-w-6xl mx-auto w-full px-4 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 grid place-items-center bg-primary border-[3px] border-border shadow-[4px_4px_0_0_var(--color-border)]">
            <span className="display text-xs">PH</span>
          </div>
          <span className="wordmark text-lg md:text-2xl">Pixel Hotel</span>
        </div>
        <nav className="flex gap-2">
          <Link to="/auth" className="btn-pixel" data-variant="ghost">
            Entrar
          </Link>
          <Link to="/auth" className="btn-pixel">
            Criar conta
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex-1 w-full">
        <section className="max-w-6xl mx-auto px-4 grid lg:grid-cols-[1.05fr_1fr] gap-8 items-center py-6">
          <div>
            <h1 className="wordmark text-3xl md:text-5xl leading-[1.25] mb-5">
              Entre. Faça amigos.
              <br />
              Construa seu quarto.
            </h1>
            <p className="text-2xl mb-6 max-w-lg">
              Um hotel virtual em pixel art: avatar do seu jeito, quartos isométricos e conversa em balões.
              Gratuito e feito para a comunidade brasileira.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/auth" className="btn-pixel">
                Jogue agora
              </Link>
              <a href="#novidades" className="btn-pixel" data-variant="secondary">
                Novidades
              </a>
            </div>
            <div className="mt-7 flex items-center gap-3 flex-wrap">
              {CREWS.map((c) => (
                <div key={c.name} className="flex flex-col items-center">
                  <AvatarSprite figure={c.figure} size={46} />
                  <span className="text-sm opacity-80">{c.name}</span>
                </div>
              ))}
              <span className="text-lg ml-2">
                <b>{onlineCount}</b> habitantes online agora
              </span>
            </div>
          </div>

          <div className="panel p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="display text-[0.55rem] opacity-70">LOBBY PRINCIPAL</span>
              <span className="tag-pixel">AO VIVO</span>
            </div>
            <RoomScene />
          </div>
        </section>

        {/* News */}
        <section id="novidades" className="max-w-6xl mx-auto w-full px-4 py-10">
          <h2 className="wordmark text-xl md:text-2xl mb-5">Novidades do Hotel</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {NEWS.map((n) => (
              <article key={n.title} className="card-pixel p-4">
                <span className="tag-pixel mb-3">{n.tag}</span>
                <h3 className="display text-[0.7rem] leading-relaxed mt-3 mb-2">{n.title}</h3>
                <p className="text-xl">{n.text}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Rooms */}
        <section className="max-w-6xl mx-auto w-full px-4 pb-10">
          <h2 className="wordmark text-xl md:text-2xl mb-5">Quartos em destaque</h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {ROOMS.map((r) => (
              <div key={r.name} className="card-pixel p-4">
                <div className="h-24 border-[3px] border-border mb-3" style={{ background: r.color }} />
                <div className="display text-[0.65rem] mb-1">{r.name}</div>
                <div className="text-lg opacity-75">{r.people} pessoas dentro</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto w-full px-4 pb-14">
          <div className="panel p-6 text-center">
            <h2 className="wordmark text-xl md:text-2xl mb-3">Seu quarto está esperando</h2>
            <p className="text-2xl mb-5">Crie sua conta em segundos e escolha seu visual.</p>
            <Link to="/auth" className="btn-pixel">
              Criar minha conta
            </Link>
          </div>
        </section>
      </main>

      <footer className="relative z-10 topbar py-6">
        <div className="max-w-6xl mx-auto px-4 text-sm flex flex-wrap gap-3 justify-between">
          <span>Pixel Hotel © {new Date().getFullYear()} — feito com pixels e saudade.</span>
          <span className="opacity-70">Projeto de fã, sem vínculo com outros hotéis virtuais.</span>
        </div>
      </footer>
    </div>
  );
}
