/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Users, 
  BarChart3, 
  ShieldCheck, 
  Cpu, 
  Award, 
  Trash2, 
  Plus, 
  ToggleLeft, 
  ToggleRight, 
  Loader2, 
  Mail, 
  AlertCircle, 
  CheckCircle,
  Key
} from "lucide-react";
import { db } from "../firebase";

interface AdminUserRow {
  id: string;
  name: string;
  empresa: string;
  segmento: string;
  plan: 'Membro' | 'Premium' | 'Enterprise';
  diagnosticsCount: number;
  aiUsage: string; // e.g. "85%"
}

export const AdminPanel: React.FC = () => {
  const [activePlanFilter, setActivePlanFilter] = useState<string>("All");
  
  // Access Control & Whitelist States
  const [whitelist, setWhitelist] = useState<any[]>([]);
  const [whitelistEnabled, setWhitelistEnabled] = useState<boolean>(true);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const adminUsers: AdminUserRow[] = [
    { id: "u-1", name: "Roberto Albuquerque", empresa: "Albuquerque Alimentos Ltda.", segmento: "Alimentício", plan: "Premium", diagnosticsCount: 2, aiUsage: "64%" },
    { id: "u-2", name: "Amanda Silveira", empresa: "Clínica Odonto Riso", segmento: "Saúde & Estética", plan: "Premium", diagnosticsCount: 1, aiUsage: "40%" },
    { id: "u-3", name: "Cláudio Martins", empresa: "Martins Autopeças", segmento: "Mecânica & Varejo", plan: "Membro", diagnosticsCount: 1, aiUsage: "90%" },
    { id: "u-4", name: "Renata Vasconcellos", empresa: "Escola Criar e Crescer", segmento: "Educação", plan: "Enterprise", diagnosticsCount: 4, aiUsage: "12%" },
    { id: "u-5", name: "Felipe Guedes", empresa: "Guedes Advocacia", segmento: "Serviços Jurídicos", plan: "Membro", diagnosticsCount: 0, aiUsage: "0%" }
  ];

  const stats = {
    totalUsers: 147,
    activeDiagnostics: 82,
    avgCrescerScore: "68%",
    tokensUsed: "1.4M / 5M"
  };

  useEffect(() => {
    fetchAccessControlData();
  }, []);

  const fetchAccessControlData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch configurations settings
      const settingsList = await db.getDocs("settings");
      const whitelistSetting = settingsList.find((s: any) => s.id === "whitelist_enabled" || s.key === "whitelist_enabled");
      if (whitelistSetting) {
        setWhitelistEnabled(whitelistSetting.value);
      } else {
        // If settings doc doesn't exist, seed it as enabled out-of-the-box
        await db.addDoc("settings", { id: "whitelist_enabled", key: "whitelist_enabled", value: true, name: "Exigir Liberação de E-mail" });
        setWhitelistEnabled(true);
      }

      // 2. Fetch whitelist allowed users
      const list = await db.getDocs("whitelist");
      setWhitelist(list);
    } catch (err) {
      console.error("Erro ao carregar controle de acesso:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleWhitelist = async () => {
    try {
      setActionLoading(true);
      const newValue = !whitelistEnabled;
      
      const settingsList = await db.getDocs("settings");
      const whitelistSetting = settingsList.find((s: any) => s.id === "whitelist_enabled" || s.key === "whitelist_enabled");
      
      if (whitelistSetting) {
        await db.updateDoc("settings", whitelistSetting.id, { value: newValue });
      } else {
        await db.addDoc("settings", { id: "whitelist_enabled", key: "whitelist_enabled", value: newValue, name: "Exigir Liberação de E-mail" });
      }
      
      setWhitelistEnabled(newValue);
      setMessage(`Filtro de liberação de e-mail ${newValue ? "ATIVADO" : "DESATIVADO"} com sucesso.`);
      setTimeout(() => setMessage(null), 5000);
    } catch (err) {
      console.error(err);
      setError("Erro ao salvar configuração operacional.");
      setTimeout(() => setError(null), 5000);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    try {
      setActionLoading(true);
      setError(null);
      const emailLower = newEmail.trim().toLowerCase();
      
      // Check if already allowed in state list
      if (whitelist.some((item: any) => item.email && item.email.toLowerCase() === emailLower)) {
        setError("Este e-mail já possui acesso liberado na plataforma.");
        setTimeout(() => setError(null), 5000);
        return;
      }

      const itemData = {
        id: "wl-" + Math.random().toString(36).substring(7),
        email: emailLower,
        name: newName.trim() || "Convidado de Testes",
        createdAt: new Date().toLocaleDateString('pt-BR')
      };

      await db.addDoc("whitelist", itemData);
      
      // refresh list
      const list = await db.getDocs("whitelist");
      setWhitelist(list);
      
      setNewEmail("");
      setNewName("");
      setMessage(`Acesso de testes concedido com sucesso para: ${emailLower}`);
      setTimeout(() => setMessage(null), 5000);
    } catch (err) {
      console.error(err);
      setError("Erro ao cadastrar e-mail liberado.");
      setTimeout(() => setError(null), 5000);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveEmail = async (docId: string, email: string) => {
    const isOwnerEmail = email.toLowerCase() === "enilsonlobo32@gmail.com";
    if (isOwnerEmail) {
      setError("O e-mail do proprietário Enilson Lobo não pode ter seu acesso revogado!");
      setTimeout(() => setError(null), 5000);
      return;
    }

    if (!window.confirm(`Tem certeza que deseja revogar definitivamente o acesso de testes do e-mail: ${email}?`)) {
      return;
    }

    try {
      setActionLoading(true);
      await db.deleteDoc("whitelist", docId);
      
      // refresh list
      const list = await db.getDocs("whitelist");
      setWhitelist(list);
      
      setMessage(`Acesso de testes revogado com sucesso para: ${email}`);
      setTimeout(() => setMessage(null), 5000);
    } catch (err) {
      console.error(err);
      setError("Erro ao revogar acesso do e-mail.");
      setTimeout(() => setError(null), 5000);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredUsers = activePlanFilter === "All" 
    ? adminUsers 
    : adminUsers.filter(u => u.plan === activePlanFilter);

  return (
    <div id="admin-panel-root" className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
      
      {/* Top Banner */}
      <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center gap-3 text-indigo-400">
          <ShieldCheck className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">Painel Administrativo do SaaS</span>
        </div>
        <h2 className="text-xl font-extrabold text-white mt-1.5">Métricas Consolidadas de Uso</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-xl">
          Monitore o volume de assinaturas, consumo de tokens de inteligência artificial corporativa, quantidade de auditorias finalizadas e distribuição de planos comerciais.
        </p>
      </div>

      {/* Main SaaS Stat grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        <div className="p-5 bg-slate-950 border border-slate-900 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total de Clientes</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-black text-white">{stats.totalUsers}</p>
          <span className="text-[10px] text-emerald-500 font-bold block mt-1">+14% este mês</span>
        </div>

        <div className="p-5 bg-slate-950 border border-slate-900 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Auditorias Realizadas</span>
            <BarChart3 className="w-4 h-4 text-pink-400" />
          </div>
          <p className="text-2xl font-black text-white">{stats.activeDiagnostics}</p>
          <span className="text-[10px] text-slate-500 font-bold block mt-1">Método CRESCER™ ativo</span>
        </div>

        <div className="p-5 bg-slate-950 border border-slate-900 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Uso Global da IA</span>
            <Cpu className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-white">{stats.tokensUsed}</p>
          <span className="text-[10px] text-slate-500 font-bold block mt-1">Consumo de APIs Gemini</span>
        </div>

        <div className="p-5 bg-slate-950 border border-slate-900 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Score CRESCER™ Médio</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white">{stats.avgCrescerScore}</p>
          <span className="text-[10px] text-amber-500 font-bold block mt-1">Zona de maturidade média</span>
        </div>

      </div>

      {/* Access Control Management Panel (CRITICAL DEMAND) */}
      <div id="access-control-manager-card" className="bg-slate-950 border border-slate-900 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        
        {/* Title and Settings Toggle header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-6 mb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-indigo-400">
              <Key className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Segurança & Distribuição</span>
            </div>
            <h3 className="text-base font-extrabold text-white">Controle de Acesso de Convidados</h3>
            <p className="text-xs text-slate-500 max-w-xl">
              Impeça cadastros indesejados. Quando ativo, apenas e-mails explicitamente adicionados a esta lista de liberação poderão acessar a consultoria estratégica.
            </p>
          </div>

          {/* Toggle Switch */}
          <div className="flex items-center gap-3 bg-slate-900/60 border border-slate-900 px-4 py-2.5 rounded-2xl shrink-0">
            <span className="text-xs font-bold text-slate-300">Exigir Liberação Ativa:</span>
            <button
              id="btn-toggle-whitelist"
              onClick={handleToggleWhitelist}
              disabled={actionLoading}
              className="text-slate-400 hover:text-white transition-colors"
              title={whitelistEnabled ? "Clique para desativar restrições" : "Clique para ativar restrições"}
            >
              {whitelistEnabled ? (
                <ToggleRight className="w-8 h-8 text-indigo-500" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-slate-600" />
              )}
            </button>
            <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
              whitelistEnabled ? "bg-indigo-500/10 text-indigo-400" : "bg-slate-800 text-slate-500"
            }`}>
              {whitelistEnabled ? "Restrito" : "Aberto"}
            </span>
          </div>
        </div>

        {/* Messaging alerts */}
        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-xs flex items-center gap-2.5 mb-6">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl text-xs flex items-center gap-2.5 mb-6">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {/* Main interactive grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Form to add new email - 5 cols */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-2xl space-y-4">
              <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Liberar Novo Acesso</h4>
              <hr className="border-slate-900" />
              
              <form onSubmit={handleAddEmail} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">E-mail do Testador / Cliente</label>
                  <input
                    id="input-whitelist-email"
                    type="email"
                    required
                    placeholder="exemplo@cliente.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-900 rounded-xl text-xs text-slate-200 placeholder-slate-700 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Nome / Descrição (Opcional)</label>
                  <input
                    id="input-whitelist-name"
                    type="text"
                    placeholder="Nome do cliente, parceiro ou assessor"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-900 rounded-xl text-xs text-slate-200 placeholder-slate-700 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <button
                  id="btn-submit-whitelist-add"
                  type="submit"
                  disabled={actionLoading || !newEmail}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-indigo-600/10 disabled:bg-slate-800 disabled:shadow-none"
                >
                  <Plus className="w-4 h-4" />
                  <span>Liberar Acesso de Testes</span>
                </button>
              </form>
            </div>
          </div>

          {/* List of currently whitelisted emails - 7 cols */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-2xl flex flex-col h-full min-h-[240px]">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">E-mails com Acesso Liberado ({whitelist.length})</h4>
                <span className="text-[10px] text-slate-500 font-bold">Total na nuvem</span>
              </div>
              <hr className="border-slate-900 mb-4" />

              {loading ? (
                <div className="flex-1 flex flex-col justify-center items-center gap-2 text-slate-500 py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                  <span className="text-xs font-medium">Sincronizando acessos...</span>
                </div>
              ) : whitelist.length === 0 ? (
                <div className="flex-1 flex flex-col justify-center items-center text-center text-slate-500 py-8">
                  <Mail className="w-8 h-8 text-slate-700 mb-2" />
                  <p className="text-xs font-medium">Nenhum e-mail liberado ainda.</p>
                  <p className="text-[10px] text-slate-600 mt-1">Todos os cadastros estão abertos se o filtro estiver desativado.</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto max-h-[220px] pr-1 space-y-2 custom-scrollbar">
                  {whitelist.map((item) => {
                    const isOwner = item.email && item.email.toLowerCase() === "enilsonlobo32@gmail.com";
                    return (
                      <div 
                        key={item.id} 
                        className="flex items-center justify-between p-3 bg-slate-950 border border-slate-900/80 rounded-xl hover:border-slate-800 transition-colors"
                      >
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-slate-200 block truncate max-w-[200px] sm:max-w-[320px]">{item.email}</span>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500">
                            <span className="font-semibold text-slate-400">{item.name}</span>
                            <span>•</span>
                            <span>Liberado em {item.createdAt || "Original"}</span>
                          </div>
                        </div>

                        {!isOwner ? (
                          <button
                            id={`btn-remove-whitelist-${item.id}`}
                            onClick={() => handleRemoveEmail(item.id, item.email)}
                            disabled={actionLoading}
                            className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                            title="Revogar Acesso"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="text-[9px] bg-indigo-500/15 text-indigo-400 font-extrabold uppercase px-2 py-0.5 rounded">Proprietário</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Plans distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* User list - 8 cols */}
        <div className="lg:col-span-8 bg-slate-950 border border-slate-900 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-base font-extrabold text-white">Usuários Recentes</h3>
            
            {/* Filter buttons */}
            <div className="flex gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-900">
              {["All", "Membro", "Premium", "Enterprise"].map((plan) => (
                <button
                  id={`btn-admin-filter-${plan}`}
                  key={plan}
                  onClick={() => setActivePlanFilter(plan)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activePlanFilter === plan ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {plan}
                </button>
              ))}
            </div>
          </div>

          <hr className="border-slate-900" />

          {/* Table list */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 font-extrabold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 rounded-l-xl">Empresário</th>
                  <th className="px-4 py-3">Empresa / Setor</th>
                  <th className="px-4 py-3">Plano</th>
                  <th className="px-4 py-3">Auditorias</th>
                  <th className="px-4 py-3 rounded-r-xl text-right">Quota IA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-900/35 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-slate-200">{user.name}</td>
                    <td className="px-4 py-3.5">
                      <span className="text-slate-300 font-semibold block">{user.empresa}</span>
                      <span className="text-[10px] text-slate-500 font-medium block mt-0.5">{user.segmento}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        user.plan === "Premium" 
                          ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/20" 
                          : user.plan === "Enterprise" 
                          ? "bg-purple-600/15 text-purple-400 border border-purple-500/20" 
                          : "bg-slate-800 text-slate-400"
                      }`}>
                        {user.plan}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-300">{user.diagnosticsCount} realizadas</td>
                    <td className="px-4 py-3.5 text-right font-bold text-indigo-400">{user.aiUsage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System parameters control - 4 cols */}
        <div className="lg:col-span-4 bg-slate-950 border border-slate-900 rounded-3xl p-6 shadow-xl space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-base font-extrabold text-white">Parâmetros Operacionais</h3>
            <hr className="border-slate-900" />

            <div className="space-y-4 text-xs font-semibold">
              <div className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-900">
                <span className="text-slate-400">Modelo AI Principal:</span>
                <span className="text-white font-bold">Gemini 2.5 Pro</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-900">
                <span className="text-slate-400">Taxa Limite por Minuto:</span>
                <span className="text-white font-bold">15 requisições</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-900">
                <span className="text-slate-400">Armazenamento Cloud:</span>
                <span className="text-emerald-500 font-bold">Habilitado</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl text-center">
            <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-widest block mb-2">Monitoramento de Segurança</span>
            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
              As regras de segurança do Firestore (firestore.rules) garantem o isolamento completo por Tenant ID (UID do Usuário).
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
