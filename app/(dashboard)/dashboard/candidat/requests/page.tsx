"use client";
import { useEffect, useState } from "react";
import BreadCrumb from "@/components/breadcrumb";
import { useToast } from "@/components/ui/use-toast";
import Cookies from "js-cookie";
import { EnterpriseRequests } from "@/components/tables/request-tables/requests";
import { LoadingSpinner } from "@/components/ui/spinner";
import { HiOutlineClipboardList, HiOutlineCollection } from "react-icons/hi";
import { FaBuilding, FaClock, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { Entreprise } from "@/constants/data";

const breadcrumbItems = [{ title: "Requests", link: "/dashboard/requests" }];

export default function UsersPage() {
  const [users, setUsers] = useState<Entreprise[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const authToken = Cookies.get("authToken");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          process.env.NEXT_PUBLIC_BACKEND_URL + "/api/v1/admin/entreprises",
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          },
        );
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        toast({
          title: "Whoops!",
          variant: "destructive",
          description: "Erreur lors de la récupération des données.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authToken, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-220px)]">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-green-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Calculate request statistics
  const stats = {
    total: users.length,
    pending: users.filter(u => u.isVerified === 'pending').length,
    approved: users.filter(u => u.isVerified === 'Accepted').length,
    rejected: users.filter(u => u.isVerified === 'Declined').length,
  };

  return (
    <div className="space-y-8">
      {/* Header with enhanced design */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <HiOutlineClipboardList className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Mes Demandes</h1>
                <p className="text-indigo-100 mt-1">Suivez le statut de vos demandes et candidatures</p>
              </div>
            </div>
            
            {/* Statistics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
                    <HiOutlineCollection className="text-white text-lg" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.total}</p>
                    <p className="text-xs text-indigo-100">Total</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-amber-500/30 flex items-center justify-center">
                    <FaClock className="text-white text-lg" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.pending}</p>
                    <p className="text-xs text-indigo-100">En attente</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/30 flex items-center justify-center">
                    <FaCheckCircle className="text-white text-lg" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.approved}</p>
                    <p className="text-xs text-indigo-100">Approuvées</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-red-500/30 flex items-center justify-center">
                    <FaTimesCircle className="text-white text-lg" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.rejected}</p>
                    <p className="text-xs text-indigo-100">Rejetées</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center">
              <FaBuilding className="text-indigo-600 text-sm" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Demandes d'entreprises</h2>
          </div>
          
          <BreadCrumb items={breadcrumbItems} />
          <div className="mt-6">
            <EnterpriseRequests data={users} />
          </div>
        </div>
      </div>
    </div>
  );
}
