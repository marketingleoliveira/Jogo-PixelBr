import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — Pixel Hotel" },
      { name: "description", content: "Entre no Pixel Hotel para criar seu avatar e visitar seu quarto." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already signed in, bounce to /room
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/room" });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/room" },
        });
        if (error) throw error;
        navigate({ to: "/room" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/room" });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const google = async () => {
    setError(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/room",
    });
    if (result.error) setError(result.error.message ?? "Falha no login com Google");
    if (!result.redirected && !result.error) navigate({ to: "/room" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="panel p-6 w-full max-w-md">
        <h1 className="display text-xl mb-1">
          {mode === "signin" ? "Entrar no hotel" : "Criar conta"}
        </h1>
        <p className="text-lg opacity-80 mb-4">
          {mode === "signin" ? "Bem-vindo de volta, habitante!" : "Escolha uma chave para seu quarto."}
        </p>

        <button onClick={google} className="btn-pixel w-full mb-4" data-variant="accent">
          Continuar com Google
        </button>
        <div className="flex items-center gap-2 my-3 opacity-60">
          <div className="flex-1 h-[2px] bg-border" />
          <span className="text-sm">ou</span>
          <div className="flex-1 h-[2px] bg-border" />
        </div>

        <form onSubmit={submit} className="space-y-3">
          <label className="block">
            <span className="text-sm display">Email</span>
            <input className="pixel-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label className="block">
            <span className="text-sm display">Senha</span>
            <input className="pixel-input" type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>
          {error && <div className="text-destructive text-sm">{error}</div>}
          <button className="btn-pixel w-full" disabled={loading}>
            {loading ? "Aguarde..." : mode === "signin" ? "Entrar" : "Criar minha conta"}
          </button>
        </form>

        <button
          className="mt-4 text-sm underline block mx-auto"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          type="button"
        >
          {mode === "signin" ? "Ainda não tem conta? Criar uma." : "Já tem conta? Entrar."}
        </button>
      </div>
    </div>
  );
}