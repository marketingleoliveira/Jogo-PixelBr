import { useState, useEffect } from "react";

const STEPS = [
  {
    title: "Bem-vindo ao Hotel!",
    content: "Este é o seu quarto isométrico. Use o mouse para explorar o ambiente.",
    target: "room",
  },
  {
    title: "Como se mover",
    content: "Clique em qualquer tile (quadrado) do chão para seu avatar caminhar até lá.",
    target: "tiles",
  },
  {
    title: "Fale com outros",
    content: "Use a barra na parte inferior para enviar mensagens. Todos no quarto verão seus balões!",
    target: "chat",
  },
  {
    title: "Visite outros quartos",
    content: "Clique no botão 'Navegador' para ver quem mais está online e visitar outros quartos.",
    target: "navigator",
  },
];

export function Tutorial({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);

  const next = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 pointer-events-none p-4">
      <div className="panel w-full max-w-sm pointer-events-auto shadow-2xl border-primary animate-in fade-in zoom-in duration-300">
        <div className="p-3 border-b-2 border-border bg-primary/20 flex justify-between items-center">
          <span className="display text-[0.6rem]">{STEPS[step].title}</span>
          <span className="text-xs opacity-60">{step + 1} / {STEPS.length}</span>
        </div>
        <div className="p-4 text-center">
          <p className="text-xl mb-4 leading-relaxed">
            {STEPS[step].content}
          </p>
          <button onClick={next} className="btn-pixel w-full">
            {step < STEPS.length - 1 ? "Entendi!" : "Começar a Jogar"}
          </button>
        </div>
      </div>
    </div>
  );
}
