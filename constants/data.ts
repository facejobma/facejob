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

export type Sector = {
  id: number;
  name: string;
};

export type Job = {
  id: number;
  titre: string;
  description: string;
  date_debut: string;
  date_fin: string;
  company_name: string;
  sector: Sector;
  contractType: string;
  is_verified: string;
  postuler_offres_count: number;

};

export type CV = {
  id: number;
  link: string;
  isVerified: string;
  candidat_name: string;
  secteur_name: string;
};

export interface UserClient {
  id: number;
  first_name: string;
  last_name: string;
  sector: string;
  image?: string;
  bio: string;
}

export interface Experience {
  roleUrl: string;
  poste: string;
  companyUrl: string;
  organisme: string;
  date_debut: string;
  date_fin: string;
  location?: string;
  description?: string;
  enterpriseLogoUrl?: string;
}

export interface ProfileData {
  name: string;
  headline: string;
  avatarUrl: string;
  coverImageUrl: string;
  location: string;
  companyName: string;
  companyLogoUrl: string;
  bio: string;
  experiences: Experience[];
  skills: any[];
  projects: any[];
  education: any[];
}

export interface Skill {
  title: string;
}

export interface Project {
  title: string;
  description: string;
}

export interface Education {
  schoolLogoUrl?: string;
  school_name: string;
  degree: string;
  title: string;
  graduation_date: string;
}

export interface ProfileSectionProps {
  title: string;
  children: React.ReactNode;
  onUpdateContent: (newContent: any) => void;
  initialContent: any;
}

export const navItemsCandidat: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard/candidat",
    icon: "dashboard",
    label: "Dashboard",
  },

  {
    title: "Offres",
    href: "/dashboard/candidat/offres",
    icon: "offres",
    label: "offres",
  },
  {
    title: "Entreprises",
    href: "/dashboard/candidat/entreprises",
    icon: "entreprises",
    label: "entreprises",
  },
  {
    title: "Postuler",
    href: "/dashboard/candidat/postuler",
    icon: "postuler",
    label: "postuler",
  },
  {
    title: "Profile",
    href: "/dashboard/candidat/profile",
    icon: "profile",
    label: "Profile",
  },
  {
    title: "Support",
    href: "/dashboard/candidat/support",
    icon: "support",
    label: "support",
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
    title: "Candidats",
    href: "/dashboard/entreprise/candidats",
    icon: "candidats",
    label: "candidats",
  },
  { 
    title: "Publier",
    href: "/dashboard/entreprise/publier",
    icon: "postuler",
    label: "publier",
  },
  { 
    title: "Mes Offres",
    href: "/dashboard/entreprise/mes-offres",
    icon: "mesOffres",
    label: "mesOffres",
  },
  {
    title: "Service de Paiment",
    href: "/dashboard/entreprise/payments",
    icon: "payments",
    label: "payments",
  },
  {
    title: "Profile",
    href: "/dashboard/entreprise/profile",
    icon: "profile",
    label: "Profile",
  },
  {
    title: "Support",
    href: "/dashboard/entreprise/support",
    icon: "support",
    label: "support",
  },
  {
    title: "Logout",
    href: "/",
    icon: "logout",
    label: "logout",
  },
];
