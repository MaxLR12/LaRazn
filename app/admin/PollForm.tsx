"use client";

import { useState } from "react";

interface Option {
  text: string;
  imageUrl: string;
}

interface Props {
  onCreated: () => void;
  onCancel: () => void;
}

const emptyOption = (): Option => ({ text: "", imageUrl: "" });

export default function PollForm({ onCreated, onCancel }: Props) {
  const [title, setTitle] = useState("");
  const [question, setQuestion] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [options, setOptions] = useState<Option[]>([emptyOption(), emptyOption()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function addOption() {
    if (options.length < 8) setOptions([...options, emptyOption()]);
  }

  function removeOption(i: number) {
    if (options.length <= 2) return;
    setOptions(options.filter((_, idx) => idx !== i));
  }

  function updateOption(i: number, field: keyof Option, value: string) {
    setOptions(options.map((opt, idx) => (idx === i ? { ...opt, [field]: value } : opt)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const validOptions = options.filter((o) => o.text.trim());
    if (validOptions.length < 2) {
      setError("Necesitas al menos 2 opciones con texto.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, question, imageUrl, options: validOptions }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Error al crear la encuesta.");
        return;
      }
      onCreated();
    } catch {
      setError("Error de red. Inténtalo de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Nueva encuesta</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Título (H2) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Encuesta de la semana"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pregunta <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={2}
            placeholder="¿Cuál es tu opinión sobre...?"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL de imagen de cabecera <span className="text-gray-400 font-normal">(opcional)</span>
          </label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://..."
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Opciones <span className="text-red-500">*</span>{" "}
            <span className="text-gray-400 font-normal">(mínimo 2, máximo 8)</span>
          </label>
          <div className="space-y-3">
            {options.map((opt, i) => (
              <div key={i} className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className="mt-2.5 text-sm font-semibold text-gray-500 w-5 shrink-0">{i + 1}</span>
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={opt.text}
                    onChange={(e) => updateOption(i, "text", e.target.value)}
                    placeholder={`Opción ${i + 1}`}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                  />
                  <input
                    type="url"
                    value={opt.imageUrl}
                    onChange={(e) => updateOption(i, "imageUrl", e.target.value)}
                    placeholder="URL de imagen (opcional)"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeOption(i)}
                  disabled={options.length <= 2}
                  className="mt-2 text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Eliminar opción"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {options.length < 8 && (
            <button
              type="button"
              onClick={addOption}
              className="mt-3 text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Añadir opción
            </button>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors"
          >
            {saving ? "Guardando..." : "Crear encuesta"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-600 hover:text-gray-800 font-medium px-4 py-2.5"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
