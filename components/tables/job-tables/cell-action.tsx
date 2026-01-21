import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Job } from "@/types";
import { Edit, MoreHorizontal, View, Users, Trash2, Copy } from "lucide-react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";

interface CellActionProps {
  data: Job;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const authToken = Cookies.get("authToken");
  const router = useRouter();

  const handleCopyId = () => {
    navigator.clipboard.writeText(data.id.toString());
    toast.success("ID de l'offre copié dans le presse-papiers");
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="h-8 w-8 p-0 hover:bg-gray-100 transition-colors"
        >
          <span className="sr-only">Ouvrir le menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-semibold">Actions disponibles</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={() => {
            router.push(`/dashboard/entreprise/mes-offres/${data.id}`);
          }}
          className="cursor-pointer hover:bg-blue-50 focus:bg-blue-50"
        >
          <View className="mr-2 h-4 w-4 text-blue-600" />
          <div>
            <div className="font-medium">Consulter l'offre</div>
            <div className="text-xs text-gray-500">Voir les détails et candidatures</div>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => {
            sessionStorage.setItem("offreid", data.id.toString());
            router.push(`/dashboard/entreprise/mes-offres/edit/${data.id}`);
          }}
          className="cursor-pointer hover:bg-amber-50 focus:bg-amber-50"
        >
          <Edit className="mr-2 h-4 w-4 text-amber-600" />
          <div>
            <div className="font-medium">Modifier l'offre</div>
            <div className="text-xs text-gray-500">Éditer les informations</div>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => {
            router.push(`/dashboard/entreprise/candidats?offre=${data.id}`);
          }}
          className="cursor-pointer hover:bg-green-50 focus:bg-green-50"
        >
          <Users className="mr-2 h-4 w-4 text-green-600" />
          <div>
            <div className="font-medium">Voir les candidats</div>
            <div className="text-xs text-gray-500">0 candidatures</div>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={handleCopyId}
          className="cursor-pointer hover:bg-gray-50 focus:bg-gray-50"
        >
          <Copy className="mr-2 h-4 w-4 text-gray-600" />
          <div>
            <div className="font-medium">Copier l'ID</div>
            <div className="text-xs text-gray-500">ID: {data.id}</div>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
