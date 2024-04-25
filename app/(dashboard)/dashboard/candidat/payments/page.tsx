"use client";
import BreadCrumb from "@/components/breadcrumb";
import { ChangePlanToEntreprise } from "@/components/forms/entreprise-change-plan";


const breadcrumbItems = [{ title: "Recharger compte d'entreprise", link: "/dashboard/payments" }];
export default function UsersPage() {


  return (
    <>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <BreadCrumb items={breadcrumbItems} />
        <ChangePlanToEntreprise />
      </div>
    </>
  );
}
