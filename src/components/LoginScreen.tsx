import React, { useState } from "react";
import { auth } from "../supabase";
import { Sparkles, Mail, Lock, AlertCircle, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import { motion } from "motion/react";

interface LoginScreenProps {
  onSuccess: () => void;
  onBackToLanding: () => void;
  initialMode?: "login" | "signup" | "forgot";
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onSuccess,
  onBackToLanding,
  initialMode = "login",
}) => {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => setMode(initialMode), [initialMode]);

  const changeMode = (next: "login" | "signup" | "forgot") => {
    setError(null);
    setMessage(null);
    setMode(next);
  };

  const handleAction = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return setError("Preencha o seu e-mail.");
    if (mode !== "forgot" && !password) return setError("Digite a sua senha.");

    if (mode === "signup") {
      if (password.length < 6) return setError("A senha deve ter pelo menos 6 caracteres.");
      if (password !== confirmPassword) return setError("As senhas não coincidem.");
    }

    setLoading(true);
    try {
      if (mode === "login") {
        await auth.signInWithEmailAndPassword(cleanEmail, password);
        onSuccess();
        return;
      }

      if (mode === "signup") {
        const result = await auth.createUserWithEmailAndPassword(cleanEmail, password);
        if (result.session) {
          setMessage("Conta criada. Acesso liberado com sucesso.");
          onSuccess();
        } else {
          setMessage("Conta criada. Confira seu e-mail para confirmar o cadastro e depois faça o login.");
          setPassword("");
          setConfirmPassword("");
          setMode("login");
        }
        return;
      }

      await auth.sendPasswordResetEmail(cleanEmail);
      setMessage("Enviamos as instruções de recuperação. Confira também a caixa de spam.");
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Não foi possível concluir a operação.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center px-4 py-10 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-500/5 rounded-full blur-3xl pointer-events-none" />

      <button
        onClick={onBackToLanding}
        className="absolute top-6 left-6 flex items-center gap-2 text-xs text-slate-400 hover:text-white font-semibold transition-colors z-20"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </button>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-slate-950/80 border border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl relative z-10 backdrop-blur-md"
      >
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex bg-indigo-600 text-white p-3 rounded-2xl shadow-lg mb-2">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Meu Consultor IA<span className="text-indigo-500">®</span>
          </h2>
          <p className="text-slate-400 text-xs">
            {mode === "login" && "Entre com seu e-mail e sua senha."}
            {mode === "signup" && "Crie sua conta para acessar a plataforma."}
            {mode === "forgot" && "Receba por e-mail o link de recuperação."}
          </p>
        </div>

        {mode !== "forgot" && (
          <div className="flex bg-slate-900 p-1 rounded-xl mb-6 border border-slate-800">
            <button type="button" onClick={() => changeMode("login")} className={`flex-1 py-2.5 text-xs font-bold rounded-lg ${mode === "login" ? "bg-indigo-600 text-white" : "text-slate-400"}`}>
              Entrar
            </button>
            <button type="button" onClick={() => changeMode("signup")} className={`flex-1 py-2.5 text-xs font-bold rounded-lg ${mode === "signup" ? "bg-indigo-600 text-white" : "text-slate-400"}`}>
              Criar conta
            </button>
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-xs flex gap-2.5 mb-6">
            <AlertCircle className="w-4 h-4 shrink-0" /><span>{error}</span>
          </div>
        )}
        {message && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl text-xs flex gap-2.5 mb-6">
            <CheckCircle className="w-4 h-4 shrink-0" /><span>{message}</span>
          </div>
        )}

        <form onSubmit={handleAction} className="space-y-4">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
            E-mail
            <div className="relative mt-1">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nome@suaempresa.com.br" className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl text-sm focus:outline-none text-slate-200" />
            </div>
          </label>

          {mode !== "forgot" && (
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Senha
              <div className="relative mt-1">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input type={showPassword ? "text" : "password"} autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl text-sm focus:outline-none text-slate-200" />
              </div>
            </label>
          )}

          {mode === "signup" && (
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Confirmar senha
              <div className="relative mt-1">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input type={showPassword ? "text" : "password"} autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl text-sm focus:outline-none text-slate-200" />
              </div>
            </label>
          )}

          {mode !== "forgot" && (
            <label className="flex items-center text-xs text-slate-400 cursor-pointer">
              <input type="checkbox" checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)} className="mr-2" />
              Mostrar senha
            </label>
          )}

          {mode === "login" && (
            <div className="text-right">
              <button type="button" onClick={() => changeMode("forgot")} className="text-xs text-slate-400 hover:text-indigo-400">Esqueceu sua senha?</button>
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2">
            {loading ? "Processando..." : mode === "login" ? "Entrar" : mode === "signup" ? "Criar conta" : "Enviar recuperação"}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {mode === "forgot" && (
          <div className="mt-6 text-center">
            <button type="button" onClick={() => changeMode("login")} className="text-xs font-bold text-indigo-400 hover:underline">Voltar para o login</button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
