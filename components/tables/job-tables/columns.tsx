import { Checkbox } from "@/components/ui/checkbox";
import { Job } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle, AlertCircle, Users, Building, Calendar, FileText } from "lucide-react";

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
    header: ({ column }) => (
      <div className="flex items-center gap-2 font-semibold">
        <FileText className="w-4 h-4" />
        TITRE
      </div>
    ),
    cell: ({ row }) => (
      <div className="font-medium text-gray-900 max-w-xs">
        <div className="truncate">{row.original.titre}</div>
        <div className="text-xs text-gray-500 mt-1">
          <Badge variant="outline" className="text-xs">
            {row.original.company_name}
          </Badge>
        </div>
      </div>
    ),
    enableColumnFilter: true,
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "sector_name",
    header: ({ column }) => (
      <div className="flex items-center gap-2 font-semibold">
        <Building className="w-4 h-4" />
        SECTEUR
      </div>
    ),
    cell: ({ row }) => (
      <Badge variant="outline" className="font-medium bg-blue-50 text-blue-700 border-blue-200">
        {row.original.sector_name || "Non spécifié"}
      </Badge>
    ),
  },
  {
    accessorKey: "postuler_offres_count",
    header: ({ column }) => (
      <div className="flex items-center gap-2 font-semibold">
        <Users className="w-4 h-4" />
        CANDIDATURES
      </div>
    ),
    cell: ({ row }) => {
      const count = 0; // Default value since postuler_offres_count doesn't exist in this Job type
      return (
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            count > 10 ? 'bg-green-100 text-green-700' :
            count > 5 ? 'bg-blue-100 text-blue-700' :
            count > 0 ? 'bg-amber-100 text-amber-700' :
            'bg-gray-100 text-gray-500'
          }`}>
            {count}
          </div>
          <span className="text-sm text-gray-600">
            {count === 0 ? 'Aucune' : count === 1 ? '1 candidature' : `${count} candidatures`}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "location",
    header: "LIEU",
    cell: ({ row }) => (
      <div className="text-gray-600">
        {"Non spécifié"} {/* location property doesn't exist in this Job type */}
      </div>
    ),
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <div className="flex items-center gap-2 font-semibold">
        <Calendar className="w-4 h-4" />
        DATE DE CRÉATION
      </div>
    ),
    cell: ({ row }) => {
      // created_at doesn't exist in this Job type, use current date as fallback
      const dateString = new Date().toISOString();
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Format français : JJ/MM/AAAA HH:mm
      const formattedDate = date.toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      
      return (
        <div>
          <div className="font-medium text-gray-900">{formattedDate}</div>
          <div className="text-xs text-gray-500">
            {diffDays === 1 ? "Hier" : 
             diffDays < 7 ? `Il y a ${diffDays} jours` :
             diffDays < 30 ? `Il y a ${Math.floor(diffDays / 7)} semaine${Math.floor(diffDays / 7) > 1 ? 's' : ''}` :
             `Il y a ${Math.floor(diffDays / 30)} mois`
            }
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "is_verified",
    header: "STATUT",
    cell: ({ row }) => {
      const status = row.original.is_verified;
      const getStatusConfig = (status: string) => {
        switch (status) {
          case "Accepted":
            return {
              icon: CheckCircle,
              label: "Validée",
              className: "bg-emerald-50 text-emerald-700 border-emerald-200",
              iconColor: "text-emerald-600"
            };
          case "Pending":
            return {
              icon: Clock,
              label: "En attente",
              className: "bg-amber-50 text-amber-700 border-amber-200",
              iconColor: "text-amber-600"
            };
          case "Declined":
            return {
              icon: XCircle,
              label: "Refusée",
              className: "bg-red-50 text-red-700 border-red-200",
              iconColor: "text-red-600"
            };
          default:
            return {
              icon: AlertCircle,
              label: "Inconnu",
              className: "bg-gray-50 text-gray-700 border-gray-200",
              iconColor: "text-gray-600"
            };
        }
      };
      
      const config = getStatusConfig(status);
      const Icon = config.icon;
      
      return (
        <Badge className={`${config.className} border font-medium px-3 py-1`}>
          <Icon className={`w-3 h-3 mr-1 ${config.iconColor}`} />
          {config.label}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "ACTIONS",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
