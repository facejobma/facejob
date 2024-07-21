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
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";

const breadcrumbItems = [
  { title: "Recharger compte d'entreprise", link: "/dashboard/payments" },
];

const plans = [
  {
    id: 1,
    name: "Pannel gratuit",
    monthly_price: 0,
    quarterly_price: 0,
    annual_price: 0,
    account_creation_included: true,
    cv_video_access: true,
    cv_video_consultations: 5,
    job_postings: 0,
    dedicated_support: false,
    exclusif: false,
    popular: false,
  },
  {
    id: 2,
    name: "Pannel de base",
    monthly_price: 1000,
    quarterly_price: 2700,
    annual_price: 9600,
    account_creation_included: true,
    cv_video_access: true,
    cv_video_consultations: 10,
    job_postings: 5,
    dedicated_support: false,
    exclusif: false,
    popular: true,
  },
  {
    id: 3,
    name: "Pannel Intérmédiaire",
    monthly_price: 1900,
    quarterly_price: 5100,
    annual_price: 18000,
    account_creation_included: true,
    cv_video_access: true,
    cv_video_consultations: 25,
    job_postings: 12,
    dedicated_support: false,
    exclusif: true,
    popular: true,
  },
  {
    id: 4,
    name: "Pannel Essentiel",
    monthly_price: 3000,
    quarterly_price: 8100,
    annual_price: 28000,
    account_creation_included: true,
    cv_video_access: true,
    cv_video_consultations: 50,
    job_postings: 20,
    dedicated_support: false,
    exclusif: false,
    popular: false,
  },
  {
    id: 5,
    name: "Pannel Premium",
    monthly_price: 5000,
    quarterly_price: 13500,
    annual_price: 48000,
    account_creation_included: true,
    cv_video_access: true,
    cv_video_consultations: "Illimité",
    job_postings: "Illimité",
    dedicated_support: true,
    exclusif: false,
    popular: false,
  },
];

