"use client";

import React, { useState, useEffect } from "react";
import { FaVideo, FaUpload } from "react-icons/fa";
import { HiOutlineVideoCamera } from "react-icons/hi";

export default function PublishVideo() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [experiences, setExperiences] = useState("");
  const [selectedSector, setSelectedSector] = useState("");
  const [selectedJob, setSelectedJob] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted", { videoFile, experiences, selectedSector, selectedJob });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
            <HiOutlineVideoCamera className="text-green-600 text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Créer mon CV vidéo</h1>
            <p className="text-gray-600 mt-1">Publiez votre CV vidéo et mettez en valeur vos compétences</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Video Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vidéo CV
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-500 transition-colors">
              <FaVideo className="mx-auto text-gray-400 text-3xl mb-3" />
              <p className="text-gray-600 mb-2">Glissez votre vidéo ici ou cliquez pour sélectionner</p>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                className="hidden"
                id="video-upload"
              />
              <label
                htmlFor="video-upload"
                className="inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors"
              >
                Choisir une vidéo
              </label>
              {videoFile && (
                <p className="mt-3 text-sm text-green-600">✓ {videoFile.name}</p>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Années d'expérience
              </label>
              <input
                type="number"
                value={experiences}
                onChange={(e) => setExperiences(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                placeholder="Ex: 3"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secteur d'activité
              </label>
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              >
                <option value="">Sélectionnez le secteur</option>
                <option value="tech">Technologie</option>
                <option value="finance">Finance</option>
                <option value="sante">Santé</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Poste recherché
              </label>
              <select
                value={selectedJob}
                onChange={(e) => setSelectedJob(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              >
                <option value="">Sélectionnez le métier</option>
                <option value="dev">Développeur</option>
                <option value="designer">Designer</option>
                <option value="manager">Manager</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-4">
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-8 rounded-lg transition-colors flex items-center gap-2"
            >
              <FaUpload />
              Publier mon CV vidéo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
