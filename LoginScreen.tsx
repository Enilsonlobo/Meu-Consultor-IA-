/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { auth } from "../supabase";
import { Sparkles, Mail, Lock, AlertCircle, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import { motion } from "motion/react";

interface LoginScreenProps {
  onSuccess: () => void;
  onBackToLanding: () => void;
  initialMode?: 'login' | 'signup' | 'forgot';
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onSuccess, onBackToLanding, initialMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);

  React.useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Por favor, preencha o campo de e-mail.");
      return;
    }

    if (mode !== 'forgot' && !password) {
      setError("Por favor, insira sua senha.");
      return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        await auth.signInWithEmailAndPassword(cleanEmail, password);
        onSuccess();
      } else if (mode === 'signup') {
        if (password !== confirmPassword) {
          setError("As senhas inseridas não coincidem.");
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError("Sua senha deve conter pelo menos 6 caracteres.");
          setLoading(false);
          return;
        }
        await auth.createUserWithEmailAndPassword(cleanEmail, password);
        setMessage("Conta criada com sucesso!");
        setTimeout(() => {
          onSuccess();
        }, 1000);
      } else if (mode === 'forgot') {
        await auth.sendPasswordResetEmail(cleanEmail);
        setMessage("Se as credenciais corresponderem a uma conta ativa, você receberá um link para redefinir sua senha.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erro inesperado ao autenticar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div id="login-screen-root" className="min-h-screen bg-slate-900 flex flex-col justify-start md:justify-center items-center px-4 md:px-6 py-8 md:py-16 relative overflow-y-auto">
      
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Launcher Logo */}
      <div className="w-full max-w-md flex justify-start mb-6 z-20 md:absolute md:top-8 md:left-8 md:mb-0 md:w-auto">
        <button
          id="btn-login-back-landing"
          onClick={onBackToLanding}
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-white font-semibold transition-colors outline-none cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para a Landing Page</span>
        </button>
      </div>

      {/* Main Login Card Layout */}
      <motion.div
        id="login-form-card"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-slate-950/80 border border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl relative z-10 backdrop-blur-md md:my-auto my-4"
      >
        {/* Brand Banner */}
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex bg-indigo-600 text-white p-3 rounded-2xl shadow-lg shadow-indigo-600/15 mb-2 justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Meu Consultor IA<span className="text-indigo-500">®</span>
          </h2>
          <p className="text-slate-400 text-xs">
            {mode === 'login' && "Acesse sua conta para continuar sua consultoria empresarial."}
            {mode === 'signup' && "Crie e registre sua senha de acesso para o seu e-mail liberado."}
            {mode === 'forgot' && "Digite seu e-mail para recuperar seu acesso corporativo."}
          </p>
        </div>

        {/* Navigation Tabs for Login and Sign up */}
        {mode !== 'forgot' && (
          <div className="flex bg-slate-900 p-1 rounded-xl mb-6 border border-slate-800">
            <button
              id="tab-login-btn"
              type="button"
              onClick={() => {
                setError(null);
                setMessage(null);
                setMode('login');
              }}
              className={`flex-1 py-2.5 text-[11px] sm:text-xs font-bold px-1 rounded-lg transition-all cursor-pointer outline-none ${
                mode === 'login' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Acessar Minha Conta
            </button>
            <button
              id="tab-signup-btn"
              type="button"
              onClick={() => {
                setError(null);
                setMessage(null);
                setMode('signup');
              }}
              className={`flex-1 py-2.5 text-[11px] sm:text-xs font-bold px-1 rounded-lg transition-all cursor-pointer outline-none ${
                mode === 'signup' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Cadastrar Minha Senha
            </button>
          </div>
        )}

        {/* Alert Notifications */}
        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-xs flex items-start gap-2.5 mb-6">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl text-xs flex items-start gap-2.5 mb-6">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{message}</span>
          </div>
        )}

        {/* Action Form */}
        <form id="auth-action-form" onSubmit={handleAction} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Endereço de E-mail</label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-slate-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                id="login-email-input"
                type="email"
                placeholder="nome@suaempresa.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl text-sm focus:outline-none placeholder-slate-600 text-slate-200"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Senha de Acesso</label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-slate-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="login-password-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Sua senha secreta"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl text-sm focus:outline-none placeholder-slate-600 text-slate-200"
                />
              </div>
            </div>
          )}

          {mode === 'signup' && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Confirmar Senha</label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-slate-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="login-confirm-password-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Repita sua senha secreta"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl text-sm focus:outline-none placeholder-slate-600 text-slate-200"
                />
              </div>
            </div>
          )}

          {/* Show Password Option */}
          {mode !== 'forgot' && (
            <div className="flex items-center pt-1 pb-1">
              <input
                id="checkbox-show-password"
                type="checkbox"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                className="w-4 h-4 text-indigo-600 bg-slate-900 border-slate-800 rounded focus:ring-indigo-500 focus:ring-offset-slate-900 cursor-pointer"
              />
              <label htmlFor="checkbox-show-password" className="ml-2 text-xs text-slate-400 hover:text-slate-300 cursor-pointer select-none">
                Mostrar caracteres da senha
              </label>
            </div>
          )}

          {/* Forgot link (only during login mode) */}
          {mode === 'login' && (
            <div className="text-right">
              <button
                id="btn-forgot-password-trigger"
                type="button"
                onClick={() => setMode('forgot')}
                className="text-xs text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer outline-none"
              >
                Esqueceu sua senha?
              </button>
            </div>
          )}

          {/* Submit Action Button */}
          <button
            id="btn-auth-submit"
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-semibold rounded-xl text-sm shadow-md shadow-indigo-600/10 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>{loading ? "Processando..." : mode === 'login' ? "Entrar na Plataforma" : mode === 'signup' ? "Cadastrar Minha Senha & Entrar" : "Enviar Link de Recuperação"}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Auth mode switches */}
        <div className="mt-8 text-center text-xs text-slate-400 space-y-3 border-t border-slate-900 pt-6">
          {mode === 'login' && (
            <p className="text-slate-500">
              Primeiro acesso ou sem senha cadastrada?{" "}
              <button
                id="btn-switch-signup"
                type="button"
                onClick={() => {
                  setError(null);
                  setMessage(null);
                  setMode('signup');
                }}
                className="font-bold text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer outline-none ml-1"
              >
                Cadastre sua Senha aqui
              </button>
            </p>
          )}

          {mode === 'signup' && (
            <p className="text-slate-500">
              Já possui sua senha cadastrada?{" "}
              <button
                id="btn-switch-login-from-signup"
                type="button"
                onClick={() => {
                  setError(null);
                  setMessage(null);
                  setMode('login');
                }}
                className="font-bold text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer outline-none ml-1"
              >
                Acessar Minha Conta
              </button>
            </p>
          )}

          {mode === 'forgot' && (
            <p className="text-slate-500">
              Lembrou sua senha?{" "}
              <button
                id="btn-switch-login-from-forgot"
                type="button"
                onClick={() => {
                  setError(null);
                  setMessage(null);
                  setMode('login');
                }}
                className="font-bold text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer outline-none ml-1"
              >
                Voltar para o Login
              </button>
            </p>
          )}
        </div>

      </motion.div>
    </div>
  );
};
