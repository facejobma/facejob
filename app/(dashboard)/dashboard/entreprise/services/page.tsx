"use client";
import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircleIcon,
  VideoCameraIcon,
  BriefcaseIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import Cookies from "js-cookie";
import { fetchPlans } from "@/lib/api";
import { toast } from "react-hot-toast";
import { useUser } from "@/hooks/useUser";

function ServicePlanPage() {
  const { user, isLoading: userLoading } = useUser();
  const authToken = Cookies.get("authToken")?.replace(/["']/g, "");
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("Mensuel");
  const [lastPayment, setLastPayment] = useState<any>(null);
  const [currentPlanId, setCurrentPlanId] = useState(null);
  const [hasNoPayment, setHasNoPayment] = useState(false);
  const [isLoadingPayment, setIsLoadingPayment] = useState(true);
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  const fetchLastPayment = async () => {
    if (!user?.id) return;
    
    setIsLoadingPayment(true);
    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_URL + `/api/v1/payments/${user.id}/last`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        },
      );
      
      if (response.ok) {
        const data = await response.json();
        setLastPayment(data);
        setCurrentPlanId(data.plan_id);
        setHasNoPayment(false);
      } else if (response.status === 404) {
        const errorData = await response.json();
        console.log("No active payment found:", errorData.message);
        
        // Check if there's a pending payment
        if (errorData.has_pending) {
          setLastPayment({
            status: 'Pending',
            plan_name: errorData.pending_plan,
            has_pending: true
          });
          setHasNoPayment(true);
        } else {
          setLastPayment(null);
          setCurrentPlanId(null);
          setHasNoPayment(true);
        }
      } else {
        console.error("Failed to fetch last payment");
        toast.error("Erreur lors de la récupération des informations de paiement");
        setHasNoPayment(true);
      }
    } finally {
      setIsLoadingPayment(false);
    }
  };

  const fetchPlansData = async () => {
    setIsLoadingPlans(true);
    try {
      console.log('Fetching plans...');
      const plansData = await fetchPlans();
      console.log('Raw plans data:', plansData);
      
      // Remove duplicates based on plan ID
      const uniquePlans = plansData.filter((plan: any, index: number, self: any[]) => 
        index === self.findIndex((p: any) => p.id === plan.id)
      );
      
      const transformedPlans = uniquePlans.map((plan: any) => ({
        ...plan,
        contact_access: plan.cv_video_consultations,
        exclusif: plan.exclusive,
      }));
      
      console.log('Transformed plans:', transformedPlans.length, transformedPlans);
      setPlans(transformedPlans);
    } catch (error) {
      console.error("Failed to fetch plans:", error);
      toast.error("Erreur lors de la récupération des plans");
      setPlans([]); // Set empty array on error
    } finally {
      setIsLoadingPlans(false);
    }
  };
  
  useEffect(() => {
    console.log('useEffect triggered, user?.id:', user?.id);
    if (user?.id) {
      fetchLastPayment();
      fetchPlansData();
    }
  }, [user?.id]);

  const handleUpgradeClick = (plan: any) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
    setShowSuccessMessage(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setShowSuccessMessage(false);
  };

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
  };

  const handleConfirmClick = async () => {
    if (!selectedPlan || !selectedPeriod) return;

    const paymentData = {
      plan_id: selectedPlan.id,
      payment_period: selectedPeriod,
    };

    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_URL + "/api/v1/payments",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(paymentData),
        },
      );

      if (response.ok) {
        setShowSuccessMessage(true);
        fetchLastPayment();
      } else {
        // Parse error response
        const errorData = await response.json();
        
        // Check for specific error messages
        if (errorData.errors && errorData.errors.subscription) {
          // Display subscription error (e.g., "Vous avez déjà un abonnement actif")
          toast.error(errorData.errors.subscription[0] || errorData.errors.subscription);
        } else if (errorData.message) {
          toast.error(errorData.message);
        } else if (errorData.error) {
          toast.error(errorData.error);
        } else {
          toast.error("Erreur lors de la création de l'abonnement!");
        }
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Erreur lors de la création de l'abonnement!");
    }
  };

  const isCurrentPlanDisabled = (plan: any) => {
    if (hasNoPayment || !lastPayment) {
      return false;
    }
    
    if (
      currentPlanId !== plan.id ||
      lastPayment?.payment_period !== selectedPeriod
    ) {
      return false;
    }

    const currentDate = new Date().toISOString().split("T")[0];
    const endDate = lastPayment?.end_date;

    return currentDate <= endDate;
  };


  const renderPlanCard = (plan: any, priceKey: string, periodLabel: string) => {
    const isPopular = plan.popular;
    const isExclusive = plan.exclusif;
    const isFree = Number(plan.monthly_price || 0) === 0;
    
    return (
      <div
        key={`${plan.id}-${priceKey}`}
        className={`relative rounded-lg border-2 transition-colors ${
          isPopular || isExclusive
            ? 'border-green-500 shadow-md' 
            : isFree
            ? 'border-green-400 shadow-sm'
            : 'border-gray-200 shadow-sm hover:border-gray-300'
        }`}
      >
        {(isPopular || isExclusive) && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
            <span className="bg-green-600 text-white px-4 py-1 rounded-full text-sm font-semibold whitespace-nowrap">
              {isPopular ? "⭐ Populaire" : "👑 Exclusif"}
            </span>
          </div>
        )}

        {isFree && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
            <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-semibold whitespace-nowrap">
              🎉 Gratuit
            </span>
          </div>
        )}

        <div className="p-6 h-full flex flex-col">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              {plan.name}
            </h3>
            <div className="mb-4">
              <span className="text-4xl font-bold text-gray-900">
                {Number(plan[priceKey] || 0).toFixed(0)}
              </span>
              <span className="text-gray-600 ml-1">DH</span>
              <div className="text-sm text-gray-500 mt-1">
                {periodLabel}
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-4 min-h-[2.5rem] flex items-center justify-center">
              {plan.description || (isFree ? "Parfait pour découvrir" : "Plan professionnel")}
            </p>
          </div>


          <div className="space-y-4 mb-8 flex-grow">
            <div className="flex items-start gap-3">
              <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-700 leading-relaxed">
                Gestion des candidatures
              </span>
            </div>
            
            <div className="flex items-start gap-3">
              <VideoCameraIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-700 leading-relaxed">
                Visualisation CV vidéos
              </span>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                Illimité
              </span>
            </div>
            
            <div className="flex items-start gap-3">
              <svg className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-sm text-gray-700 leading-relaxed">
                Coordonnées candidats
              </span>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                {plan.cv_video_consultations === -1 ? "Illimité" : `${plan.cv_video_consultations}/mois`}
              </span>
            </div>
            
            <div className="flex items-start gap-3">
              <BriefcaseIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-700 leading-relaxed">
                Offres d'emploi
              </span>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                {plan.job_postings === -1 ? "Illimité" : `${plan.job_postings}/mois`}
              </span>
            </div>
            
            {plan.dedicated_support && (
              <div className="flex items-start gap-3">
                <svg className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 109.75 9.75A9.75 9.75 0 0012 2.25z" />
                </svg>
                <span className="text-sm text-gray-700 font-medium leading-relaxed">
                  Support Dédié
                </span>
              </div>
            )}
          </div>


          <div className="mt-auto">
            <button
              className={`w-full py-3 px-6 rounded-lg font-semibold text-base transition-colors ${
                isCurrentPlanDisabled(plan)
                  ? "bg-gray-100 text-gray-500 cursor-not-allowed border border-gray-200"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
              onClick={() => handleUpgradeClick(plan)}
              disabled={isCurrentPlanDisabled(plan)}
            >
              {isCurrentPlanDisabled(plan)
                ? `✓ Plan Actuel`
                : "Choisir ce plan"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Show loading state while user data is being fetched
  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-green-600 rounded-full animate-spin"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-full overflow-y-auto">
        <div className="space-y-4 md:space-y-6">
          {/* Simple Header */}
          <div className="bg-green-50 rounded-lg border-2 border-green-200 p-4 md:p-6">
            <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                <svg className="text-green-600 w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg md:text-2xl font-bold text-gray-900">Services & Abonnements</h1>
                <p className="text-xs md:text-base text-gray-600">Choisissez le plan qui correspond à vos besoins</p>
              </div>
            </div>

            
            {/* Statistics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <div className="bg-white border-2 border-green-200 rounded-lg p-3 md:p-4">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircleIcon className="text-green-600 w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base md:text-xl font-bold text-gray-900 truncate">
                      {isLoadingPayment ? "..." : (lastPayment ? lastPayment.plan_name : hasNoPayment ? "Aucun" : "-")}
                    </p>
                    <p className="text-xs text-gray-600">Plan actuel</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white border-2 border-green-200 rounded-lg p-3 md:p-4">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                    <VideoCameraIcon className="text-green-600 w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base md:text-xl font-bold text-gray-900">
                      {isLoadingPayment ? "..." : (lastPayment ? lastPayment.contact_access_remaining : hasNoPayment ? "0" : "-")}
                    </p>
                    <p className="text-xs text-gray-600">Contacts</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white border-2 border-green-200 rounded-lg p-3 md:p-4">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                    <BriefcaseIcon className="text-green-600 w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base md:text-xl font-bold text-gray-900">
                      {isLoadingPayment ? "..." : (lastPayment ? lastPayment.job_remaining : hasNoPayment ? "0" : "-")}
                    </p>
                    <p className="text-xs text-gray-600">Offres</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white border-2 border-green-200 rounded-lg p-3 md:p-4">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                    <ClockIcon className="text-green-600 w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base md:text-xl font-bold text-gray-900 truncate">
                      {isLoadingPayment ? "..." : (lastPayment ? lastPayment?.payment_period : hasNoPayment ? "Aucune" : "-")}
                    </p>
                    <p className="text-xs text-gray-600">Période</p>
                  </div>
                </div>
              </div>
            </div>
          </div>


          {/* Current Plan Overview */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-4 md:px-6 py-3 md:py-4 border-b border-gray-200">
              <h3 className="text-base md:text-lg font-semibold text-gray-900">Aperçu de votre abonnement</h3>
            </div>
            <div className="p-4 md:p-6">
              {isLoadingPayment ? (
                <div className="flex justify-center items-center py-8">
                  <div className="w-8 h-8 border-4 border-gray-200 border-t-green-600 rounded-full animate-spin"></div>
                  <span className="ml-2 text-gray-600">Chargement...</span>
                </div>
              ) : hasNoPayment ? (
                <div className="text-center py-8">
                  {lastPayment && lastPayment.has_pending ? (
                    <div className="bg-yellow-50 rounded-lg p-6 border-2 border-yellow-200">
                      <div className="flex justify-center mb-4">
                        <div className="h-16 w-16 rounded-full bg-yellow-100 flex items-center justify-center">
                          <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">Demande d'abonnement en cours</h4>
                      <p className="text-gray-600 mb-4">
                        Votre demande pour le <strong>{lastPayment.plan_name}</strong> est en attente de confirmation.
                        Un de nos conseillers va vous contacter prochainement.
                      </p>
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 rounded-full">
                        <span className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse"></span>
                        <span className="text-sm font-medium text-yellow-900">En attente de validation</span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                    <div className="flex justify-center mb-4">
                      <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                        <BriefcaseIcon className="h-8 w-8 text-green-600" />
                      </div>
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">Aucun abonnement actif</h4>
                    <p className="text-gray-600 mb-4">
                      Vous n'avez pas encore d'abonnement actif. Choisissez un plan ci-dessous pour commencer à utiliser nos services.
                    </p>
                    <div className="bg-white rounded-lg p-4 border border-green-200">
                      <p className="text-sm text-gray-700">
                        <strong>Avantages d'un abonnement :</strong>
                      </p>
                      <ul className="text-sm text-gray-600 mt-2 space-y-1">
                        <li>• Accès aux CV vidéos des candidats</li>
                        <li>• Publication d'offres d'emploi</li>
                        <li>• Support dédié selon le plan</li>
                        <li>• Gestion complète des candidatures</li>
                      </ul>
                    </div>
                  </div>
                  )}
                </div>
              ) : (
                <div>
                  {/* Payment Status Alert */}
                  {lastPayment && lastPayment.has_pending && (
                    <div className="mb-6 bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <svg className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="flex-1">
                          <h4 className="font-semibold text-yellow-900 mb-1">
                            Nouvelle demande d'abonnement en attente
                          </h4>
                          <p className="text-sm text-yellow-800">
                            Vous avez une demande pour le <strong>{lastPayment.pending_plan}</strong> en attente de confirmation. 
                            Un de nos conseillers va vous contacter prochainement. Votre plan actuel reste actif jusqu'à la validation.
                          </p>
                          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 rounded-full">
                            <span className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse"></span>
                            <span className="text-xs font-medium text-yellow-900">Nouvelle demande en attente</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {lastPayment && lastPayment.status === 'Accepted' && (
                    <div className="mb-6 bg-green-50 border-2 border-green-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <svg className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="flex-1">
                          <h4 className="font-semibold text-green-900 mb-1">
                            Abonnement actif
                          </h4>
                          <p className="text-sm text-green-800">
                            Votre pack <strong>{lastPayment.plan_name}</strong> est actif et opérationnel.
                          </p>
                          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full">
                            <span className="h-2 w-2 bg-green-500 rounded-full"></span>
                            <span className="text-xs font-medium text-green-900">Statut: Actif</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-3">
                  <Card className="border border-gray-200 rounded-lg">
                    <CardHeader className="flex flex-col items-center space-y-2 pb-2">
                      <CheckCircleIcon className="h-8 w-8 text-green-500" />
                      <CardTitle className="text-sm font-medium text-center">
                        Votre plan actuel
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 text-center">
                        {lastPayment ? lastPayment.plan_name : "-"}
                      </p>
                    </CardContent>
                  </Card>

                  
                  <Card className="border border-gray-200 rounded-lg">
                    <CardHeader className="flex flex-col items-center space-y-2 pb-2">
                      <ClockIcon className="h-8 w-8 text-green-500" />
                      <CardTitle className="text-sm font-medium text-center">
                        Période actuelle
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 text-center">
                        {lastPayment ? lastPayment?.payment_period : "-"}
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border border-gray-200 rounded-lg">
                    <CardHeader className="flex flex-col items-center space-y-2 pb-2">
                      <VideoCameraIcon className="h-8 w-8 text-green-500" />
                      <CardTitle className="text-sm font-medium text-center">
                        CV vidéos consommés
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 text-center">
                        {lastPayment ? lastPayment.cv_video_consumed : "-"}
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border border-gray-200 rounded-lg">
                    <CardHeader className="flex flex-col items-center space-y-2 pb-2">
                      <VideoCameraIcon className="h-8 w-8 text-green-500" />
                      <CardTitle className="text-sm font-medium text-center">
                        CV vidéos restants
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 text-center">
                        {lastPayment ? lastPayment.cv_video_remaining : "-"}
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border border-gray-200 rounded-lg">
                    <CardHeader className="flex flex-col items-center space-y-2 pb-2">
                      <BriefcaseIcon className="h-8 w-8 text-green-500" />
                      <CardTitle className="text-sm font-medium text-center">
                        Offres diffusées
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 text-center">
                        {lastPayment ? lastPayment.job_posted : "-"}
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border border-gray-200 rounded-lg">
                    <CardHeader className="flex flex-col items-center space-y-2 pb-2">
                      <BriefcaseIcon className="h-8 w-8 text-green-500" />
                      <CardTitle className="text-sm font-medium text-center">
                        Offres restantes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 text-center">
                        {lastPayment ? lastPayment.job_remaining : "-"}
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border border-gray-200 rounded-lg">
                    <CardHeader className="flex flex-col items-center space-y-2 pb-2">
                      <svg className="h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <CardTitle className="text-sm font-medium text-center">
                        Date de début
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 text-center">
                        {lastPayment && lastPayment.start_date 
                          ? new Date(lastPayment.start_date).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })
                          : "-"}
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border border-gray-200 rounded-lg">
                    <CardHeader className="flex flex-col items-center space-y-2 pb-2">
                      <svg className="h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <CardTitle className="text-sm font-medium text-center">
                        Date de fin
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 text-center">
                        {lastPayment && lastPayment.end_date 
                          ? new Date(lastPayment.end_date).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })
                          : "-"}
                      </p>
                    </CardContent>
                  </Card>
                </div>
                </div>
              )}
            </div>
          </div>


          {/* Plans Section */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="bg-green-50 px-4 md:px-6 py-4 md:py-6 border-b border-gray-200">
              <div className="text-center">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1 md:mb-2">
                  Choisissez votre plan
                </h2>
                <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
                  Des solutions flexibles adaptées à tous les besoins
                </p>
              </div>
            </div>
            
            <div className="p-4 md:p-6">
              {/* Important Note */}
              <div className="mb-4 md:mb-6 bg-blue-50 border-2 border-blue-200 rounded-lg p-3 md:p-4">
                <div className="flex items-start gap-2 md:gap-3">
                  <svg className="h-5 w-5 md:h-6 md:w-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm md:text-base font-semibold text-blue-900 mb-1">
                      Information importante
                    </h4>
                    <p className="text-xs md:text-sm text-blue-800">
                      Après avoir choisi votre pack, celui-ci sera activé uniquement après la confirmation de notre conseiller. 
                      Vous recevrez un email de confirmation et serez contacté dans les plus brefs délais.
                    </p>
                  </div>
                </div>
              </div>
              
              <Tabs defaultValue="Mensuel" className="w-full">
                <div className="flex justify-center mb-6 md:mb-8">
                  <TabsList className="inline-flex bg-gray-100 p-1 rounded-lg gap-1 w-full md:w-auto">
                    <TabsTrigger
                      value="Mensuel"
                      onClick={() => handlePeriodChange("Mensuel")}
                      className="flex-1 md:flex-none px-3 md:px-4 py-2 text-xs md:text-sm text-gray-700 data-[state=active]:bg-green-600 data-[state=active]:text-white rounded-md transition-colors whitespace-nowrap"
                    >
                      Mensuel
                    </TabsTrigger>
                    <TabsTrigger
                      value="Trimestriel"
                      onClick={() => handlePeriodChange("Trimestriel")}
                      className="flex-1 md:flex-none px-2 md:px-4 py-2 text-xs md:text-sm text-gray-700 data-[state=active]:bg-green-600 data-[state=active]:text-white rounded-md transition-colors whitespace-nowrap"
                    >
                      <span className="hidden sm:inline">Trimestriel -10%</span>
                      <span className="sm:hidden">Trim. -10%</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="Annuel"
                      onClick={() => handlePeriodChange("Annuel")}
                      className="flex-1 md:flex-none px-3 md:px-4 py-2 text-xs md:text-sm text-gray-700 data-[state=active]:bg-green-600 data-[state=active]:text-white rounded-md transition-colors whitespace-nowrap"
                    >
                      Annuel -20%
                    </TabsTrigger>
                  </TabsList>
                </div>


                {/* Monthly Plans */}
                <TabsContent value="Mensuel" className="mt-0">
                  <div className="w-full py-4 md:py-6">
                    {isLoadingPlans ? (
                      <div className="flex justify-center items-center py-12 md:py-16">
                        <div className="w-12 h-12 border-4 border-gray-200 border-t-green-600 rounded-full animate-spin"></div>
                        <span className="ml-3 text-gray-600">Chargement...</span>
                      </div>
                    ) : plans.length === 0 ? (
                      <div className="text-center py-12 md:py-16">
                        <p className="text-gray-500">Aucun plan disponible</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {plans.map((plan, index) => {
                          console.log(`Rendering monthly plan ${index + 1}:`, plan.name, plan.id);
                          return (
                            <React.Fragment key={`monthly-${plan.id}`}>
                              {renderPlanCard(plan, "monthly_price", "par mois")}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Quarterly Plans */}
                <TabsContent value="Trimestriel" className="mt-0">
                  <div className="w-full py-4 md:py-6">
                    {isLoadingPlans ? (
                      <div className="flex justify-center items-center py-12 md:py-16">
                        <div className="w-12 h-12 border-4 border-gray-200 border-t-green-600 rounded-full animate-spin"></div>
                        <span className="ml-3 text-gray-600">Chargement...</span>
                      </div>
                    ) : plans.length === 0 ? (
                      <div className="text-center py-12 md:py-16">
                        <p className="text-gray-500">Aucun plan disponible</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {plans.map((plan) => (
                          <React.Fragment key={`quarterly-${plan.id}`}>
                            {renderPlanCard(plan, "quarterly_price", "par trimestre")}
                          </React.Fragment>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Annual Plans */}
                <TabsContent value="Annuel" className="mt-0">
                  <div className="w-full py-4 md:py-6">
                    {isLoadingPlans ? (
                      <div className="flex justify-center items-center py-12 md:py-16">
                        <div className="w-12 h-12 border-4 border-gray-200 border-t-green-600 rounded-full animate-spin"></div>
                        <span className="ml-3 text-gray-600">Chargement...</span>
                      </div>
                    ) : plans.length === 0 ? (
                      <div className="text-center py-12 md:py-16">
                        <p className="text-gray-500">Aucun plan disponible</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {plans.map((plan) => (
                          <React.Fragment key={`annual-${plan.id}`}>
                            {renderPlanCard(plan, "annual_price", "par année")}
                          </React.Fragment>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>


          {/* Trust Indicators */}
          <div className="bg-green-50 rounded-lg border-2 border-green-200 p-4 md:p-6">
            <div className="text-center mb-6 md:mb-8">
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-4">
                Pourquoi choisir FaceJob ?
              </h3>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4 md:gap-6">
              <div className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                    <CheckCircleIcon className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Recrutement Simplifié</h4>
                <p className="text-sm text-gray-600">
                  Accédez rapidement aux meilleurs talents grâce aux CV vidéos
                </p>
              </div>
              
              <div className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Gain de Temps</h4>
                <p className="text-sm text-gray-600">
                  Réduisez le temps de présélection avec des profils vidéo détaillés
                </p>
              </div>
              
              <div className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Support Dédié</h4>
                <p className="text-sm text-gray-600">
                  Une équipe à votre écoute pour vous accompagner
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Payment Modal */}
      {isModalOpen && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Confirmer votre abonnement
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {!showSuccessMessage ? (
              <>
                <div className="mb-6">
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <h4 className="font-semibold text-gray-900 mb-2">{selectedPlan.name}</h4>
                    <p className="text-2xl font-bold text-green-600">
                      {selectedPeriod === "Mensuel" && `${Number(selectedPlan.monthly_price || 0).toFixed(0)} DH/mois`}
                      {selectedPeriod === "Trimestriel" && `${Number(selectedPlan.quarterly_price || 0).toFixed(0)} DH/trimestre`}
                      {selectedPeriod === "Annuel" && `${Number(selectedPlan.annual_price || 0).toFixed(0)} DH/année`}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleConfirmClick}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Confirmer
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <div className="flex justify-center mb-4">
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">
                  Demande envoyée avec succès!
                </h4>
                <p className="text-gray-600 mb-6">
                  Un de nos conseillers va vous contacter prochainement pour finaliser votre abonnement.
                </p>
                <button
                  onClick={handleCloseModal}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Fermer
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default ServicePlanPage;
