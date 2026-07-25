import { createClient, type User } from '@supabase/supabase-js';
import type { UserProfile } from './types';

const env = import.meta.env as Record<string, string | undefined>;
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase não configurado. Cadastre VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY na Vercel.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
});

const today = () => new Date().toISOString();

function defaultProfile(user: User): UserProfile {
  const metadata = user.user_metadata || {};
  return {
    uid: user.id,
    email: user.email || '',
    displayName: metadata.displayName || metadata.full_name || (user.email?.split('@')[0] ?? 'Usuário'),
    empresa: metadata.empresa || '',
    segmento: metadata.segmento || '',
    cidade: metadata.cidade || '',
    telefone: metadata.telefone || '',
    funcionarios: metadata.funcionarios || '',
    faturamento: metadata.faturamento || '',
    objetivos: metadata.objetivos || '',
    scoreCrescer: Number(metadata.scoreCrescer || 0),
    ultimoAcesso: today(),
    ultimoDiagnostico: metadata.ultimoDiagnostico || '',
    plan: metadata.plan || 'Membro',
    createdAt: user.created_at || today(),
    hasCompletedInitialDiag: Boolean(metadata.hasCompletedInitialDiag)
  };
}

async function loadProfile(user: User): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('app_records')
    .select('data')
    .eq('collection', 'users')
    .eq('id', user.id)
    .maybeSingle();

  if (error) throw error;
  const base = defaultProfile(user);
  if (!data?.data) {
    await supabase.from('app_records').upsert({
      id: user.id,
      collection: 'users',
      owner_id: user.id,
      data: base
    });
    return base;
  }
  return { ...base, ...data.data, uid: user.id, email: user.email || data.data.email || '' };
}

class SupabaseAuthAdapter {
  currentUser: UserProfile | null = null;

  onAuthStateChanged(callback: (user: UserProfile | null) => void) {
    let active = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      const user = data.session?.user;
      if (!user) return callback(null);
      try {
        this.currentUser = await loadProfile(user);
        callback(this.currentUser);
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        callback(null);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!active) return;
      if (!session?.user) {
        this.currentUser = null;
        callback(null);
        return;
      }
      try {
        this.currentUser = await loadProfile(session.user);
        callback(this.currentUser);
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        callback(null);
      }
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }

  async signInWithEmailAndPassword(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message === 'Invalid login credentials' ? 'E-mail ou senha incorretos.' : error.message);
    if (data.user) this.currentUser = await loadProfile(data.user);
    return { user: this.currentUser };
  }

  async createUserWithEmailAndPassword(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin }
    });
    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('Não foi possível criar o usuário.');
    this.currentUser = await loadProfile(data.user);
    return { user: this.currentUser };
  }

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    this.currentUser = null;
  }

  async sendPasswordResetEmail(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/`
    });
    if (error) throw new Error(error.message);
  }

  async updateProfileData(data: Partial<UserProfile>) {
    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;
    if (!user) throw new Error('Sessão expirada. Entre novamente.');
    const current = this.currentUser || await loadProfile(user);
    const updated = { ...current, ...data, uid: user.id, email: user.email || current.email };
    const { error } = await supabase.from('app_records').upsert({
      id: user.id,
      collection: 'users',
      owner_id: user.id,
      data: updated
    });
    if (error) throw error;
    this.currentUser = updated;
    return updated;
  }
}

type Filter = { field: string; val: unknown };

class SupabaseDbAdapter {
  private async userId() {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw new Error('Sessão expirada. Entre novamente.');
    return data.user.id;
  }

  async getDocs(collectionName: string, filters: Filter[] = []) {
    let query = supabase.from('app_records').select('id,data,created_at').eq('collection', collectionName);
    for (const filter of filters) query = query.contains('data', { [filter.field]: filter.val });
    const { data, error } = await query.order('created_at', { ascending: true });
    if (error) throw error;
    return (data || []).map(row => ({ id: row.id, ...(row.data || {}) }));
  }

  async addDoc(collectionName: string, value: any) {
    const ownerId = await this.userId();
    const id = crypto.randomUUID();
    const record = { ...value, id };
    const { error } = await supabase.from('app_records').insert({
      id,
      collection: collectionName,
      owner_id: ownerId,
      data: record
    });
    if (error) throw error;
    return record;
  }

  async updateDoc(collectionName: string, docId: string, changes: Record<string, unknown>) {
    const { data: existing, error: readError } = await supabase
      .from('app_records').select('data').eq('collection', collectionName).eq('id', docId).single();
    if (readError) throw readError;
    const updated = { ...(existing?.data || {}), ...changes, id: docId };
    const { error } = await supabase.from('app_records').update({ data: updated }).eq('collection', collectionName).eq('id', docId);
    if (error) throw error;
    return updated;
  }

  async deleteDoc(collectionName: string, docId: string) {
    const { error } = await supabase.from('app_records').delete().eq('collection', collectionName).eq('id', docId);
    if (error) throw error;
  }
}

export const auth = new SupabaseAuthAdapter();
export const db = new SupabaseDbAdapter();
