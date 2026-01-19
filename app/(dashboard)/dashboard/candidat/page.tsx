"use client";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import Cookies from "js-cookie";
import { Circles } from "react-loader-spinner";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Heading } from "@/components/ui/heading";
import { FaTrashAlt, FaVideo, FaFilter, FaPlay, FaEye } from "react-icons/fa";
import { HiOutlineVideoCamera, HiOutlineCollection } from "react-icons/hi";
import { BiStats } from "react-icons/bi";
import toast from "react-hot-toast";

interface CV {
  id: number;
  link: string;
  candidat_name: string;
  secteur_name: string;
  is_verified: string;
  job_name: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<CV[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast: toastUI } = useToast();
  const authToken = Cookies.get("authToken");
  const user =
    typeof window !== "undefined"
      ? window.sessionStorage?.getItem("user")
      : null;
  const userId = user ? JSON.parse(user).id : null;

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
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/candidate-video/delete/${id}`,
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
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "id",
        header: () => <div className="font-semibold text-gray-700">ID</div>,
        cell: ({ row }) => (
          <div className="font-mono text-sm text-gray-500 bg-gray-50 px-2 py-1 rounded-md w-fit">
            #{row.original.id}
          </div>
        ),
      },
      {
        accessorKey: "link",
        header: () => <div className="font-semibold text-gray-700">Aperçu vidéo</div>,
        cell: ({ row }) => (
          <div className="relative group">
            <div className="relative overflow-hidden rounded-xl border-2 border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
              <video
                width="140"
                height="90"
                controls
                className="rounded-lg bg-gray-900"
                poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='90' viewBox='0 0 140 90'%3E%3Crect width='140' height='90' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%236b7280' font-family='Arial, sans-serif' font-size='12'%3ECV Vidéo%3C/text%3E%3C/svg%3E"
              >
                {row.original.link && (
                  <source src={row.original.link} type="video/mp4" />
                )}
                Votre navigateur ne supporte pas la vidéo.
              </video>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 rounded-lg flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-white/90 backdrop-blur-sm rounded-full p-2">
                    <FaPlay className="text-green-600 text-sm" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "candidat_name",
        header: () => <div className="font-semibold text-gray-700">Candidat</div>,
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
              {row.original.candidat_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <span className="font-semibold text-gray-900 block">
                {row.original.candidat_name}
              </span>
              <span className="text-xs text-gray-500">Candidat</span>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "job_name",
        header: () => <div className="font-semibold text-gray-700">Poste recherché</div>,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <span className="text-gray-800 font-medium">{row.original.job_name}</span>
          </div>
        ),
      },
      {
        accessorKey: "secteur_name",
        header: () => <div className="font-semibold text-gray-700">Secteur</div>,
        cell: ({ row }) => (
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200">
            {row.original.secteur_name}
          </span>
        ),
      },
      {
        accessorKey: "is_verified",
        header: () => <div className="font-semibold text-gray-700">Statut</div>,
        cell: ({ row }) => {
          const statusRaw = row.original.is_verified;

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
              icon: string;
            }
          > = {
            Accepted: {
              bg: "bg-emerald-50",
              text: "text-emerald-700",
              border: "border-emerald-200",
              dot: "bg-emerald-500",
              label: "Accepté",
              icon: "✓",
            },
            Declined: {
              bg: "bg-red-50",
              text: "text-red-700",
              border: "border-red-200",
              dot: "bg-red-500",
              label: "Refusé",
              icon: "✕",
            },
            Pending: {
              bg: "bg-amber-50",
              text: "text-amber-700",
              border: "border-amber-200",
              dot: "bg-amber-500",
              label: "En attente",
              icon: "⏳",
            },
          };

          const config = statusConfig[status];

          return (
            <span
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold ${config.bg} ${config.text} border ${config.border} shadow-sm`}
            >
              <span className="text-sm">{config.icon}</span>
              {config.label}
            </span>
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
              className="group flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:text-white hover:bg-red-600 border border-red-200 hover:border-red-600 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
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
    const baseUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/candidate-video/${userId}`;

    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  }, [userId, selectedStatus, selectedSector, selectedJob]);

  const fetchData = useCallback(async () => {
    if (!userId || !authToken) {
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
    userId,
    buildFetchUrl,
    allSectors.length,
    allJobs.length,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (allSectors.length > 0 || allJobs.length > 0) {
      fetchData();
    }
  }, [selectedStatus, selectedSector, selectedJob]);

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
      <div className="flex flex-col items-center justify-center h-[calc(100vh-220px)] gap-6">
        <div className="relative">
          <Circles
            height={80}
            width={80}
            color="#10b981"
            ariaLabel="circles-loading"
            visible={true}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <HiOutlineVideoCamera className="text-2xl text-green-600 animate-pulse" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900 mb-2">Chargement de vos CV vidéos</p>
          <p className="text-sm text-gray-500">Veuillez patienter quelques instants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="space-y-8 p-4">
        {/* Header with enhanced design */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-700 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <HiOutlineCollection className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Ma liste des vidéos</h1>
                <p className="text-green-100 mt-1">Gérez et consultez tous vos CV vidéos en un coup d'œil</p>
              </div>
            </div>
            
            {/* Statistics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
                    <FaVideo className="text-white text-lg" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.total}</p>
                    <p className="text-xs text-green-100">Total</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/30 flex items-center justify-center">
                    <span className="text-white font-bold">✓</span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.accepted}</p>
                    <p className="text-xs text-green-100">Acceptés</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-amber-500/30 flex items-center justify-center">
                    <span className="text-white font-bold">⏳</span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.pending}</p>
                    <p className="text-xs text-green-100">En attente</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-red-500/30 flex items-center justify-center">
                    <span className="text-white font-bold">✕</span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.declined}</p>
                    <p className="text-xs text-green-100">Refusés</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
                  <FaFilter className="text-green-600 text-sm" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Filtres de recherche</h3>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="text-sm font-medium text-green-600 hover:text-green-700 hover:underline transition-colors"
                >
                  Réinitialiser
                </button>
              )}
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <BiStats className="text-green-600" />
                  Statut de validation
                </label>
                <select
                  value={selectedStatus}
                  onChange={handleStatusChange}
                  className="w-full border-2 border-gray-200 bg-white text-gray-700 px-4 py-3 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all shadow-sm hover:border-gray-300"
                >
                  <option value="">Tous les statuts</option>
                  <option value="Pending">⏳ En attente</option>
                  <option value="Accepted">✓ Accepté</option>
                  <option value="Declined">✕ Refusé</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700">
                  Secteur d'activité
                </label>
                <select
                  value={selectedSector}
                  onChange={handleSectorChange}
                  className="w-full border-2 border-gray-200 bg-white text-gray-700 px-4 py-3 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all shadow-sm hover:border-gray-300"
                >
                  <option value="">Tous les secteurs</option>
                  {allSectors.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700">
                  Poste recherché
                </label>
                <select
                  value={selectedJob}
                  onChange={handleJobChange}
                  className="w-full border-2 border-gray-200 bg-white text-gray-700 px-4 py-3 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all shadow-sm hover:border-gray-300"
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
      </div>

      {/* Enhanced Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        <ScrollArea className="h-[calc(80vh-200px)]">
          <Table>
            <TableHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-gray-50 border-b border-gray-200">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="font-semibold text-gray-700 py-4"
                    >
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
                table.getRowModel().rows.map((row, index) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() ? "selected" : undefined}
                    className={`hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                    }`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-6">
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
                  <TableCell
                    colSpan={columns.length}
                    className="h-40 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-4 text-gray-500 py-12">
                      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                        <FaVideo className="text-2xl text-gray-400" />
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold text-gray-700 mb-2">Aucun CV vidéo trouvé</p>
                        <p className="text-sm text-gray-500 max-w-md">
                          {hasActiveFilters
                            ? "Aucun résultat ne correspond à vos critères de recherche. Essayez de modifier vos filtres."
                            : "Vous n'avez pas encore créé de CV vidéo. Commencez par ajouter votre premier CV vidéo pour apparaître ici."}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Enhanced Pagination */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-600 font-medium">
            {table.getFilteredSelectedRowModel().rows.length > 0 && (
              <>
                <span className="text-green-600 font-bold">
                  {table.getFilteredSelectedRowModel().rows.length}
                </span>
                <span className="mx-1">sur</span>
              </>
            )}
            <span className="font-bold text-gray-900">
              {table.getRowModel().rows.length}
            </span>
            <span className="ml-1">
              {table.getRowModel().rows.length > 1 ? "éléments" : "élément"}
              {table.getFilteredSelectedRowModel().rows.length > 0 && " sélectionné(s)"}
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="font-medium border-gray-300 hover:bg-gray-50"
            >
              ← Précédent
            </Button>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Page</span>
              <div className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-bold min-w-[60px] text-center">
                {table.getState().pagination.pageIndex + 1}
              </div>
              <span className="text-sm text-gray-600">sur {table.getPageCount()}</span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="font-medium border-gray-300 hover:bg-gray-50"
            >
              Suivant →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
