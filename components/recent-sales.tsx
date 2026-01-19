import { Sales } from "@/types";
import moment from "moment";
import "moment/locale/fr";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
moment.locale("fr");

export function RecentSales({ sales }: { sales: Sales[] }) {
  return (
    <div className="space-y-8">
      {sales.map((sale, index) => (
        <div key={index} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage 
              src={sale.entreprise.entreprise_logo || undefined} 
              alt="Avatar" 
            />
            <AvatarFallback>{sale.entreprise.company_name}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{sale.description}</p>
            <p className="text-sm text-muted-foreground">
              {moment(sale.created_at).fromNow()}
            </p>
          </div>
          <div className="ml-auto font-medium">+MAD {sale.amount}</div>
        </div>
      ))}
    </div>
  );
}