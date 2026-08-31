"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Briefcase, 
  Building, 
  MapPin, 
  Calendar, 
  Banknote,
  ChevronRight
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { stripHtmlTags } from "@/lib/textUtils";

interface Offer {
  id: number;
  titre: string;
  description?: string | null;
  company_name?: string | null;
  sector_name: string | null;
  job_name: string | null;
  location: string | null;
  contractType: string | null;
  created_at: string | null;
  entreprise_id?: number | null;
  salary_min?: number | null;
  salary_max?: number | null;
  currency?: string | null;
  experience_required?: number | null;
}

const FeaturedOffers: React.FC = () => {
  const router = useRouter();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOffers: 0,
    newThisWeek: 0,
    totalCompanies: 0
  });

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        // Check if we have cached data
        const cachedData = sessionStorage.getItem('featured_offers');
        const cacheTime = sessionStorage.getItem('featured_offers_time');
        const now = Date.now();
        
        // Use cache if less than 5 minutes old
        if (cachedData && cacheTime && (now - parseInt(cacheTime)) < 300000) {
          const cached = JSON.parse(cachedData);
          setOffers(Array.isArray(cached?.offers) ? cached.offers.filter((offer: any) => offer?.id) : []);
          if (cached?.stats && typeof cached.stats === "object") setStats(cached.stats);
          setLoading(false);
          return;
        }
        
        // Use AbortController for request timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
        
        const response = await fetch(`${(typeof window !== 'undefined' ? '' : process.env.NEXT_PUBLIC_BACKEND_URL)}/api/v1/offres`, {
          headers: {
            'ngrok-skip-browser-warning': 'true'
          },
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const result = await response.json();
          const data: Offer[] = Array.isArray(result?.data) ? result.data.filter((offer: any) => offer?.id) : [];
          
          // Get latest 6 offers for featured section
          const sortedOffers = data
            .sort((a: Offer, b: Offer) => {
              const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
              const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
              return (Number.isFinite(bTime) ? bTime : 0) - (Number.isFinite(aTime) ? aTime : 0);
            })
            .slice(0, 6);
          
          setOffers(sortedOffers);
          
          // Calculate stats
          const now = new Date();
          const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          const newThisWeek = data.filter((offer: Offer) => {
            if (!offer.created_at) return false;
            const created = new Date(offer.created_at);
            return !Number.isNaN(created.getTime()) && created >= oneWeekAgo;
          }).length;
          
          const uniqueCompanies = new Set(data.map((offer) => offer.entreprise_id).filter((id) => id != null)).size;
          
          const statsData = {
            totalOffers: Number(result?.pagination?.total ?? data.length),
            newThisWeek,
            totalCompanies: uniqueCompanies
          };
          
          setStats(statsData);
          
          // Cache the data
          sessionStorage.setItem('featured_offers', JSON.stringify({
            offers: sortedOffers,
            stats: statsData
          }));
          sessionStorage.setItem('featured_offers_time', Date.now().toString());
        }
      } catch (error) {
        console.error("Error fetching offers:", error);
      } finally {
        setLoading(false);
      }
    };

    // Defer API call slightly to prioritize above-the-fold content
    const timer = setTimeout(() => {
      fetchOffers();
    }, 200);
    
    return () => clearTimeout(timer);
  }, []);

  const handleApply = async (offerId: number) => {
    const dashboardOfferUrl = `/dashboard/candidat/offres/${offerId}`;
    const loginUrl = `/auth/login-candidate?returnUrl=${encodeURIComponent(dashboardOfferUrl)}`;

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('oauthReturnUrl', dashboardOfferUrl);
    }

    // Vérifier si l'utilisateur est connecté en vérifiant le token
    try {
      const authToken = document.cookie.split('authToken=')[1]?.split(';')[0]?.replace(/['"]/g, '');
      
      if (!authToken) {
        // Pas de token, rediriger vers la connexion avec returnUrl vers la page de détail de l'offre
        router.push(loginUrl);
        return;
      }
      
      const response = await fetch(`${(typeof window !== 'undefined' ? '' : process.env.NEXT_PUBLIC_BACKEND_URL)}/api/v1/candidate-profile`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        // Utilisateur connecté, rediriger vers la page de détail de l'offre dans le dashboard
        sessionStorage.removeItem('oauthReturnUrl');
        router.push(dashboardOfferUrl);
      } else {
        // Utilisateur non connecté, rediriger vers la page de connexion
        router.push(loginUrl);
      }
    } catch (error) {
      // En cas d'erreur, rediriger vers la page de connexion par sécurité
      router.push(loginUrl);
    }
  };

  const getPublicationLabel = (dateString?: string | null) => {
    if (!dateString) return "Date indisponible";
    const now = new Date();
    const created = new Date(dateString);
    if (Number.isNaN(created.getTime())) return "Date indisponible";
    const diffDays = Math.max(0, Math.floor((now.getTime() - created.getTime()) / 86400000));
    if (diffDays === 0) return "Aujourd’hui";
    if (diffDays === 1) return "Hier";
    return `Il y a ${diffDays} jours`;
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="border-y border-slate-100 bg-slate-50 py-16 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">
            Offres d'emploi récentes
          </h2>
          <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 px-4">
            Découvrez les dernières opportunités d'emploi au Maroc
          </p>
          
          {/* Stats */}
          {/* <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-2xl mx-auto mb-6 sm:mb-8">
            <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
              <div className="flex items-center justify-center gap-2">
                <Briefcase className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalOffers}</p>
                  <p className="text-xs sm:text-sm text-gray-600">Offres disponibles</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
              <div className="flex items-center justify-center gap-2">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-primary-1 flex-shrink-0" />
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.newThisWeek}</p>
                  <p className="text-xs sm:text-sm text-gray-600">Nouvelles cette semaine</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
              <div className="flex items-center justify-center gap-2">
                <Building className="h-5 w-5 sm:h-6 sm:w-6 text-primary-2 flex-shrink-0" />
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalCompanies}</p>
                  <p className="text-xs sm:text-sm text-gray-600">Entreprises partenaires</p>
                </div>
              </div>
            </div>
          </div> */}
        </div>

        {/* Featured Offers Grid */}
        {offers.length > 0 ? (
          <>
            <div className="mx-auto mb-10 grid max-w-6xl grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {offers.map((offer) => (
                <article
                  key={offer.id}
                  className="group relative flex min-h-[330px] cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_6px_24px_rgba(15,23,42,0.04)] transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_16px_36px_rgba(15,23,42,0.09)]"
                  onClick={() => router.push(`/offres/${offer.id}`)}
                >
                  <div className="h-1 w-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-lime-400" />
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-700 transition group-hover:bg-emerald-600 group-hover:text-white">
                          <Building className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-700">{offer.company_name || "Entreprise confidentielle"}</p>
                          <p className="mt-0.5 truncate text-xs text-slate-400">{offer.sector_name || offer.job_name || "Recrutement"}</p>
                        </div>
                      </div>
                      <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500">
                        {getPublicationLabel(offer.created_at)}
                      </span>
                    </div>

                    <div className="mt-5">
                      {offer.job_name && <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">{offer.job_name}</p>}
                      <h3 className="line-clamp-2 text-lg font-bold leading-snug text-slate-900 transition-colors group-hover:text-emerald-700">{offer.titre || "Opportunité professionnelle"}</h3>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {offer.location && (
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-600">
                          <MapPin className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                          {offer.location}
                        </span>
                      )}
                      {offer.contractType && (
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-600">
                          <Calendar className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                          {offer.contractType}
                        </span>
                      )}
                      {offer.experience_required != null && (
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-600">
                          <Briefcase className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                          {offer.experience_required} an(s) d’expérience
                        </span>
                      )}
                    </div>

                    <p className="mt-4 line-clamp-2 flex-1 text-sm leading-5 text-slate-500">
                      {offer.description ? stripHtmlTags(offer.description) : "Consultez cette offre pour découvrir les missions et le profil recherché."}
                    </p>

                    <div className="mt-4 border-t border-slate-100 pt-4">
                      <div className="mb-3 flex min-h-6 items-center gap-2 text-sm">
                        <Banknote className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                        <span className="font-semibold text-slate-800">
                          {offer.salary_min != null && offer.salary_max != null
                            ? `${Number(offer.salary_min).toLocaleString("fr-FR")} – ${Number(offer.salary_max).toLocaleString("fr-FR")} ${offer.currency || "MAD"}`
                            : offer.salary_min != null
                            ? `À partir de ${Number(offer.salary_min).toLocaleString("fr-FR")} ${offer.currency || "MAD"}`
                            : offer.salary_max != null
                            ? `Jusqu’à ${Number(offer.salary_max).toLocaleString("fr-FR")} ${offer.currency || "MAD"}`
                            : "Salaire à discuter"}
                        </span>
                      </div>
                      <button onClick={(event) => { event.stopPropagation(); handleApply(offer.id); }} className="flex w-full items-center justify-between rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2">
                        Consulter et postuler
                        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Call to Action */}
            <div className="mx-auto max-w-6xl">
              <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 px-6 py-7 text-white sm:flex sm:items-center sm:justify-between sm:px-8">
                <div className="absolute -right-12 -top-20 h-48 w-48 rounded-full bg-emerald-500/20 blur-3xl" />
                <div className="relative text-center sm:text-left">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-400">Votre prochaine opportunité</p>
                <h3 className="text-xl font-bold sm:text-2xl">
                  {stats.totalOffers > 0 ? `${stats.totalOffers} offres à découvrir` : "Découvrez les opportunités disponibles"}
                </h3>
                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
                  Explorez les offres disponibles et postulez simplement avec votre profil FaceJob.
                </p>
                </div>
                <div className="relative mt-5 flex flex-col gap-3 sm:ml-8 sm:mt-0 sm:flex-row">
                  <Link href="/offres">
                    <Button size="lg" className="w-full bg-emerald-500 text-slate-950 hover:bg-emerald-400 sm:w-auto">
                      <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      Voir toutes les offres
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucune offre disponible pour le moment
            </h3>
            <p className="text-gray-600">
              Revenez bientôt pour découvrir de nouvelles opportunités !
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedOffers;
