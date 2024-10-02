"use client";
import React, { useEffect, useState, useMemo } from "react";
import Cookies from "js-cookie";
import { Circles } from "react-loader-spinner";
import "@reach/menu-button/styles.css"; // Importez les styles de Reach MenuButton si nécessaire
import { Menu, MenuButton, MenuItem, MenuList } from "@reach/menu-button";
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

interface CV {
  id: number;
  link: string;
  candidat_name: string;
  secteur_name: string;
  is_verified: string;
  job_name: string;
}

import { FaEdit, FaTrashAlt, FaEllipsisV } from "react-icons/fa"; // Import icons
import toast from "react-hot-toast";

const columns: ColumnDef<CV>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
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
    header: "ID",
  },
  {
    accessorKey: "link",
    header: "Vidéo",
    cell: ({ row }) => (
      <video width="100" height="60" controls>
        <source src={row.original.link} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    ),
  },
  {
    accessorKey: "job_name",
    header: "Métier",
  },
  {
    accessorKey: "secteur_name",
    header: "Secteur",
  },
  {
    accessorKey: "is_verified",
    header: "Statut",
    cell: ({ row }) => (
      <div
        className={
          row.original.is_verified === "Accepted"
            ? "bg-green-200 text-green-800 rounded-full py-1 px-2 text-center"
            : row.original.is_verified === "Declined"
            ? "bg-yellow-200 text-yellow-800 rounded-full py-1 px-2 text-center"
            : "bg-gray-200 text-gray-800 rounded-full py-1 px-2 text-center"
        }
      >
        {row.original.is_verified}
      </div>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const [isMenuOpen, setIsMenuOpen] = useState(false); // State to track menu open/close

      const toggleMenu = () => setIsMenuOpen(!isMenuOpen); // Toggle the menu state

      return (
        <div className="relative">
          {/* Toggle only the menu button (three dots) */}
          {!isMenuOpen ? (
            <button onClick={toggleMenu} className="border px-1 py-1 rounded-md">
              <FaEllipsisV />
            </button>
          ) : (
            <div className="flex space-x-2">
              {/* Edit and Delete Icons */}
              <FaEdit
                className="text-green-900 cursor-pointer"
                onClick={() => {
                  handleEdit(row.original.id);
                  setIsMenuOpen(false); // Close the menu after action
                }}
              />
              <FaTrashAlt
                className="text-red-500 cursor-pointer"
                onClick={() => {
                  handleDelete(row.original.id);
                  setIsMenuOpen(false); // Close the menu after action
                }}
              />
              {/* Option to close the icons and show three dots again */}
              <button onClick={toggleMenu} className="text-black-900 cursor-pointer text-bold">
                ✕
              </button>
            </div>
          )}
        </div>
      );
    },
  },
];

// Exemple de fonctions pour gérer l'édition et la suppression
const handleEdit = (id: number) => {
  console.log("Éditer l'élément avec l'ID:", id);
  // Vous pouvez rediriger vers une page d'édition ou ouvrir une modal ici
};

const handleDelete = async (id: number) => {
  const authToken = Cookies.get("authToken");

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/candidate-video/delete/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${authToken}`, // Add the Bearer token for authorization
        "Content-Type": "application/json",   // Set content type
      },
    });

    if (response.ok) {
      toast.success(`l'élément est supprimé avec succès`);
      //refresh the page
      // Perform any UI updates here
    } else {
      toast.error(`Erreur lors de la suppression de l'élément`);
      // Handle the error accordingly
    }
  } catch (error) {
    console.error('Error deleting element:', error);
    // Handle any network or unexpected errors
  }
};






export default function UsersPage() {
  const [users, setUsers] = useState<CV[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const authToken = Cookies.get("authToken");
  const user =
    typeof window !== "undefined"
      ? window.sessionStorage?.getItem("user")
      : null;
  const userId = user ? JSON.parse(user).id : null;
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true); // Set loading to true before starting the fetch
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/candidate-video/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        console.log("Data:", data);

        if (Array.isArray(data)) {
          setUsers(data);
          console.log("Fetched data:", data);
        } else {
          console.error("Fetched data is not an array:", data);
        }
      } catch (error) {
        console.error("Fetch error:", error);
        toast({
          title: "Whoops!",
          variant: "destructive",
          description: "Erreur lors de la récupération des données.",
        });
      } finally {
        setLoading(false); // Set loading to false after fetching is complete
      }
    };

    fetchData();
  }, [authToken, toast, userId]);

  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedSector, setSelectedSector] = useState<string>("");
  const [selectedJob, setSelectedJob] = useState<string>("");

  const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(event.target.value);
  };

  const handleSectorChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSector(event.target.value);
  };

  const handleJobChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedJob(event.target.value);
  };

  const filteredUsers = useMemo(
    () =>
      users.filter(
        (user) =>
          (selectedStatus === "" || user.is_verified === selectedStatus) &&
          (selectedSector === "" || user.secteur_name === selectedSector) &&
          (selectedJob === "" || user.job_name === selectedJob)
      ),
    [users, selectedStatus, selectedSector, selectedJob]
  );

  const jobOptions = useMemo(() => {
    const jobs = Array.from(new Set(users.map((user) => user.job_name)));
    return [...jobs];
  }, [users]);

  const table = useReactTable({
    data: filteredUsers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(), // Enable pagination
    initialState: {
      pagination: {
        pageSize: 4, // Set page size to 4
      },
    },
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-220px)]">
        <Circles
          height={80}
          width={80}
          color="#4fa94d"
          ariaLabel="circles-loading"
          visible={true}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-start justify-between">
        <Heading
          title={`Mes CVs vidéos (${filteredUsers.length})`}
          description=""
        />
      </div>
      <div className="flex space-x-2">
        <select
          value={selectedStatus}
          onChange={handleStatusChange}
          className="border bg-white text-gray-500 p-2 rounded-md focus:outline-none focus:border-accent focus:ring focus:ring-accent disabled:opacity-50 w-60"
        >
          <option value="">Tous les Statuts</option>
          <option value="Pending">En cours</option>
          <option value="Accepted">Accepté</option>
          <option value="Declined">Décliné</option>
        </select>
        <select
          value={selectedSector}
          onChange={handleSectorChange}
          className="border bg-white text-gray-500 p-2 rounded-md focus:outline-none focus:border-accent focus:ring focus:ring-accent disabled:opacity-50 w-60"
        >
          <option value="">Tous les secteurs</option>
          {Array.from(new Set(users.map((user) => user.secteur_name))).map(
            (option) => (
              <option key={option} value={option}>
                {option}
              </option>
            )
          )}
        </select>
        <select
          value={selectedJob}
          onChange={handleJobChange}
          className="border bg-white text-gray-500 p-2 rounded-md focus:outline-none focus:border-accent focus:ring focus:ring-accent disabled:opacity-50 w-60"
        >
          <option value="">Tous les Postes</option>
          {jobOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
      <ScrollArea className="rounded-md border h-[calc(80vh-220px)]">
        <Table className="relative">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() ? "selected" : undefined}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getRowModel().rows.length} ligne(s) sélectionnée(s).
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Précédent
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Suivant
          </Button>
        </div>
      </div>
    </div>
  );
}
