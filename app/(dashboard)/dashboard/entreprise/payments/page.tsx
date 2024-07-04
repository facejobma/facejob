"use client";
import BreadCrumb from "@/components/breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircleIcon,
  VideoCameraIcon,
  BriefcaseIcon,
} from "@heroicons/react/24/outline";
const breadcrumbItems = [
  { title: "Recharger compte d'entreprise", link: "/dashboard/payments" },
];

const plans = [
  {
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
                <p className="text-gray-700 text-center">Pannel Essentiel</p>
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
                <p className="text-gray-700 text-center">25</p>
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
                <p className="text-gray-700 text-center">25</p>
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
                <p className="text-gray-700 text-center">10</p>
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
                <p className="text-gray-700 text-center">10</p>
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
                  <TabsTrigger value="monthly">Mensuel</TabsTrigger>
                  <TabsTrigger value="yearly">Annuel</TabsTrigger>
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
                            <button className="bg-primary hover:bg-primary-dark mt-4 text-white font-semibold py-1 px-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                              Mettre à niveau le plan
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
                            <button className="bg-primary hover:bg-primary-dark mt-4 text-white font-semibold py-1 px-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                              Mettre à niveau le plan
                            </button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </ScrollArea>
    </>
  );
}

export default function page() {
  return <ServicePlanPage />;
}