function ServicePlanPage() {
  const authToken = Cookies.get("authToken")?.replace(/["']/g, "");
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [paymentReference, setPaymentReference] = useState("");
  const [lastPayment, setLastPayment] = useState<any>(null);
  const [currentPlanId, setCurrentPlanId] = useState(null);

  const company = typeof window !== "undefined"
    ? window.sessionStorage?.getItem("user") || '{}'
    : '{}';
  const companyId = company ? JSON.parse(company).id : null;
  const fetchLastPayment = async () => {
    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_URL + `/api/payments/${companyId}/last`,
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
      } else {
        console.error("Failed to fetch last payment");
      }
    } catch (error) {
      console.error("Error fetching last payment:", error);
    }
  };
  useEffect(() => {
    fetchLastPayment();
  }, []);

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

    let price, endDate, paymentPeriod, cvVideoConsumed, jobPosted;

    const startDate = new Date();

    switch (selectedPeriod) {
      case "monthly":
        price = selectedPlan.monthly_price;
        endDate = new Date(new Date().setMonth(startDate.getMonth() + 1));
        paymentPeriod = "Mensuel";
        // cvVideoConsumed =
        //   selectedPlan.cv_video_consultations === "Illimité"
        //     ? "Illimité"
        //     : selectedPlan.cv_video_consultations;
        // jobPosted =
        //   selectedPlan.job_postings === "Illimité"
        //     ? "Illimité"
        //     : selectedPlan.job_postings;
        break;
      case "quarterly":
        price = selectedPlan.quarterly_price;
        endDate = new Date(new Date().setMonth(startDate.getMonth() + 3));
        paymentPeriod = "Trimestriel";
        // cvVideoConsumed =
        //   selectedPlan.cv_video_consultations === "Illimité"
        //     ? "Illimité"
        //     : selectedPlan.cv_video_consultations * 3;
        // jobPosted =
        //   selectedPlan.job_postings === "Illimité"
        //     ? "Illimité"
        //     : selectedPlan.job_postings * 3;
        break;
      case "yearly":
        price = selectedPlan.annual_price;
        endDate = new Date(new Date().setFullYear(startDate.getFullYear() + 1));
        paymentPeriod = "Annuel";
        // cvVideoConsumed =
        //   selectedPlan.cv_video_consultations === "Illimité"
        //     ? "Illimité"
        //     : selectedPlan.cv_video_consultations * 12;
        // jobPosted =
        //   selectedPlan.job_postings === "Illimité"
        //     ? "Illimité"
        //     : selectedPlan.job_postings * 12;
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
        process.env.NEXT_PUBLIC_BACKEND_URL + "/api/payments",
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
    if (
      currentPlanId !== plan.id ||
      lastPayment?.payment_period !== selectedPeriod
    ) {
      return false;
    }

    const currentDate = new Date().toISOString().split("T")[0];

    const endDate = lastPayment?.end_date;

    // console.log("Current date:", currentDate);
    // console.log("End date:", endDate);

    return currentDate <= endDate;
  };

  return (
    <>
      <ScrollArea className="h-full">
        <div className="flex-1 space-y-8 p-4 md:p-8 pt-6">
          <BreadCrumb items={breadcrumbItems} />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 w-full max-w-5xl mx-auto">
            <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow border rounded-lg flex flex-col items-center">
              <CheckCircleIcon className="h-8 w-8 text-green-500 mb-2" />
              <CardHeader className="flex flex-col items-center space-y-0 pb-2">
                <CardTitle className="font-medium text-center">
                  Votre plan de paiement actuel
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
                  Votre periode de pannel actuel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-center">
                  {lastPayment ? lastPayment?.payment_period : "-"}
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
                  Nombre des offres d’emploi diffusés
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
                  Nombre des offres d’emploi restants
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-center">
                  {lastPayment ? lastPayment.job_remaining : "-"}
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight mb-6">
              Choisissez un plan qui vous convient
            </h2>
            <div className="flex justify-center">
              <Tabs defaultValue="monthly" className="space-y-4">
                <TabsList className="flex justify-center mb-4">
                  <TabsTrigger
                    value="monthly"
                    onClick={() => handlePeriodChange("monthly")}
                  >
                    Mensuel
                  </TabsTrigger>
                  <TabsTrigger
                    value="quarterly"
                    onClick={() => handlePeriodChange("quarterly")}
                  >
                    Trimestre
                  </TabsTrigger>
                  <TabsTrigger
                    value="yearly"
                    onClick={() => handlePeriodChange("yearly")}
                  >
                    Annuel
                  </TabsTrigger>
                </TabsList>
                <TabsContent
                  value="monthly"
                  className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 w-full max-w-5xl mx-auto"
                >
                  {plans.map((plan, index) => (
                    <div
                      key={index}
                      className="flex justify-center lg:justify-start"
                    >
                      <Card className="border rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
                        <CardHeader className="flex justify-between items-center mb-4">
                          <CardTitle className="text-lg font-bold">
                            {plan.name}
                          </CardTitle>
                          <div className="text-xl font-semibold text-primary">
                            {plan.monthly_price} DHs / mois
                          </div>
                        </CardHeader>
                        <CardContent className="mt-4 space-y-2 text-base font-normal text-start">
                          <div>
                            <strong>Création de compte incluse :</strong>{" "}
                            {plan.account_creation_included ? "Oui" : "Non"}
                          </div>
                          <div>
                            <strong>Accès aux vidéos CV :</strong>{" "}
                            {plan.cv_video_access ? "Oui" : "Non"}
                          </div>
                          <div>
                            <strong>Consultations vidéos CV :</strong>{" "}
                            {plan.cv_video_consultations}
                          </div>
                          <div>
                            <strong>Publications d'offres d'emploi :</strong>{" "}
                            {plan.job_postings}
                          </div>
                          <div>
                            <strong>Support dédié :</strong>{" "}
                            {plan.dedicated_support ? "Oui" : "Non"}
                          </div>
                          <div>
                            <strong>Exclusif :</strong>{" "}
                            {plan.exclusif ? "Oui" : "Non"}
                          </div>
                          <div>
                            <strong>Populaire :</strong>{" "}
                            {plan.popular ? "Oui" : "Non"}
                          </div>
                          <div className="text-center">
                            <button
                              className={`${
                                isCurrentPlanDisabled(plan)
                                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                  : "bg-primary hover:bg-primary-dark text-white"
                              } mt-4 text-sm font-semibold py-1 px-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary`}
                              onClick={() => handleUpgradeClick(plan)}
                              disabled={isCurrentPlanDisabled(plan)}
                            >
                              {isCurrentPlanDisabled(plan)
                                ? `Plan actuel - ${plan.name}`
                                : "Mettre à niveau le plan"}
                            </button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </TabsContent>
                <TabsContent
                  value="quarterly"
                  className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 w-full max-w-5xl mx-auto"
                >
                  {plans.map((plan, index) => (
                    <div
                      key={index}
                      className="flex justify-center lg:justify-start"
                    >
                      <Card className="border rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
                        <CardHeader className="flex justify-between items-center mb-4">
                          <CardTitle className="text-lg font-bold">
                            {plan.name}
                          </CardTitle>
                          <div className="text-xl font-semibold text-primary">
                            {plan.quarterly_price} DHs / trimestre
                          </div>
                        </CardHeader>
                        <CardContent className="mt-4 space-y-2 text-base font-normal text-start">
                          <div>
                            <strong>Création de compte incluse :</strong>{" "}
                            {plan.account_creation_included ? "Oui" : "Non"}
                          </div>
                          <div>
                            <strong>Accès aux vidéos CV :</strong>{" "}
                            {plan.cv_video_access ? "Oui" : "Non"}
                          </div>
                          <div>
                            <strong>Consultations vidéos CV :</strong>{" "}
                            {plan.cv_video_consultations}
                          </div>
                          <div>
                            <strong>Publications d'offres d'emploi :</strong>{" "}
                            {plan.job_postings}
                          </div>
                          <div>
                            <strong>Support dédié :</strong>{" "}
                            {plan.dedicated_support ? "Oui" : "Non"}
                          </div>
                          <div>
                            <strong>Exclusif :</strong>{" "}
                            {plan.exclusif ? "Oui" : "Non"}
                          </div>
                          <div>
                            <strong>Populaire :</strong>{" "}
                            {plan.popular ? "Oui" : "Non"}
                          </div>
                          <div className="text-center">
                            <button
                              className={`${
                                isCurrentPlanDisabled(plan)
                                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                  : "bg-primary hover:bg-primary-dark text-white"
                              } mt-4 text-sm font-semibold py-1 px-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary`}
                              onClick={() => handleUpgradeClick(plan)}
                              disabled={isCurrentPlanDisabled(plan)}
                            >
                              {isCurrentPlanDisabled(plan)
                                ? `Plan actuel - ${plan.name}`
                                : "Mettre à niveau le plan"}
                            </button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </TabsContent>
                <TabsContent
                  value="yearly"
                  className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 w-full max-w-5xl mx-auto"
                >
                  {plans.map((plan, index) => (
                    <div
                      key={index}
                      className="flex justify-center lg:justify-start"
                    >
                      <Card className="border rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
                        <CardHeader className="flex justify-between items-center mb-4">
                          <CardTitle className="text-lg font-bold">
                            {plan.name}
                          </CardTitle>
                          <div className="text-xl font-semibold text-primary">
                            {plan.annual_price} DHs / année
                          </div>
                        </CardHeader>
                        <CardContent className="mt-4 space-y-2 text-base font-normal text-start">
                          <div>
                            <strong>Création de compte incluse :</strong>{" "}
                            {plan.account_creation_included ? "Oui" : "Non"}
                          </div>
                          <div>
                            <strong>Accès aux vidéos CV :</strong>{" "}
                            {plan.cv_video_access ? "Oui" : "Non"}
                          </div>
                          <div>
                            <strong>Consultations vidéos CV :</strong>{" "}
                            {plan.cv_video_consultations}
                          </div>
                          <div>
                            <strong>Publications d'offres d'emploi :</strong>{" "}
                            {plan.job_postings}
                          </div>
                          <div>
                            <strong>Support dédié :</strong>{" "}
                            {plan.dedicated_support ? "Oui" : "Non"}
                          </div>
                          <div>
                            <strong>Exclusif :</strong>{" "}
                            {plan.exclusif ? "Oui" : "Non"}
                          </div>
                          <div>
                            <strong>Populaire :</strong>{" "}
                            {plan.popular ? "Oui" : "Non"}
                          </div>
                          <div className="text-center">
                            <button
                              className={`${
                                isCurrentPlanDisabled(plan)
                                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                  : "bg-primary hover:bg-primary-dark text-white"
                              } mt-4 text-sm font-semibold py-1 px-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary`}
                              onClick={() => handleUpgradeClick(plan)}
                              disabled={isCurrentPlanDisabled(plan)}
                            >
                              {isCurrentPlanDisabled(plan)
                                ? `Plan actuel - ${plan.name}`
                                : "Mettre à niveau le plan"}
                            </button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
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
                        Accès aux vidéos CV :
                      </span>
                      <span>
                        {selectedPlan.cv_video_access ? "Oui" : "Non"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">
                        Consultations vidéos CV :
                      </span>
                      <span>{selectedPlan.cv_video_consultations}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">
                        Publications d'offres d'emploi :
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
                      <h3 className="text-lg font-semibold mb-2">
                        Contact Informations
                      </h3>
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
                          Nom complete :
                          <input
                            type="text"
                            placeholder="Nom complete"
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
