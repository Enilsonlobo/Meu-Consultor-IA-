/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { UserProfile, ChatSession, Message, CrescerPillars, DiagnosticSession } from "./types";
import { auth, db } from "./firebase";
import { LandingPage } from "./components/LandingPage";
import { LoginScreen } from "./components/LoginScreen";
import { Sidebar, SidebarTab } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { ChatWindow } from "./components/ChatWindow";
import { DiagnosticSection } from "./components/DiagnosticSection";
import { ReportViewer } from "./components/ReportViewer";
import { CompetitionRadar } from "./components/CompetitionRadar";
import { ProfileSection } from "./components/ProfileSection";
import { AdminPanel } from "./components/AdminPanel";
import { ActionPlanSection } from "./components/ActionPlanSection";
import { PostDesignStudio } from "./components/PostDesignStudio";
import { InstagramAudit } from "./components/InstagramAudit";
import { PublicAuditView } from "./components/PublicAuditView";
import { DIAG_QUESTIONS } from "./data";
import { 
  Sparkles, 
  Trash2, 
  MessageSquare, 
  FileText, 
  ShieldAlert, 
  CheckSquare, 
  Eye, 
  Activity, 
  TrendingUp, 
  Target,
  Settings,
  HelpCircle,
  FileCheck
} from "lucide-react";

