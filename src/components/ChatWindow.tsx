/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { Message, ChatSession } from "../types";
import { 
  Send, 
  Paperclip, 
  Sparkles, 
  Briefcase, 
  CornerDownLeft, 
  Plus, 
  Trash2, 
  CheckSquare, 
  Table, 
  TrendingUp, 
  Info,
  X,
  FileCheck
} from "lucide-react";
import { motion } from "motion/react";

interface ChatWindowProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
  onSendMessage: (text: string, fileData?: { name: string; type: string }) => Promise<void>;
  isGenerating: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onSendMessage,
  isGenerating
}) => {
  const [input, setInput] = useState("");
  const [attachedFile, setAttachedFile] = useState<{ name: string; type: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeSession = sessions.find(s => s.id === activeSessionId);
  const messages = activeSession ? activeSession.messages : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() && !attachedFile) return;

    const messageText = input;
    setInput("");
    const file = attachedFile || undefined;
    setAttachedFile(null);

    await onSendMessage(messageText, file);
  };

  const handleTriggerFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile({
        name: file.name,
        type: file.type || "application/octet-stream"
      });
    }
  };

  const starterPrompts = [
    { text: "Como melhorar o posicionamento do meu Google Meu Negócio?", category: "Comunicação" },
    { text: "Ideias práticas para motivar equipe de vendas no varejo físico.", category: "Vendas" },
    { text: "Como estruturar um plano de metas de faturamento viável?", category: "Estratégia" },
    { text: "Qual a melhor rotina para fazer conciliação bancária diária?", category: "Finanças" }
  ];

  // Renders markdown content with elegant custom styles (Checklists, Tables, Blocks, Lists, SWOT)
  const renderMessageContent = (text: string) => {
    const lines = text.split("\n");
    let inTable = false;
    let tableHeaders: string[] = [];
    let tableRows: string[][] = [];

    return (
      <div className="space-y-3.5 text-sm leading-relaxed text-slate-100 font-medium">
        {lines.map((line, idx) => {
          const trimmed = line.trim();

          // 1. Bullet Points or Lists
          if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-2">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full shrink-0 mt-2" />
                <span className="text-slate-200">{trimmed.slice(2)}</span>
              </div>
            );
          }

          // 2. Checklists / Todo Items
          if (trimmed.startsWith("[ ]") || trimmed.startsWith("[x]")) {
            const isChecked = trimmed.startsWith("[x]");
            return (
              <div key={idx} className="flex items-center gap-2.5 p-2 bg-slate-900/40 border border-slate-900 rounded-xl">
                <CheckSquare className={`w-4 h-4 shrink-0 ${isChecked ? "text-emerald-500" : "text-slate-600"}`} />
                <span className={isChecked ? "line-through text-slate-500" : "text-slate-200"}>
                  {trimmed.substring(3).trim()}
                </span>
              </div>
            );
          }

          // 3. Header Titles
          if (trimmed.startsWith("### ")) {
            return (
              <h4 key={idx} className="text-sm font-black text-indigo-400 uppercase tracking-wider pt-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>{trimmed.substring(4)}</span>
              </h4>
            );
          }
          if (trimmed.startsWith("## ")) {
            return (
              <h3 key={idx} className="text-base font-black text-white uppercase tracking-wider border-b border-slate-900 pb-1 pt-3">
                {trimmed.substring(3)}
              </h3>
            );
          }

          // 4. SWOT Matrices / Highlight Callouts
          if (trimmed.startsWith("[SWOT]") || trimmed.startsWith("[ANÁLISE]")) {
            return (
              <div key={idx} className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl flex gap-3 my-2">
                <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest block">Análise de Cenário</span>
                  <span className="text-slate-300 text-xs">{trimmed.replace(/\[(SWOT|ANÁLISE)\]/g, "").trim()}</span>
                </div>
              </div>
            );
          }

          // 5. Basic Table handling (simplistic parser for beauty)
          if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
            const columns = trimmed.split("|").map(c => c.trim()).filter(Boolean);
            if (trimmed.includes("---")) return null; // skip divider lines

            // If it's the start of table, save headers
            if (!inTable) {
              inTable = true;
              tableHeaders = columns;
              return (
                <div key={idx} className="overflow-x-auto my-3.5 border border-slate-900 rounded-2xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider">
                      <tr>
                        {columns.map((col, cIdx) => (
                          <th key={cIdx} className="px-4 py-2.5 font-extrabold">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900">
                      {/* rows will be rendered in subsequent lines */}
                    </tbody>
                  </table>
                </div>
              );
            }
            
            // Render row cell
            return (
              <div key={idx} className="px-4 py-2 bg-slate-950/20 border-b border-slate-900 flex justify-between gap-4 text-xs font-semibold">
                {columns.map((col, cIdx) => (
                  <span key={cIdx} className="text-slate-300">{col}</span>
                ))}
              </div>
            );
          }

          // End of table state
          inTable = false;

          // Default text paragraph
          return trimmed ? (
            <p key={idx} className="text-slate-300 text-sm leading-relaxed">{trimmed}</p>
          ) : <div key={idx} className="h-2" />;
        })}
      </div>
    );
  };

  return (
    <div id="chat-window-root" className="flex h-[calc(100vh-65px)] lg:h-screen bg-slate-950 relative overflow-hidden">
      
      {/* 1. Left Chat Session History Sidebar (Desktop only) */}
      <div className="hidden md:flex flex-col w-64 bg-slate-950 border-r border-slate-900 shrink-0">
        <div className="p-4 border-b border-slate-900">
          <button
            id="btn-chat-new-session"
            onClick={onNewSession}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/10"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Consultoria</span>
          </button>
        </div>

        {/* Scrollable list of previous sessions */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {sessions.length === 0 ? (
            <p className="text-center text-slate-600 text-xs font-medium py-8">Nenhuma sessão ativa.</p>
          ) : (
            sessions.map((sess) => {
              const isActive = sess.id === activeSessionId;
              return (
                <div 
                  key={sess.id}
                  className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                    isActive ? "bg-slate-900 text-white border border-slate-800" : "hover:bg-slate-900/40 text-slate-400 hover:text-slate-200"
                  }`}
                  onClick={() => onSelectSession(sess.id)}
                >
                  <div className="min-w-0 flex items-center gap-2">
                    <Briefcase className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-indigo-400" : "text-slate-600"}`} />
                    <span className="text-xs font-bold truncate pr-2">{sess.title || "Discussão Estratégica"}</span>
                  </div>
                  
                  <button
                    id={`btn-delete-session-${sess.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(sess.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-slate-850 hover:text-rose-400 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 2. Chat Conversation Stage Area */}
      <div className="flex-1 flex flex-col justify-between h-full bg-slate-950">
        
        {/* Message scroll container */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {messages.length === 0 ? (
            /* Starter Landing state */
            <div className="max-w-3xl mx-auto py-12 md:py-20 text-center space-y-8">
              <div className="inline-flex bg-indigo-600/10 text-indigo-400 p-4 rounded-3xl border border-indigo-500/10 mb-2 justify-center shadow-lg shadow-indigo-600/5">
                <Briefcase className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-white tracking-tight">Meu Consultor IA<span className="text-indigo-500">®</span></h2>
                <p className="text-slate-400 text-xs max-w-lg mx-auto leading-relaxed">
                  Conselheiro corporativo estratégico sênior focado em atração, vendas, margem e processos de pequenas empresas. O que deseja otimizar hoje?
                </p>
              </div>

              {/* Starter Prompt Selection Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto pt-4 text-left">
                {starterPrompts.map((prompt, idx) => (
                  <button
                    id={`btn-starter-prompt-${idx}`}
                    key={idx}
                    onClick={() => {
                      setInput(prompt.text);
                    }}
                    className="p-4 bg-slate-900 border border-slate-900 hover:border-slate-800 rounded-2xl text-left transition-all hover:bg-slate-900/60 group outline-none"
                  >
                    <span className="text-[9px] text-indigo-400 font-extrabold uppercase tracking-widest block mb-1">{prompt.category}</span>
                    <span className="text-xs font-bold text-slate-300 group-hover:text-white leading-relaxed">{prompt.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Messages List rendering */
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <div key={msg.id} className={`flex gap-4 ${isUser ? "justify-end" : "justify-start"}`}>
                    
                    {/* Model Avatar icon */}
                    {!isUser && (
                      <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-extrabold flex items-center justify-center shrink-0 text-xs">
                        MC
                      </div>
                    )}

                    {/* Chat Bubble card */}
                    <div className={`max-w-[85%] rounded-2xl p-4 border ${
                      isUser 
                        ? "bg-slate-900 border-slate-800 text-slate-200" 
                        : "bg-slate-900/30 border-slate-900 text-slate-100"
                    }`}>
                      {/* Subtitle timestamp */}
                      <span className="text-[9px] text-slate-500 font-bold block mb-1 uppercase tracking-wider">{isUser ? "Você" : "Meu Consultor IA®"}</span>
                      
                      {/* Rich Content parser */}
                      {isUser ? <p className="text-sm font-medium">{msg.text}</p> : renderMessageContent(msg.text)}
                    </div>

                    {/* User Avatar initials */}
                    {isUser && (
                      <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 font-bold flex items-center justify-center shrink-0 text-xs border border-slate-700">
                        ME
                      </div>
                    )}

                  </div>
                );
              })}

              {/* Bot typing state anim indicator */}
              {isGenerating && (
                <div className="flex gap-4 justify-start">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-extrabold flex items-center justify-center shrink-0 text-xs animate-pulse">
                    MC
                  </div>
                  <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Bottom Input Area Form container */}
        <div className="p-4 md:p-6 border-t border-slate-900 bg-slate-950/80 backdrop-blur-md">
          <div className="max-w-3xl mx-auto">
            
            {/* Displaying attached files indicators if any */}
            {attachedFile && (
              <div className="flex items-center justify-between p-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl text-xs font-bold mb-3">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4" />
                  <span>Documento Anexado: {attachedFile.name}</span>
                </div>
                <button
                  id="btn-remove-attachment"
                  onClick={() => setAttachedFile(null)}
                  className="p-1 rounded hover:bg-indigo-500/20 text-indigo-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <form id="chat-input-form" onSubmit={handleSend} className="relative">
              
              {/* Actual Input field */}
              <textarea
                id="chat-message-textarea"
                rows={1}
                placeholder="Pergunte sobre WhatsApp Business, contratação, fluxo de caixa..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                className="w-full pl-4 pr-24 py-3 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-2xl text-sm focus:outline-none placeholder-slate-600 text-slate-200 resize-none min-h-[46px] max-h-32"
              />

              {/* Action Buttons inside the text area */}
              <div className="absolute right-2 top-1.5 flex items-center gap-1.5">
                
                {/* File Attachment Hidden Input and Icon */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".png,.jpg,.jpeg,.pdf,.xlsx,.csv,.txt"
                />
                
                <button
                  id="btn-chat-attach-trigger"
                  type="button"
                  onClick={handleTriggerFile}
                  title="Anexar Planilha, PDF ou Imagem"
                  className="p-2 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-xl transition-all"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                {/* Send Button */}
                <button
                  id="btn-chat-send"
                  type="submit"
                  disabled={isGenerating || (!input.trim() && !attachedFile)}
                  className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white rounded-xl transition-all shadow-md shadow-indigo-600/10 flex items-center justify-center h-8 w-8"
                >
                  <Send className="w-4 h-4" />
                </button>

              </div>
            </form>

            <p className="text-[10px] text-slate-600 font-semibold text-center mt-3 uppercase tracking-wider">
              MEU CONSULTOR IA® — CONSELHOS CORPORATIVOS BASEADOS NO MÉTODO CRESCER™
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
