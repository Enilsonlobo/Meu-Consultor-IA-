import React from "react";
import { Users, BarChart3, ShieldCheck, Cpu, Award, Database, KeyRound } from "lucide-react";

interface AdminUserRow {
  id: string;
  name: string;
  empresa: string;
  segmento: string;
  plan: "Membro" | "Premium" | "Enterprise";
  diagnosticsCount: number;
  aiUsage: string;
}

export const AdminPanel: React.FC = () => {
  const adminUsers: AdminUserRow[] = [
    { id: "u-1", name: "Roberto Albuquerque", empresa: "Albuquerque Alimentos Ltda.", segmento: "Alimentício", plan: "Premium", diagnosticsCount: 2, aiUsage: "64%" },
    { id: "u-2", name: "Amanda Silveira", empresa: "Clínica Odonto Riso", segmento: "Saúde & Estética", plan: "Premium", diagnosticsCount: 1, aiUsage: "40%" },
    { id: "u-3", name: "Cláudio Martins", empresa: "Martins Autopeças", segmento: "Mecânica & Varejo", plan: "Membro", diagnosticsCount: 1, aiUsage: "90%" },
    { id: "u-4", name: "Renata Vasconcellos", empresa: "Escola Criar e Crescer", segmento: "Educação", plan: "Enterprise", diagnosticsCount: 4, aiUsage: "12%" },
  ];

  const stats = {
    totalUsers: adminUsers.length,
    activeDiagnostics: adminUsers.reduce((sum, user) => sum + user.diagnosticsCount, 0),
    avgCrescerScore: "68%",
    tokensUsed: "Em acompanhamento",
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
      <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center gap-3 text-indigo-400">
          <ShieldCheck className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">Painel Administrativo</span>
        </div>
        <h2 className="text-xl font-extrabold text-white mt-1.5">Gestão da plataforma</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl">
          O acesso agora é controlado exclusivamente pelo Supabase Auth. Não existe mais liberação por navegador, aparelho ou lista local de e-mails.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Usuários exibidos" value={String(stats.totalUsers)} icon={<Users className="w-4 h-4 text-indigo-400" />} />
        <StatCard label="Diagnósticos" value={String(stats.activeDiagnostics)} icon={<BarChart3 className="w-4 h-4 text-pink-400" />} />
        <StatCard label="Uso da IA" value={stats.tokensUsed} icon={<Cpu className="w-4 h-4 text-purple-400" />} />
        <StatCard label="Score médio" value={stats.avgCrescerScore} icon={<Award className="w-4 h-4 text-emerald-400" />} />
      </div>

      <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 md:p-8 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">Autenticação centralizada</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Cadastro, confirmação de e-mail, login, recuperação de senha e sessões são tratados pelo Supabase. Ao liberar ou criar uma conta, ela funciona em qualquer dispositivo com as mesmas credenciais.
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl border border-slate-900 bg-slate-900/30">
            <div className="flex items-center gap-2 text-slate-300 font-bold text-sm">
              <Database className="w-4 h-4 text-indigo-400" /> Banco de dados
            </div>
            <p className="text-xs text-slate-500 mt-2">Perfis e dados da aplicação ficam no Supabase, com políticas de segurança por usuário.</p>
          </div>
          <div className="p-4 rounded-2xl border border-slate-900 bg-slate-900/30">
            <div className="flex items-center gap-2 text-slate-300 font-bold text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Controle de acesso
            </div>
            <p className="text-xs text-slate-500 mt-2">A antiga whitelist e a liberação por dispositivo foram removidas do painel.</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-950 border border-slate-900 rounded-3xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-900">
          <h3 className="text-base font-extrabold text-white">Visão geral dos usuários</h3>
          <p className="text-xs text-slate-500 mt-1">Dados demonstrativos do painel; a autenticação real é administrada no Supabase.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-500 uppercase tracking-wider bg-slate-900/40">
              <tr>
                <th className="px-6 py-3">Nome</th>
                <th className="px-6 py-3">Empresa</th>
                <th className="px-6 py-3">Segmento</th>
                <th className="px-6 py-3">Plano</th>
                <th className="px-6 py-3">Diagnósticos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {adminUsers.map((user) => (
                <tr key={user.id} className="text-slate-300">
                  <td className="px-6 py-4 font-semibold text-white">{user.name}</td>
                  <td className="px-6 py-4">{user.empresa}</td>
                  <td className="px-6 py-4">{user.segmento}</td>
                  <td className="px-6 py-4">{user.plan}</td>
                  <td className="px-6 py-4">{user.diagnosticsCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string; icon: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="p-5 bg-slate-950 border border-slate-900 rounded-2xl space-y-2">
    <div className="flex items-center justify-between text-slate-500">
      <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
      {icon}
    </div>
    <p className="text-2xl font-black text-white">{value}</p>
  </div>
);
