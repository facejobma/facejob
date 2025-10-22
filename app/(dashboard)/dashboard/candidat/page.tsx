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
import { FaTrashAlt, FaVideo, FaFilter } from "react-icons/fa";
import { IoMdRefresh } from "react-icons/io";
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
  const [showFilters, setShowFilters] = useState<boolean>(true);

  const [allSectors, setAllSectors] = useState<string[]>([]);
  const [allJobs, setAllJobs] = useState<string[]>([]);

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
        header: () => <div className="font-semibold">ID</div>,
        cell: ({ row }) => (
          <div className="font-mono text-sm text-gray-600">
            #{row.original.id}
          </div>
        ),
      },
      {
        accessorKey: "link",
        header: () => <div className="font-semibold">Vidéo</div>,
        cell: ({ row }) => (
          <div className="relative group">
            <video
              width="120"
              height="80"
              controls
              className="rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <source src={row.original.link} type="video/mp4" />
              Votre navigateur ne supporte pas la vidéo.
            </video>
            <div className="absolute top-2 right-2 bg-black/60 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <FaVideo className="text-white text-xs" />
            </div>
          </div>
        ),
      },
      {
        accessorKey: "candidat_name",
        header: () => <div className="font-semibold">Candidat</div>,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
              {row.original.candidat_name.charAt(0).toUpperCase()}
            </div>
            <span className="font-medium text-gray-800">
              {row.original.candidat_name}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "job_name",
        header: () => <div className="font-semibold">Métier</div>,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
            <span className="text-gray-700">{row.original.job_name}</span>
          </div>
        ),
      },
      {
        accessorKey: "secteur_name",
        header: () => <div className="font-semibold">Secteur</div>,
        cell: ({ row }) => (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
            {row.original.secteur_name}
          </span>
        ),
      },
      {
        accessorKey: "is_verified",
        header: () => <div className="font-semibold">Statut</div>,
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
            }
          > = {
            Accepted: {
              bg: "bg-emerald-50",
              text: "text-emerald-700",
              border: "border-emerald-200",
              dot: "bg-emerald-500",
              label: "Accepté",
            },
            Declined: {
              bg: "bg-amber-50",
              text: "text-amber-700",
              border: "border-amber-200",
              dot: "bg-amber-500",
              label: "Décliné",
            },
            Pending: {
              bg: "bg-slate-50",
              text: "text-slate-700",
              border: "border-slate-200",
              dot: "bg-slate-500",
              label: "En cours",
            },
          };

          const config = statusConfig[status];

          return (
            <span
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${config.bg} ${config.text} border ${config.border}`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${config.dot} animate-pulse`}
              ></span>
              {config.label}
            </span>
          );
        },
      },

      {
        id: "actions",
        header: () => <div className="font-semibold text-center">Actions</div>,
        cell: ({ row }) => (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handleDelete(row.original.id)}
              className="group flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-white hover:bg-red-600 border border-red-200 hover:border-red-600 rounded-lg transition-all duration-200"
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
        pageSize: 5,
      },
    },
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-220px)] gap-4">
        <Circles
          height={80}
          width={80}
          color="#4f46e5"
          ariaLabel="circles-loading"
          visible={true}
        />
        <p className="text-gray-600 font-medium">Chargement des CV vidéos...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <Heading
            title={`Mes CVs vidéos`}
            description="Gérez et consultez tous vos CV vidéos"
          />
          <div className="flex items-center gap-3 mt-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-full">
              <FaVideo className="text-indigo-600 text-sm" />
              <span className="text-sm font-semibold text-indigo-700">
                {users.length} {users.length > 1 ? "vidéos" : "vidéo"}
              </span>
            </div>
            {hasActiveFilters && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-full">
                <FaFilter className="text-amber-600 text-xs" />
                <span className="text-sm font-medium text-amber-700">
                  Filtres actifs
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <FaFilter className="text-sm" />
            {showFilters ? "Masquer" : "Afficher"} filtres
          </Button>
          <Button
            onClick={fetchData}
            variant="outline"
            className="flex items-center gap-2"
          >
            <IoMdRefresh className="text-lg" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <FaFilter className="text-indigo-600" />
              Filtres de recherche
            </h3>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:underline transition-colors"
              >
                Réinitialiser tous les filtres
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Statut
              </label>
              <select
                value={selectedStatus}
                onChange={handleStatusChange}
                className="w-full border-2 border-gray-300 bg-white text-gray-700 px-4 py-2.5 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all shadow-sm hover:border-gray-400"
              >
                <option value="">Tous les statuts</option>
                <option value="Pending">En cours</option>
                <option value="Accepted">Accepté</option>
                <option value="Declined">Décliné</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Secteur
              </label>
              <select
                value={selectedSector}
                onChange={handleSectorChange}
                className="w-full border-2 border-gray-300 bg-white text-gray-700 px-4 py-2.5 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all shadow-sm hover:border-gray-400"
              >
                <option value="">Tous les secteurs</option>
                {allSectors.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Poste
              </label>
              <select
                value={selectedJob}
                onChange={handleJobChange}
                className="w-full border-2 border-gray-300 bg-white text-gray-700 px-4 py-2.5 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all shadow-sm hover:border-gray-400"
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
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <ScrollArea className="h-[calc(80vh-320px)]">
          <Table>
            <TableHeader className="bg-gray-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-gray-50">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="font-semibold text-gray-700"
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
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() ? "selected" : undefined}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-4">
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
                    className="h-32 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-3 text-gray-500">
                      <FaVideo className="text-4xl text-gray-300" />
                      <p className="font-medium">Aucun CV vidéo trouvé</p>
                      <p className="text-sm text-gray-400">
                        {hasActiveFilters
                          ? "Essayez de modifier vos filtres"
                          : "Commencez par ajouter votre premier CV vidéo"}
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

      {/* Pagination */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4">
        <div className="text-sm text-gray-600 font-medium">
          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <span className="text-indigo-600 font-semibold">
              {table.getFilteredSelectedRowModel().rows.length}
            </span>
          )}{" "}
          {table.getFilteredSelectedRowModel().rows.length > 0 && "sur "}
          <span className="font-semibold">
            {table.getRowModel().rows.length}
          </span>{" "}
          ligne(s) sélectionnée(s)
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="font-medium"
          >
            ← Précédent
          </Button>
          <div className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-semibold text-gray-700">
            Page {table.getState().pagination.pageIndex + 1} sur{" "}
            {table.getPageCount()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="font-medium"
          >
            Suivant →
          </Button>
        </div>
      </div>
    </div>
  );
}
