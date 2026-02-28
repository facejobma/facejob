"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";

interface UseExperiencePromptReturn {
  shouldShowPrompt: boolean;
  isLoading: boolean;
  showPrompt: () => void;
  hidePrompt: () => void;
  skipPrompt: () => void;
}

export function useExperiencePrompt(candidatId: number | null): UseExperiencePromptReturn {
  const [shouldShowPrompt, setShouldShowPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const SKIP_KEY = `experience_prompt_skipped_${candidatId}`;
  const SKIP_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  const checkExperiences = async () => {
    if (!candidatId) {
      setIsLoading(false);
      return;
    }

    // Check if user has skipped recently
    const skipData = localStorage.getItem(SKIP_KEY);
    if (skipData) {
      const { timestamp } = JSON.parse(skipData);
      const now = Date.now();
      if (now - timestamp < SKIP_DURATION) {
        setIsLoading(false);
        return;
      } else {
        // Remove expired skip data
        localStorage.removeItem(SKIP_KEY);
      }
    }

    try {
      const authToken = Cookies.get("authToken");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/candidate-profile`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        
        // Check if any profile section is missing
        const hasBio = data.bio && data.bio.trim().length > 0;
        const hasExperiences = data.experiences && data.experiences.length > 0;
        const hasSkills = data.skills && data.skills.length > 0;
        const hasProjects = data.projects && data.projects.length > 0;
        const hasEducation = data.educations && data.educations.length > 0;
        
        // Don't show prompt automatically - only when manually triggered
        // const hasAnySectionMissing = !hasBio || !hasExperiences || !hasSkills || !hasProjects || !hasEducation;
        // setShouldShowPrompt(hasAnySectionMissing);
        setShouldShowPrompt(false);
      }
    } catch (error) {
      console.error("Error checking experiences:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const showPrompt = () => {
    setShouldShowPrompt(true);
  };

  const hidePrompt = () => {
    setShouldShowPrompt(false);
  };

  const skipPrompt = () => {
    // Store skip timestamp in localStorage
    localStorage.setItem(
      SKIP_KEY,
      JSON.stringify({
        timestamp: Date.now(),
      })
    );
    setShouldShowPrompt(false);
  };

  useEffect(() => {
    checkExperiences();
  }, [candidatId]);

  return {
    shouldShowPrompt,
    isLoading,
    showPrompt,
    hidePrompt,
    skipPrompt,
  };
}