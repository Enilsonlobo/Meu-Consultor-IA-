/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { UserProfile } from "../types";
import { User, Building2, MapPin, Phone, Mail, FileText, Users, DollarSign, Target, Save, CheckCircle2 } from "lucide-react";

interface ProfileSectionProps {
  profile: UserProfile;
  onSave: (updatedProfile: Partial<UserProfile>) => Promise<void>;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({ profile, onSave }) => {
  const sanitizeName = (name: string, emailStr?: string) => {
    const normEmail = (emailStr || "").toLowerCase();
    if (normEmail === "enilsonlobo32@gmail.com" || normEmail.includes("enilson")) {
      return "Mestre";
    }
    if (name.toLowerCase().includes("enilson")) {
      return "Mestre";
    }
    return name;
  };

  const [displayName, setDisplayName] = useState(sanitizeName(profile.displayName || "", profile.email));
  const [empresa, setEmpresa] = useState(profile.empresa || "");
  const [cidade, setCidade] = useState(profile.cidade || "");
  const [telefone, setTelefone] = useState(profile.telefone || "");
  const [email, setEmail] = useState(profile.email || "");
  const [segmento, setSegmento] = useState(profile.segmento || "");
  const [funcionarios, setFuncionarios] = useState(profile.funcionarios || "");
  const [faturamento, setFaturamento] = useState(profile.faturamento || "");
  const [objetivos, setObjetivos] = useState(profile.objetivos || "");

  React.useEffect(() => {
    setDisplayName(sanitizeName(profile.displayName || "", profile.email));
    setEmpresa(profile.empresa || "");
    setCidade(profile.cidade || "");
    setTelefone(profile.telefone || "");
    setEmail(profile.email || "");
    setSegmento(profile.segmento || "");
    setFuncionarios(profile.funcionarios || "");
    setFaturamento(profile.faturamento || "");
    setObjetivos(profile.objetivos || "");
  }, [profile]);
  
  const [loading, setLoading] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSavedMessage(false);

    try {
      await onSave({
        displayName,
        empresa,
        cidade,
        telefone,
        segmento,
        funcionarios,
        faturamento,
        objetivos
      });
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="profile-section-root" className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
      
      {/* Top Header Panel */}
      <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center gap-3 text-indigo-400">
          <User className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">Perfil Estratégico</span>
        </div>
        <h2 className="text-xl font-extrabold text-white mt-1.5">Ficha de Diagnóstico Continuo</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-xl">
          Essas informações são utilizadas de forma automática pelo seu **Consultor IA®** para dar respostas sob medida altamente contextualizadas com sua margem, setor e metas operacionais.
        </p>
      </div>

      {/* Profile Form */}
      <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 md:p-8 shadow-xl">
        <form id="profile-details-form" onSubmit={handleSubmit} className="space-y-6">
          
          {savedMessage && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-2xl text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Ficha Estratégica da Empresa atualizada no banco de dados com sucesso! Seu Consultor IA® agora está calibrado com esses novos dados.</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Display name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-500" /> Nome do Empresário
              </label>
              <input
                id="profile-name-input"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Ex: Roberto Albuquerque"
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm focus:outline-none placeholder-slate-600 text-slate-200"
                required
              />
            </div>

            {/* Empresa */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-500" /> Nome da Empresa
              </label>
              <input
                id="profile-company-input"
                type="text"
                value={empresa}
                onChange={(e) => setEmpresa(e.target.value)}
                placeholder="Ex: Albuquerque Alimentos Ltda."
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm focus:outline-none placeholder-slate-600 text-slate-200"
                required
              />
            </div>

            {/* Cidade */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500" /> Cidade / Região
              </label>
              <input
                id="profile-city-input"
                type="text"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm focus:outline-none placeholder-slate-600 text-slate-200"
                required
              />
            </div>

            {/* Telefone */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-500" /> Telefone / WhatsApp
              </label>
              <input
                id="profile-phone-input"
                type="text"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="Ex: (11) 98765-4321"
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm focus:outline-none placeholder-slate-600 text-slate-200"
              />
            </div>

            {/* Email (Read Only for security) */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-500" /> Endereço de E-mail
              </label>
              <input
                id="profile-email-readonly"
                type="email"
                value={email}
                disabled
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-900 rounded-xl text-sm text-slate-500 cursor-not-allowed"
              />
            </div>

            {/* Segmento */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-500" /> Segmento de Vendas
              </label>
              <input
                id="profile-segment-input"
                type="text"
                value={segmento}
                onChange={(e) => setSegmento(e.target.value)}
                placeholder="Ex: Varejo, Alimentício, Serviços"
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm focus:outline-none placeholder-slate-600 text-slate-200"
              />
            </div>

            {/* Funcionarios */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-500" /> Quantidade de Funcionários
              </label>
              <select
                id="profile-staff-select"
                value={funcionarios}
                onChange={(e) => setFuncionarios(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm focus:outline-none text-slate-200"
              >
                <option value="">Selecione...</option>
                <option value="Apenas eu">Apenas eu (Autônomo)</option>
                <option value="1 a 5 funcionários">1 a 5 colaboradores</option>
                <option value="6 a 20 funcionários">6 a 20 colaboradores</option>
                <option value="21 a 100 funcionários">21 a 100 colaboradores</option>
                <option value="Mais de 100 funcionários">Mais de 100 colaboradores</option>
              </select>
            </div>

            {/* Faturamento */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-slate-500" /> Faturamento Médio Mensal
              </label>
              <select
                id="profile-revenue-select"
                value={faturamento}
                onChange={(e) => setFaturamento(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm focus:outline-none text-slate-200"
              >
                <option value="">Selecione...</option>
                <option value="Até R$ 10.000 / mês">Até R$ 10.000 / mês</option>
                <option value="R$ 10.000 a R$ 30.000 / mês">R$ 10.000 a R$ 30.000 / mês</option>
                <option value="R$ 30.000 a R$ 80.000 / mês">R$ 30.000 a R$ 80.000 / mês</option>
                <option value="R$ 80.000 a R$ 300.000 / mês">R$ 80.000 a R$ 300.000 / mês</option>
                <option value="Mais de R$ 300.000 / mês">Mais de R$ 300.000 / mês</option>
              </select>
            </div>

            {/* Objetivos estratégicos */}
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-slate-500" /> Objetivos de Negócios Principais
              </label>
              <textarea
                id="profile-objectives-textarea"
                rows={3}
                value={objetivos}
                onChange={(e) => setObjetivos(e.target.value)}
                placeholder="Ex: Otimizar margens de lucro, readequar preços, expandir canais e melhorar engajamento de redes sociais."
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm focus:outline-none placeholder-slate-600 text-slate-200 resize-none"
              />
            </div>

          </div>

          <div className="text-right pt-4">
            <button
              id="btn-profile-submit"
              type="submit"
              disabled={loading}
              className="w-full md:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/10 flex items-center justify-center gap-2 transition-all ml-auto"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? "Gravando ficha..." : "Salvar Ficha Estratégica"}</span>
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};
