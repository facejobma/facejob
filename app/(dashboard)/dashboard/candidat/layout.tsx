"use client";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/sidebar";
import dynamic from "next/dynamic";
import HeaderCandidat from "@/components/layout/header-candidat";
import ExperiencePromptModal from "@/components/ExperiencePromptModal";
import { useExperiencePrompt } from "@/hooks/useExperiencePrompt";
import { ExperiencePromptProvider, useExperiencePromptContext } from "@/contexts/ExperiencePromptContext";
import { useEffect, useState } from "react";

interface LayoutProps {
  children: React.ReactNode;
  params: any;
}

function DashboardLayoutContent({ 
  children, 
  params 
}: LayoutProps) {
  const router = useRouter();
  const [candidatId, setCandidatId] = useState<number | null>(null);
  const { showPrompt: showManualPrompt, hidePrompt: hideManualPrompt, isPromptVisible: isManualPromptVisible } = useExperiencePromptContext();

  const userDataString =
    typeof window !== "undefined"
      ? window.sessionStorage?.getItem("user")
      : null;
  const userData = userDataString ? JSON.parse(userDataString) : null;

  useEffect(() => {
    if (userData?.id) {
      setCandidatId(userData.id);
    }
  }, [userData]);

  const {
    shouldShowPrompt: shouldShowAutoPrompt,
    isLoading,
    hidePrompt: hideAutoPrompt,
    skipPrompt,
  } = useExperiencePrompt(candidatId);

  if (!userData) {
    router.push(`/`);
  }

  const handleClosePrompt = () => {
    hideAutoPrompt();
    hideManualPrompt();
  };

  const handleSkipPrompt = () => {
    skipPrompt();
    hideManualPrompt();
  };

  return (
    <>
      <div className="font-sans bg-gray-50 min-h-screen">
        <HeaderCandidat />

        <div className={`flex h-screen`}>
          <Sidebar />
          <main className="flex-1 pt-20 overflow-auto">
            <div className="p-6">
              {children}
            </div>
          </main>
        </div>

        {/* Experience Prompt Modal */}
        {!isLoading && candidatId && (
          <ExperiencePromptModal
            isOpen={shouldShowAutoPrompt || isManualPromptVisible}
            onClose={handleClosePrompt}
            onSkip={handleSkipPrompt}
            candidatId={candidatId}
          />
        )}
      </div>
    </>
  );
}

function DashboardLayout({ 
  children, 
  params 
}: LayoutProps) {
  return (
    <ExperiencePromptProvider>
      <DashboardLayoutContent params={params}>{children}</DashboardLayoutContent>
    </ExperiencePromptProvider>
  );
}

export default dynamic(() => Promise.resolve(DashboardLayout), { ssr: false });
