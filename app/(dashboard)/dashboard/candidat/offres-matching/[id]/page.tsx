"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";
import SafeHtmlDisplay from "@/components/SafeHtmlDisplay";
import { 
  ArrowLeft, Building2, MapPin, Calendar, Briefcase, 
  Check, Code, Globe, Award, DollarSign, Clock
} from "lucide-react";

interface MatchedCriteria {
  sector: boolean;
  job_title: boolean;
  experience: boolean;
  skills: string[];
  languages: string[];
  location: boolean;
  contract_type: boolean;
}

interface MatchedOffer {
  match_percentage: number;
  matched_criteria: MatchedCriteria;
  offer: {
    id: number;
    titre: string;
    slug: string;
    description: string;
    contractType: string | null;
    location: string | null;
    salary_min: number | null;
    salary_max: number | null;
    currency: string;
    date_fin: string;
    entreprise: { id: number; company_name: string; logo: string | null };
    sector: { id: number; name: string };
    job: { id: number; name: string };
  };
}

function MatchBadge({ percentage }: { percentage: number }) {
  let colorClass = "bg-red-100 text-red-700 border-red-200";
  if (percentage >= 70) {
    colorClass = "bg-emerald-100 text-emerald-700 border-emerald-200";
  } else if (percentage >= 40) {
    colorClass = "bg-orange-100 text-orange-700 border-orange-200";
  }
  return (
    <span className={`inline-flex items-center justify-center w-16 h-16 rounded-full border-2 text-xl font-bold ${colorClass}`}>
      {percentage}%
    </span>
  );
}

function getLogoUrl(logoUrl: string | null, backendUrl: string): string {
  if (!logoUrl) return '';
  return logoUrl.startsWith('http') ? logoUrl : `${backendUrl}/storage/${logoUrl}`;
}

