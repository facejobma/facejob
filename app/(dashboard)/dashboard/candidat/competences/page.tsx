"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, Loader2, Plus, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { SKILLS_BY_CATEGORY, TOP_SKILLS } from "@/constants/skills";

interface Skill {
  id: string | number;
  title: string;
}

interface CandidatProfile {
  id?: number;
  candidat_id?: number;
  skills?: Skill[];
}

interface CurrentUser {
  id?: number;
  first_name?: string;
  last_name?: string;
  email?: string;
}

const MAX_SKILLS_COUNT = 20;
const TOP_CATEGORY = "Top Compétences";

const normalizeToken = (token?: string) => token?.replace(/["']/g, "");
const normalizeSkill = (value: string) => value.trim().replace(/\s+/g, " ");

export default function CompetencesPage() {
  const router = useRouter();
  const authToken = normalizeToken(Cookies.get("authToken"));

  const [loading, setLoading] = useState(true);
  const [busySkill, setBusySkill] = useState<string | null>(null);
  const [candidatId, setCandidatId] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [editedSkills, setEditedSkills] = useState<Skill[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>(TOP_CATEGORY);

  const categoriesWithTop = useMemo(
    () => ({
      [TOP_CATEGORY]: TOP_SKILLS,
      ...SKILLS_BY_CATEGORY,
    }),
    []
  );

  const selectedSkillTitles = useMemo(
    () => new Set(editedSkills.map((skill) => skill.title.toLowerCase())),
    [editedSkills]
  );

  const filteredSkills = useMemo(() => {
    const categorySkills =
      categoriesWithTop[selectedCategory as keyof typeof categoriesWithTop] || [];
    const search = searchTerm.toLowerCase().trim();

    if (!search) return categorySkills;

    return categorySkills.filter((skill) => skill.toLowerCase().includes(search));
  }, [categoriesWithTop, searchTerm, selectedCategory]);

  const customSkill = normalizeSkill(searchTerm);
  const canAddCustomSkill =
    customSkill.length > 1 &&
    !selectedSkillTitles.has(customSkill.toLowerCase()) &&
    !filteredSkills.some((skill) => skill.toLowerCase() === customSkill.toLowerCase());

  const fetchUserIfNeeded = useCallback(async () => {
    if (typeof window === "undefined") return null;

    const cachedUser = window.sessionStorage.getItem("user");
    if (cachedUser) {
      const parsedUser = JSON.parse(cachedUser) as CurrentUser;
      setCurrentUser(parsedUser);
      return parsedUser;
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/user`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch user data");
    }

    const user = (await response.json()) as CurrentUser;
    window.sessionStorage.setItem("user", JSON.stringify(user));
    setCurrentUser(user);
    return user;
  }, [authToken]);

  const fetchCandidatData = useCallback(async () => {
    if (!authToken) {
      toast.error("Session expirée. Veuillez vous reconnecter.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const user = await fetchUserIfNeeded();

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/candidate-profile`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch candidate profile");
      }

      const profileData = (await response.json()) as CandidatProfile;
      const profileId = profileData.id || profileData.candidat_id || user?.id || null;

      setCandidatId(profileId);
      setEditedSkills(profileData.skills || []);
    } catch (error) {
      console.error("Error fetching candidat data:", error);
      toast.error("Impossible de charger vos compétences");
    } finally {
      setLoading(false);
    }
  }, [authToken, fetchUserIfNeeded]);

  useEffect(() => {
    fetchCandidatData();
  }, [fetchCandidatData]);

  const handleAddSkill = async (skillTitle: string) => {
    const normalizedTitle = normalizeSkill(skillTitle);

    if (!candidatId || !authToken) {
      toast.error("Impossible d'identifier votre profil candidat");
      return;
    }

    if (!normalizedTitle) {
      toast.error("Saisissez une compétence valide");
      return;
    }

    if (selectedSkillTitles.has(normalizedTitle.toLowerCase())) {
      toast.error("Cette compétence est déjà ajoutée");
      return;
    }

    if (editedSkills.length >= MAX_SKILLS_COUNT) {
      toast.error(`Vous ne pouvez pas ajouter plus de ${MAX_SKILLS_COUNT} compétences`);
      return;
    }

    try {
      setBusySkill(normalizedTitle);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/candidat/${candidatId}/skills`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title: normalizedTitle }),
        }
      );

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const addedSkill = (await response.json()) as Skill;
      setEditedSkills((prev) => [...prev, addedSkill]);
      setSearchTerm("");
      toast.success("Compétence ajoutée");
    } catch (error) {
      console.error("Error adding skill:", error);
      toast.error("Erreur lors de l'ajout");
    } finally {
      setBusySkill(null);
    }
  };

  const handleRemoveSkill = async (skill: Skill) => {
    if (!authToken) {
      toast.error("Session expirée. Veuillez vous reconnecter.");
      return;
    }

    try {
      setBusySkill(String(skill.id));

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/candidat/skill/delete/${skill.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete skill");
      }

      setEditedSkills((prev) => prev.filter((sk) => sk.id !== skill.id));
      toast.success("Compétence supprimée");
    } catch (error) {
      console.error("Error deleting skill:", error);
      toast.error("Erreur lors de la suppression");
    } finally {
      setBusySkill(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-220px)] items-center justify-center px-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#16a34a]" />
          <p className="text-sm text-gray-600 sm:text-base">
            Chargement de vos compétences...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-0 max-w-full space-y-3 sm:space-y-4 md:space-y-6">
      <section className="min-w-0 max-w-full overflow-hidden rounded-lg border border-gray-200 bg-white p-3 sm:rounded-xl sm:p-4 md:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <button
              onClick={() => router.back()}
              className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 sm:mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </button>
            <h1 className="text-lg font-bold text-gray-900 sm:text-xl md:text-2xl">
              Gérer vos compétences
            </h1>
            <p className="mt-1 text-sm leading-5 text-gray-600 md:text-base">
              {currentUser?.first_name
                ? `${currentUser.first_name}, ajoutez vos savoir-faire et savoir-être.`
                : "Ajoutez vos savoir-faire et savoir-être."}
            </p>
          </div>

          <div className="flex w-full flex-row items-center justify-between gap-3 sm:w-auto sm:flex-col sm:items-end">
            <div className="inline-flex items-center gap-3 rounded-lg bg-[#16a34a]/10 px-3 py-2 sm:px-4">
              <span className="text-sm font-medium text-gray-700">Sélectionnées</span>
              <span className="text-xl font-bold text-[#16a34a] sm:text-2xl">
                {editedSkills.length}/{MAX_SKILLS_COUNT}
              </span>
            </div>
            <p className="max-w-[7rem] text-right text-xs leading-4 text-gray-500 sm:max-w-none">
              Enregistrement automatique
            </p>
          </div>
        </div>
      </section>

      <section className="min-w-0 max-w-full overflow-hidden rounded-lg border border-gray-200 bg-white p-3 sm:rounded-xl sm:p-4 md:p-6">
        <div className="mb-4 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center sm:gap-3">
          <h2 className="text-base font-semibold text-gray-900 md:text-lg">
            Vos compétences sélectionnées
          </h2>
          {editedSkills.length >= MAX_SKILLS_COUNT && (
            <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
              Limite atteinte
            </span>
          )}
        </div>

        {editedSkills.length > 0 ? (
          <div className="grid min-w-0 max-w-full grid-cols-1 gap-2 sm:flex sm:flex-wrap">
            {editedSkills.map((skill) => {
              const isRemoving = busySkill === String(skill.id);

              return (
                <div
                  key={skill.id}
                  className="inline-flex min-w-0 max-w-full items-center justify-between gap-2 rounded-lg border border-[#16a34a]/20 bg-[#16a34a]/5 px-3 py-2 text-sm font-medium text-[#16a34a] sm:justify-start"
                >
                  <span className="min-w-0 truncate">{skill.title}</span>
                  <button
                    onClick={() => handleRemoveSkill(skill)}
                    disabled={isRemoving}
                    className="shrink-0 text-[#16a34a]/70 transition-colors hover:text-red-600 disabled:opacity-50"
                    title="Supprimer"
                    aria-label={`Supprimer ${skill.title}`}
                  >
                    {isRemoving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 py-7 text-center">
            <p className="text-sm text-gray-600">
              Aucune compétence ajoutée pour le moment
            </p>
          </div>
        )}
      </section>

      <section className="min-w-0 max-w-full overflow-hidden rounded-lg border border-gray-200 bg-white p-3 sm:rounded-xl sm:p-4 md:p-6">
        <h2 className="mb-4 text-base font-semibold text-gray-900 md:text-lg">
          Compétences disponibles
        </h2>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Rechercher ou saisir une compétence..."
            className="w-full rounded-lg border-2 border-gray-300 py-2.5 pl-11 pr-10 text-sm outline-none focus:border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]/20 sm:py-3 sm:text-base"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Effacer la recherche"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="mb-4 min-w-0 max-w-full border-b border-gray-200">
          <div className="-mx-3 flex max-w-full gap-2 overflow-x-auto overscroll-x-contain px-3 pb-2 sm:mx-0 sm:px-0">
            {Object.keys(categoriesWithTop).map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`shrink-0 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition-all sm:px-4 sm:text-sm ${
                  selectedCategory === category
                    ? "bg-[#16a34a] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="min-w-0 max-w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-50 p-3 md:p-4">
          {canAddCustomSkill && (
            <button
              onClick={() => handleAddSkill(customSkill)}
              disabled={editedSkills.length >= MAX_SKILLS_COUNT || busySkill === customSkill}
              className="mb-4 inline-flex w-full max-w-full items-center justify-center gap-2 rounded-lg border-2 border-[#16a34a] bg-white px-4 py-2 text-sm font-medium text-[#16a34a] hover:bg-[#16a34a]/5 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {busySkill === customSkill ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              <span className="min-w-0 truncate">Ajouter "{customSkill}"</span>
            </button>
          )}

          {filteredSkills.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center sm:py-12">
              <Search className="mb-3 h-12 w-12 text-gray-300" />
              <p className="text-sm font-medium text-gray-500">
                Aucune compétence trouvée
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Vous pouvez saisir une compétence personnalisée.
              </p>
            </div>
          ) : (
            <div className="grid max-h-[54vh] grid-cols-1 gap-2 overflow-y-auto pr-1 sm:max-h-none sm:grid-cols-2 sm:overflow-visible sm:pr-0 lg:grid-cols-3 2xl:grid-cols-4">
              {filteredSkills.map((skill) => {
                const isAdded = selectedSkillTitles.has(skill.toLowerCase());
                const isBusy = busySkill === skill;
                const isDisabled =
                  isAdded || editedSkills.length >= MAX_SKILLS_COUNT || Boolean(busySkill);

                return (
                  <button
                    key={skill}
                    onClick={() => handleAddSkill(skill)}
                    disabled={isDisabled}
                    className={`inline-flex min-h-11 w-full min-w-0 items-center justify-start gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition-all sm:px-4 ${
                      isAdded
                        ? "cursor-default bg-[#16a34a] text-white"
                        : "border-2 border-gray-300 bg-white text-gray-700 hover:border-[#16a34a] hover:bg-[#16a34a]/5"
                    } ${
                      editedSkills.length >= MAX_SKILLS_COUNT && !isAdded
                        ? "cursor-not-allowed opacity-40"
                        : ""
                    }`}
                  >
                    {isBusy ? (
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                    ) : isAdded ? (
                      <Check className="h-4 w-4 shrink-0" />
                    ) : (
                      <Plus className="h-4 w-4 shrink-0" />
                    )}
                    <span className="min-w-0 truncate">{skill}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
