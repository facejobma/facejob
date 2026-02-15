"use client";
import BreadCrumb from "@/components/breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircleIcon,
  VideoCameraIcon,
  BriefcaseIcon,
  ClockIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { fetchPlans } from "@/lib/api";
import { toast } from "react-hot-toast";

const breadcrumbItems = [
  { title: "Recharger compte d'entreprise", link: "/dashboard/payments" },
];

// Helper function to translate payment period to French
const translatePeriod = (period: string | undefined): string => {
  if (!period) return "-";
  const translations: { [key: string]: string } = {
    "Mensuel": "Mensuel",
    "Trimestriel": "Trimestriel",
    "Annuel": "Annuel",
    "monthly": "Mensuel",
    "quarterly": "Trimestriel",
    "annual": "Annuel",
  };
  return translations[period] || period;
};

function ServicePlanPage() {
  const authToken = Cookies.get("authToken")?.replace(/["']/g, "");
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("Mensuel");
  const [paymentReference, setPaymentReference] = useState("");
  const [lastPayment, setLastPayment] = useState<any>(null);
  const [currentPlanId, setCurrentPlanId] = useState(null);
  const [hasNoPayment, setHasNoPayment] = useState(false);
  const [isLoadingPayment, setIsLoadingPayment] = useState(true);
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  
  // Carousel state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(1);

  const company =
    typeof window !== "undefined"
      ? window.sessionStorage?.getItem("user") || "{}"
      : "{}";
  const companyId = company ? JSON.parse(company).id : null;
  
  const fetchLastPayment = async () => {
    setIsLoadingPayment(true);
    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_URL + `/api/v1/payments/${companyId}/last`,
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
        // Handle "No payment found for this entreprise" case
        const errorData = await response.json();
        console.log("No payment found:", errorData.message);
        setLastPayment(null);
        setCurrentPlanId(null);
        setHasNoPayment(true);
        // User will see the plan selection interface without a toast message
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
      const plansData = await fetchPlans();
      // Transform the data to match frontend expectations
      const transformedPlans = plansData.map((plan: any) => ({
        ...plan,
        contact_access: plan.cv_video_consultations, // Map contact access
        exclusif: plan.exclusive, // Map exclusive field
      }));
      setPlans(transformedPlans);
    } catch (error) {
      console.error("Failed to fetch plans:", error);
      toast.error("Erreur lors de la récupération des plans");
    } finally {
      setIsLoadingPlans(false);
    }
  };
  
  useEffect(() => {
    fetchLastPayment();
    fetchPlansData();
    
    // Set cards per view based on screen size
    const updateCardsPerView = () => {
      if (window.innerWidth >= 1536) { // 2xl
        setCardsPerView(3);
      } else if (window.innerWidth >= 1280) { // xl
        setCardsPerView(2);
      } else if (window.innerWidth >= 1024) { // lg
        setCardsPerView(2);
      } else {
        setCardsPerView(1);
      }
    };

    updateCardsPerView();
    window.addEventListener('resize', updateCardsPerView);
    
    return () => window.removeEventListener('resize', updateCardsPerView);
  }, []);

  // Carousel functions
  const nextSlide = () => {
    const maxSlide = Math.max(0, plans.length - cardsPerView);
    setCurrentSlide(prev => (prev >= maxSlide ? 0 : prev + 1));
  };

  const prevSlide = () => {
    const maxSlide = Math.max(0, plans.length - cardsPerView);
    setCurrentSlide(prev => (prev <= 0 ? maxSlide : prev - 1));
  };

  const goToSlide = (index: number) => {
    const maxSlide = Math.max(0, plans.length - cardsPerView);
    setCurrentSlide(Math.min(index, maxSlide));
  };

  const handleUpgradeClick = (plan: any) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const handlePaymentMethodChange = (method: any) => {
    setPaymentMethod(method);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setPaymentMethod(null);
  };

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
  };

  const handlePaymentReferenceChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setPaymentReference(e.target.value);
  };

  const handleConfirmClick = async () => {
    if (!selectedPlan || !selectedPeriod) return;

    let price, endDate, paymentPeriod;

    const startDate = new Date();

    switch (selectedPeriod) {
      case "Mensuel":
        price = selectedPlan.monthly_price;
        endDate = new Date(new Date().setMonth(startDate.getMonth() + 1));
        paymentPeriod = "Mensuel";
        break;
      case "Trimestriel":
        price = selectedPlan.quarterly_price;
        endDate = new Date(new Date().setMonth(startDate.getMonth() + 3));
        paymentPeriod = "Trimestriel";
        break;
      case "Annuel":
        price = selectedPlan.annual_price;
        endDate = new Date(new Date().setFullYear(startDate.getFullYear() + 1));
        paymentPeriod = "Annuel";
        break;
      default:
        return;
    }

    const paymentData = {
      price: price,
      start_date: startDate.toISOString().split("T")[0],
      end_date: endDate.toISOString().split("T")[0],
      payment_method: paymentMethod,
      reference: paymentReference,
      payment_period: paymentPeriod,
      status: "pending",
      cv_video_consumed: 0,
      job_posted: 0,
      entreprise_id: companyId,
      plan_id: selectedPlan.id,
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
        toast.success("Payment created successfully!");
        fetchLastPayment();
        handleCloseModal();
      } else {
        toast.error("Error creating payment!");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const isCurrentPlanDisabled = (plan: any) => {
    // If no payment exists, no plan should be disabled
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

  return (
    <>
      <ScrollArea className="h-full">
        <div className="space-y-4 md:space-y-6 lg:space-y-8 p-4 md:p-6 lg:p-8">
          {/* Header with enhanced design */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-8 text-white shadow-xl">
            <div className="flex flex-col gap-4 md:gap-6">
              <div className="flex-1">
                <div className="flex items-start md:items-center gap-3 mb-4">
                  <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg md:rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                    <svg className="text-white w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">Plans & Abonnements</h1>
                    <p className="text-indigo-100 mt-1 text-sm md:text-base">Choisissez le plan adapté à vos besoins</p>
                  </div>
                </div>
                
                {/* Statistics Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3 lg:gap-4 mt-4 md:mt-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg md:rounded-xl p-3 md:p-4 border border-white/20">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                      <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                        <CheckCircleIcon className="text-white w-4 h-4 md:w-5 md:h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-lg md:text-xl lg:text-2xl font-bold text-white truncate">
                          {isLoadingPayment ? "..." : (lastPayment ? lastPayment.plan_name : hasNoPayment ? "Aucun" : "-")}
                        </p>
                        <p className="text-xs text-indigo-100">Plan actuel</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg md:rounded-xl p-3 md:p-4 border border-white/20">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                      <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-emerald-500/30 flex items-center justify-center flex-shrink-0">
                        <VideoCameraIcon className="text-white w-4 h-4 md:w-5 md:h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-lg md:text-xl lg:text-2xl font-bold text-white truncate">
                          {isLoadingPayment ? "..." : (lastPayment ? lastPayment.contact_access_remaining : hasNoPayment ? "0" : "-")}
                        </p>
                        <p className="text-xs text-indigo-100">Contacts</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg md:rounded-xl p-3 md:p-4 border border-white/20">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                      <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-blue-500/30 flex items-center justify-center flex-shrink-0">
                        <BriefcaseIcon className="text-white w-4 h-4 md:w-5 md:h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-lg md:text-xl lg:text-2xl font-bold text-white truncate">
                          {isLoadingPayment ? "..." : (lastPayment ? lastPayment.job_remaining : hasNoPayment ? "0" : "-")}
                        </p>
                        <p className="text-xs text-indigo-100">Offres</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg md:rounded-xl p-3 md:p-4 border border-white/20">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                      <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-amber-500/30 flex items-center justify-center flex-shrink-0">
                        <ClockIcon className="text-white w-4 h-4 md:w-5 md:h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-lg md:text-xl lg:text-2xl font-bold text-white truncate">
                          {isLoadingPayment ? "..." : (lastPayment ? translatePeriod(lastPayment?.payment_period) : hasNoPayment ? "Aucune" : "-")}
                        </p>
                        <p className="text-xs text-indigo-100">Période</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Current Plan Overview */}
          <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 md:px-6 py-3 md:py-4 border-b border-gray-200">
              <h3 className="text-base md:text-lg font-semibold text-gray-900">Aperçu de votre abonnement</h3>
            </div>
            <div className="p-4 md:p-6">
              {isLoadingPayment ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  <span className="ml-2 text-sm md:text-base text-gray-600">Chargement...</span>
                </div>
              ) : hasNoPayment ? (
                <div className="text-center py-6 md:py-8">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 md:p-6 border border-blue-200">
                    <div className="flex justify-center mb-4">
                      <div className="h-12 w-12 md:h-16 md:w-16 rounded-full bg-blue-100 flex items-center justify-center">
                        <BriefcaseIcon className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
                      </div>
                    </div>
                    <h4 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">Aucun abonnement actif</h4>
                    <p className="text-sm md:text-base text-gray-600 mb-4">
                      Choisissez un plan ci-dessous pour commencer.
                    </p>
                    <div className="bg-white rounded-lg p-3 md:p-4 border border-blue-200">
                      <p className="text-xs md:text-sm text-gray-700 font-medium mb-2">
                        Avantages d'un abonnement :
                      </p>
                      <ul className="text-xs md:text-sm text-gray-600 space-y-1 text-left">
                        <li>• Accès aux CV vidéos</li>
                        <li>• Publication d'offres d'emploi</li>
                        <li>• Support dédié selon le plan</li>
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full max-w-5xl mx-auto">
                  <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow border rounded-lg flex flex-col items-center">
                    <CheckCircleIcon className="h-8 w-8 text-green-500 mb-2" />
                    <CardHeader className="flex flex-col items-center space-y-0 pb-2">
                      <CardTitle className="font-medium text-center">
                      Votre panel actuel
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 text-center">
                        {lastPayment ? lastPayment.plan_name : "-"}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow border rounded-lg flex flex-col items-center">
                    <ClockIcon className="h-8 w-8 text-gray-500 mb-2" />
                    <CardHeader className="flex flex-col items-center space-y-0 pb-2">
                      <CardTitle className="font-medium text-center">
                      Votre période de panel actuel
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 text-center">
                        {lastPayment ? translatePeriod(lastPayment?.payment_period) : "-"}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow border rounded-lg flex flex-col items-center">
                    <VideoCameraIcon className="h-8 w-8 text-blue-500 mb-2" />
                    <CardHeader className="flex flex-col items-center space-y-0 pb-2">
                      <CardTitle className="font-medium text-center">
                        Nombre de CV vidéos consommés
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 text-center">
                        {lastPayment ? lastPayment.cv_video_consumed : "-"}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow border rounded-lg flex flex-col items-center">
                    <VideoCameraIcon className="h-8 w-8 text-orange-500 mb-2" />
                    <CardHeader className="flex flex-col items-center space-y-0 pb-2">
                      <CardTitle className="font-medium text-center">
                        Nombre de CV vidéos restants
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 text-center">
                        {lastPayment ? lastPayment.cv_video_remaining : "-"}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow border rounded-lg flex flex-col items-center">
                    <BriefcaseIcon className="h-8 w-8 text-yellow-500 mb-2" />
                    <CardHeader className="flex flex-col items-center space-y-4 pb-2">
                      <CardTitle className="font-medium text-center">
                      Nombre des offres d'emploi diffusées
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 text-center">
                        {lastPayment ? lastPayment.job_posted : "-"}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow border rounded-lg flex flex-col items-center">
                    <BriefcaseIcon className="h-8 w-8 text-red-500 mb-2" />
                    <CardHeader className="flex flex-col items-center space-y-0 pb-2">
                      <CardTitle className="font-medium text-center">
                      Nombre des offres d'emploi restantes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 text-center">
                        {lastPayment ? lastPayment.job_remaining : "-"}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>

          {/* Plans Section */}
          <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-4 md:px-6 lg:px-8 py-4 md:py-6 border-b border-gray-200">
              <div className="text-center">
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                  Choisissez votre plan
                </h2>
                <p className="text-sm md:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto">
                  Des solutions flexibles pour tous les besoins
                </p>
              </div>
            </div>
            
            <div className="p-4 md:p-6 lg:p-8">
              {/* Period Selector */}
              <div className="flex justify-center mb-6 md:mb-8">
                <div className="bg-gray-100 p-1 rounded-lg md:rounded-xl w-full max-w-md md:max-w-none md:w-auto">
                  <Tabs defaultValue="Mensuel" className="space-y-6 md:space-y-8">
                    <TabsList className="bg-transparent space-x-1 grid grid-cols-3 md:flex w-full">
                      <TabsTrigger
                        value="Mensuel"
                        onClick={() => handlePeriodChange("Mensuel")}
                        className="px-3 md:px-6 py-2 rounded-lg text-xs md:text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm"
                      >
                        Mensuel
                      </TabsTrigger>
                      <TabsTrigger
                        value="Trimestriel"
                        onClick={() => handlePeriodChange("Trimestriel")}
                        className="px-3 md:px-6 py-2 rounded-lg text-xs md:text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm"
                      >
                        <span className="flex items-center gap-1 md:gap-2">
                          <span className="hidden sm:inline">Trimestriel</span>
                          <span className="sm:hidden">3 mois</span>
                          <span className="bg-green-100 text-green-700 text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded-full font-medium">
                            -10%
                          </span>
                        </span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="Annuel"
                        onClick={() => handlePeriodChange("Annuel")}
                        className="px-3 md:px-6 py-2 rounded-lg text-xs md:text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm"
                      >
                        <span className="flex items-center gap-1 md:gap-2">
                          Annuel
                          <span className="bg-blue-100 text-blue-700 text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded-full font-medium">
                            -20%
                          </span>
                        </span>
                      </TabsTrigger>
                    </TabsList>

                    {/* Monthly Plans Carousel */}
                    <TabsContent value="Mensuel">
                      <div className="relative max-w-7xl mx-auto px-8 md:px-12 pt-14 md:pt-16 pb-6 md:pb-8">
                        {isLoadingPlans ? (
                          <div className="flex justify-center items-center py-12 md:py-16">
                            <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 border-indigo-600"></div>
                            <span className="ml-3 text-sm md:text-base text-gray-600">Chargement...</span>
                          </div>
                        ) : plans.length === 0 ? (
                          <div className="text-center py-12 md:py-16">
                            <p className="text-gray-500 text-sm md:text-base">Aucun plan disponible</p>
                          </div>
                        ) : (
                          <>
                            {/* Carousel Container */}
                            <div className="overflow-hidden pt-6 px-2">
                              <div 
                                className="flex transition-transform duration-300 ease-in-out gap-6"
                                style={{ 
                                  transform: `translateX(-${currentSlide * (100 / cardsPerView)}%)`,
                                  width: `${(plans.length / cardsPerView) * 100}%`
                                }}
                              >
                            {plans.map((plan, index) => {
                              const isPopular = plan.popular;
                              const isExclusive = plan.exclusif;
                              const isFree = Number(plan.monthly_price || 0) === 0;
                              
                              return (
                                <div
                                  key={index}
                                  className={`relative rounded-2xl border-2 transition-all duration-300 h-full ${
                                    isPopular 
                                      ? 'border-indigo-500 shadow-xl shadow-indigo-100' 
                                      : isExclusive
                                      ? 'border-purple-500 shadow-xl shadow-purple-100'
                                      : isFree
                                      ? 'border-green-500 shadow-xl shadow-green-100'
                                      : 'border-gray-200 shadow-lg hover:border-gray-300'
                                  } flex-shrink-0`}
                                  style={{ width: `calc(${100 / cardsPerView}% - ${(cardsPerView - 1) * 1.5}rem / ${cardsPerView})` }}
                                >
                                  {/* Popular Badge */}
                                  {isPopular && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                                      <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 md:px-4 py-1 rounded-full text-xs md:text-sm font-semibold shadow-lg whitespace-nowrap">
                                        ⭐ Populaire
                                      </span>
                                    </div>
                                  )}
                                  
                                  {/* Exclusive Badge */}
                                  {isExclusive && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                                      <span className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-3 md:px-4 py-1 rounded-full text-xs md:text-sm font-semibold shadow-lg whitespace-nowrap">
                                        👑 Exclusif
                                      </span>
                                    </div>
                                  )}

                                  {/* Free Badge */}
                                  {isFree && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                                      <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 md:px-4 py-1 rounded-full text-xs md:text-sm font-semibold shadow-lg whitespace-nowrap">
                                        🎉 Gratuit
                                      </span>
                                    </div>
                                  )}

                                  <div className="p-4 md:p-6 h-full flex flex-col">
                                    {/* Plan Header */}
                                    <div className="text-center mb-4 md:mb-6">
                                      <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-3">
                                        {plan.name}
                                      </h3>
                                      <div className="mb-3 md:mb-4">
                                        <span className="text-3xl md:text-4xl font-bold text-gray-900">
                                          {Number(plan.monthly_price || 0).toFixed(0)}
                                        </span>
                                        <span className="text-gray-600 ml-1 text-sm md:text-base">DH</span>
                                        <div className="text-xs md:text-sm text-gray-500 mt-1">
                                          par mois
                                        </div>
                                      </div>
                                      
                                      {/* Plan Description */}
                                      <p className="text-xs md:text-sm text-gray-600 mb-3 md:mb-4 min-h-[2rem] md:min-h-[2.5rem] flex items-center justify-center px-2">
                                        {plan.description || (isFree ? "Parfait pour découvrir" : "Plan professionnel")}
                                      </p>
                                    </div>

                                    {/* Features List */}
                                    <div className="space-y-3 md:space-y-4 mb-6 md:mb-8 flex-grow">
                                      <div className="flex items-start gap-2 md:gap-3">
                                        <CheckCircleIcon className="h-4 w-4 md:h-5 md:w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span className="text-xs md:text-sm text-gray-700 leading-relaxed">
                                          Gestion des candidatures *
                                        </span>
                                      </div>
                                      
                                      <div className="flex items-start gap-2 md:gap-3">
                                        <VideoCameraIcon className="h-4 w-4 md:h-5 md:w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                        <span className="text-xs md:text-sm text-gray-700 leading-relaxed">
                                          Visualisation CV vidéos **
                                        </span>
                                        <span className="text-xs bg-green-100 text-green-800 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full">
                                          Illimité
                                        </span>
                                      </div>
                                      
                                      <div className="flex items-start gap-2 md:gap-3">
                                        <svg className="h-4 w-4 md:h-5 md:w-5 text-purple-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <span className="text-xs md:text-sm text-gray-700 leading-relaxed">
                                          Coordonnées candidats ***
                                        </span>
                                        <span className="text-xs bg-blue-100 text-blue-800 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full font-medium">
                                          {plan.cv_video_consultations === -1 ? "Illimité" : `${plan.cv_video_consultations}/mois`}
                                        </span>
                                      </div>
                                      
                                      <div className="flex items-start gap-2 md:gap-3">
                                        <BriefcaseIcon className="h-4 w-4 md:h-5 md:w-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                                        <span className="text-xs md:text-sm text-gray-700 leading-relaxed">
                                          Offres d'emploi
                                        </span>
                                        <span className="text-xs bg-purple-100 text-purple-800 px-1.5 md:px-2 py-0.5 md:py-1 rounded-full font-medium">
                                          {plan.job_postings === -1 ? "Illimité" : `${plan.job_postings}/mois`}
                                        </span>
                                      </div>
                                      
                                      {plan.dedicated_support && (
                                        <div className="flex items-start gap-2 md:gap-3">
                                          <svg className="h-4 w-4 md:h-5 md:w-5 text-orange-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 109.75 9.75A9.75 9.75 0 0012 2.25z" />
                                          </svg>
                                          <span className="text-xs md:text-sm text-gray-700 font-medium leading-relaxed">
                                            Support Dédié
                                          </span>
                                        </div>
                                      )}
                                    </div>

                                    {/* CTA Button */}
                                    <div className="mt-auto">
                                      <button
                                        className={`w-full py-2.5 md:py-3 px-4 md:px-6 rounded-xl font-semibold text-sm md:text-base transition-all duration-200 ${
                                          isCurrentPlanDisabled(plan)
                                            ? "bg-gray-100 text-gray-500 cursor-not-allowed border border-gray-200"
                                            : isPopular
                                            ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-lg hover:shadow-xl"
                                            : isExclusive
                                            ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700 shadow-lg hover:shadow-xl"
                                            : isFree
                                            ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl"
                                            : "bg-gray-900 text-white hover:bg-gray-800 shadow-lg hover:shadow-xl"
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
                            })}
                          </div>
                        </div>

                        {/* Navigation Arrows */}
                        {plans.length > cardsPerView && (
                          <>
                            <button
                              onClick={prevSlide}
                              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 md:p-3 shadow-xl border-2 border-gray-300 hover:bg-gray-50 hover:border-indigo-500 transition-all z-20"
                            >
                              <ChevronLeftIcon className="h-6 w-6 text-gray-600" />
                            </button>
                            <button
                              onClick={nextSlide}
                              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 md:p-3 shadow-xl border-2 border-gray-300 hover:bg-gray-50 hover:border-indigo-500 transition-all z-20"
                            >
                              <ChevronRightIcon className="h-6 w-6 text-gray-600" />
                            </button>
                          </>
                        )}

                        {/* Dots Indicator */}
                        {plans.length > cardsPerView && (
                          <div className="flex justify-center mt-8 space-x-2">
                            {Array.from({ length: Math.ceil(plans.length / cardsPerView) }).map((_, index) => (
                              <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`w-3 h-3 rounded-full transition-colors ${
                                  Math.floor(currentSlide / cardsPerView) === index
                                    ? 'bg-indigo-600'
                                    : 'bg-gray-300 hover:bg-gray-400'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                          </>
                        )}
                      </div>
                    </TabsContent>

                    {/* Quarterly Plans Carousel */}
                    <TabsContent value="Trimestriel">
                      <div className="relative max-w-7xl mx-auto px-8 md:px-12 pt-14 md:pt-16 pb-6 md:pb-8">
                        {isLoadingPlans ? (
                          <div className="flex justify-center items-center py-16">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                            <span className="ml-3 text-gray-600">Chargement des plans...</span>
                          </div>
                        ) : plans.length === 0 ? (
                          <div className="text-center py-16">
                            <p className="text-gray-500">Aucun plan disponible</p>
                          </div>
                        ) : (
                          <>
                            <div className="overflow-hidden pt-6 px-2">
                              <div 
                                className="flex transition-transform duration-300 ease-in-out gap-6"
                                style={{ 
                                  transform: `translateX(-${currentSlide * (100 / cardsPerView)}%)`,
                                  width: `${(plans.length / cardsPerView) * 100}%`
                                }}
                              >
                            {plans.map((plan, index) => {
                              const isPopular = plan.popular;
                              const isExclusive = plan.exclusif;
                              const isFree = Number(plan.monthly_price || 0) === 0;
                              const monthlySavings = Number(plan.monthly_price || 0) * 3 - Number(plan.quarterly_price || 0);
                              
                              return (
                                <div
                                  key={index}
                                  className={`relative rounded-2xl border-2 transition-all duration-300 h-full ${
                                    isPopular 
                                      ? 'border-indigo-500 shadow-xl shadow-indigo-100' 
                                      : isExclusive
                                      ? 'border-purple-500 shadow-xl shadow-purple-100'
                                      : isFree
                                      ? 'border-green-500 shadow-xl shadow-green-100'
                                      : 'border-gray-200 shadow-lg hover:border-gray-300'
                                  } flex-shrink-0`}
                                  style={{ width: `calc(${100 / cardsPerView}% - ${(cardsPerView - 1) * 1.5}rem / ${cardsPerView})` }}
                                >
                                  {/* Savings Badge */}
                                  {!isFree && monthlySavings > 0 && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                                      <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg whitespace-nowrap">
                                        💰 Économisez {monthlySavings} DH
                                      </span>
                                    </div>
                                  )}

                                  {/* Free Badge */}
                                  {isFree && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                                      <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg whitespace-nowrap">
                                        🎉 Toujours Gratuit
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
                                          {Number(plan.quarterly_price || 0).toFixed(0)}
                                        </span>
                                        <span className="text-gray-600 ml-1">DH</span>
                                        <div className="text-sm text-gray-500 mt-1">
                                          par trimestre
                                        </div>
                                        {!isFree && (
                                          <div className="text-sm text-green-600 font-medium mt-1">
                                            {(Number(plan.quarterly_price || 0) / 3).toFixed(0)} DH/mois
                                          </div>
                                        )}
                                      </div>
                                      
                                      {/* Plan Description */}
                                      <p className="text-sm text-gray-600 mb-4 min-h-[2.5rem] flex items-center justify-center">
                                        {plan.description || (isFree ? "Parfait pour découvrir nos services" : "Plan professionnel")}
                                      </p>
                                    </div>

                                    {/* Features List */}
                                    <div className="space-y-4 mb-8 flex-grow">
                                      <div className="flex items-start gap-3">
                                        <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span className="text-sm text-gray-700 leading-relaxed">
                                          Création de compte client et gestion des candidatures *
                                        </span>
                                      </div>
                                      
                                      <div className="flex items-start gap-3">
                                        <VideoCameraIcon className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                        <span className="text-sm text-gray-700 leading-relaxed">
                                          Accès visualisation de CV vidéos **
                                        </span>
                                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                          Illimité
                                        </span>
                                      </div>
                                      
                                      <div className="flex items-start gap-3">
                                        <svg className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <span className="text-sm text-gray-700 leading-relaxed">
                                          Accès coordonnées candidats ***
                                        </span>
                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                                          {plan.cv_video_consultations === -1 ? "Illimité" : `${plan.cv_video_consultations}/mois`}
                                        </span>
                                      </div>
                                      
                                      <div className="flex items-start gap-3">
                                        <BriefcaseIcon className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                                        <span className="text-sm text-gray-700 leading-relaxed">
                                          Offres d'emploi
                                        </span>
                                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full font-medium">
                                          {plan.job_postings === -1 ? "Illimité" : `${plan.job_postings}/mois`}
                                        </span>
                                      </div>
                                      
                                      {plan.dedicated_support && (
                                        <div className="flex items-start gap-3">
                                          <svg className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                        className={`w-full py-3 px-6 rounded-xl font-semibold text-base transition-all duration-200 ${
                                          isCurrentPlanDisabled(plan)
                                            ? "bg-gray-100 text-gray-500 cursor-not-allowed border border-gray-200"
                                            : "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl"
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
                            })}
                          </div>
                        </div>

                        {/* Navigation Arrows */}
                        {plans.length > cardsPerView && (
                          <>
                            <button
                              onClick={prevSlide}
                              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 md:p-3 shadow-xl border-2 border-gray-300 hover:bg-gray-50 hover:border-indigo-500 transition-all z-20"
                            >
                              <ChevronLeftIcon className="h-6 w-6 text-gray-600" />
                            </button>
                            <button
                              onClick={nextSlide}
                              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 md:p-3 shadow-xl border-2 border-gray-300 hover:bg-gray-50 hover:border-indigo-500 transition-all z-20"
                            >
                              <ChevronRightIcon className="h-6 w-6 text-gray-600" />
                            </button>
                          </>
                        )}

                        {/* Dots Indicator */}
                        {plans.length > cardsPerView && (
                          <div className="flex justify-center mt-8 space-x-2">
                            {Array.from({ length: Math.ceil(plans.length / cardsPerView) }).map((_, index) => (
                              <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`w-3 h-3 rounded-full transition-colors ${
                                  Math.floor(currentSlide / cardsPerView) === index
                                    ? 'bg-green-600'
                                    : 'bg-gray-300 hover:bg-gray-400'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                          </>
                        )}
                      </div>
                    </TabsContent>

                    {/* Annual Plans Carousel */}
                    <TabsContent value="Annuel">
                      <div className="relative max-w-7xl mx-auto px-8 md:px-12 pt-14 md:pt-16 pb-6 md:pb-8">
                        {isLoadingPlans ? (
                          <div className="flex justify-center items-center py-16">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            <span className="ml-3 text-gray-600">Chargement des plans...</span>
                          </div>
                        ) : plans.length === 0 ? (
                          <div className="text-center py-16">
                            <p className="text-gray-500">Aucun plan disponible</p>
                          </div>
                        ) : (
                          <>
                            <div className="overflow-hidden pt-6 px-2">
                              <div 
                                className="flex transition-transform duration-300 ease-in-out gap-6"
                                style={{ 
                                  transform: `translateX(-${currentSlide * (100 / cardsPerView)}%)`,
                                  width: `${(plans.length / cardsPerView) * 100}%`
                                }}
                              >
                            {plans.map((plan, index) => {
                              const isPopular = plan.popular;
                              const isExclusive = plan.exclusif;
                              const isFree = Number(plan.monthly_price || 0) === 0;
                              const monthlySavings = Number(plan.monthly_price || 0) * 12 - Number(plan.annual_price || 0);
                              
                              return (
                                <div
                                  key={index}
                                  className={`relative rounded-2xl border-2 transition-all duration-300 h-full ${
                                    isPopular 
                                      ? 'border-indigo-500 shadow-xl shadow-indigo-100' 
                                      : isExclusive
                                      ? 'border-purple-500 shadow-xl shadow-purple-100'
                                      : isFree
                                      ? 'border-green-500 shadow-xl shadow-green-100'
                                      : 'border-gray-200 shadow-lg hover:border-gray-300'
                                  } flex-shrink-0`}
                                  style={{ width: `calc(${100 / cardsPerView}% - ${(cardsPerView - 1) * 1.5}rem / ${cardsPerView})` }}
                                >
                                  {/* Best Value Badge */}
                                  {!isFree && monthlySavings > 0 && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                                      <span className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg whitespace-nowrap">
                                        🏆 Meilleure Valeur - Économisez {monthlySavings} DH
                                      </span>
                                    </div>
                                  )}

                                  {/* Free Badge */}
                                  {isFree && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                                      <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg whitespace-nowrap">
                                        🎉 Toujours Gratuit
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
                                          {Number(plan.annual_price || 0).toFixed(0)}
                                        </span>
                                        <span className="text-gray-600 ml-1">DH</span>
                                        <div className="text-sm text-gray-500 mt-1">
                                          par année
                                        </div>
                                        {!isFree && (
                                          <div className="text-sm text-blue-600 font-medium mt-1">
                                            {(Number(plan.annual_price || 0) / 12).toFixed(0)} DH/mois
                                          </div>
                                        )}
                                      </div>
                                      
                                      {/* Plan Description */}
                                      <p className="text-sm text-gray-600 mb-4 min-h-[2.5rem] flex items-center justify-center">
                                        {plan.description || (isFree ? "Parfait pour découvrir nos services" : "Plan professionnel")}
                                      </p>
                                    </div>

                                    {/* Features List */}
                                    <div className="space-y-4 mb-8 flex-grow">
                                      <div className="flex items-start gap-3">
                                        <CheckCircleIcon className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span className="text-sm text-gray-700 leading-relaxed">
                                          Création de compte client et gestion des candidatures *
                                        </span>
                                      </div>
                                      
                                      <div className="flex items-start gap-3">
                                        <VideoCameraIcon className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                        <span className="text-sm text-gray-700 leading-relaxed">
                                          Accès visualisation de CV vidéos **
                                        </span>
                                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                          Illimité
                                        </span>
                                      </div>
                                      
                                      <div className="flex items-start gap-3">
                                        <svg className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <span className="text-sm text-gray-700 leading-relaxed">
                                          Accès coordonnées candidats ***
                                        </span>
                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                                          {plan.cv_video_consultations === -1 ? "Illimité" : `${plan.cv_video_consultations}/mois`}
                                        </span>
                                      </div>
                                      
                                      <div className="flex items-start gap-3">
                                        <BriefcaseIcon className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                                        <span className="text-sm text-gray-700 leading-relaxed">
                                          Offres d'emploi
                                        </span>
                                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full font-medium">
                                          {plan.job_postings === -1 ? "Illimité" : `${plan.job_postings}/mois`}
                                        </span>
                                      </div>
                                      
                                      {plan.dedicated_support && (
                                        <div className="flex items-start gap-3">
                                          <svg className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                        className={`w-full py-3 px-6 rounded-xl font-semibold text-base transition-all duration-200 ${
                                          isCurrentPlanDisabled(plan)
                                            ? "bg-gray-100 text-gray-500 cursor-not-allowed border border-gray-200"
                                            : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl"
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
                            })}
                          </div>
                        </div>

                        {/* Navigation Arrows */}
                        {plans.length > cardsPerView && (
                          <>
                            <button
                              onClick={prevSlide}
                              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 md:p-3 shadow-xl border-2 border-gray-300 hover:bg-gray-50 hover:border-indigo-500 transition-all z-20"
                            >
                              <ChevronLeftIcon className="h-6 w-6 text-gray-600" />
                            </button>
                            <button
                              onClick={nextSlide}
                              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 md:p-3 shadow-xl border-2 border-gray-300 hover:bg-gray-50 hover:border-indigo-500 transition-all z-20"
                            >
                              <ChevronRightIcon className="h-6 w-6 text-gray-600" />
                            </button>
                          </>
                        )}

                        {/* Dots Indicator */}
                        {plans.length > cardsPerView && (
                          <div className="flex justify-center mt-8 space-x-2">
                            {Array.from({ length: Math.ceil(plans.length / cardsPerView) }).map((_, index) => (
                              <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`w-3 h-3 rounded-full transition-colors ${
                                  Math.floor(currentSlide / cardsPerView) === index
                                    ? 'bg-blue-600'
                                    : 'bg-gray-300 hover:bg-gray-400'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                          </>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <div className="text-center mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Pourquoi choisir FaceJob ?
                  </h3>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Recrutement Rapide</h4>
                    <p className="text-sm text-gray-600">
                      Trouvez les meilleurs candidats 3x plus rapidement grâce aux CV vidéo
                    </p>
                  </div>
                  
                  <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                    <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Qualité Garantie</h4>
                    <p className="text-sm text-gray-600">
                      Candidats pré-qualifiés et vérifiés pour des recrutements de qualité
                    </p>
                  </div>
                  
                  <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                    <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 109.75 9.75A9.75 9.75 0 0012 2.25z" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Support Expert</h4>
                    <p className="text-sm text-gray-600">
                      Accompagnement personnalisé pour optimiser vos recrutements
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {isModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white p-10 rounded-lg max-w-xl w-full">
                  <h3 className="text-xl font-semibold mb-4 text-center">
                    {selectedPlan.name}
                  </h3>
                  <div className="space-y-4 mb-4 p-4 border border-gray-300 rounded-md bg-white">
                    <div className="flex justify-between">
                      <span className="font-semibold">Prix mensuel :</span>
                      <span>{selectedPlan.monthly_price} DHs</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Prix annuel :</span>
                      <span>{selectedPlan.annual_price} DHs</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">
                        Création de compte incluse :
                      </span>
                      <span>
                        {selectedPlan.account_creation_included ? "Oui" : "Non"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">
                      Accès aux CVs vidéos :
                      </span>
                      <span>
                        {selectedPlan.cv_video_access ? "Oui" : "Non"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">
                      Consultation de CVs vidéos :
                      </span>
                      <span>{selectedPlan.cv_video_consultations}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">
                      Publications des offres d'emploi :
                      </span>
                      <span>{selectedPlan.job_postings}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Support dédié :</span>
                      <span>
                        {selectedPlan.dedicated_support ? "Oui" : "Non"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Exclusif :</span>
                      <span>{selectedPlan.exclusif ? "Oui" : "Non"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Populaire :</span>
                      <span>{selectedPlan.popular ? "Oui" : "Non"}</span>
                    </div>
                  </div>

                  <div className="relative w-full mb-4">
                    <div className="flex items-center space-x-4">
                      <label className="block w-1/2">
                        <input
                          type="radio"
                          name="payment_method"
                          value="virement"
                          className="hidden peer"
                          onChange={() => handlePaymentMethodChange("virement")}
                        />
                        <div className="w-full py-2 px-4 border border-gray-300 rounded-md bg-white text-center cursor-pointer peer-checked:border-primary focus:outline-none focus:ring-2 focus:ring-blue-200">
                          Paiement via virement
                        </div>
                      </label>
                      <label className="block w-1/2">
                        <input
                          type="radio"
                          name="payment_method"
                          value="contact"
                          className="hidden peer"
                          onChange={() => handlePaymentMethodChange("contact")}
                        />
                        <div className="w-full py-2 px-4 border border-gray-300 rounded-md bg-white text-center cursor-pointer peer-checked:border-primary focus:outline-none focus:ring-2 focus:ring-green-200">
                          Paiement via contact
                        </div>
                      </label>
                    </div>
                  </div>

                  {paymentMethod === "contact" && (
                    <div className="mt-4 p-4 border border-gray-300 rounded-md bg-white">
                      <h3 className="text-lg font-semibold mb-2">Contact</h3>
                      <div className="space-y-1">
                        <p>
                          <strong>Phone:</strong> +212 8 08588918
                        </p>
                        <p>
                          <strong>Email:</strong> contact@facejob.ma
                        </p>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "virement" && (
                    <div className="mt-4 p-4 border border-gray-300 rounded-md bg-white">
                      <div>
                        <strong>RIB :</strong> 1233882264829876
                      </div>
                      <div>
                        <label>
                        Nom complet :
                          <input
                            type="text"
                            placeholder="Nom complet"
                            className="border border-gray-400 rounded-lg p-2 mt-1 w-full"
                            value={paymentReference}
                            onChange={handlePaymentReferenceChange}
                          />
                        </label>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-center mt-8">
                    <button
                      className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-1 px-2 rounded mr-2"
                      onClick={handleCloseModal}
                    >
                      Annuler
                    </button>
                    <button
                      className="bg-primary hover:bg-primary-dark text-white font-bold py-1 px-2 rounded"
                      onClick={handleConfirmClick}
                    >
                      Confirmer
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </>
  );
}

export default function page() {
  return <ServicePlanPage />;
}