export default function OfferMatchingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [offerData, setOfferData] = useState<MatchedOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const offerId = params.id as string;
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? '';

  useEffect(() => {
    const fetchOfferDetail = async () => {
      const token = Cookies.get("authToken");

      try {
        const response = await fetch(
          `${backendUrl}/api/v1/candidate/matching-offers`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) throw new Error(`Erreur ${response.status}`);

        const data = await response.json();
        const offers = data.data ?? [];
        const offer = offers.find((o: MatchedOffer) => o.offer.id === parseInt(offerId));

        if (offer) {
          setOfferData(offer);
        } else {
          setError("Offre non trouvée");
        }
      } catch (err) {
        setError("Impossible de charger les détails de l'offre");
        toast.error("Erreur lors du chargement");
      } finally {
        setLoading(false);
      }
    };

    fetchOfferDetail();
  }, [offerId, backendUrl]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-green-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !offerData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-600 mb-4">{error || "Offre non trouvée"}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  const { offer, match_percentage, matched_criteria } = offerData;
  const dateFin = offer.date_fin
    ? new Date(offer.date_fin).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-2 text-green-600 hover:text-green-700 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux offres correspondantes
        </button>

        <div className="flex items-start gap-6">
          {/* Company Logo */}
          <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-gray-200 bg-white flex items-center justify-center flex-shrink-0 p-2">
            {offer.entreprise.logo ? (
              <>
                <img
                  src={getLogoUrl(offer.entreprise.logo, backendUrl)}
                  alt={offer.entreprise.company_name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <div className="w-full h-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-2xl font-bold" style={{ display: 'none' }}>
                  {offer.entreprise.company_name?.[0]?.toUpperCase() || 'E'}
                </div>
              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-2xl font-bold">
                {offer.entreprise.company_name?.[0]?.toUpperCase() || 'E'}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{offer.titre}</h1>
                <p className="text-lg text-gray-600 flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  {offer.entreprise.company_name}
                </p>
              </div>
              <MatchBadge percentage={match_percentage} />
            </div>

            <div className="flex flex-wrap gap-3">
              {offer.contractType && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  <Briefcase className="w-4 h-4" />
                  {offer.contractType}
                </span>
              )}
              {offer.location && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                  <MapPin className="w-4 h-4" />
                  {offer.location}
                </span>
              )}
              {dateFin && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                  <Clock className="w-4 h-4" />
                  Expire le {dateFin}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Matching Criteria */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Check className="w-5 h-5 text-green-600" />
          Critères de correspondance
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { key: "sector", label: "Secteur", icon: Building2 },
            { key: "job_title", label: "Poste", icon: Briefcase },
            { key: "experience", label: "Expérience", icon: Award },
            { key: "location", label: "Localisation", icon: MapPin },
            { key: "contract_type", label: "Type de contrat", icon: Calendar },
          ].map(({ key, label, icon: Icon }) => {
            const matched = matched_criteria[key as keyof typeof matched_criteria];
            return (
              <div
                key={key}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 ${
                  matched
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : "bg-gray-50 border-gray-200 text-gray-400"
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">{label}</span>
                <span className={`ml-auto w-3 h-3 rounded-full ${matched ? "bg-emerald-500" : "bg-gray-300"}`} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Description */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Description du poste</h2>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <SafeHtmlDisplay
            html={offer.description}
            className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
          />
        </div>
      </div>

      {/* Details */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Détails de l'offre</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-1">Secteur</h4>
              <p className="text-gray-700">{offer.sector.name}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-1">Métier</h4>
              <p className="text-gray-700">{offer.job.name}</p>
            </div>
          </div>

          {(offer.salary_min || offer.salary_max) && (
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-1">Salaire</h4>
                <p className="text-gray-700">
                  {offer.salary_min && offer.salary_max
                    ? `${offer.salary_min} - ${offer.salary_max} ${offer.currency}`
                    : offer.salary_min
                    ? `À partir de ${offer.salary_min} ${offer.currency}`
                    : `Jusqu'à ${offer.salary_max} ${offer.currency}`}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Matched Skills */}
      {matched_criteria.skills.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Code className="w-5 h-5 text-green-600" />
            Compétences correspondantes
          </h2>
          <div className="flex flex-wrap gap-2">
            {matched_criteria.skills.map((skill) => (
              <span
                key={skill}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-emerald-100 text-emerald-700 border-2 border-emerald-300"
              >
                {skill}
                <span className="ml-2 text-emerald-600">✓</span>
              </span>
            ))}
          </div>
          <p className="mt-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2">
            <Check className="w-4 h-4 inline mr-2" />
            {matched_criteria.skills.length} de vos compétences correspondent à cette offre
          </p>
        </div>
      )}

      {/* Matched Languages */}
      {matched_criteria.languages.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-green-600" />
            Langues correspondantes
          </h2>
          <div className="flex flex-wrap gap-2">
            {matched_criteria.languages.map((lang) => (
              <span
                key={lang}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-emerald-100 text-emerald-700 border-2 border-emerald-300"
              >
                {lang}
                <span className="ml-2 text-emerald-600">✓</span>
              </span>
            ))}
          </div>
          <p className="mt-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2">
            <Check className="w-4 h-4 inline mr-2" />
            {matched_criteria.languages.length} de vos langues correspondent à cette offre
          </p>
        </div>
      )}

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Résumé de la correspondance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-green-200">
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <Award className="w-4 h-4" />
              <span className="text-sm font-medium">Correspondance</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{match_percentage}%</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-green-200">
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <Code className="w-4 h-4" />
              <span className="text-sm font-medium">Compétences</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{matched_criteria.skills.length}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-green-200">
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <Globe className="w-4 h-4" />
              <span className="text-sm font-medium">Langues</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{matched_criteria.languages.length}</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Intéressé par cette offre ?</h3>
            <p className="text-sm text-gray-600">Postulez maintenant pour maximiser vos chances</p>
          </div>
          <button
            onClick={() => router.push(`/dashboard/candidat/offres/${offer.id}`)}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg whitespace-nowrap"
          >
            Voir l'offre complète
          </button>
        </div>
      </div>
    </div>
  );
}
