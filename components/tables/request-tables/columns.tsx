import { Checkbox } from "@/components/ui/checkbox";
import { Entreprise } from "@/constants/data";
import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import { TableCell } from "@/components/ui/table";
import Image from "next/image";

export const columns: ColumnDef<Entreprise>[] = [
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
    accessorKey: "logo",
    header: "Logo",
    cell: ({ row }) => (
      <TableCell>
        <div className="w-10 h-10 relative rounded-full overflow-hidden">
          {row.original.logo && <Image
            src={row.original.logo}
            alt={`${row.original.company_name} Logo`}
            layout="fill"
            objectFit="cover"
          />}
        </div>
      </TableCell>
    ),
  },
  {
    accessorKey: "company_name",
    header: "Company Name",
    enableColumnFilter: true,
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "secteur",
    header: "SECTEUR",
  },
  {
    accessorKey: "email",
    header: "EMAIL",
  },
  {
    accessorKey: "phone",
    header: "TEL",
  },
  {
    accessorKey: "isVerified",
    header: "Status",
    cell: ({ row }) => (
      <div
        className={
          row.original.isVerified === "Accepted"
            ? "bg-green-200 text-green-800 rounded-full py-1 px-2 text-center"
            : row.original.isVerified === "Declined"
              ? "bg-yellow-200 text-yellow-800 rounded-full py-1 px-2 text-center"
              : "bg-gray-200 text-gray-800 rounded-full py-1 px-2 text-center"
        }
      >
        {row.original.isVerified}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
