import { createClient, Session, User } from "@supabase/supabase-js";
import type { UserProfile } from "./types";

const env = import.meta.env as Record<string, string | undefined>;
const supabaseUrl = env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY?.trim();

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.");
}

export const supabase = createClient(
  supabaseUrl || "https://configuracao-ausente.supabase.co",
  supabaseAnonKey || "configuracao-ausente",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);

const defaultPillars = {
  conhecimento: 0,
  relacionamento: 0,
  estrategia: 0,
  sistema: 0,
  comunicacao: 0,
  eficiencia: 0,
  resultados: 0,
};

function defaultProfile(user: User): UserProfile {
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
    pillars: metadata.pillars || defaultPillars,
    hasCompletedInitialDiag: Boolean(metadata.hasCompletedInitialDiag),
  };
}

async function loadOrCreateProfile(user: User): Promise<UserProfile> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) throw new Error(`Erro ao carregar perfil: ${error.message}`);

  if (data) {
    return {
      ...defaultProfile(user),
      ...(data.profile_data || {}),
      uid: user.id,
      email: user.email || data.email || "",
      displayName: data.display_name || data.profile_data?.displayName || defaultProfile(user).displayName,
    };
  }

  const profile = defaultProfile(user);
  const { error: insertError } = await supabase.from("profiles").insert({
    id: user.id,
    email: profile.email,
    display_name: profile.displayName,
    profile_data: profile,
  });
  if (insertError) throw new Error(`Erro ao criar perfil: ${insertError.message}`);
  return profile;
}

class SupabaseAuthAdapter {
  currentUser: UserProfile | null = null;
  private listeners: Array<(user: UserProfile | null) => void> = [];
  private initialized = false;

  constructor() {
    void this.initialize();
  }

  private async applySession(session: Session | null) {
    try {
      this.currentUser = session?.user ? await loadOrCreateProfile(session.user) : null;
    } catch (error) {
      console.error(error);
      this.currentUser = null;
    }
    this.listeners.forEach((listener) => listener(this.currentUser));
  }

  private async initialize() {
    if (this.initialized) return;
    this.initialized = true;
    const { data } = await supabase.auth.getSession();
    await this.applySession(data.session);
    supabase.auth.onAuthStateChange((_event, session) => {
      window.setTimeout(() => void this.applySession(session), 0);
    });
  }

  onAuthStateChanged(callback: (user: UserProfile | null) => void) {
    this.listeners.push(callback);
    callback(this.currentUser);
    return () => {
      this.listeners = this.listeners.filter((listener) => listener !== callback);
    };
  }

  async signInWithEmailAndPassword(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) {
      if (error.message.toLowerCase().includes("invalid login credentials")) {
        throw new Error("E-mail ou senha incorretos.");
      }
      if (error.message.toLowerCase().includes("email not confirmed")) {
        throw new Error("Confirme seu e-mail antes de entrar. Verifique também a caixa de spam.");
      }
      throw new Error(error.message);
    }
    await this.applySession(data.session);
    return data;
  }

  async createUserWithEmailAndPassword(email: string, password: string) {
    const redirectTo = `${window.location.origin}/`;
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: { emailRedirectTo: redirectTo },
    });
    if (error) throw new Error(error.message);
    if (data.session) await this.applySession(data.session);
    return data;
  }

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
    await this.applySession(null);
  }

  async sendPasswordResetEmail(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/`,
    });
    if (error) throw new Error(error.message);
    return true;
  }

  async updateProfileData(data: Partial<UserProfile>) {
    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;
    if (!user) throw new Error("Sua sessão expirou. Entre novamente.");

    const next = { ...(this.currentUser || defaultProfile(user)), ...data, uid: user.id, email: user.email || "" };
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      email: next.email,
      display_name: next.displayName,
      profile_data: next,
      updated_at: new Date().toISOString(),
    });
    if (error) throw new Error(error.message);
    this.currentUser = next;
    this.listeners.forEach((listener) => listener(next));
  }
}

class SupabaseDbAdapter {
  private async userId() {
    const { data } = await supabase.auth.getUser();
    return data.user?.id || null;
  }

  async getDocs(collectionName: string, queryConditions: any[] = []) {
    let query = supabase.from("app_records").select("id, collection, user_id, data, created_at, updated_at").eq("collection", collectionName);
    for (const condition of queryConditions) {
      if (condition.field === "userId") query = query.eq("user_id", condition.val);
      else if (condition.field === "id") query = query.eq("id", condition.val);
      else query = query.eq(`data->>${condition.field}`, String(condition.val));
    }
    const { data, error } = await query.order("created_at", { ascending: true });
    if (error) throw new Error(`Erro ao consultar ${collectionName}: ${error.message}`);
    return (data || []).map((row: any) => ({ id: row.id, ...(row.data || {}), userId: row.data?.userId || row.user_id }));
  }

  async addDoc(collectionName: string, record: any) {
    const currentUserId = await this.userId();
    const requestedId = typeof record.id === "string" ? record.id : undefined;
    const payload: any = {
      collection: collectionName,
      user_id: record.userId || currentUserId,
      data: record,
    };
    if (requestedId) payload.id = requestedId;
    const { data, error } = await supabase.from("app_records").insert(payload).select("id, data, user_id").single();
    if (error) throw new Error(`Erro ao salvar ${collectionName}: ${error.message}`);
    return { id: data.id, ...(data.data || {}), userId: data.data?.userId || data.user_id };
  }

  async updateDoc(collectionName: string, docId: string, changes: any) {
    const { data: existing, error: readError } = await supabase
      .from("app_records")
      .select("data")
      .eq("collection", collectionName)
      .eq("id", docId)
      .single();
    if (readError) throw new Error(`Registro não encontrado: ${readError.message}`);
    const { error } = await supabase
      .from("app_records")
      .update({ data: { ...(existing?.data || {}), ...changes }, updated_at: new Date().toISOString() })
      .eq("collection", collectionName)
      .eq("id", docId);
    if (error) throw new Error(`Erro ao atualizar ${collectionName}: ${error.message}`);
    return true;
  }

  async deleteDoc(collectionName: string, docId: string) {
    const { error } = await supabase.from("app_records").delete().eq("collection", collectionName).eq("id", docId);
    if (error) throw new Error(`Erro ao excluir ${collectionName}: ${error.message}`);
    return true;
  }
}

export const auth = new SupabaseAuthAdapter();
export const db = new SupabaseDbAdapter();
export const isMockActive = false;
