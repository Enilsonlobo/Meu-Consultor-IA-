// Camada de compatibilidade temporária para os componentes antigos.
// A autenticação usa o adaptador resiliente; o banco usa o Supabase.
export { auth } from "./auth";
export { db, isMockActive } from "./supabase";
