"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// import { useSession } from "@/app/providers/SessionProvider";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import Cookies from "js-cookie";
import { performLogout } from "@/lib/auth";

const userDataString =
  typeof window !== "undefined" ? window.sessionStorage?.getItem("user") : null;

export function UserNav() {
  // const { session } = useSession();
  const userdata =
    typeof window !== "undefined"
      ? window.sessionStorage?.getItem("user") || "{}"
      : "{}";
  const user = JSON.parse(userdata as string);
  const router = useRouter();
  const { toast } = useToast();

  const userRole =
    typeof window !== "undefined"
      ? window.sessionStorage?.getItem("userRole")
      : null;

  console.log("The actual userRole => ", userRole);

  const authToken = Cookies.get("authToken");

  function signOut() {
    performLogout(userRole);
  }

  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={user?.image || user?.logo || undefined}
                alt={user?.first_name ?? user?.company_name}
              />
              <AvatarFallback>
                {user?.first_name?.[0] ?? user?.company_name?.[0]}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel >
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {user?.first_name ?? user?.company_name}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {/*<DropdownMenuItem>*/}
            {/*  Profile*/}
            {/*  <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>*/}
            {/*</DropdownMenuItem>*/}
            {/*<DropdownMenuItem>*/}
            {/*  Billing*/}
            {/*  <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>*/}
            {/*</DropdownMenuItem>*/}
            <DropdownMenuItem
              onClick={() => {
                router.push(
                  `/dashboard/${userRole == "entreprise" ? "entreprise" : "candidat"}/profile`,
                );
              }}
            >
              Paramètres
            </DropdownMenuItem>
            {/*<DropdownMenuItem>New Team</DropdownMenuItem>*/}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut()}>
            Déconnexion
            {/*<DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>*/}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
}
