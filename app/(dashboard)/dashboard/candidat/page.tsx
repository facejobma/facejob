"use client";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import Cookies from "js-cookie";
import { FullPageLoading } from "@/components/ui/loading";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { Heading } from "@/components/ui/heading";
import { FaTrashAlt, FaVideo, FaFilter, FaPlay, FaEye, FaCheckCircle, FaTimesCircle, FaClock, FaInfoCircle, FaThLarge, FaList } from "react-icons/fa";
import { HiOutlineVideoCamera, HiOutlineCollection } from "react-icons/hi";
import { BiStats } from "react-icons/bi";
import toast from "react-hot-toast";

type ViewMode = 'cards' | 'table';

interface CV {
  id: number;
  link: string;
  candidat_name: string;
  secteur_name: string;
  is_verified: string;
  job_name: string;
  comment?: string; // Add comment field for decline reason
}

export default function UsersPage() {
  const [users, setUsers] = useState<CV[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast: toastUI } = useToast();
  const authToken = Cookies.get("authToken");
  const [viewMode, setViewMode] = useState<ViewMode>('cards');

  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedSector, setSelectedSector] = useState<string>("");
  const [selectedJob, setSelectedJob] = useState<string>("");
  const showFilters = true;

  const [allSectors, setAllSectors] = useState<string[]>([]);
  const [allJobs, setAllJobs] = useState<string[]>([]);

  // Statistics
  const stats = useMemo(() => {
    const total = users.length;
    const accepted = users.filter(u => u.is_verified === 'Accepted').length;
    const pending = users.filter(u => u.is_verified === 'Pending').length;
    const declined = users.filter(u => u.is_verified === 'Declined').length;
    
    return { total, accepted, pending, declined };
  }, [users]);

  const handleDelete = useCallback(async (id: number) => {
    const authToken = Cookies.get("authToken");

    if (!confirm("Êtes-vous sûr de vouloir supprimer ce CV vidéo ?")) {
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/candidate-video/delete/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        toast.success("L'élément est supprimé avec succès");
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
      } else {
        const errorData = await response.json();
        toast.error(
          errorData.message || "Erreur lors de la suppression de l'élément",
        );
      }
    } catch (error) {
      console.error("Error deleting element:", error);
      toast.error("Erreur réseau lors de la suppression");
    }
  }, []);

  const columns: ColumnDef<CV>[] = useMemo(
    () => [
      {
        accessorKey: "id",
        header: () => <div className="font-semibold text-gray-700">ID</div>,
        cell: ({ row }) => (
          <div className="font-mono text-xs text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded w-fit">
            #{row.original.id}
          </div>
        ),
      },
      {
        accessorKey: "link",
        header: () => <div className="font-semibold text-gray-700">Vidéo</div>,
        cell: ({ row }) => (
          <div className="flex items-center">
            <video
              width="100"
              height="60"
              controls
              className="rounded-md bg-gray-900 border border-gray-200"
              poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='60' viewBox='0 0 100 60'%3E%3Crect width='100' height='60' fill='%23111827'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='Arial, sans-serif' font-size='10'%3ECV%3C/text%3E%3C/svg%3E"
            >
              {row.original.link && (
                <source src={row.original.link} type="video/mp4" />
              )}
            </video>
          </div>
        ),
      },
      {
        accessorKey: "job_name",
        header: () => <div className="font-semibold text-gray-700">Poste</div>,
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
            <span className="text-gray-800 font-medium text-sm">{row.original.job_name}</span>
          </div>
        ),
      },
      {
        accessorKey: "secteur_name",
        header: () => <div className="font-semibold text-gray-700">Secteur</div>,
        cell: ({ row }) => (
          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
            {row.original.secteur_name}
          </span>
        ),
      },
      {
        accessorKey: "is_verified",
        header: () => <div className="font-semibold text-gray-700">Statut</div>,
        cell: ({ row }) => {
          const statusRaw = row.original.is_verified;
          const comment = row.original.comment;

          // convertir le status en string correspondant à ton config
          const status: "Accepted" | "Declined" | "Pending" =
            statusRaw === "Accepted" || statusRaw === "Declined"
              ? statusRaw
              : "Pending";

          const statusConfig: Record<
            "Accepted" | "Declined" | "Pending",
            {
              bg: string;
              text: string;
              border: string;
              dot: string;
              label: string;
              icon: React.ReactNode;
            }
          > = {
            Accepted: {
              bg: "bg-emerald-50",
              text: "text-emerald-700",
              border: "border-emerald-200",
              dot: "bg-emerald-500",
              label: "Accepté",
              icon: <FaCheckCircle className="text-sm" />,
            },
            Declined: {
              bg: "bg-red-50",
              text: "text-red-700",
              border: "border-red-200",
              dot: "bg-red-500",
              label: "Refusé",
              icon: <FaTimesCircle className="text-sm" />,
            },
            Pending: {
              bg: "bg-amber-50",
              text: "text-amber-700",
              border: "border-amber-200",
              dot: "bg-amber-500",
              label: "En attente",
              icon: <FaClock className="text-sm" />,
            },
          };

          const config = statusConfig[status];

          return (
            <div className="relative group">
              <span
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold ${config.bg} ${config.text} border ${config.border} shadow-sm cursor-pointer`}
              >
                {config.icon}
                {config.label}
                {status === "Declined" && comment && (
                  <FaInfoCircle className="text-xs opacity-70" />
                )}
              </span>
              
              {/* Tooltip for declined reason */}
              {status === "Declined" && comment && (
                <div className="absolute left-0 top-full mt-2 w-80 bg-white border-2 border-red-200 rounded-lg shadow-xl p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="flex items-start gap-2 mb-2">
                    <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                      <FaTimesCircle className="text-red-600 text-sm" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-red-900 mb-1">Raison du refus</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{comment}</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-red-100">
                    <p className="text-xs text-gray-600 flex items-center gap-1">
                      <FaInfoCircle className="text-gray-400" />
                      Consultez votre email pour les détails complets et les règles à respecter
                    </p>
                  </div>
                  {/* Arrow */}
                  <div className="absolute -top-2 left-6 w-4 h-4 bg-white border-t-2 border-l-2 border-red-200 transform rotate-45"></div>
                </div>
              )}
            </div>
          );
        },
      },

      {
        id: "actions",
        header: () => <div className="font-semibold text-center text-gray-700">Actions</div>,
        cell: ({ row }) => (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handleDelete(row.original.id)}
              className="group flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:text-white hover:bg-red-600 border border-red-200 hover:border-red-600 rounded-md transition-all"
            >
              <FaTrashAlt className="text-xs" />
              <span>Supprimer</span>
            </button>
          </div>
        ),
      },
    ],
    [handleDelete],
  );

  const buildFetchUrl = useCallback(() => {
    const params = new URLSearchParams();

    if (selectedStatus) params.append("status", selectedStatus);
    if (selectedSector) params.append("sector", selectedSector);
    if (selectedJob) params.append("job", selectedJob);

    const queryString = params.toString();
    const baseUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/candidate-video`;

    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  }, [selectedStatus, selectedSector, selectedJob]);

  const fetchData = useCallback(async () => {
    if (!authToken) {
      toastUI({
        title: "Erreur",
        variant: "destructive",
        description: "Utilisateur non authentifié",
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const url = buildFetchUrl();

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        setUsers(data);

        if (allSectors.length === 0 && allJobs.length === 0) {
          const sectors = Array.from(
            new Set(data.map((user) => user.secteur_name).filter(Boolean)),
          );
          const jobs = Array.from(
            new Set(data.map((user) => user.job_name).filter(Boolean)),
          );
          setAllSectors(sectors);
          setAllJobs(jobs);
        }
      } else {
        console.error("Fetched data is not an array:", data);
        toastUI({
          title: "Erreur",
          variant: "destructive",
          description: "Format de données invalide",
        });
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toastUI({
        title: "Whoops!",
        variant: "destructive",
        description: "Erreur lors de la récupération des données.",
      });
    } finally {
      setLoading(false);
    }
  }, [
    authToken,
    toastUI,
    buildFetchUrl,
    allSectors.length,
    allJobs.length,
  ]);

  useEffect(() => {
    fetchData();
  }, [selectedStatus, selectedSector, selectedJob, authToken, toastUI, buildFetchUrl, allSectors.length, allJobs.length]);

  const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(event.target.value);
  };

  const handleSectorChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSector(event.target.value);
  };

  const handleJobChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedJob(event.target.value);
  };

  const resetFilters = () => {
    setSelectedStatus("");
    setSelectedSector("");
    setSelectedJob("");
  };

  const hasActiveFilters = selectedStatus || selectedSector || selectedJob;

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 8,
      },
    },
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-220px)]">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-green-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Simple */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow-md p-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <HiOutlineCollection className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Mes CV vidéos</h1>
            <p className="text-green-50 text-sm">Gérez vos candidatures vidéo</p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
              <FaVideo className="text-green-600 text-lg" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-sm text-gray-600 mt-1">Total</p>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="h-12 w-12 rounded-lg bg-emerald-100 flex items-center justify-center">
              <FaCheckCircle className="text-emerald-600 text-lg" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.accepted}</p>
          <p className="text-sm text-gray-600 mt-1">Acceptés</p>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="h-12 w-12 rounded-lg bg-amber-100 flex items-center justify-center">
              <FaClock className="text-amber-600 text-lg" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
          <p className="text-sm text-gray-600 mt-1">En attente</p>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center">
              <FaTimesCircle className="text-red-600 text-lg" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.declined}</p>
          <p className="text-sm text-gray-600 mt-1">Refusés</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
                <FaFilter className="text-green-600 text-sm" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">Filtres</h3>
            </div>
            <div className="flex items-center gap-3">
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="text-sm font-medium text-green-600 hover:text-green-700 hover:underline"
                >
                  Réinitialiser
                </button>
              )}
              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'cards'
                      ? 'bg-white text-green-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FaThLarge className="text-sm" />
                  Cards
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'table'
                      ? 'bg-white text-green-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FaList className="text-sm" />
                  Table
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Statut</label>
              <select
                value={selectedStatus}
                onChange={handleStatusChange}
                className="w-full border border-gray-300 bg-white text-gray-700 px-3 py-2 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              >
                <option value="">Tous les statuts</option>
                <option value="Pending">En attente</option>
                <option value="Accepted">Accepté</option>
                <option value="Declined">Refusé</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Secteur</label>
              <select
                value={selectedSector}
                onChange={handleSectorChange}
                className="w-full border border-gray-300 bg-white text-gray-700 px-3 py-2 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              >
                <option value="">Tous les secteurs</option>
                {allSectors.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Poste</label>
              <select
                value={selectedJob}
                onChange={handleJobChange}
                className="w-full border border-gray-300 bg-white text-gray-700 px-3 py-2 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              >
                <option value="">Tous les postes</option>
                {allJobs.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Cards View */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {users.length > 0 ? (
            users.map((cv) => {
              const statusConfig: Record<string, { bg: string; text: string; icon: React.ReactNode; label: string }> = {
                Accepted: {
                  bg: 'bg-emerald-50 border-emerald-200',
                  text: 'text-emerald-700',
                  icon: <FaCheckCircle className="text-xs" />,
                  label: 'Accepté'
                },
                Declined: {
                  bg: 'bg-red-50 border-red-200',
                  text: 'text-red-700',
                  icon: <FaTimesCircle className="text-xs" />,
                  label: 'Refusé'
                },
                Pending: {
                  bg: 'bg-amber-50 border-amber-200',
                  text: 'text-amber-700',
                  icon: <FaClock className="text-xs" />,
                  label: 'En attente'
                }
              };

              const status = cv.is_verified === 'Accepted' || cv.is_verified === 'Declined' ? cv.is_verified : 'Pending';
              const config = statusConfig[status];

              return (
                <div key={cv.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  {/* Video Preview */}
                  <div className="relative aspect-video bg-gray-900">
                    <video
                      className="w-full h-full object-cover"
                      controls
                      poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 400 225'%3E%3Crect width='400' height='225' fill='%23111827'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='Arial, sans-serif' font-size='14'%3ECV Vidéo%3C/text%3E%3C/svg%3E"
                    >
                      {cv.link && <source src={cv.link} type="video/mp4" />}
                    </video>
                    <div className="absolute top-2 right-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${config.bg} ${config.text}`}>
                        {config.icon}
                        {config.label}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm text-gray-900 mb-0.5 truncate">{cv.job_name}</h3>
                        <p className="text-xs text-gray-600 truncate">{cv.secteur_name}</p>
                      </div>
                      <span className="text-xs text-gray-500 font-mono bg-gray-50 px-1.5 py-0.5 rounded ml-2 flex-shrink-0">
                        #{cv.id}
                      </span>
                    </div>

                    {/* Declined Reason */}
                    {status === 'Declined' && cv.comment && (
                      <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded">
                        <div className="flex items-start gap-1.5">
                          <FaInfoCircle className="text-red-600 text-xs mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-red-700 leading-tight line-clamp-2">{cv.comment}</p>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <button
                      onClick={() => handleDelete(cv.id)}
                      className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-medium text-red-600 hover:text-white hover:bg-red-600 border border-red-200 hover:border-red-600 rounded transition-all"
                    >
                      <FaTrashAlt className="text-xs" />
                      Supprimer
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full">
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <FaVideo className="text-2xl text-gray-400" />
                </div>
                <p className="text-gray-600">
                  {hasActiveFilters ? "Aucun résultat trouvé" : "Aucun CV vidéo"}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <ScrollArea className="h-[calc(80vh-200px)]">
            <Table>
              <TableHeader className="bg-gray-50 sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="border-b border-gray-200">
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className="font-semibold text-gray-700 py-2 text-xs">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() ? "selected" : undefined}
                      className="hover:bg-gray-50 border-b border-gray-100"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-2 text-sm">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-40 text-center">
                      <div className="flex flex-col items-center justify-center gap-3 text-gray-500 py-8">
                        <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                          <FaVideo className="text-xl text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-600">
                          {hasActiveFilters
                            ? "Aucun résultat trouvé"
                            : "Aucun CV vidéo"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      )}

      {/* Pagination - Only show for table view */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">
                {table.getRowModel().rows.length}
              </span>
              {" "}CV vidéo{table.getRowModel().rows.length > 1 ? 's' : ''}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="border-gray-300"
              >
                Précédent
              </Button>
              
              <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">
                  Page {table.getState().pagination.pageIndex + 1} sur {table.getPageCount()}
                </span>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="border-gray-300"
              >
                Suivant
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
