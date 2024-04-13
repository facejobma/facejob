import { Icons } from "@/components/icons";
import * as z from "zod";

export interface NavItem {
  title: string;
  href?: string;
  disabled?: boolean;
  external?: boolean;
  icon?: keyof typeof Icons;
  label?: string;
  description?: string;
}



export interface Statistiques{
  secteurs: number;
  postules: number;
  users: number;
  offres: number;
  entreprises: number;
}

export enum Plan {
  PannelGratuit = "Pannel gratuit",
  PannelDeBase = "Pannel de base",
  PannelIntermédiaire = "Pannel Intérmédiaire",
  PannelEssentiel = "Pannel Essentiel",
  PannelPremium = "Pannel Premium"
}
// export const Plan = z.enum([
//   "Pannel gratuit",
//   "Pannel de base",
//   "Pannel Intérmédiaire",
//   "Pannel Essentiel",
//   "Pannel Premium"
// ]);

export interface EnterpriseData {
  logo: string;
  company_name: string;
  secteur: string;
  email: string;
  phone: string;
  adresse: string;
  site_web: string;
  effectif: string;
  description: string;
  isVerified: string;
  plan: Plan;
}