import { NavItem } from "@/types";

export type User = {
  id: number;
  nomComplete: string;
  secteur: string;
  email: string;
  tel: string;
  bio: string;
};

export type Entreprise = {
  logo: string;
  id: number;
  company_name: string;
  secteur: string;
  email: string;
  phone: string;
  adresse: string;
  site_web: string;
  effectif: string;
  description: string;
  isVerified: string;
};

export type Job = {
  id: number;
  titre: string;
  description: string;
  date_debut: string;
  date_fin: string;
  company_name: string;
  secteur_name: string;
  isVerified: string;
};

export type CV = {
  id: number;
  link: string;
  isVerified: string;
  candidat_name: string;
  secteur_name: string;
};

export const navItemsCandidat: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard/candidat",
    icon: "dashboard",
    label: "Dashboard",
  },
  {
    title: "Service de Payment",
    href: "/dashboard/candidat/payments",
    icon: "payments",
    label: "payments",
  },
  {
    title: "Offres",
    href: "/dashboard/candidat/offres",
    icon: "offres",
    label: "offres",
  },
  {
    title: "Profile",
    href: "/dashboard/candidat",
    icon: "profile",
    label: "Profile",
  },
  {
    title: "Logout",
    href: "/",
    icon: "logout",
    label: "logout",
  },
];

export const navItemsEntreprise: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard/entreprise",
    icon: "dashboard",
    label: "Dashboard",
  },
  {
    title: "Service de Payment",
    href: "/dashboard/entreprise/payments",
    icon: "payments",
    label: "payments",
  },
  {
    title: "Profile",
    href: "/dashboard/entreprise",
    icon: "profile",
    label: "Profile",
  },
  {
    title: "Logout",
    href: "/",
    icon: "logout",
    label: "logout",
  },
];
