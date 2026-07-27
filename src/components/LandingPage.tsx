import React from "react";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Target,
  BarChart3,
  MessageSquareText,
  Palette,
  Radar,
  Instagram,
  ShieldCheck,
  PlayCircle,
  Building2,
  BrainCircuit,
  ListChecks,
  TrendingUp,
  ChevronRight,
  Clock3,
  Zap
} from "lucide-react";
import { motion } from "motion/react";

interface LandingPageProps {
  onStart: () => void;
  onLogin: () => void;
}

const resources = [
  {
    icon: MessageSquareText,
    title: "Converse com seu consultor de IA",
    description: "Receba orientações práticas para vendas, marketing, atendimento, gestão e crescimento.",
    label: "Tirar dúvidas e criar estratégias"
  },
  {
    icon: Target,
    title: "Descubra o que impede seu crescimento",
    description: "Faça um diagnóstico simples da empresa e veja quais áreas precisam de atenção primeiro.",
    label: "Fazer diagnóstico da empresa"
  },
  {
    icon: Radar,
    title: "Analise seus concorrentes",
    description: "Compare posicionamento, oportunidades e diferenciais para tomar decisões mais seguras.",
    label: "Abrir Radar da Concorrência"
  },
  {
    icon: Palette,
    title: "Crie campanhas e artes profissionais",
    description: "Produza ideias, textos e criativos para divulgar sua empresa com mais qualidade.",
    label: "Criar no Marketing Studio"
  },
  {
    icon: Instagram,
    title: "Melhore sua presença no Instagram",
    description: "Avalie seu perfil, encontre oportunidades e organize conteúdos mais estratégicos.",
    label: "Analisar meu Instagram"
  },
  {
    icon: BarChart3,
    title: "Acompanhe planos e resultados",
    description: "Transforme recomendações em ações claras e acompanhe a evolução da sua empresa.",
    label: "Ver plano de crescimento"
  }
];

