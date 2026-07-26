import type { User } from "@supabase/supabase-js";
import type { UserProfile } from "./types";
import { supabase } from "./supabase";

const emptyPillars = {
  conhecimento: 0,
  relacionamento: 0,
  estrategia: 0,
  sistema: 0,
  comunicacao: 0,
  eficiencia: 0,
  resultados: 0,
};

function profileFromUser(user: User): UserProfile {
  const metadata = user.user_metadata || {};
  const now = new Date().toISOString();
  return {
    uid: user.id,
    email: user.email || "",
    displayName: metadata.display_name || metadata.full_name || user.email?.split("@")[0] || "Usuário",
    empresa: metadata.empresa || "",
    segmento: metadata.segmento || "",
    cidade: metadata.cidade || "",
    telefone: metadata.telefone || "",
    funcionarios: metadata.funcionarios || "",
    faturamento: metadata.faturamento || "",
    objetivos: metadata.objetivos || "",
    scoreCrescer: Number(metadata.scoreCrescer || 0),
    ultimoAcesso: now,
    ultimoDiagnostico: "",
    plan: metadata.plan || "Membro",
    createdAt: user.created_at || now,
    pillars: metadata.pillars || emptyPillars,
    hasCompletedInitialDiag: Boolean(metadata.hasCompletedInitialDiag),
  };
}

async function getProfile(user: User): Promise<UserProfile> {
  const fallback = profileFromUser(user);
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("email, display_name, profile_data")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.warn("Perfil indisponível; usando dados da autenticação:", error.message);
      return fallback;
    }

    if (!data) {
      const { error: insertError } = await supabase.from("profiles").upsert({
        id: user.id,
        email: fallback.email,
        display_name: fallback.displayName,
        profile_data: fallback,
        updated_at: new Date().toISOString(),
      });
      if (insertError) console.warn("Não foi possível criar o perfil:", insertError.message);
      return fallback;
    }

    return {
      ...fallback,
      ...(data.profile_data || {}),
      uid: user.id,
      email: user.email || data.email || "",
      displayName: data.display_name || data.profile_data?.displayName || fallback.displayName,
    };
  } catch (error) {
    console.warn("Falha inesperada ao carregar perfil; login mantido:", error);
    return fallback;
  }
}

function installAuthorizedApiFetch() {
  if (typeof window === "undefined" || (window as any).__mciAuthorizedFetchInstalled) return;
  const nativeFetch = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    if (!url.startsWith("/api/")) return nativeFetch(input, init);

    const { data } = await supabase.auth.getSession();
    const headers = new Headers(init.headers || (input instanceof Request ? input.headers : undefined));
    if (data.session?.access_token) headers.set("Authorization", `Bearer ${data.session.access_token}`);
    if (!headers.has("Content-Type") && init.body) headers.set("Content-Type", "application/json");
    return nativeFetch(input, { ...init, headers });
  };
  (window as any).__mciAuthorizedFetchInstalled = true;
}

class ReliableAuth {
  currentUser: UserProfile | null = null;
  private listeners = new Set<(user: UserProfile | null) => void>();
  private ready = false;

  constructor() {
    installAuthorizedApiFetch();
    void this.initialize();
  }

  private emit() {
    this.listeners.forEach((listener) => listener(this.currentUser));
  }

  private async applyUser(user: User | null) {
    this.currentUser = user ? await getProfile(user) : null;
    this.ready = true;
    this.emit();
  }

  private async initialize() {
    const { data, error } = await supabase.auth.getSession();
    if (error) console.error("Erro ao recuperar sessão:", error.message);
    await this.applyUser(data.session?.user || null);
    supabase.auth.onAuthStateChange((_event, session) => {
      window.setTimeout(() => void this.applyUser(session?.user || null), 0);
    });
  }

  onAuthStateChanged(callback: (user: UserProfile | null) => void): (() => void) {
    this.listeners.add(callback);
    if (this.ready) callback(this.currentUser);
    return () => {
      this.listeners.delete(callback);
    };
  }

  async signInWithEmailAndPassword(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    if (error) {
      const message = error.message.toLowerCase();
      if (message.includes("invalid login credentials")) throw new Error("E-mail ou senha incorretos.");
      if (message.includes("email not confirmed")) throw new Error("Confirme seu e-mail antes de entrar.");
      throw new Error(error.message);
    }
    await this.applyUser(data.user);
    return data;
  }

  async createUserWithEmailAndPassword(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: { emailRedirectTo: `${window.location.origin}/` },
    });
    if (error) throw new Error(error.message);
    if (data.user && data.session) await this.applyUser(data.user);
    return data;
  }

  async sendPasswordResetEmail(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo: `${window.location.origin}/` });
    if (error) throw new Error(error.message);
    return true;
  }

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
    await this.applyUser(null);
  }

  async updateProfileData(changes: Partial<UserProfile>) {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw new Error("Sua sessão expirou. Entre novamente.");
    const next = { ...(this.currentUser || profileFromUser(data.user)), ...changes, uid: data.user.id, email: data.user.email || "" };
    const { error: profileError } = await supabase.from("profiles").upsert({
      id: data.user.id,
      email: next.email,
      display_name: next.displayName,
      profile_data: next,
      updated_at: new Date().toISOString(),
    });
    if (profileError) throw new Error(profileError.message);
    this.currentUser = next;
    this.emit();
  }
}

export const auth = new ReliableAuth();
