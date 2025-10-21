import { Checkbox } from "@/components/ui/checkbox";
import { Job } from "@/constants/data";
import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";

// import { TableCell } from "@/components/ui/table";
// import Image from "next/image";

export const columns: ColumnDef<Job>[] = [
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
    accessorKey: "titre",
    header: "TITRE",
    enableColumnFilter: true,
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "sector_name",
    header: "SECTEUR",
  },
  {
    accessorKey: "postuler_offres_count",
    header: "POSTULANTS",
  },
  {
    accessorKey: "contractType",
    header: "CONTRAT",
  },
  {
  accessorKey: "created_at",
  header: "Date de création",
  cell: ({ row }) => {
    const dateString = row.original.created_at;
    const date = new Date(dateString);
    // Format français : JJ/MM/AAAA HH:mm
    const formattedDate = date.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    return <span>{formattedDate}</span>;
  },
},
  {
    accessorKey: "is_verified",
    header: "STATUS",
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
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
