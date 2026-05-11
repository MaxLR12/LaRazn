"use client";

import { useState } from "react";
import type { Poll } from "./page";

interface Props {
  polls: Poll[];
  onRefresh: () => void;
}

export default function PollList({ polls, onRefresh }: Props) {
  const [copied, setCopied] = useState<string | null>(null);

  function getEmbedCode(id: string) {
    const base = typeof window !== "undefined" ? window.location.origin : "";
    return `<iframe src="${base}/embed/${id}" width="100%" height="520" frameborder="0" scrolling="no" style="border:none;overflow:hidden" allowtransparency="true"></iframe>`;
  }

  async function copyEmbed(id: string) {
    await navigator.clipboard.writeText(getEmbedCode(id));
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  async function deletePoll(id: string) {
    if (!confirm("¿Eliminar esta encuesta? Esta acción no se puede deshacer.")) return;
    await fetch(`/api/polls/${id}`, { method: "DELETE" });
    onRefresh();
  }

  if (!polls.length) {
    return (
      <div className="text-center py-20 text-gray-400">
        <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p className="font-medium">No hay encuestas todavía.</p>
        <p className="text-sm mt-1">Crea la primera usando el botón de arriba.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">{polls.length} encuesta{polls.length !== 1 ? "s" : ""}</p>
      {polls.map((poll) => (
        <div key={poll.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-lg truncate">{poll.title}</h3>
              <p className="text-gray-600 text-sm mt-0.5 truncate">{poll.question}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                <span>{poll.options.length} opciones</span>
                <span>{poll._count.votes} voto{poll._count.votes !== 1 ? "s" : ""}</span>
                <span>{new Date(poll.createdAt).toLocaleDateString("es-ES")}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a
                href={`/embed/${poll.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded px-2.5 py-1.5 transition-colors"
              >
                Vista previa
              </a>
              <button
                onClick={() => copyEmbed(poll.id)}
                className="text-xs bg-red-600 hover:bg-red-700 text-white rounded px-2.5 py-1.5 transition-colors font-medium"
              >
                {copied === poll.id ? "¡Copiado!" : "Copiar iframe"}
              </button>
              <button
                onClick={() => deletePoll(poll.id)}
                className="text-gray-400 hover:text-red-500 transition-colors p-1.5"
                title="Eliminar encuesta"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 font-medium mb-1.5">Código de embed:</p>
            <code className="text-xs text-gray-700 break-all">{getEmbedCode(poll.id)}</code>
          </div>
        </div>
      ))}
    </div>
  );
}
