/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
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
import { CRMBoard } from "./components/CRMBoard";
import { SalesDirector } from "./components/SalesDirector";
import { DIAG_QUESTIONS } from "./data";
import { FileText, MessageSquare, Settings } from "lucide-react";

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [authScreen, setAuthScreen] = useState<"landing" | "login" | "signup">("landing");
  const [publicAuditId, setPublicAuditId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<SidebarTab>("dashboard");
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [latestDiagnostics, setLatestDiagnostics] = useState<DiagnosticSession[]>([]);
  const [activeDiagAnswers, setActiveDiagAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const auditParam = params.get("audit");
    if (auditParam) setPublicAuditId(auditParam);
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user: UserProfile | null) => {
      if (user) {
        const updatedUser = { ...user };
        if (
          user.email &&
          (user.email.toLowerCase() === "enilsonlobo32@gmail.com" || user.email.toLowerCase().includes("enilson")) &&
          (!user.displayName || user.displayName.toLowerCase().includes("enilson"))
        ) {
          updatedUser.displayName = "Mestre";
        }
        setCurrentUser(updatedUser);
        void loadUserData(user.uid);
      } else {
        setCurrentUser(null);
      }
      setIsAuthenticating(false);
    });

    return () => unsubscribe();
  }, []);

  const loadUserData = async (uid: string) => {
    try {
      const chats = (await db.getDocs("chats", [{ field: "userId", val: uid }])) as ChatSession[];
      if (chats.length > 0) {
        setChatSessions(chats);
        setActiveSessionId(chats[chats.length - 1].id);
      } else {
        const defaultChat = (await db.addDoc("chats", {
          userId: uid,
          title: "Consulta Estratégica Inicial",
          lastUpdated: new Date().toLocaleDateString("pt-BR"),
          messages: [],
        })) as ChatSession;
        setChatSessions([defaultChat]);
        setActiveSessionId(defaultChat.id);
      }

      const diagnostics = (await db.getDocs("diagnostics", [{ field: "userId", val: uid }])) as DiagnosticSession[];
      setLatestDiagnostics(diagnostics);
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
    }
  };

  const handleSendMessage = async (text: string, fileData?: { name: string; type: string }) => {
    if (!currentUser || !activeSessionId) return;

    const targetSession = chatSessions.find((session) => session.id === activeSessionId);
    if (!targetSession) return;

    const promptText = fileData
      ? `[Arquivo Anexado: ${fileData.name} (${fileData.type})]\n\n${text || "Analise o arquivo e apresente recomendações estratégicas."}`
      : text;

    const userMessage: Message = {
      id: `msg-${Math.random().toString(36).slice(2)}`,
      role: "user",
      text: promptText,
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    };

    const updatedMessages = [...targetSession.messages, userMessage];
    setChatSessions((current) => current.map((session) => session.id === activeSessionId ? { ...session, messages: updatedMessages } : session));
    setIsGenerating(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages, profile: currentUser }),
      });
      if (!response.ok) throw new Error("Erro na comunicação com o servidor de IA.");

      const data = await response.json();
      const assistantMessage: Message = {
        id: `msg-${Math.random().toString(36).slice(2)}`,
        role: "model",
        text: data.text,
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      };
      const finalMessages = [...updatedMessages, assistantMessage];
      await db.updateDoc("chats", activeSessionId, {
        messages: finalMessages,
        lastUpdated: new Date().toLocaleDateString("pt-BR"),
      });
      setChatSessions((current) => current.map((session) => session.id === activeSessionId ? { ...session, messages: finalMessages } : session));
    } catch (error) {
      console.error(error);
      const fallbackMessage: Message = {
        id: `msg-${Math.random().toString(36).slice(2)}`,
        role: "model",
        text: `### Parecer operacional\nNão foi possível acessar a IA agora. Priorize resposta rápida no WhatsApp, acompanhamento das propostas abertas e solicitação de avaliações aos clientes satisfeitos.`,
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      };
      const finalMessages = [...updatedMessages, fallbackMessage];
      await db.updateDoc("chats", activeSessionId, {
        messages: finalMessages,
        lastUpdated: new Date().toLocaleDateString("pt-BR"),
      });
      setChatSessions((current) => current.map((session) => session.id === activeSessionId ? { ...session, messages: finalMessages } : session));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNewSession = async () => {
    if (!currentUser) return;
    const newChat = (await db.addDoc("chats", {
      userId: currentUser.uid,
      title: `Discussão Estratégica #${chatSessions.length + 1}`,
      lastUpdated: new Date().toLocaleDateString("pt-BR"),
      messages: [],
    })) as ChatSession;
    setChatSessions((current) => [newChat, ...current]);
    setActiveSessionId(newChat.id);
  };

  const handleDeleteSession = async (id: string) => {
    await db.deleteDoc("chats", id);
    const remaining = chatSessions.filter((session) => session.id !== id);
    setChatSessions(remaining);
    if (activeSessionId === id) setActiveSessionId(remaining[0]?.id || null);
  };

  const handleDiagnosticComplete = async (
    pillars: CrescerPillars,
    score: number,
    answers: Record<string, string>
  ) => {
    if (!currentUser) return;
    setIsGeneratingReport(true);

    try {
      const formattedAnswers = DIAG_QUESTIONS.map((question) => {
        const answerLabel = answers[question.id];
        const option = question.options.find((item) => item.label === answerLabel);
        return {
          questionText: question.questionText,
          answerText: answerLabel ? `${answerLabel} - ${option?.description || ""}` : "Não respondida",
        };
      });

      let compiledReportText = "";
      try {
        const reportResponse = await fetch("/api/report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profile: currentUser, answers: formattedAnswers, pillars, score }),
        });
        if (reportResponse.ok) compiledReportText = (await reportResponse.json()).text;
      } catch (error) {
        console.error("Erro ao gerar relatório:", error);
      }

      const diagnostic = (await db.addDoc("diagnostics", {
        userId: currentUser.uid,
        currentStep: 7,
        answers,
        scoreCrescer: score,
        pillars,
        completed: true,
        report: compiledReportText,
        createdAt: new Date().toLocaleDateString("pt-BR"),
        updatedAt: new Date().toLocaleDateString("pt-BR"),
      })) as DiagnosticSession;

      const updatedProfile = {
        scoreCrescer: score,
        ultimoDiagnostico: new Date().toLocaleDateString("pt-BR"),
        pillars,
      };
      await auth.updateProfileData(updatedProfile);
      setCurrentUser((current) => current ? { ...current, ...updatedProfile } : null);
      setLatestDiagnostics((current) => [diagnostic, ...current]);
      setActiveDiagAnswers({});
      setActiveTab("relatorios");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleSaveProfile = async (fields: Partial<UserProfile>) => {
    await auth.updateProfileData(fields);
    setCurrentUser((current) => current ? { ...current, ...fields } : null);
  };

  const handleGenerateCompetitionAnalysis = async (cidade: string, segmento: string, empresa: string) => {
    const response = await fetch("/api/radar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cidade, segmento, empresa }),
    });
    if (!response.ok) throw new Error("Erro ao compilar análise local.");
    const data = await response.json();
    await db.addDoc("competition", {
      userId: currentUser?.uid,
      empresa,
      segmento,
      cidade,
      analysisText: data.text,
      createdAt: new Date().toLocaleDateString("pt-BR"),
    });
    return data.text as string;
  };

  const isAdmin = currentUser?.email === "admin@consultoria.com.br" || currentUser?.email === "enilsonlobo32@gmail.com";

  if (publicAuditId) {
    return (
      <PublicAuditView
        auditId={publicAuditId}
        onBackToApp={() => {
          window.history.pushState({}, document.title, window.location.pathname);
          setPublicAuditId(null);
        }}
      />
    );
  }

  if (isAuthenticating) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center gap-4 text-slate-100">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Iniciando Meu Consultor IA®...</p>
      </div>
    );
  }

  if (isGeneratingReport) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center gap-6 text-slate-100 p-6 text-center">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <div>
          <h2 className="text-xl font-extrabold text-white">Compilando auditoria...</h2>
          <p className="mt-2 text-sm text-slate-400">Preparando seu diagnóstico e plano de ação.</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    if (authScreen === "landing") {
      return <LandingPage onStart={() => setAuthScreen("signup")} onLogin={() => setAuthScreen("login")} />;
    }
    return (
      <LoginScreen
        initialMode={authScreen === "signup" ? "signup" : "login"}
        onSuccess={() => setAuthScreen("landing")}
        onBackToLanding={() => setAuthScreen("landing")}
      />
    );
  }

  const finishedDiagnostic = latestDiagnostics.find((diagnostic) => diagnostic.completed);

  return (
    <div className="h-screen bg-slate-900 text-slate-100 flex flex-col lg:flex-row font-sans overflow-hidden">
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        userName={
          currentUser.email?.toLowerCase() === "enilsonlobo32@gmail.com" || currentUser.displayName?.toLowerCase().includes("enilson")
            ? "Mestre"
            : currentUser.displayName || currentUser.email
        }
        userRole={`${currentUser.plan || "Premium"} Member`}
        onLogout={() => {
          void auth.signOut();
          setAuthScreen("landing");
        }}
        isAdmin={Boolean(isAdmin)}
      />

      <main id="main-content-canvas" className="flex-1 bg-slate-900 overflow-y-auto pb-12 min-h-0">
        {activeTab === "dashboard" && (
          <Dashboard profile={currentUser} onTabChange={setActiveTab} onSaveProfile={handleSaveProfile} />
        )}

        {activeTab === "chat" && (
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

        {activeTab === "diagnostico" && (
          <DiagnosticSection
            userId={currentUser.uid}
            onComplete={handleDiagnosticComplete}
            savedAnswers={activeDiagAnswers}
          />
        )}

        {activeTab === "vendas" && (
          <div className="space-y-8 pb-10">
            <CRMBoard profile={currentUser} />
            <div className="max-w-[1500px] mx-auto px-5 md:px-8">
              <SalesDirector profile={currentUser} />
            </div>
          </div>
        )}

        {activeTab === "radar" && (
          <CompetitionRadar
            userCity={currentUser.cidade}
            userSegment={currentUser.segmento}
            userCompany={currentUser.empresa}
            onGenerateAnalysis={handleGenerateCompetitionAnalysis}
          />
        )}

        {activeTab === "plano" && (
          <ActionPlanSection pillars={currentUser.pillars || {
            conhecimento: 0,
            relacionamento: 0,
            estrategia: 0,
            sistema: 0,
            comunicacao: 0,
            eficiencia: 0,
            resultados: 0,
          }} />
        )}

        {activeTab === "relatorios" && (
          finishedDiagnostic ? (
            <ReportViewer
              pillars={finishedDiagnostic.pillars}
              score={finishedDiagnostic.scoreCrescer}
              empresa={currentUser.empresa}
              segmento={currentUser.segmento}
              cidade={currentUser.cidade}
              onRestart={() => setActiveTab("diagnostico")}
              savedReportMarkdown={finishedDiagnostic.report}
            />
          ) : (
            <EmptyState
              title="Nenhum relatório disponível"
              description="Conclua o diagnóstico Método CRESCER™ para gerar seu relatório executivo."
              buttonLabel="Realizar diagnóstico"
              onClick={() => setActiveTab("diagnostico")}
            />
          )
        )}

        {activeTab === "artes" && <PostDesignStudio profile={currentUser} />}
        {activeTab === "instagram_audits" && <InstagramAudit profile={currentUser} />}

        {activeTab === "historico" && (
          <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6">
              <h2 className="text-xl font-extrabold text-white">Histórico de atividades</h2>
              <div className="mt-6 space-y-3">
                {chatSessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => {
                      setActiveSessionId(session.id);
                      setActiveTab("chat");
                    }}
                    className="w-full p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between text-left"
                  >
                    <span><strong className="block text-sm text-white">{session.title}</strong><small className="text-slate-500">{session.messages.length} mensagens</small></span>
                    <MessageSquare className="w-4 h-4 text-indigo-400" />
                  </button>
                ))}
                {latestDiagnostics.map((diagnostic) => (
                  <button key={diagnostic.id} onClick={() => setActiveTab("relatorios")} className="w-full p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between text-left">
                    <span><strong className="block text-sm text-white">Diagnóstico de {diagnostic.updatedAt}</strong><small className="text-slate-500">Maturidade: {diagnostic.scoreCrescer}%</small></span>
                    <FileText className="w-4 h-4 text-pink-400" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "perfil" && <ProfileSection profile={currentUser} onSave={handleSaveProfile} />}
        {activeTab === "admin" && <AdminPanel />}

        {activeTab === "configuracoes" && (
          <div className="p-6 md:p-8 max-w-4xl mx-auto">
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-5">
              <div className="flex items-center gap-3 text-indigo-400"><Settings className="w-5 h-5" /><span className="text-xs font-bold uppercase">Configurações operacionais</span></div>
              <h2 className="text-xl font-extrabold text-white">Segurança e integração</h2>
              {["Isolamento por usuário ativo", "Sincronização com banco de dados ativa", `Plano atual: ${currentUser.plan || "Premium"}`].map((item) => (
                <div key={item} className="p-4 rounded-2xl border border-slate-800 bg-slate-900 text-sm text-slate-300">{item}</div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function EmptyState({
  title,
  description,
  buttonLabel,
  onClick,
}: {
  title: string;
  description: string;
  buttonLabel: string;
  onClick: () => void;
}) {
  return (
    <div className="p-12 text-center max-w-lg mx-auto my-16 bg-slate-950 border border-slate-800 rounded-3xl space-y-5">
      <FileText className="w-8 h-8 text-indigo-400 mx-auto" />
      <div><h3 className="font-extrabold text-white">{title}</h3><p className="mt-2 text-xs text-slate-500">{description}</p></div>
      <button onClick={onClick} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold">{buttonLabel}</button>
    </div>
  );
}
