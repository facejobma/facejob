"use client";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/sidebar";
import HeaderCandidat from "@/components/layout/header-candidat";
import ExperiencePromptModal from "@/components/ExperiencePromptModal";
import { useExperiencePrompt } from "@/hooks/useExperiencePrompt";
import { ExperiencePromptProvider, useExperiencePromptContext } from "@/contexts/ExperiencePromptContext";
import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext";
import { useEffect, useState } from "react";
import DashboardPageWrapper from "@/components/layout/DashboardPageWrapper";

interface LayoutProps {
  children: React.ReactNode;
  params: any;
}

function DashboardLayoutContent({ 
  children, 
  params 
}: LayoutProps) {
  const router = useRouter();
  const { isOpen } = useSidebar();
  const [candidatId, setCandidatId] = useState<number | null>(null);
  const { showPrompt: showManualPrompt, hidePrompt: hideManualPrompt, isPromptVisible: isManualPromptVisible } = useExperiencePromptContext();

  const userDataString =
    typeof window !== "undefined"
      ? window.sessionStorage?.getItem("user")
      : null;
  const userData = userDataString ? JSON.parse(userDataString) : null;

  // Add dashboard-page class to body
  useEffect(() => {
    document.body.classList.add('dashboard-page');
    return () => {
      document.body.classList.remove('dashboard-page');
    };
  }, []);

  useEffect(() => {
    if (userData?.id) {
      setCandidatId(userData.id);
    }
  }, [userData]);

  // Note: Authentication is handled by the parent layout.tsx
  // No need for client-side auth check here to avoid redirect loops

  const {
    shouldShowPrompt: shouldShowAutoPrompt,
    isLoading,
    hidePrompt: hideAutoPrompt,
    skipPrompt,
  } = useExperiencePrompt(candidatId);

  const handleClosePrompt = () => {
    hideAutoPrompt();
    hideManualPrompt();
  };

  const handleSkipPrompt = () => {
    skipPrompt();
    hideManualPrompt();
  };

  return (
    <div className="dashboard-layout min-h-screen font-sans bg-gray-50 flex flex-col">
      <HeaderCandidat />

      <div className="flex flex-1 pt-16">
        <Sidebar />
        <main className={`flex-1 transition-all duration-300 ${isOpen ? 'md:ml-64' : 'md:ml-0'}`}>
          <DashboardPageWrapper>
            {children}
          </DashboardPageWrapper>
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
  );
}

export default function CandidatClientLayout({ 
  children, 
  params 
}: LayoutProps) {
  return (
    <SidebarProvider>
      <ExperiencePromptProvider>
        <DashboardLayoutContent params={params}>{children}</DashboardLayoutContent>
      </ExperiencePromptProvider>
    </SidebarProvider>
  );
}