"use client";
import { useEffect, useState } from "react";
import BreadCrumb from "@/components/breadcrumb";
// import { UserClient } from "@/components/tables/user-tables/client";
import { useToast } from "@/components/ui/use-toast";
import Cookies from "js-cookie";
import { EnterpriseRequests } from "@/components/tables/request-tables/requests";

const breadcrumbItems = [{ title: "Requests", link: "/dashboard/requests" }];

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const { toast } = useToast();
  const authToken = Cookies.get("authToken");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          process.env.NEXT_PUBLIC_BACKEND_URL + "/api/admin/entreprises",
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          },
        );
        const data = await response.json();
        // const users = {
        //   nomComplete: data.first_name + " " + data.last_name,
        //   secteur: data.sector,
        //   email: data.email,
        //   tel: data.tel,
        //   bio: data.bio,
        // };
        setUsers(data);
      } catch (error) {
        toast({
          title: "Whoops!",
          variant: "destructive",
          description: "Erreur lors de la récupération des données.",
        });
      }
    };

    fetchData();
  }, [authToken]);

  return (
    <>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <BreadCrumb items={breadcrumbItems} />
        <EnterpriseRequests data={users} />
      </div>
    </>
  );
}
