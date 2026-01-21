"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, X, Briefcase, Clock } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import toast from "react-hot-toast";
import Cookies from "js-cookie";

interface Experience {
  organisme: string;
  poste: string;
  date_debut: Date | null;
  date_fin: Date | null;
  description: string;
  location: string;
}

interface ExperiencePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSkip: () => void;
  candidatId: number;
}

export default function ExperiencePromptModal({
  isOpen,
  onClose,
  onSkip,
  candidatId,
}: ExperiencePromptModalProps) {
  const [experiences, setExperiences] = useState<Experience[]>([
    {
      organisme: "",
      poste: "",
      date_debut: null,
      date_fin: null,
      description: "",
      location: "",
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addExperience = () => {
    setExperiences([
      ...experiences,
      {
        organisme: "",
        poste: "",
        date_debut: null,
        date_fin: null,
        description: "",
        location: "",
      },
    ]);
  };

  const removeExperience = (index: number) => {
    if (experiences.length > 1) {
      setExperiences(experiences.filter((_, i) => i !== index));
    }
  };

  const updateExperience = (index: number, field: keyof Experience, value: any) => {
    const updated = [...experiences];
    updated[index] = { ...updated[index], [field]: value };
    setExperiences(updated);
  };

  const handleSubmit = async () => {
    // Validate that at least one experience has required fields
    const validExperiences = experiences.filter(
      (exp) => exp.organisme.trim() && exp.poste.trim()
    );

    if (validExperiences.length === 0) {
      toast.error("Veuillez remplir au moins une expérience avec l'entreprise et le poste");
      return;
    }

    setIsSubmitting(true);
    const authToken = Cookies.get("authToken");

    try {
      // Submit each valid experience
      const promises = validExperiences.map((experience) =>
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/experiences`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            candidat_id: candidatId,
            organisme: experience.organisme,
            poste: experience.poste,
            date_debut: experience.date_debut
              ? format(experience.date_debut, "yyyy-MM-dd")
              : null,
            date_fin: experience.date_fin
              ? format(experience.date_fin, "yyyy-MM-dd")
              : null,
            description: experience.description,
            location: experience.location,
          }),
        })
      );

      await Promise.all(promises);
      toast.success("Expériences ajoutées avec succès!");
      onClose();
    } catch (error) {
      console.error("Error saving experiences:", error);
      toast.error("Erreur lors de l'enregistrement des expériences");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby="experience-modal-description">
        <DialogHeader className="relative">
          <DialogTitle className="flex items-center gap-2 text-xl pr-8">
            <Briefcase className="h-6 w-6 text-blue-600" />
            Ajoutez vos expériences professionnelles
          </DialogTitle>
          <p id="experience-modal-description" className="text-gray-600 mt-2">
            Complétez votre profil en ajoutant vos expériences professionnelles. 
            Cela aidera les recruteurs à mieux vous connaître.
          </p>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {experiences.map((experience, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 bg-gray-50 relative"
            >
              {experiences.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full h-8 w-8 p-0"
                  onClick={() => removeExperience(index)}
                  title="Supprimer cette expérience"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Supprimer cette expérience</span>
                </Button>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`organisme-${index}`}>
                    Entreprise / Organisation *
                  </Label>
                  <Input
                    id={`organisme-${index}`}
                    value={experience.organisme}
                    onChange={(e) =>
                      updateExperience(index, "organisme", e.target.value)
                    }
                    placeholder="Ex: Google, Microsoft..."
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor={`poste-${index}`}>Poste occupé *</Label>
                  <Input
                    id={`poste-${index}`}
                    value={experience.poste}
                    onChange={(e) =>
                      updateExperience(index, "poste", e.target.value)
                    }
                    placeholder="Ex: Développeur Full Stack"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Date de début</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal mt-1"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {experience.date_debut
                          ? format(experience.date_debut, "PPP", { locale: fr })
                          : "Sélectionner une date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={experience.date_debut || undefined}
                        onSelect={(date) =>
                          updateExperience(index, "date_debut", date)
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label>Date de fin</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal mt-1"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {experience.date_fin
                          ? format(experience.date_fin, "PPP", { locale: fr })
                          : "En cours / Sélectionner"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={experience.date_fin || undefined}
                        onSelect={(date) =>
                          updateExperience(index, "date_fin", date)
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor={`location-${index}`}>Lieu</Label>
                  <Input
                    id={`location-${index}`}
                    value={experience.location}
                    onChange={(e) =>
                      updateExperience(index, "location", e.target.value)
                    }
                    placeholder="Ex: Paris, France"
                    className="mt-1"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor={`description-${index}`}>Description</Label>
                  <Textarea
                    id={`description-${index}`}
                    value={experience.description}
                    onChange={(e) =>
                      updateExperience(index, "description", e.target.value)
                    }
                    placeholder="Décrivez vos responsabilités et réalisations..."
                    className="mt-1"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addExperience}
            className="w-full border-dashed border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une autre expérience
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 sm:flex-none border-gray-300 hover:bg-gray-50"
            aria-label="Fermer sans enregistrer"
          >
            <X className="h-4 w-4 mr-2" />
            Fermer
          </Button>
          <Button
            variant="outline"
            onClick={onSkip}
            className="flex-1 sm:flex-none"
            aria-label="Passer l'ajout d'expériences pour le moment"
          >
            <Clock className="h-4 w-4 mr-2" />
            Passer pour le moment
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium"
            aria-label="Enregistrer les expériences professionnelles"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Enregistrement...
              </>
            ) : (
              <>
                <Briefcase className="h-4 w-4 mr-2" />
                Enregistrer
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}