import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://fldhvvwcjxwnutkjanud.supabase.co";
const supabaseAnonKey = "sb_publishable_UJRx_Z0EDrVQI6zCLMDyZg_zd9WDkk-";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: "meu-consultor-ia-auth",
  },
});

const localKey = (collection: string) => `mci_${collection}`;

function readLocal(collection: string): any[] {
  try {
    return JSON.parse(localStorage.getItem(localKey(collection)) || "[]");
  } catch {
    return [];
  }
}

function writeLocal(collection: string, items: any[]) {
  try {
    localStorage.setItem(localKey(collection), JSON.stringify(items));
  } catch (error) {
    console.warn("Não foi possível salvar localmente:", error);
  }
}

class SupabaseDbAdapter {
  private async userId() {
    const { data } = await supabase.auth.getUser();
    return data.user?.id || null;
  }

  async getDocs(collectionName: string, queryConditions: any[] = []) {
    try {
      let query = supabase
        .from("app_records")
        .select("id, collection, user_id, data, created_at, updated_at")
        .eq("collection", collectionName);

      for (const condition of queryConditions) {
        if (condition.field === "userId") query = query.eq("user_id", condition.val);
        else if (condition.field === "id") query = query.eq("id", condition.val);
        else query = query.eq(`data->>${condition.field}`, String(condition.val));
      }

      const { data, error } = await query.order("created_at", { ascending: true });
      if (error) throw error;
      return (data || []).map((row: any) => ({
        id: row.id,
        ...(row.data || {}),
        userId: row.data?.userId || row.user_id,
      }));
    } catch (error) {
      console.warn(`Supabase indisponível em ${collectionName}; usando armazenamento local:`, error);
      let items = readLocal(collectionName);
      for (const condition of queryConditions) {
        items = items.filter((item) => String(item?.[condition.field] ?? "") === String(condition.val));
      }
      return items;
    }
  }

  async addDoc(collectionName: string, record: any) {
    const currentUserId = await this.userId();
    const id = typeof record.id === "string" ? record.id : crypto.randomUUID();
    const localRecord = { id, ...record, userId: record.userId || currentUserId };

    try {
      const payload: any = {
        id,
        collection: collectionName,
        user_id: localRecord.userId,
        data: record,
      };
      const { data, error } = await supabase
        .from("app_records")
        .insert(payload)
        .select("id, data, user_id")
        .single();
      if (error) throw error;
      return { id: data.id, ...(data.data || {}), userId: data.data?.userId || data.user_id };
    } catch (error) {
      console.warn(`Não foi possível salvar ${collectionName} no Supabase; mantendo localmente:`, error);
      const items = readLocal(collectionName);
      writeLocal(collectionName, [...items.filter((item) => item.id !== id), localRecord]);
      return localRecord;
    }
  }

  async updateDoc(collectionName: string, docId: string, changes: any) {
    try {
      const { data: existing, error: readError } = await supabase
        .from("app_records")
        .select("data")
        .eq("collection", collectionName)
        .eq("id", docId)
        .single();
      if (readError) throw readError;

      const { error } = await supabase
        .from("app_records")
        .update({ data: { ...(existing?.data || {}), ...changes }, updated_at: new Date().toISOString() })
        .eq("collection", collectionName)
        .eq("id", docId);
      if (error) throw error;
      return true;
    } catch (error) {
      console.warn(`Não foi possível atualizar ${collectionName} no Supabase; atualizando localmente:`, error);
      const items = readLocal(collectionName);
      const index = items.findIndex((item) => item.id === docId);
      if (index >= 0) items[index] = { ...items[index], ...changes };
      else items.push({ id: docId, ...changes });
      writeLocal(collectionName, items);
      return true;
    }
  }

  async deleteDoc(collectionName: string, docId: string) {
    try {
      const { error } = await supabase
        .from("app_records")
        .delete()
        .eq("collection", collectionName)
        .eq("id", docId);
      if (error) throw error;
    } catch (error) {
      console.warn(`Não foi possível excluir ${collectionName} no Supabase; removendo localmente:`, error);
    }
    writeLocal(collectionName, readLocal(collectionName).filter((item) => item.id !== docId));
    return true;
  }
}

export const db = new SupabaseDbAdapter();
export const isMockActive = false;