export default function App() {
  // Authentication & session state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [authScreen, setAuthScreen] = useState<'landing' | 'login'>('landing');
  const [publicAuditId, setPublicAuditId] = useState<string | null>(null);

  // Parse URL search parameters on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const auditParam = params.get("audit");
    if (auditParam) {
      setPublicAuditId(auditParam);
    }
  }, []);

  // Sidebar Tab navigation
  const [activeTab, setActiveTab] = useState<SidebarTab>('dashboard');

  // Core SaaS Data collections
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Diagnostic states
  const [latestDiagnostics, setLatestDiagnostics] = useState<DiagnosticSession[]>([]);
  const [activeDiagAnswers, setActiveDiagAnswers] = useState<Record<string, string>>({});

  // 1. Observe Authentication changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user: UserProfile | null) => {
      if (user) {
        setCurrentUser(user);
        // Load real-time SaaS collections for this tenant
        loadUserData(user.uid);
      } else {
        setCurrentUser(null);
      }
      setIsAuthenticating(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Load Firestore / Local collections
  const loadUserData = async (uid: string) => {
    try {
      const chats = await db.getDocs("chats", [{ field: "userId", val: uid }]);
      setChatSessions(chats);
      if (chats.length > 0) {
        setActiveSessionId(chats[chats.length - 1].id);
      } else {
        // Create a starter session automatically
        const defaultChat = await db.addDoc("chats", {
          userId: uid,
          title: "Consulta Estratégica Inicial",
          lastUpdated: new Date().toLocaleDateString('pt-BR'),
          messages: []
        });
        setChatSessions([defaultChat]);
        setActiveSessionId(defaultChat.id);
      }

      const diags = await db.getDocs("diagnostics", [{ field: "userId", val: uid }]);
      setLatestDiagnostics(diags);
    } catch (e) {
      console.error("Erro ao carregar dados do usuário:", e);
    }
  };

  // 3. Handle Chat Message Dispatch
  const handleSendMessage = async (text: string, fileData?: { name: string; type: string }) => {
    if (!currentUser || !activeSessionId) return;

    let promptText = text;
    if (fileData) {
      promptText = `[Arquivo Anexado: ${fileData.name} (${fileData.type})]\n\n${text || "Por favor, analise esta planilha financeira e dê recomendações estratégicas."}`;
    }

    const userMsg: Message = {
      id: "msg-" + Math.random().toString(36).substring(7),
      role: 'user',
      text: promptText,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    const targetSession = chatSessions.find(s => s.id === activeSessionId);
    if (!targetSession) return;

    const updatedMessages = [...targetSession.messages, userMsg];

    // Update client list instantly for responsiveness
    setChatSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, messages: updatedMessages } : s));
    setIsGenerating(true);

    try {
      // Invoke fullstack Gemini API route
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          profile: currentUser
        })
      });

      if (!response.ok) {
        throw new Error("Erro na comunicação com o servidor de IA.");
      }

      const data = await response.json();

      const assistantMsg: Message = {
        id: "msg-" + Math.random().toString(36).substring(7),
        role: 'model',
        text: data.text,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };

      const finalMessages = [...updatedMessages, assistantMsg];
      
      // Save session update in Firestore/Mock
      await db.updateDoc("chats", activeSessionId, {
        messages: finalMessages,
        lastUpdated: new Date().toLocaleDateString('pt-BR')
      });

      setChatSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, messages: finalMessages } : s));
    } catch (err: any) {
      console.error(err);
      
      // Fallback response block so the UI never crashes
      const fallbackMsg: Message = {
        id: "msg-" + Math.random().toString(36).substring(7),
        role: 'model',
        text: `### ⚠️ Parecer Operacional Meu Consultor IA®
Não foi possível estabelecer contato síncrono com a rede neural no momento. No entanto, analisando sua ficha estratégica para **${currentUser.empresa}**, sugerimos focar nas seguintes táticas imediatas:

1. **Gestão de Caixa:** Garanta que a conciliação bancária diária seja realizada utilizando um ERP online integrável para evitar descasamento de vencimento de cartões.
2. **Diferencial no WhatsApp:** Crie scripts de suporte de alta conversão de no máximo 3 parágrafos para o seu WhatsApp Business.
3. **Avaliações Ativas:** Solicite uma avaliação de nota máxima no Google Business para cada cliente satisfeito.`,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };

      const finalMessagesWithFallback = [...updatedMessages, fallbackMsg];
      await db.updateDoc("chats", activeSessionId, {
        messages: finalMessagesWithFallback,
        lastUpdated: new Date().toLocaleDateString('pt-BR')
      });

      setChatSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, messages: finalMessagesWithFallback } : s));
    } finally {
      setIsGenerating(false);
    }
  };

  // 4. Handle Chat Sessions Operations
  const handleNewSession = async () => {
    if (!currentUser) return;
    try {
      const newChat = await db.addDoc("chats", {
        userId: currentUser.uid,
        title: `Discussão Estratégica #${chatSessions.length + 1}`,
        lastUpdated: new Date().toLocaleDateString('pt-BR'),
        messages: []
      });
      setChatSessions(prev => [newChat, ...prev]);
      setActiveSessionId(newChat.id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteSession = async (id: string) => {
    try {
      await db.deleteDoc("chats", id);
      setChatSessions(prev => prev.filter(s => s.id !== id));
      if (activeSessionId === id) {
        const remaining = chatSessions.filter(s => s.id !== id);
        if (remaining.length > 0) {
          setActiveSessionId(remaining[0].id);
        } else {
          setActiveSessionId(null);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 5. Handle Diagnostic Completed
  const handleDiagnosticComplete = async (pillars: CrescerPillars, score: number, answers: Record<string, string>) => {
    if (!currentUser) return;

    setIsGeneratingReport(true);

    try {
      // Map answers to structured objects for the API
      const formattedAnswers = DIAG_QUESTIONS.map(q => {
        const answerLabel = answers[q.id];
        const option = q.options.find(o => o.label === answerLabel);
        return {
          questionText: q.questionText,
          answerText: answerLabel ? `${answerLabel} - ${option?.description || ''}` : "Não respondida"
        };
      });

      // Call the API to compile the complete deep-dive AI report
      let compiledReportText = "";
      try {
        const reportRes = await fetch("/api/report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            profile: currentUser,
            answers: formattedAnswers,
            pillars,
            score
          })
        });

        if (reportRes.ok) {
          const reportData = await reportRes.json();
          compiledReportText = reportData.text;
        } else {
          console.warn("API de relatório retornou erro, usando fallback.");
        }
      } catch (err) {
        console.error("Erro ao chamar API de relatório:", err);
      }

      // Save diagnostic audit to collection
      const newDiag = await db.addDoc("diagnostics", {
        userId: currentUser.uid,
        currentStep: 7,
        answers,
        scoreCrescer: score,
        pillars,
        completed: true,
        report: compiledReportText, // Save the generated Markdown report
        createdAt: new Date().toLocaleDateString('pt-BR'),
        updatedAt: new Date().toLocaleDateString('pt-BR')
      });

      // Update current profile stats
      const updatedProfile = {
        scoreCrescer: score,
        ultimoDiagnostico: new Date().toLocaleDateString('pt-BR'),
        pillars
      };

      await auth.updateProfileData(updatedProfile);
      setCurrentUser(prev => prev ? { ...prev, ...updatedProfile } : null);

      setLatestDiagnostics(prev => [newDiag, ...prev]);
      setActiveDiagAnswers({});
      
      // Navigate straight to the report tab to show the results
      setActiveTab('relatorios');
    } catch (e) {
      console.error("Erro ao concluir diagnóstico:", e);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // 6. Handle Profile Updates
  const handleSaveProfile = async (updatedFields: Partial<UserProfile>) => {
    if (!currentUser) return;
    try {
      await auth.updateProfileData(updatedFields);
      setCurrentUser(prev => prev ? { ...prev, ...updatedFields } : null);
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  // 7. Handle Competition Intelligence generation
  const handleGenerateCompetitionAnalysis = async (cidade: string, segmento: string, empresa: string): Promise<string> => {
    try {
      const response = await fetch("/api/radar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cidade, segmento, empresa })
      });

      if (!response.ok) {
        throw new Error("Erro ao compilar análise local.");
      }

      const data = await response.json();
      
      // Save analysis in database
      await db.addDoc("competition", {
        userId: currentUser?.uid,
        empresa,
        segmento,
        cidade,
        analysisText: data.text,
        createdAt: new Date().toLocaleDateString('pt-BR')
      });

      return data.text;
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  // Check if current user is admin
  const isAdmin = currentUser?.email === "admin@consultoria.com.br" || currentUser?.email === "enilsonlobo32@gmail.com";

  if (publicAuditId) {
    return (
      <PublicAuditView 
        auditId={publicAuditId} 
        onBackToApp={() => {
          // Clear query params and state
          window.history.pushState({}, document.title, window.location.pathname);
          setPublicAuditId(null);
        }} 
      />
    );
  }

  if (isAuthenticating) {
    return (
      <div id="loader-fallback" className="min-h-screen bg-slate-900 flex flex-col justify-center items-center gap-4 text-slate-100 font-sans">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Iniciando Meu Consultor IA®...</p>
      </div>
    );
  }

  if (isGeneratingReport) {
    return (
      <div id="report-generator-fallback" className="min-h-screen bg-slate-950 flex flex-col justify-center items-center gap-6 text-slate-100 font-sans p-6 text-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-500/20 rounded-full" />
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <div className="space-y-2 max-w-md">
          <h2 className="text-xl font-extrabold text-white animate-pulse">Compilando Auditoria...</h2>
          <p className="text-sm text-slate-400 font-medium leading-relaxed">
            O Diretor Estratégico do <strong>Meu Consultor IA®</strong> está mapeando os dados da sua empresa no Método CRESCER™ para produzir o seu plano de ação customizado de 30 dias.
          </p>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest pt-2">Aguarde, isso pode levar alguns segundos...</p>
        </div>
      </div>
    );
  }

  // Not logged in routing states
  if (!currentUser) {
    if (authScreen === 'landing') {
      return (
        <LandingPage 
          onStart={() => setAuthScreen('login')} 
          onLogin={() => setAuthScreen('login')} 
        />
      );
    }
    return (
      <LoginScreen 
        onSuccess={() => setAuthScreen('landing')} 
        onBackToLanding={() => setAuthScreen('landing')} 
      />
    );
  }

  // Active Completed Diagnostic for Report display
  const finishedDiag = latestDiagnostics.find(d => d.completed);

  return (
    <div id="mci-app-container" className="min-h-screen bg-slate-900 text-slate-100 flex flex-col lg:flex-row font-sans overflow-x-hidden">
      
      {/* 1. Left Sidebar Navigation rail */}
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={(tab) => {
          setActiveTab(tab);
          // Auto scroll to top of view
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        userName={currentUser.displayName || currentUser.email}
        userRole={`${currentUser.plan || "Premium"} Member`}
        onLogout={() => {
          auth.signOut();
          setAuthScreen('landing');
        }}
        isAdmin={isAdmin}
      />

      {/* 2. Main Content Board Canvas */}
      <main id="main-content-canvas" className="flex-1 min-h-screen bg-slate-900 overflow-y-auto pb-12">
        {activeTab === 'dashboard' && (
          <Dashboard 
            profile={currentUser} 
            onTabChange={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }} 
          />
        )}

        {activeTab === 'chat' && (
          <ChatWindow 
            sessions={chatSessions}
            activeSessionId={activeSessionId}
            onSelectSession={setActiveSessionId}
            onNewSession={handleNewSession}
            onDeleteSession={handleDeleteSession}
            onSendMessage={handleSendMessage}
            isGenerating={isGenerating}
          />
        )}

        {activeTab === 'diagnostico' && (
          <DiagnosticSection 
            userId={currentUser.uid} 
            onComplete={handleDiagnosticComplete}
            savedAnswers={activeDiagAnswers}
          />
        )}

        {activeTab === 'radar' && (
          <CompetitionRadar 
            userCity={currentUser.cidade}
            userSegment={currentUser.segmento}
            userCompany={currentUser.empresa}
            onGenerateAnalysis={handleGenerateCompetitionAnalysis}
          />
        )}

        {activeTab === 'plano' && (
          <ActionPlanSection pillars={currentUser.pillars || {
            conhecimento: 0,
            relacionamento: 0,
            estrategia: 0,
            sistema: 0,
            comunicacao: 0,
            eficiencia: 0,
            resultados: 0
          }} />
        )}

        {activeTab === 'relatorios' && (
          finishedDiag ? (
            <ReportViewer 
              pillars={finishedDiag.pillars}
              score={finishedDiag.scoreCrescer}
              empresa={currentUser.empresa}
              segmento={currentUser.segmento}
              cidade={currentUser.cidade}
              onRestart={() => setActiveTab('diagnostico')}
              savedReportMarkdown={finishedDiag.report}
            />
          ) : (
            <div className="p-12 text-center max-w-lg mx-auto my-16 bg-slate-950 border border-slate-900 rounded-3xl space-y-6">
              <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto border border-indigo-500/10 shadow-lg shadow-indigo-600/5">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="font-extrabold text-white">Nenhum Relatório Disponível</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  Seu relatório executivo consolidado com plano de ação de 30 dias é gerado automaticamente após a conclusão da auditoria Método CRESCER™.
                </p>
              </div>
              <button
                id="btn-report-diag-cta"
                onClick={() => setActiveTab('diagnostico')}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/10"
              >
                Realizar Diagnóstico Agora
              </button>
            </div>
          )
        )}

        {activeTab === 'artes' && (
          <PostDesignStudio profile={currentUser} />
        )}

        {activeTab === 'instagram_audits' && (
          <InstagramAudit profile={currentUser} />
        )}

        {activeTab === 'historico' && (
          <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
            <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 shadow-xl">
              <h2 className="text-xl font-extrabold text-white">Histórico de Atividades</h2>
              <p className="text-xs text-slate-500 font-semibold uppercase mt-1">Sessões arquivadas no Banco de Dados</p>

              <div className="mt-6 space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-indigo-400" />
                  Discussões Consultivas IA ({chatSessions.length})
                </h3>

                <div className="space-y-3.5">
                  {chatSessions.map(sess => (
                    <div key={sess.id} className="p-4 bg-slate-900/60 border border-slate-900 rounded-2xl flex items-center justify-between gap-4">
                      <div>
                        <span className="text-xs font-bold text-slate-200 block">{sess.title}</span>
                        <span className="text-[10px] text-slate-500 font-medium mt-1 block">Última atualização: {sess.lastUpdated} — {sess.messages.length} mensagens trocadas</span>
                      </div>
                      <button
                        id={`btn-history-view-chat-${sess.id}`}
                        onClick={() => {
                          setActiveSessionId(sess.id);
                          setActiveTab('chat');
                        }}
                        className="px-3.5 py-2 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 font-bold text-xs rounded-xl border border-indigo-500/10 transition-all"
                      >
                        Visualizar Chat
                      </button>
                    </div>
                  ))}
                </div>

                <hr className="border-slate-900 my-6" />

                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <FileText className="w-4 h-4 text-pink-400" />
                  Auditorias Método CRESCER™ ({latestDiagnostics.length})
                </h3>

                {latestDiagnostics.length === 0 ? (
                  <p className="text-xs text-slate-600 font-semibold py-4">Nenhuma auditoria finalizada ainda.</p>
                ) : (
                  <div className="space-y-3.5">
                    {latestDiagnostics.map(diag => (
                      <div key={diag.id} className="p-4 bg-slate-900/60 border border-slate-900 rounded-2xl flex items-center justify-between gap-4">
                        <div>
                          <span className="text-xs font-bold text-slate-200 block">Diagnóstico de {diag.updatedAt}</span>
                          <span className="text-[10px] text-slate-500 font-medium mt-1 block">Maturidade Geral: <strong className="text-indigo-400">{diag.scoreCrescer}%</strong></span>
                        </div>
                        <button
                          id={`btn-history-view-diag-${diag.id}`}
                          onClick={() => {
                            setActiveTab('relatorios');
                          }}
                          className="px-3.5 py-2 bg-pink-600/10 hover:bg-pink-600/20 text-pink-400 font-bold text-xs rounded-xl border border-pink-500/10 transition-all"
                        >
                          Visualizar Relatório
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'perfil' && (
          <ProfileSection 
            profile={currentUser} 
            onSave={handleSaveProfile} 
          />
        )}

        {activeTab === 'admin' && <AdminPanel />}

        {activeTab === 'configuracoes' && (
          <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
            <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 shadow-xl space-y-6">
              <div className="flex items-center gap-3 text-indigo-400">
                <Settings className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Configurações Operacionais</span>
              </div>
              <h2 className="text-xl font-extrabold text-white">Parâmetros de Segurança & Integração</h2>
              <hr className="border-slate-900" />

              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-slate-900/60 border border-slate-900 rounded-2xl">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-200 block">Isolamento Multi-Tenant</span>
                    <span className="text-[10px] text-slate-500 font-medium block">Segurança por ID de Usuário (UID) ativo</span>
                  </div>
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/25 rounded-full uppercase tracking-wider">Ativo</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-900/60 border border-slate-900 rounded-2xl">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-200 block">Sincronização Firestore</span>
                    <span className="text-[10px] text-slate-500 font-medium block">Backup e sincronia automática de auditorias e discussões</span>
                  </div>
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/25 rounded-full uppercase tracking-wider">Ativo</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-900/60 border border-slate-900 rounded-2xl">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-200 block">Limite de Quota de IA</span>
                    <span className="text-[10px] text-slate-500 font-medium block">Quota de consultas mensais vinculadas ao plano {currentUser.plan || "Premium"}</span>
                  </div>
                  <span className="px-3 py-1 bg-indigo-600/10 text-indigo-400 text-xs font-bold border border-indigo-500/15 rounded-full uppercase tracking-wider">Ilimitado</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

    </div>
  );
}
