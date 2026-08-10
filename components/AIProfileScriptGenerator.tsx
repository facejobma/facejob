"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { generateAIScriptFromText, generateAIScriptFromPdf } from "@/lib/api";
import { toast } from "react-hot-toast";
import { FaFilePdf, FaAlignLeft, FaMagic, FaClock, FaCheckCircle, FaSpinner } from "react-icons/fa";

interface AIProfileScriptGeneratorProps {
  onScriptGenerated: (script: string) => void;
  initialScript?: string;
}

export default function AIProfileScriptGenerator({ onScriptGenerated, initialScript = "" }: AIProfileScriptGeneratorProps) {
  const [activeTab, setActiveTab] = useState<"text" | "pdf">("text");
  const [cvText, setCvText] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [script, setScript] = useState(initialScript);
  const [isEditing, setIsEditing] = useState(false);

  // Check if we are in local environment
  const isLocalEnv = typeof window !== "undefined" && 
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

  const wordCount = script.split(/\s+/).filter(Boolean).length;
  const estimatedSeconds = Math.round((wordCount / 130) * 60);

  const handleTextSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!cvText.trim()) {
      toast.error("Veuillez saisir le texte de votre CV.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Génération de votre script de pitch par l'IA...");
    try {
      // Use local test mode if running locally, otherwise standard authenticated API
      const response = await generateAIScriptFromText(cvText, isLocalEnv);
      if (response && response.script) {
        setScript(response.script);
        onScriptGenerated(response.script);
        setIsEditing(true);
        toast.success("Script IA généré avec succès !", { id: toastId });
      } else {
        throw new Error("Pas de script retourné");
      }
    } catch (err) {
      console.error(err);
      toast.error("Échec de la génération du script. Veuillez réessayer.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handlePdfSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!pdfFile) {
      toast.error("Veuillez choisir un fichier PDF.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Lecture du PDF et génération de votre script...");
    try {
      const response = await generateAIScriptFromPdf(pdfFile, isLocalEnv);
      if (response && response.script) {
        setScript(response.script);
        onScriptGenerated(response.script);
        setIsEditing(true);
        toast.success("Script IA généré avec succès !", { id: toastId });
      } else {
        throw new Error("Pas de script retourné");
      }
    } catch (err) {
      console.error(err);
      toast.error("Échec de la lecture du PDF ou de la génération.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-green-50 text-green-600 rounded-lg">
            <FaMagic className="text-lg animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-base">Assistant de Script IA</h3>
            <p className="text-xs text-gray-500">Générez un pitch de 60 secondes adapté à votre CV</p>
          </div>
        </div>
        {isLocalEnv && (
          <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-bold">
            Local Test Mode
          </span>
        )}
      </div>

      {/* Tabs */}
      {!script && (
        <div className="flex gap-2 p-1 bg-gray-50 rounded-lg border border-gray-200/50">
          <button
            type="button"
            onClick={() => setActiveTab("text")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-md transition-all ${
              activeTab === "text"
                ? "bg-white text-green-700 shadow-sm border border-gray-200/60"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <FaAlignLeft className="text-xs" />
            Texte libre
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("pdf")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-md transition-all ${
              activeTab === "pdf"
                ? "bg-white text-green-700 shadow-sm border border-gray-200/60"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <FaFilePdf className="text-xs" />
            CV PDF
          </button>
        </div>
      )}

      {/* Form content */}
      {!script ? (
        activeTab === "text" ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                Texte ou Résumé du CV
              </label>
              <textarea
                value={cvText}
                onChange={(e) => setCvText(e.target.value)}
                placeholder="Collez ici les sections clés de votre CV (expériences, compétences, diplômes...)"
                rows={5}
                className="w-full text-sm border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none transition-all placeholder-gray-400"
                disabled={loading}
              />
            </div>
            <button
              type="button"
              onClick={handleTextSubmit}
              disabled={loading || !cvText.trim()}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-200 text-white font-bold text-sm rounded-lg transition-all shadow-sm"
            >
              {loading ? <FaSpinner className="animate-spin text-sm" /> : <FaMagic />}
              Générer mon pitch IA
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                Importer votre CV (PDF uniquement)
              </label>
              <div className="border-2 border-dashed border-gray-300 hover:border-green-500 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-green-50/10 cursor-pointer transition-colors relative">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={loading}
                />
                <FaFilePdf className={`w-8 h-8 mb-2 ${pdfFile ? "text-red-500" : "text-gray-400"}`} />
                <span className="text-xs font-semibold text-gray-700">
                  {pdfFile ? pdfFile.name : "Cliquez ou glissez votre CV PDF ici"}
                </span>
                <span className="text-[10px] text-gray-500 mt-1">Taille max : 5 Mo</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handlePdfSubmit}
              disabled={loading || !pdfFile}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-200 text-white font-bold text-sm rounded-lg transition-all shadow-sm"
            >
              {loading ? <FaSpinner className="animate-spin text-sm" /> : <FaMagic />}
              Extraire & Générer
            </button>
          </div>
        )
      ) : (
        /* Generated Script Preview & Editor */
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <FaCheckCircle className="text-green-500" />
              Script généré
            </span>
            <span className="flex items-center gap-1">
              <FaClock className="text-gray-400" />
              Lecture : ~{estimatedSeconds}s ({wordCount} mots)
            </span>
          </div>

          <textarea
            value={script}
            onChange={(e) => {
              setScript(e.target.value);
              onScriptGenerated(e.target.value);
            }}
            placeholder="Modifiez votre script ici..."
            rows={6}
            className="w-full text-sm border border-gray-300 rounded-lg p-3 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all font-medium leading-relaxed text-gray-800"
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setScript("");
                onScriptGenerated("");
                setCvText("");
                setPdfFile(null);
                setIsEditing(false);
              }}
              className="flex-1 py-2 px-3 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold text-xs rounded-lg transition-colors text-center"
            >
              Recommencer
            </button>
            <button
              type="button"
              onClick={() => {
                toast.success("Script enregistré ! Prêt pour le téléprompteur.");
              }}
              className="flex-1 py-2 px-3 bg-green-600 hover:bg-green-700 text-white font-semibold text-xs rounded-lg transition-colors text-center shadow-sm"
            >
              Sauvegarder le Script
            </button>
          </div>
        </div>
      )}

      {/* ── FULL-SCREEN BLOCKING SPINNER OVERLAY ── */}
      {loading && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[99999] bg-slate-900/85 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center pointer-events-auto cursor-wait select-none">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-gray-100 flex flex-col items-center space-y-5">
            {/* Animated Pulsing Icon */}
            <div className="relative flex items-center justify-center">
              <div className="w-20 h-20 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center text-green-600">
                <FaMagic className="text-2xl animate-pulse" />
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-gray-900">
                L'IA génère votre script de pitch...
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Extraction du contenu de votre CV et rédaction d'un pitch oral optimisé de 60 secondes. Veuillez patienter quelques instants...
              </p>
            </div>

            {/* Locking Alert */}
            <div className="w-full p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-center gap-2 text-amber-800 text-xs font-semibold">
              <span>🔒 Navigation bloquée pendant le traitement par l'IA.</span>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
