"use client";

import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { FaVideo, FaCloudUploadAlt, FaEdit, FaCheckCircle, FaEye, FaDownload } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";

interface Job {
  id: number;
  name: string;
}

interface Sector {
  id: number;
  name: string;
  jobs: Job[];
}

export default function CVPage() {
  const { user, isLoading: userLoading } = useUser();
  const router = useRouter();

  // Show loading while user data is being fetched
  if (userLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header - Copié de postuler */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <FaVideo className="text-2xl text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Créer mon CV vidéo</h1>
            <p className="text-gray-600 mt-1">Publiez votre CV vidéo et mettez en valeur vos compétences</p>
          </div>
        </div>

        {/* Process Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FaCloudUploadAlt className="text-primary text-lg" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Étape 1</p>
                <p className="text-xs text-gray-600">Téléchargez votre vidéo</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FaEdit className="text-primary text-lg" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Étape 2</p>
                <p className="text-xs text-gray-600">Remplissez les informations</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FaCheckCircle className="text-primary text-lg" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Étape 3</p>
                <p className="text-xs text-gray-600">Publiez votre CV</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards - Contenu original */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total CV Vidéos</p>
              <p className="text-3xl font-bold text-gray-900">3</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <FaVideo className="text-2xl text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Vues Totales</p>
              <p className="text-3xl font-bold text-gray-900">127</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
              <FaEye className="text-2xl text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Téléchargements</p>
              <p className="text-3xl font-bold text-gray-900">45</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <FaDownload className="text-2xl text-purple-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