const steps = [
  { icon: Building2, number: "01", title: "Conte sobre sua empresa", text: "Preencha seu perfil para a IA entender seu negócio, público e objetivos." },
  { icon: BrainCircuit, number: "02", title: "Receba uma análise inteligente", text: "A plataforma identifica prioridades e apresenta recomendações personalizadas." },
  { icon: ListChecks, number: "03", title: "Siga um plano simples", text: "Veja o que fazer primeiro, quais ações executar e como melhorar seus resultados." },
  { icon: TrendingUp, number: "04", title: "Acompanhe sua evolução", text: "Registre metas, acompanhe indicadores e tome decisões com mais segurança." }
];

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, onLogin }) => {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div id="landing-page-root" className="min-h-screen bg-[#07101f] text-white font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/3 h-[520px] w-[520px] rounded-full bg-indigo-600/15 blur-[120px]" />
        <div className="absolute top-[45%] -right-48 h-[460px] w-[460px] rounded-full bg-cyan-500/10 blur-[130px]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#07101f]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex items-center gap-3 text-left">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-700 shadow-lg shadow-indigo-900/40">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-lg font-black leading-none tracking-tight">Meu Consultor IA<span className="text-indigo-400">®</span></span>
              <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.22em] text-slate-400">Inteligência para pequenas empresas</span>
            </div>
          </button>

          <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-300 lg:flex">
            <button onClick={() => scrollTo("recursos")} className="transition hover:text-white">O que você pode fazer</button>
            <button onClick={() => scrollTo("como-funciona")} className="transition hover:text-white">Como funciona</button>
            <button onClick={() => scrollTo("plano")} className="transition hover:text-white">Plano</button>
          </nav>

          <div className="flex items-center gap-2">
            <button onClick={onLogin} className="hidden rounded-xl px-4 py-2.5 text-sm font-bold text-slate-200 transition hover:bg-white/5 sm:block">Entrar</button>
            <button onClick={onStart} className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-extrabold shadow-lg shadow-indigo-950/40 transition hover:bg-indigo-500">
              Começar agora
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <section className="px-5 pb-20 pt-16 lg:px-8 lg:pb-28 lg:pt-24">
          <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.05fr_.95fr]">
            <div>
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-indigo-300">
                <Zap className="h-3.5 w-3.5" />
                Estratégia, marketing e gestão em um só lugar
              </motion.div>

              <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .08 }} className="max-w-4xl text-4xl font-black leading-[1.06] tracking-[-0.04em] sm:text-5xl lg:text-7xl">
                A inteligência que faltava para sua empresa <span className="bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent">crescer com direção.</span>
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .16 }} className="mt-7 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                Entenda os problemas do seu negócio, receba um plano de ação, crie campanhas e tome decisões melhores com um consultor de IA disponível a qualquer hora.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .24 }} className="mt-9 flex flex-col gap-3 sm:flex-row">
                <button onClick={onStart} className="group flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-7 py-4 text-sm font-black shadow-xl shadow-indigo-950/50 transition hover:-translate-y-0.5 hover:bg-indigo-500">
                  Comece por aqui
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </button>
                <button onClick={() => scrollTo("como-funciona")} className="flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-7 py-4 text-sm font-bold text-slate-200 transition hover:bg-white/10">
                  <PlayCircle className="h-4 w-4" />
                  Ver como funciona
                </button>
              </motion.div>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs font-semibold text-slate-400">
                <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Fácil de usar</span>
                <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Feito para pequenas empresas</span>
                <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Orientações práticas</span>
              </div>
            </div>

            <motion.div initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .55, delay: .18 }} className="relative">
              <div className="absolute -inset-5 rounded-[38px] bg-gradient-to-br from-indigo-500/20 to-cyan-500/5 blur-2xl" />
              <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-slate-950/80 p-4 shadow-2xl shadow-black/40">
                <div className="flex items-center justify-between border-b border-white/10 px-2 pb-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-indigo-300">Seu painel de crescimento</p>
                    <h3 className="mt-1 text-xl font-black">O que você quer melhorar hoje?</h3>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15"><Sparkles className="h-5 w-5 text-indigo-300" /></div>
                </div>
                <div className="grid gap-3 pt-4 sm:grid-cols-2">
                  {resources.slice(0, 4).map(({ icon: Icon, title, label }) => (
                    <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition hover:border-indigo-400/30 hover:bg-indigo-500/[0.06]">
                      <Icon className="mb-4 h-5 w-5 text-indigo-300" />
                      <p className="text-sm font-extrabold leading-5">{title}</p>
                      <p className="mt-3 flex items-center gap-1 text-[11px] font-bold text-slate-400">{label}<ChevronRight className="h-3 w-3" /></p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-3 rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.06] p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10"><Clock3 className="h-5 w-5 text-emerald-300" /></div>
                  <div><p className="text-sm font-extrabold">Consultor disponível 24 horas</p><p className="mt-1 text-xs text-slate-400">Pergunte, planeje e execute no seu ritmo.</p></div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="recursos" className="border-y border-white/10 bg-white/[0.025] px-5 py-20 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-300">Tudo explicado de forma simples</p>
              <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">Você não precisa entender de marketing ou inteligência artificial.</h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400">Cada ferramenta mostra claramente o que faz e qual é o próximo passo. Assim, qualquer pessoa consegue navegar e colocar as recomendações em prática.</p>
            </div>
            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {resources.map(({ icon: Icon, title, description, label }) => (
                <article key={title} className="group rounded-3xl border border-white/10 bg-[#0b1628] p-6 transition hover:-translate-y-1 hover:border-indigo-400/30">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-300"><Icon className="h-6 w-6" /></div>
                  <h3 className="mt-6 text-lg font-black">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{description}</p>
                  <p className="mt-6 flex items-center gap-1 text-xs font-extrabold text-indigo-300">{label}<ChevronRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" /></p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="como-funciona" className="px-5 py-20 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-300">Comece por aqui</p>
              <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">Do primeiro acesso ao plano de crescimento</h2>
              <p className="mx-auto mt-5 max-w-2xl text-slate-400">A plataforma conduz você por uma sequência clara, sem menus confusos e sem termos complicados.</p>
            </div>
            <div className="mt-14 grid gap-5 lg:grid-cols-4">
              {steps.map(({ icon: Icon, number, title, text }) => (
                <div key={number} className="relative rounded-3xl border border-white/10 bg-white/[0.035] p-6">
                  <span className="absolute right-5 top-4 text-4xl font-black text-white/[0.06]">{number}</span>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white"><Icon className="h-6 w-6" /></div>
                  <h3 className="mt-6 text-lg font-black">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="plano" className="border-y border-white/10 bg-gradient-to-b from-indigo-950/25 to-transparent px-5 py-20 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-300">Um único plano. Acesso completo.</p>
              <h2 className="mt-4 text-3xl font-black sm:text-5xl">Todas as ferramentas para cuidar do crescimento da sua empresa.</h2>
            </div>
            <div className="mx-auto mt-12 max-w-2xl rounded-[32px] border border-indigo-400/30 bg-[#0b1628] p-7 shadow-2xl shadow-indigo-950/40 sm:p-10">
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                <div><p className="text-xs font-black uppercase tracking-wider text-indigo-300">Plano completo</p><h3 className="mt-2 text-2xl font-black">Meu Consultor IA Premium</h3><p className="mt-2 text-sm text-slate-400">Estratégia, diagnóstico, marketing e acompanhamento em uma única plataforma.</p></div>
                <div className="shrink-0 sm:text-right"><span className="text-4xl font-black">R$ 49,90</span><span className="text-sm font-bold text-slate-400">/mês</span></div>
              </div>
              <div className="my-8 h-px bg-white/10" />
              <div className="grid gap-4 sm:grid-cols-2">
                {["Consultor de IA disponível 24 horas", "Diagnóstico completo da empresa", "Radar da Concorrência", "Marketing Studio com IA", "Auditoria de Instagram", "Planos de ação e relatórios", "Histórico das análises", "Novas ferramentas e melhorias"].map(item => (
                  <div key={item} className="flex items-start gap-3 text-sm font-semibold text-slate-300"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />{item}</div>
                ))}
              </div>
              <button onClick={onStart} className="mt-9 flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-4 text-sm font-black transition hover:bg-indigo-500">Começar agora<ArrowRight className="h-4 w-4" /></button>
            </div>
          </div>
        </section>

        <section className="px-5 py-20 lg:px-8">
          <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-8 rounded-[34px] border border-white/10 bg-gradient-to-r from-indigo-600/20 to-cyan-500/10 p-8 text-center sm:p-12 lg:flex-row lg:text-left">
            <div><p className="text-sm font-extrabold text-indigo-300">Pronto para começar?</p><h2 className="mt-2 max-w-2xl text-3xl font-black tracking-tight">Tenha mais clareza para decidir o próximo passo da sua empresa.</h2></div>
            <button onClick={onStart} className="flex shrink-0 items-center gap-2 rounded-2xl bg-white px-7 py-4 text-sm font-black text-slate-950 transition hover:-translate-y-0.5">Comece por aqui<ArrowRight className="h-4 w-4" /></button>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/10 px-5 py-8 text-sm text-slate-500 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <p>© {new Date().getFullYear()} Meu Consultor IA®. Todos os direitos reservados.</p>
          <p className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-400" />Acesso protegido e dados tratados com segurança.</p>
        </div>
      </footer>
    </div>
  );
};