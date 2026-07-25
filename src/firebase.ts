// Camada de compatibilidade temporária.
// Todo o projeto agora utiliza Supabase; este arquivo existe apenas para
// manter imports antigos funcionando durante a migração.
export { auth, db, isMockActive } from "./supabase";
