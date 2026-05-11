"use client";

import { useState, useEffect } from "react";
import PollForm from "./PollForm";
import PollList from "./PollList";

export default function AdminPage() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  async function fetchPolls() {
    const res = await fetch("/api/polls");
    const data = await res.json();
    setPolls(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchPolls();
  }, []);

  function handleCreated() {
    setShowForm(false);
    fetchPolls();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-red-600">La Razón</span>
          <span className="text-gray-400 font-light text-lg">|</span>
          <span className="text-gray-700 font-medium">Gestión de Encuestas</span>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2 rounded-lg transition-colors"
        >
          + Nueva encuesta
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {showForm && (
          <div className="mb-8">
            <PollForm onCreated={handleCreated} onCancel={() => setShowForm(false)} />
          </div>
        )}

        {loading ? (
          <p className="text-gray-500 text-center py-16">Cargando encuestas...</p>
        ) : (
          <PollList polls={polls} onRefresh={fetchPolls} />
        )}
      </main>
    </div>
  );
}

export interface Poll {
  id: string;
  title: string;
  question: string;
  imageUrl: string | null;
  createdAt: string;
  options: { id: string; text: string; imageUrl: string | null; position: number }[];
  _count: { votes: number };
}
