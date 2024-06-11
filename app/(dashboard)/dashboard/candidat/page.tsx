"use client";
import { useEffect, useState } from "react";
import BreadCrumb from "@/components/breadcrumb";
import { useToast } from "@/components/ui/use-toast";
import Cookies from "js-cookie";
import { CVRequests } from "@/components/tables/cv-tables/requests";

const breadcrumbItems = [
  { title: "Videos", link: "/dashboard/candidate-videos" },
];

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const { toast } = useToast();
  const authToken = Cookies.get("authToken");
  const user = sessionStorage.getItem("user");
  const userId = user ? JSON.parse(user).id : null;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          process.env.NEXT_PUBLIC_BACKEND_URL + `/api/candidate-video/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          },
        );
        const data = await response.json();

        setUsers(data);
        console.log("data", data);
      } catch (error) {
        toast({
          title: "Whoops!",
          variant: "destructive",
          description: "Erreur lors de la récupération des données.",
        });
      }
    };
    

    fetchData();
  }, [authToken, toast, userId]);

  return (
    <>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <BreadCrumb items={breadcrumbItems} />
        <CVRequests data={users}  />
      </div>
    </>
  );
}
