"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface ResultOption {
  id: string;
  text: string;
  imageUrl: string | null;
  votes: number;
  percent: number;
}

interface PollData {
  poll: {
    id: string;
    title: string;
    question: string;
    imageUrl: string | null;
    imageSize: string;
  };
  results: ResultOption[];
  total: number;
  hasVoted: boolean;
  votedOptionId: string | null;
}

interface Props {
  pollId: string;
}

function OptionImage({ url, text, large }: { url: string; text: string; large: boolean }) {
  if (large) {
    return (
      <div className="relative shrink-0 rounded-lg overflow-hidden" style={{ width: 120, height: 120 }}>
        <Image src={url} alt={text} fill className="object-cover" unoptimized />
      </div>
    );
  }
  return (
    <div className="relative w-10 h-10 shrink-0 rounded overflow-hidden">
      <Image src={url} alt={text} fill className="object-cover" unoptimized />
    </div>
  );
}

export default function PollEmbed({ pollId }: Props) {
  const [data, setData] = useState<PollData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    try {
      const res = await fetch(`/api/polls/${pollId}/results`);
      if (!res.ok) throw new Error("not found");
      const json = await res.json();
      setData(json);
    } catch {
      setError("Encuesta no disponible.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollId]);

  async function handleVote() {
    if (!selected) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/polls/${pollId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionId: selected }),
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok) {
        if (json.alreadyVoted) { await load(); return; }
        setError(json.error ?? "Error al votar.");
        return;
      }
      setData((prev) =>
        prev
          ? {
              ...prev,
              results: json.results,
              total: json.results.reduce((s: number, o: ResultOption) => s + o.votes, 0),
              hasVoted: true,
              votedOptionId: selected,
            }
          : prev
      );
    } catch {
      setError("Error de red. Inténtalo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px] bg-white">
        <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex items-center justify-center min-h-[200px] bg-white">
        <p className="text-gray-500 text-sm">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const { poll, results, total, hasVoted, votedOptionId } = data;
  const showResults = hasVoted;
  const large = poll.imageSize === "large";

  return (
    <div className="bg-white font-sans p-5 max-w-xl mx-auto">
      {poll.imageUrl && (
        <div className="relative w-full h-40 mb-4 rounded-lg overflow-hidden">
          <Image src={poll.imageUrl} alt={poll.title} fill className="object-cover" unoptimized />
        </div>
      )}

      <h2 className="text-xl font-bold text-gray-900 mb-1">{poll.title}</h2>
      <p className="text-gray-700 text-sm mb-4">{poll.question}</p>

      <div className="space-y-2.5">
        {results.map((opt) => {
          const isVoted = votedOptionId === opt.id;
          const isSelected = selected === opt.id;
          const minH = large && opt.imageUrl ? "min-h-[136px]" : "";

          if (showResults) {
            return (
              <div key={opt.id} className="relative">
                <div
                  className={`relative flex items-center gap-3 rounded-lg border px-3 py-3 overflow-hidden ${minH} ${
                    isVoted ? "border-red-500 bg-red-50" : "border-gray-200 bg-white"
                  }`}
                >
                  <div
                    className="absolute left-0 top-0 bottom-0 bg-red-100 transition-all duration-700"
                    style={{ width: `${opt.percent}%` }}
                  />
                  {opt.imageUrl && (
                    <div className="relative z-10">
                      <OptionImage url={opt.imageUrl} text={opt.text} large={large} />
                    </div>
                  )}
                  <span className="flex-1 text-sm font-medium text-gray-800 relative z-10">
                    {opt.text}
                    {isVoted && (
                      <span className="ml-2 text-xs text-red-600 font-semibold">✓ Tu voto</span>
                    )}
                  </span>
                  <span className="text-sm font-bold text-gray-700 relative z-10 shrink-0">
                    {opt.percent}%
                  </span>
                </div>
              </div>
            );
          }

          return (
            <button
              key={opt.id}
              onClick={() => setSelected(opt.id)}
              className={`w-full flex items-center gap-3 rounded-lg border px-3 py-3 text-left transition-colors ${minH} ${
                isSelected
                  ? "border-red-500 bg-red-50"
                  : "border-gray-200 bg-white hover:border-red-300 hover:bg-red-50"
              }`}
            >
              {opt.imageUrl && <OptionImage url={opt.imageUrl} text={opt.text} large={large} />}
              <span className="flex-1 text-sm font-medium text-gray-800">{opt.text}</span>
              <div
                className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                  isSelected ? "border-red-500 bg-red-500" : "border-gray-300"
                }`}
              >
                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
            </button>
          );
        })}
      </div>

      {!showResults && (
        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={handleVote}
            disabled={!selected || submitting}
            className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
          >
            {submitting ? "Enviando..." : "Votar"}
          </button>
          {selected && !submitting && (
            <button onClick={() => setSelected(null)} className="text-xs text-gray-400 hover:text-gray-600">
              Limpiar selección
            </button>
          )}
        </div>
      )}

      {showResults && (
        <p className="mt-4 text-xs text-gray-400 text-right">
          {total} voto{total !== 1 ? "s" : ""} en total
        </p>
      )}

      {error && <p className="mt-3 text-xs text-red-600">{error}</p>}

      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-300 font-medium tracking-wide">La Razón</span>
        {!showResults && total > 0 && (
          <button
            onClick={() => setData({ ...data, hasVoted: true })}
            className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2"
          >
            Ver resultados
          </button>
        )}
      </div>
    </div>
  );
}
