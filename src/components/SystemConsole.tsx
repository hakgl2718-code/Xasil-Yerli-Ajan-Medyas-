import React, { useState } from "react";
import { Terminal, Trash2, Shield, Clock, Cpu, FileJson, AlertCircle } from "lucide-react";
import { LogEntry } from "../types";

interface SystemConsoleProps {
  logs: LogEntry[];
  setLogs: React.Dispatch<React.SetStateAction<LogEntry[]>>;
}

export default function SystemConsole({ logs, setLogs }: SystemConsoleProps) {
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("all");

  const filteredLogs = logs.filter((log) => {
    if (filterType === "all") return true;
    return log.type === filterType;
  });

  const selectedLog = logs.find((l) => l.id === selectedLogId);

  // Stats calculation
  const totalGenerations = logs.length;
  const averageLatency =
    logs.length > 0 ? Math.round(logs.reduce((sum, l) => sum + l.latencyMs, 0) / logs.length) : 0;

  const latestLogWithModel = [...logs].reverse().find(l => l.model);
  const rawModel = latestLogWithModel?.model || "Llama 3 / Gemini";
  const activeModel = rawModel.includes("/") ? rawModel.split("/").pop() || rawModel : rawModel;

  return (
    <div className="flex-1 overflow-hidden flex flex-col md:flex-row h-[calc(100vh-80px)] md:h-full w-full">
      {/* Left Pane: Logs Stream */}
      <div className="flex-1 overflow-y-auto border-r border-slate-200 bg-white p-4 md:p-6 space-y-4 flex flex-col">
        {/* Header Console controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-50 border border-red-200 text-red-600">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sans text-sm font-black text-slate-900 uppercase tracking-tight">
                Yapay Zeka API Günlükleri
              </h3>
              <p className="font-mono text-[10px] text-red-600 font-extrabold">
                Canlı {activeModel} İstek & Yanıt Akışı
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-mono text-[11px] font-bold text-slate-700 focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="all">TÜMÜ</option>
              <option value="post_generation">GÖNDERİ ÜRETİMİ</option>
              <option value="reply_generation">YORUM YANITI</option>
              <option value="gatekeeper_evaluation">KAPI BEKÇİSİ</option>
            </select>

            <button
              onClick={() => {
                setLogs([]);
                setSelectedLogId(null);
              }}
              className="p-2 rounded-lg bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-200 text-slate-500 hover:text-red-600 transition-all ml-auto"
              title="Günlükleri Temizle"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Diagnostic Stats Banner */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl flex items-center gap-2.5">
            <Cpu className="w-4.5 h-4.5 text-rose-600" />
            <div>
              <div className="text-[9px] font-mono font-black text-rose-500 uppercase">MODEL</div>
              <div className="text-[11px] font-mono font-black text-rose-700 truncate max-w-[80px]" title={rawModel}>
                {activeModel}
              </div>
            </div>
          </div>
          <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-xl flex items-center gap-2.5">
            <FileJson className="w-4.5 h-4.5 text-indigo-600" />
            <div>
              <div className="text-[9px] font-mono font-black text-indigo-500 uppercase">TOPLAM ÇAĞRI</div>
              <div className="text-[11px] font-mono font-black text-indigo-700">{totalGenerations}</div>
            </div>
          </div>
          <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex items-center gap-2.5">
            <Clock className="w-4.5 h-4.5 text-emerald-600 animate-pulse" />
            <div>
              <div className="text-[9px] font-mono font-black text-emerald-500 uppercase">ORT. GECİKME</div>
              <div className="text-[11px] font-mono font-black text-emerald-700 font-bold">
                {averageLatency > 0 ? `${averageLatency} ms` : "0 ms"}
              </div>
            </div>
          </div>
        </div>

        {/* Log Entries list */}
        <div className="flex-1 space-y-2 overflow-y-auto pr-1">
          {filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/40">
              <AlertCircle className="w-8 h-8 text-slate-400 mb-2" />
              <p className="font-mono text-xs font-bold text-slate-500">Henüz hiç API çağrısı yapılmadı.</p>
              <p className="font-sans text-[11px] text-slate-400 mt-1 font-semibold">
                Sosyal medya akışında bir post ürettirin veya yorum yapın.
              </p>
            </div>
          ) : (
            filteredLogs
              .slice()
              .reverse()
              .map((log) => {
                const isSelected = selectedLogId === log.id;

                return (
                  <button
                    key={log.id}
                    onClick={() => setSelectedLogId(log.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 block ${
                      isSelected
                        ? "bg-indigo-50/60 border-indigo-400 shadow-xs"
                        : "bg-slate-50/50 border-slate-200/80 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span
                        className={`text-[9px] font-mono font-black px-2 py-0.5 rounded border uppercase tracking-wider ${
                          log.type === "post_generation"
                            ? "bg-indigo-100 text-indigo-700 border-indigo-200"
                            : log.type === "gatekeeper_evaluation"
                            ? "bg-violet-100 text-violet-700 border-violet-200"
                            : "bg-emerald-100 text-emerald-700 border-emerald-200"
                        }`}
                      >
                        {log.type === "post_generation" ? "POST" : log.type === "gatekeeper_evaluation" ? "GATEKEEPER" : "REPLY"}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    <div className="text-xs font-black text-slate-800 truncate">
                      {log.agentName} - "{log.responseReceived}"
                    </div>

                    <div className="flex items-center gap-3 text-[10px] font-mono font-bold text-slate-400 mt-2 pt-1.5 border-t border-slate-200/60">
                      <span>{log.latencyMs} ms</span>
                      <span>•</span>
                      <span className="text-emerald-600">HTTP 200 (OK)</span>
                    </div>
                  </button>
                );
              })
          )}
        </div>
      </div>

      {/* Right Pane: Inspector / Payload Detail */}
      <div className="w-full md:w-[450px] bg-slate-50 p-4 md:p-6 overflow-y-auto flex flex-col space-y-4 border-t md:border-t-0 md:border-l border-slate-200 shrink-0">
        <div className="border-b border-slate-200 pb-4">
          <h4 className="font-sans text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-600" />
            Çağrı Detayları Müfettişi
          </h4>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            Giden system instruction yapılandırmasını ve modelin ham yanıtını inceleyin.
          </p>
        </div>

        {selectedLog ? (
          <div className="space-y-4 flex-1">
            {/* Metadata cards */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 font-mono text-[11px] space-y-1.5 text-slate-500 font-bold">
              <div className="flex justify-between">
                <span>Zaman Damgası:</span>
                <span className="text-slate-800">{new Date(selectedLog.timestamp).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Ajan:</span>
                <span className="text-indigo-600 font-black">{selectedLog.agentName}</span>
              </div>
              <div className="flex justify-between">
                <span>Model:</span>
                <span className="text-emerald-600 font-black truncate max-w-[250px]" title={selectedLog.model || "Gemini Fallback"}>
                  {selectedLog.model || "gemini-3.5-flash"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Gecikme:</span>
                <span className="text-rose-600 font-black">{selectedLog.latencyMs} ms</span>
              </div>
            </div>

            {/* Prompt Inspector */}
            <div>
              <div className="text-[9px] font-mono font-black text-slate-400 uppercase tracking-wider mb-1.5">
                Gönderilen Prompt & Yönerge (Request)
              </div>
              <pre className="bg-slate-950 text-indigo-200 border-2 border-slate-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-xl p-3 text-[10px] font-mono overflow-x-auto whitespace-pre-wrap max-h-[220px]">
                {selectedLog.promptUsed}
              </pre>
            </div>

            {/* Response Inspector */}
            <div>
              <div className="text-[9px] font-mono font-black text-slate-400 uppercase tracking-wider mb-1.5">
                Üretilen Ham Metin (Response Text)
              </div>
              <div className="bg-slate-950 text-emerald-400 border-2 border-slate-950 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-xl p-4 font-mono text-xs leading-relaxed max-h-[200px] overflow-y-auto">
                "{selectedLog.responseReceived}"
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-20 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-white/50">
            <Terminal className="w-10 h-10 mb-2 opacity-30 text-slate-500" />
            <p className="font-mono text-xs font-bold">Bir çağrı detayı seçin</p>
            <p className="text-[11px] font-medium mt-1 max-w-[200px] text-slate-400">
              Sol taraftan incelemek istediğiniz API isteğine tıklayın.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
