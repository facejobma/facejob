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

  const handleApply = () => router.push(`/auth/login-candidate?returnUrl=/dashboard/candidat/offres&offerId=${offerId}`);

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
      <Footer />
    </>
  );

  if (!offer) return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-14 w-14 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Offre non trouvée</h2>
          <p className="text-gray-500 mb-6 text-sm">Cette offre n'existe pas ou a été supprimée.</p>
          <Link href="/offres" className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-1 transition-colors">
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
      <div className="min-h-screen bg-gray-50 pt-20">

        {/* Hero banner */}
        <div className="bg-white shadow-sm">
          <div className="container mx-auto px-4 max-w-6xl py-6">
            <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition-colors mb-5">
              <ArrowLeft className="h-4 w-4" /> Retour aux offres
            </button>

            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center flex-shrink-0">
                  <Building className="h-7 w-7 text-green-600" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{offer.titre}</h1>
                  <p className="text-gray-500 font-medium">{offer.company_name}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {offer.location && (
                      <span className="inline-flex items-center gap-1 text-xs bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full font-medium">
                        <MapPin className="h-3 w-3" />{offer.location}
                      </span>
                    )}
                    {offer.contractType && (
                      <span className="inline-flex items-center gap-1 text-xs bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full font-medium">
                        <Calendar className="h-3 w-3" />{offer.contractType}
                      </span>
                    )}
                    {offer.sector_name && (
                      <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium">
                        <Briefcase className="h-3 w-3" />{offer.sector_name}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full font-medium">
                      Publié il y a {daysAgo}j
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 flex-shrink-0">
                <button onClick={handleShare} className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-primary hover:text-primary transition-colors">
                  <Share2 className="h-4 w-4" /> Partager
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 max-w-6xl py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Main */}
            <div className="lg:col-span-2 space-y-6">

              {/* Description */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-base font-bold text-gray-900 mb-4">Description du poste</h2>
                <SafeHtmlDisplay html={offer.description} className="text-gray-600 leading-relaxed prose prose-sm max-w-none text-sm" />
              </div>

              {/* Details */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-base font-bold text-gray-900 mb-4">Détails de l'offre</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Date de début</p>
                    <p className="font-medium text-gray-700">{formatDate(offer.date_debut)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Date de fin</p>
                    <p className="font-medium text-gray-700">{formatDate(offer.date_fin)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Secteur</p>
                    <p className="font-medium text-gray-700">{offer.sector_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Métier</p>
                    <p className="font-medium text-gray-700">{offer.job_name}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">

              {/* Apply */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
                <h3 className="font-bold text-gray-900 mb-1">Postuler à cette offre</h3>
                <p className="text-xs text-gray-500 mb-4">Créez votre profil et postulez avec votre CV vidéo</p>
                <button
                  onClick={handleApply}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm mb-4"
                >
                  Postuler maintenant
                </button>
                <div className="space-y-2 text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <Eye className="h-3.5 w-3.5 text-primary" />
                    <span>{offer.views_count || 0} vues</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 text-primary" />
                    <span>{offer.applications_count || 0} candidatures</span>
                  </div>
                  {offer.is_verified && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                      <span>Offre vérifiée</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Company */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-4">À propos de l'entreprise</h3>
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center">
                    <Building className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{offer.company_name}</p>
                    <p className="text-xs text-gray-500">{offer.sector_name}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {offer.company_description || "Une entreprise leader dans son secteur, offrant des opportunités de carrière dans un environnement dynamique."}
                </p>
              </div>
            </div>
          </div>

          {/* Related offers */}
          {relatedOffers.length > 0 && (
            <div className="mt-12">
              <h2 className="text-lg font-bold text-gray-900 mb-5">Offres similaires</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {relatedOffers.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => router.push(`/offres/${rel.id}`)}
                    className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 p-5 flex flex-col gap-3 cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center flex-shrink-0">
                        <Building className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-gray-900 line-clamp-2 group-hover:text-green-600 transition-colors">{rel.titre}</h3>
                        <p className="text-xs text-gray-500 truncate">{rel.company_name}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {rel.location && (
                        <span className="inline-flex items-center gap-1 text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">
                          <MapPin className="h-2.5 w-2.5" />{rel.location}
                        </span>
                      )}
                      {rel.contractType && (
                        <span className="inline-flex items-center gap-1 text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full">
                          <Calendar className="h-2.5 w-2.5" />{rel.contractType}
                        </span>
                      )}
                    </div>
                  </div>
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
