"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import SafeHtmlDisplay from "@/components/SafeHtmlDisplay";
import {
  ArrowLeft, Briefcase, Building, MapPin, Calendar,
  Users, Share2, AlertCircle, CheckCircle, Eye
} from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

// Cache key for scroll position
const SCROLL_POSITION_KEY = 'facejob_scroll_position';

interface OfferDetail {
  id: number;
  titre: string;
  description: string;
  company_name: string;
  sector_name: string;
  job_name: string;
  location: string;
  contractType: string;
  date_debut: string;
  date_fin: string;
  created_at: string;
  sector_id: number;
  job_id: number;
  entreprise_id: number;
  salaire?: string;
  company_description?: string;
  is_verified?: string | boolean;
  applications_count?: number;
  views_count?: number;
}

const OfferDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const [offer, setOffer] = useState<OfferDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedOffers, setRelatedOffers] = useState<OfferDetail[]>([]);
  const [daysAgo, setDaysAgo] = useState(0);
  const offerId = params.id as string;

  useEffect(() => {
    const fetchOfferDetail = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/offres/${offerId}`, {
          headers: { 'ngrok-skip-browser-warning': 'true' }
        });
        if (res.ok) {
          const data = await res.json();
          if (data && !data.error) {
            setOffer(data);
            const allRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/offres`, {
              headers: { 'ngrok-skip-browser-warning': 'true' }
            });
            if (allRes.ok) {
              const result = await allRes.json();
              const all = Array.isArray(result.data) ? result.data : [];
              setRelatedOffers(all.filter((o: OfferDetail) => o.id !== data.id && o.sector_id === data.sector_id).slice(0, 3));
            }
          } else {
            toast.error("Offre non trouvée");
            router.push("/offres");
          }
        } else throw new Error();
      } catch {
        toast.error("Erreur lors du chargement de l'offre");
        router.push("/offres");
      } finally {
        setLoading(false);
      }
    };
    if (offerId) fetchOfferDetail();
  }, [offerId, router]);

  useEffect(() => {
    if (offer?.created_at) {
      const diff = Math.abs(new Date().getTime() - new Date(offer.created_at).getTime());
      setDaysAgo(Math.min(Math.ceil(diff / 86400000), 365));
    }
  }, [offer?.created_at]);

  const handleApply = async () => {
    // Vérifier si l'utilisateur est connecté en vérifiant le token
    try {
      const authToken = document.cookie.split('authToken=')[1]?.split(';')[0]?.replace(/['"]/g, '');
      
      if (!authToken) {
        // Pas de token, rediriger vers la connexion avec returnUrl vers la page de détail de l'offre
        router.push(`/auth/login-candidate?returnUrl=/dashboard/candidat/offres/${offerId}`);
        return;
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/candidate-profile`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        // Utilisateur connecté, rediriger vers la page de détail de l'offre dans le dashboard
        router.push(`/dashboard/candidat/offres/${offerId}`);
      } else {
        // Utilisateur non connecté, rediriger vers la page de connexion
        router.push(`/auth/login-candidate?returnUrl=/dashboard/candidat/offres/${offerId}`);
      }
    } catch (error) {
      // En cas d'erreur, rediriger vers la page de connexion par sécurité
      router.push(`/auth/login-candidate?returnUrl=/dashboard/candidat/offres/${offerId}`);
    }
  };

  const handleShare = async () => {
    if (typeof window === 'undefined') return;
    if (navigator.share) {
      try { await navigator.share({ title: offer?.titre, url: window.location.href }); } catch {}
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Lien copié !");
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  if (loading) return (
    <>
      <NavBar />
      <div className="min-h-screen bg-optional1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
      <Footer />
    </>
  );

  if (!offer) return (
    <>
      <NavBar />
      <div className="min-h-screen bg-optional1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-10 w-10 text-gray-400" />
          </div>
          <h2 className="font-heading text-2xl font-bold text-secondary mb-3">Offre non trouvée</h2>
          <p className="font-body text-gray-600 mb-8">Cette offre n'existe pas ou a été supprimée.</p>
          <Link href="/offres" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-green-600 text-white rounded-xl font-accent font-semibold hover:from-green-600 hover:to-primary transition-all duration-300 shadow-lg">
            <ArrowLeft className="h-4 w-4" />
            Retour aux offres
          </Link>
        </div>
      </div>
      <Footer />
    </>
  );

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-optional1">

        {/* Hero banner */}
        <div className="relative bg-gradient-to-br from-white via-optional1 to-green-50/30 pt-20 pb-12 overflow-hidden">
          {/* Background decorations */}
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-gradient-to-br from-primary/20 to-green-400/20 rounded-full blur-3xl opacity-60 pointer-events-none animate-pulse" />
          <div className="absolute bottom-0 -left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-50 pointer-events-none" />
          
          <div className="container mx-auto px-4 max-w-6xl relative">
            <button onClick={() => router.back()} className="group flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-primary transition-all duration-300 mb-8 font-body">
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> 
              Retour aux offres
            </button>

            <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-xl p-8">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="flex items-start gap-5 flex-1">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/10 to-green-100/50 border-2 border-primary/20 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Building className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-secondary mb-2 leading-tight">{offer.titre}</h1>
                    <p className="font-body text-lg text-gray-600 font-semibold mb-4">{offer.company_name}</p>
                    <div className="flex flex-wrap gap-2 mb-5">
                      {offer.location && (
                        <span className="inline-flex items-center gap-1.5 text-xs bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full font-medium font-body border border-purple-100">
                          <MapPin className="h-3.5 w-3.5" />{offer.location}
                        </span>
                      )}
                      {offer.contractType && (
                        <span className="inline-flex items-center gap-1.5 text-xs bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full font-medium font-body border border-orange-100">
                          <Calendar className="h-3.5 w-3.5" />{offer.contractType}
                        </span>
                      )}
                      {offer.sector_name && (
                        <span className="inline-flex items-center gap-1.5 text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full font-medium font-body border border-blue-100">
                          <Briefcase className="h-3.5 w-3.5" />{offer.sector_name}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1.5 text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full font-medium font-body">
                        Publié il y a {daysAgo}j
                      </span>
                    </div>

                    {/* Stats inline */}
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 font-body">
                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                          <Eye className="h-4 w-4 text-blue-600" />
                        </div>
                        <span><span className="font-semibold text-gray-900">{offer.views_count || 0}</span> vues</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 font-body">
                        <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                          <Users className="h-4 w-4 text-purple-600" />
                        </div>
                        <span><span className="font-semibold text-gray-900">{offer.applications_count || 0}</span> candidatures</span>
                      </div>
                      {offer.is_verified && (
                        <div className="flex items-center gap-2 text-sm text-green-600 font-body font-medium">
                          <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </div>
                          <span>Offre vérifiée</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 lg:w-64 flex-shrink-0">
                  <button
                    onClick={handleApply}
                    className="group w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-green-600 hover:from-green-600 hover:to-primary text-white font-accent font-bold py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                  >
                    Postuler maintenant
                    <ArrowLeft className="h-4 w-4 rotate-180 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button onClick={handleShare} className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 hover:border-primary rounded-xl text-sm font-semibold text-gray-600 hover:text-primary transition-all duration-300 font-accent hover:shadow-md">
                    <Share2 className="h-4 w-4" /> Partager l'offre
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 max-w-6xl py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Main */}
            <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">

              {/* Description */}
              <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 p-6">
                <h2 className="font-heading text-lg font-bold text-secondary mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Briefcase className="h-4 w-4 text-primary" />
                  </div>
                  Description du poste
                </h2>
                <SafeHtmlDisplay html={offer.description} className="font-body text-gray-600 leading-relaxed prose prose-sm max-w-none" />
              </div>

              {/* Details */}
              <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 p-6">
                <h2 className="font-heading text-lg font-bold text-secondary mb-5 flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  Détails de l'offre
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: "Date de début", value: offer.date_debut ? formatDate(offer.date_debut) : null, icon: <Calendar className="h-4 w-4 text-primary" /> },
                    { label: "Date de fin", value: offer.date_fin ? formatDate(offer.date_fin) : null, icon: <Calendar className="h-4 w-4 text-primary" /> },
                    { label: "Secteur", value: offer.sector_name, icon: <Briefcase className="h-4 w-4 text-primary" /> },
                    { label: "Métier", value: offer.job_name, icon: <Users className="h-4 w-4 text-primary" /> },
                  ].map(({ label, value, icon }) => value ? (
                    <div key={label} className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-start gap-3">
                      <div className="w-8 h-8 bg-white rounded-lg border border-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                        {icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-gray-500 text-xs mb-1 font-body font-medium">{label}</p>
                        <p className="font-semibold text-gray-900 font-body text-sm leading-snug break-words">{value}</p>
                      </div>
                    </div>
                  ) : null)}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6 order-1 lg:order-2">

              {/* Company */}
              <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 p-6 lg:sticky lg:top-24">
                <h3 className="font-heading text-xl font-bold text-secondary mb-5 flex items-center gap-2">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Building className="h-5 w-5 text-primary" />
                  </div>
                  À propos de l'entreprise
                </h3>
                <div className="flex items-center gap-4 mb-5 p-5 bg-gradient-to-br from-primary/5 to-green-50/50 rounded-xl border-2 border-primary/10">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/10 to-green-100/50 border-2 border-primary/20 flex items-center justify-center flex-shrink-0">
                    <Building className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <p className="font-heading font-bold text-secondary text-lg">{offer.company_name}</p>
                    <p className="text-sm text-gray-600 font-body">{offer.sector_name}</p>
                  </div>
                </div>
                <p className="font-body text-sm text-gray-600 leading-relaxed mb-6">
                  {offer.company_description || "Une entreprise leader dans son secteur, offrant des opportunités de carrière dans un environnement dynamique."}
                </p>

                {/* Quick info */}
                <div className="space-y-2 pt-5 border-t-2 border-gray-100">
                  {[
                    { label: "Secteur", value: offer.sector_name, icon: <Briefcase className="h-3.5 w-3.5 text-primary" /> },
                    { label: "Métier", value: offer.job_name, icon: <Users className="h-3.5 w-3.5 text-primary" /> },
                    { label: "Localisation", value: offer.location, icon: <MapPin className="h-3.5 w-3.5 text-primary" /> },
                    { label: "Type de contrat", value: offer.contractType, icon: <Calendar className="h-3.5 w-3.5 text-primary" /> },
                  ].map(({ label, value, icon }) => value ? (
                    <div key={label} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-6 h-6 bg-primary/10 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5">
                        {icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-500 font-body mb-0.5">{label}</p>
                        <p className="text-sm font-bold text-secondary font-body leading-snug break-words">{value}</p>
                      </div>
                    </div>
                  ) : null)}
                </div>
              </div>
            </div>
          </div>

          {/* Related offers */}
          {relatedOffers.length > 0 && (
            <div className="mt-12">
              <h2 className="font-heading text-2xl font-bold text-secondary mb-6">Offres similaires</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedOffers.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/offres/${rel.id}`}
                    className="group bg-white rounded-2xl border-2 border-gray-100 hover:border-primary/30 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col gap-4 cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/10 to-green-100/50 border border-primary/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                        <Building className="h-6 w-6 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-heading text-base font-bold text-secondary line-clamp-2 group-hover:text-primary transition-colors mb-1">{rel.titre}</h3>
                        <p className="font-body text-sm text-gray-600 truncate">{rel.company_name}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {rel.location && (
                        <span className="inline-flex items-center gap-1.5 text-xs bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full font-medium font-body border border-purple-100">
                          <MapPin className="h-3 w-3" />{rel.location}
                        </span>
                      )}
                      {rel.contractType && (
                        <span className="inline-flex items-center gap-1.5 text-xs bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full font-medium font-body border border-orange-100">
                          <Calendar className="h-3 w-3" />{rel.contractType}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default OfferDetailPage;
