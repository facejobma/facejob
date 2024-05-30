"use client";

import { useEffect, useState } from "react";
import BreadCrumb from "@/components/breadcrumb";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useParams } from "next/navigation";
import Cookies from "js-cookie";
import { EntrepriseProfile } from "@/components/forms/entreprise-profile";
import { EnterpriseData } from "@/types";


export default function Page() {
  const [enterpriseData, setEnterpriseData] = useState<EnterpriseData | null>(
    null
  );
  const params = useParams();
  const requestId=params?.toString()

  const breadcrumbItems = [
    { title: "Entreprise", link: "/dashboard/requests" },
    { title: "Consult", link: "/dashboard/requests/Consult" }
  ];

  useEffect(() => {
    if (requestId) {
      // Fetch enterprise data using enterpriseId
      const fetchEnterpriseData = async () => {
        try {
          const authToken = Cookies.get("authToken");

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/enterprise/${requestId}`,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
                "Content-Type": "application/json"
              }
            }
          );
          const data = await response.json();

          const {
            company_name,
            email,
            phone,
            adresse,
            site_web,
            effectif,
            description,
            sector,
            is_verified,
            plan_name,
            entreprise_logo
          } = data;

          setEnterpriseData({
            company_name,
            sector,
            email,
            phone,
            adresse,
            site_web,
            effectif,
            description,
            is_verified,
            entreprise_logo,
            plan_name
          });
        } catch (error) {
          // console.log(error);
        }
      };

      fetchEnterpriseData();
    }
  }, [requestId]);

  return (
    <ScrollArea className="h-full">
      <div className="flex-1 space-y-4 p-5">
        <BreadCrumb items={breadcrumbItems} />
        {enterpriseData ? (
          <EntrepriseProfile
            initialData={enterpriseData}
            key={requestId as string}
          />
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </ScrollArea>
  );
}
