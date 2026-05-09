"use client";

import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { Search, Briefcase, Building, MapPin, Calendar, Filter, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Select from "react-select";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { stripHtmlTags, normalizeForSearch } from "@/lib/textUtils";
import { JobListingStructuredData, WebSiteStructuredData } from "@/components/StructuredData";

const CACHE_KEYS = {
  OFFERS: 'facejob_offers_cache_v2',
  SECTORS: 'facejob_sectors_cache_v2',
  JOBS: 'facejob_jobs_cache_v2',
  TIMESTAMP: 'facejob_cache_timestamp_v2',
  SCROLL_POSITION: 'facejob_scroll_position',
  UI_STATE: 'facejob_ui_state_v2',
};

const CACHE_DURATION = 5 * 60 * 1000;
const PAGE_SIZE = 12;

// Read saved UI state synchronously (called once at init)
function readSavedUIState() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(CACHE_KEYS.UI_STATE);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

interface Offer {
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
}

interface Sector { id: number; name: string; }
interface Job { id: number; name: string; sector_id: number; }

const PublicOffersPage: React.FC = () => {
  const router = useRouter();
  const [allOffers, setAllOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);

  // Initialize filter state from sessionStorage immediately to avoid reset on back navigation
  const [searchQuery, setSearchQuery] = useState(() => readSavedUIState()?.searchQuery ?? "");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(() => readSavedUIState()?.searchQuery ?? "");
  const [selectedSector, setSelectedSector] = useState(() => readSavedUIState()?.selectedSector ?? "");
  const [selectedJob, setSelectedJob] = useState(() => readSavedUIState()?.selectedJob ?? "");
  const [selectedCity, setSelectedCity] = useState(() => readSavedUIState()?.selectedCity ?? "");
  const [visibleCount, setVisibleCount] = useState(() => readSavedUIState()?.visibleCount ?? PAGE_SIZE);

  const [loadingMore, setLoadingMore] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [daysAgoMap, setDaysAgoMap] = useState<Record<number, number>>({});
  const scrollRestoredRef = useRef(false);

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setIsClient(true); }, []);

  // Restore scroll position after offers are rendered
  useEffect(() => {
    if (!loading && allOffers.length > 0 && !scrollRestoredRef.current) {
      const saved = sessionStorage.getItem(CACHE_KEYS.SCROLL_POSITION);
      if (saved) {
        scrollRestoredRef.current = true;
        requestAnimationFrame(() => {
          window.scrollTo(0, parseInt(saved));
          sessionStorage.removeItem(CACHE_KEYS.SCROLL_POSITION);
        });
      }
    }
  }, [loading, allOffers.length]);

  // Save scroll on navigation away
  useEffect(() => {
    const handler = () => sessionStorage.setItem(CACHE_KEYS.SCROLL_POSITION, window.scrollY.toString());
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  // Persist UI state (filters + visibleCount) to sessionStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.setItem(CACHE_KEYS.UI_STATE, JSON.stringify({
        searchQuery,
        selectedSector,
        selectedJob,
        selectedCity,
        visibleCount,
      }));
    } catch { /* quota exceeded, ignore */ }
  }, [searchQuery, selectedSector, selectedJob, selectedCity, visibleCount]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearchQuery(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Reset visible count only when user actively changes filters
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setVisibleCount(PAGE_SIZE);
  }, [debouncedSearchQuery, selectedSector, selectedJob, selectedCity]);

  // Load data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const now = Date.now();
      const cacheTimestamp = sessionStorage.getItem(CACHE_KEYS.TIMESTAMP);
      const isCacheValid = cacheTimestamp && (now - parseInt(cacheTimestamp)) < CACHE_DURATION;

      if (isCacheValid) {
        const cachedOffers = sessionStorage.getItem(CACHE_KEYS.OFFERS);
        const cachedSectors = sessionStorage.getItem(CACHE_KEYS.SECTORS);
        const cachedJobs = sessionStorage.getItem(CACHE_KEYS.JOBS);
        if (cachedOffers) {
          setAllOffers(JSON.parse(cachedOffers));
          setSectors(cachedSectors ? JSON.parse(cachedSectors) : []);
          setJobs(cachedJobs ? JSON.parse(cachedJobs) : []);
          setLoading(false);
          return;
        }
      }

      const offersRes = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/offres?page=1&per_page=500`,
        { headers: { 'ngrok-skip-browser-warning': 'true' } }
      );

      if (!offersRes.ok) {
        toast.error("Impossible de charger les offres d'emploi");
        return;
      }

      const response = await offersRes.json();
      const offersData: Offer[] = response.data || response;
      setAllOffers(offersData);
      sessionStorage.setItem(CACHE_KEYS.OFFERS, JSON.stringify(offersData));
      sessionStorage.setItem(CACHE_KEYS.TIMESTAMP, now.toString());

      // Extract jobs from offers
      const uniqueJobs = Array.from(
        new Map(
          offersData
            .filter(o => o.job_name && o.job_id)
            .map(o => [o.job_id, { id: o.job_id, name: o.job_name, sector_id: o.sector_id }])
        ).values()
      ) as Job[];
      setJobs(uniqueJobs);
      sessionStorage.setItem(CACHE_KEYS.JOBS, JSON.stringify(uniqueJobs));

      // Fetch sectors
      try {
        const sectorsRes = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/sectors`,
          { headers: { 'ngrok-skip-browser-warning': 'true' } }
        );
        if (sectorsRes.ok) {
          const sectorsData = (await sectorsRes.json()).data || await sectorsRes.json();
          setSectors(sectorsData);
          sessionStorage.setItem(CACHE_KEYS.SECTORS, JSON.stringify(sectorsData));
        } else {
          const fallback = Array.from(
            new Map(offersData.filter(o => o.sector_name && o.sector_id).map(o => [o.sector_id, { id: o.sector_id, name: o.sector_name }])).values()
          ) as Sector[];
          setSectors(fallback);
          sessionStorage.setItem(CACHE_KEYS.SECTORS, JSON.stringify(fallback));
        }
      } catch { /* fallback already handled */ }

    } catch {
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Compute days ago once offers are loaded
  useEffect(() => {
    if (allOffers.length === 0) return;
    const now = new Date();
    const map: Record<number, number> = {};
    allOffers.forEach(o => {
      const d = new Date(o.created_at);
      if (!isNaN(d.getTime())) {
        map[o.id] = Math.min(Math.ceil(Math.abs(now.getTime() - d.getTime()) / 86400000), 365);
      }
    });
    setDaysAgoMap(map);
  }, [allOffers.length]);

  // Filtered offers
  const filteredOffers = useMemo(() => {
    return allOffers.filter(offer => {
      if (debouncedSearchQuery) {
        const q = normalizeForSearch(debouncedSearchQuery);
        const match =
          normalizeForSearch(offer.titre || '').includes(q) ||
          normalizeForSearch(stripHtmlTags(offer.description) || '').includes(q) ||
          normalizeForSearch(offer.company_name || '').includes(q) ||
          normalizeForSearch(offer.sector_name || '').includes(q) ||
          normalizeForSearch(offer.job_name || '').includes(q) ||
          normalizeForSearch(offer.location || '').includes(q);
        if (!match) return false;
      }
      if (selectedSector && offer.sector_id !== Number(selectedSector)) return false;
      if (selectedJob && offer.job_id !== Number(selectedJob)) return false;
      if (selectedCity && offer.location !== selectedCity) return false;
      return true;
    });
  }, [allOffers, debouncedSearchQuery, selectedSector, selectedJob, selectedCity]);

  const visibleOffers = useMemo(
    () => filteredOffers.slice(0, visibleCount),
    [filteredOffers, visibleCount]
  );

  const hasMore = visibleCount < filteredOffers.length;

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore) {
          setLoadingMore(true);
          setTimeout(() => {
            setVisibleCount((prev: number) => prev + PAGE_SIZE);
            setLoadingMore(false);
          }, 300);
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore]);

  const availableJobs = useMemo(() => {
    if (!selectedSector) return jobs;
    return jobs.filter(j => j.sector_id === Number(selectedSector));
  }, [jobs, selectedSector]);

  const availableCities = useMemo(() => {
    return Array.from(new Set(allOffers.map(o => o.location).filter(Boolean))).sort();
  }, [allOffers]);

  const handleApply = (offerId: number) => {
    sessionStorage.setItem(CACHE_KEYS.SCROLL_POSITION, window.scrollY.toString());
    router.push(`/auth/login-candidate?returnUrl=/dashboard/candidat/offres&offerId=${offerId}`);
  };

  const handleLinkClick = () => {
    sessionStorage.setItem(CACHE_KEYS.SCROLL_POSITION, window.scrollY.toString());
    // Also persist current UI state immediately
    sessionStorage.setItem(CACHE_KEYS.UI_STATE, JSON.stringify({
      searchQuery,
      selectedSector,
      selectedJob,
      selectedCity,
      visibleCount,
    }));
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedSector("");
    setSelectedJob("");
    setSelectedCity("");
  };

  const customSelectStyles = {
    control: (base: any, state: any) => ({
      ...base,
      borderRadius: '8px',
      borderColor: state.isFocused ? '#60894B' : '#d0d5dd',
      borderWidth: '1px',
      boxShadow: state.isFocused ? '0 0 0 2px rgba(96, 137, 75, 0.1)' : 'none',
      padding: '4px',
      minHeight: '44px',
      backgroundColor: 'white',
      '&:hover': { borderColor: '#60894B' },
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected ? '#60894B' : state.isFocused ? '#f0f9ff' : 'white',
      color: state.isSelected ? 'white' : '#374151',
    }),
  };

  return (
    <>
      <JobListingStructuredData offers={allOffers} />
      <WebSiteStructuredData />
      <NavBar />
      <div className="min-h-screen bg-optional1">
        {/* Hero */}
        <div className="relative bg-gradient-to-br from-white via-optional1 to-green-50/30 pt-20 pb-20 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-gradient-to-br from-primary/20 to-green-400/20 rounded-full blur-3xl opacity-60 pointer-events-none" />
          <div className="absolute bottom-0 -left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-50 pointer-events-none" />
          <div className="container mx-auto px-4 max-w-7xl relative">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-green-100/50 backdrop-blur-sm border border-primary/20 rounded-full px-4 py-2 mb-6 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                <span className="text-sm font-medium text-primary">{allOffers.length} offres disponibles</span>
              </div>
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold text-secondary mb-6 leading-tight tracking-tight">
                Trouvez votre{" "}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-primary via-green-600 to-primary-1 bg-clip-text text-transparent">emploi idéal</span>
                  <svg className="absolute -bottom-2 left-0 w-full" height="12" viewBox="0 0 200 12" fill="none">
                    <path d="M2 10C50 2 150 2 198 10" stroke="#60894B" strokeWidth="3" strokeLinecap="round" opacity="0.3"/>
                  </svg>
                </span>
              </h1>
              <p className="font-body text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                Découvrez des opportunités de qualité au Maroc et postulez avec votre CV vidéo
              </p>
              <div className="max-w-2xl mx-auto">
                <div className="relative group">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5 z-10 group-focus-within:text-primary transition-colors" />
                  <Input
                    type="text"
                    placeholder="Rechercher par titre, entreprise, secteur..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-14 pr-6 py-6 text-base border-2 border-gray-200 focus:border-primary shadow-lg hover:shadow-xl bg-white text-gray-900 placeholder-gray-500 rounded-2xl transition-all duration-300 font-body"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 pb-16 max-w-7xl">
          {/* Filters */}
          <Card className="mb-8 border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center font-heading text-xl">
                <Filter className="h-5 w-5 mr-2 text-primary" />
                Filtres de recherche
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 font-body">Secteur</label>
                  {isClient ? (
                    <Select
                      instanceId="sector-select"
                      value={selectedSector ? { value: selectedSector, label: sectors.find(s => s.id === Number(selectedSector))?.name } : null}
                      onChange={(opt) => { setSelectedSector(opt ? opt.value : ""); setSelectedJob(""); }}
                      options={sectors.map(s => ({ value: s.id.toString(), label: s.name }))}
                      placeholder="Tous les secteurs"
                      isClearable
                      styles={customSelectStyles}
                    />
                  ) : (
                    <div className="h-[44px] border border-gray-300 rounded-lg bg-white flex items-center px-3 text-gray-500">Tous les secteurs</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 font-body">Métier</label>
                  {isClient ? (
                    <Select
                      instanceId="job-select"
                      value={selectedJob ? { value: selectedJob, label: availableJobs.find(j => j.id === Number(selectedJob))?.name } : null}
                      onChange={(opt) => setSelectedJob(opt ? opt.value : "")}
                      options={availableJobs.map(j => ({ value: j.id.toString(), label: j.name }))}
                      placeholder="Tous les métiers"
                      isClearable
                      isDisabled={!selectedSector}
                      styles={customSelectStyles}
                    />
                  ) : (
                    <div className="h-[44px] border border-gray-300 rounded-lg bg-gray-100 flex items-center px-3 text-gray-400">Tous les métiers</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 font-body">Ville</label>
                  {isClient ? (
                    <Select
                      instanceId="city-select"
                      value={selectedCity ? { value: selectedCity, label: selectedCity } : null}
                      onChange={(opt) => setSelectedCity(opt ? opt.value : "")}
                      options={availableCities.map(c => ({ value: c, label: c }))}
                      placeholder="Toutes les villes"
                      isClearable
                      styles={customSelectStyles}
                    />
                  ) : (
                    <div className="h-[44px] border border-gray-300 rounded-lg bg-white flex items-center px-3 text-gray-500">Toutes les villes</div>
                  )}
                </div>
              </div>
              {(selectedSector || selectedJob || selectedCity || searchQuery) && (
                <div className="mt-6 pt-6 border-t border-gray-100 flex justify-between items-center">
                  <p className="text-sm text-gray-600 font-body">
                    <span className="font-semibold text-primary">{filteredOffers.length}</span> offre(s) trouvée(s)
                  </p>
                  <Button variant="outline" onClick={clearFilters} className="font-accent hover:bg-primary hover:text-white hover:border-primary transition-all duration-300">
                    Effacer les filtres
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Initial loading */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          )}

          {/* Offers grid */}
          {!loading && (
            <>
              {visibleOffers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {visibleOffers.map((offer) => (
                    <Link
                      key={offer.id}
                      href={`/offres/${offer.id}`}
                      onClick={handleLinkClick}
                      className="group bg-white rounded-2xl border-2 border-gray-100 hover:border-primary/30 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col cursor-pointer"
                    >
                      <div className="p-6 flex flex-col flex-1 gap-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/10 to-green-100/50 flex items-center justify-center flex-shrink-0 border border-primary/20 group-hover:scale-110 transition-transform duration-300">
                            <Building className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-heading text-base font-bold text-secondary line-clamp-2 group-hover:text-primary transition-colors leading-snug mb-1">
                              {offer.titre}
                            </h3>
                            <p className="font-body text-sm text-gray-600 truncate">{offer.company_name}</p>
                          </div>
                          <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0 mt-1 font-body">
                            {daysAgoMap[offer.id] ?? 0}j
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
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
                        </div>
                        <p className="font-body text-sm text-gray-600 line-clamp-2 leading-relaxed flex-1">
                          {stripHtmlTags(offer.description)}
                        </p>
                        <button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleApply(offer.id); }}
                          className="group/btn w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-green-600 hover:from-green-600 hover:to-primary text-white font-accent font-bold text-sm py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
                        >
                          Postuler
                          <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <Card className="text-center py-16 border-2 border-dashed border-gray-200">
                  <CardContent>
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Briefcase className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="font-heading text-xl font-bold text-secondary mb-3">Aucune offre trouvée</h3>
                    <p className="font-body text-gray-600 mb-6 max-w-md mx-auto">
                      Essayez de modifier vos critères de recherche pour découvrir plus d'opportunités
                    </p>
                    <Button onClick={clearFilters} className="font-accent bg-primary hover:bg-primary-1 text-white">
                      Effacer les filtres
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Sentinel for infinite scroll */}
              {hasMore && (
                <div ref={sentinelRef} className="flex justify-center items-center py-10">
                  {loadingMore && <Loader2 className="h-8 w-8 animate-spin text-primary" />}
                </div>
              )}

              {/* End of results */}
              {!hasMore && visibleOffers.length > 0 && (
                <p className="text-center text-sm text-gray-400 font-body py-10">
                  Toutes les offres ont été chargées ({filteredOffers.length})
                </p>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PublicOffersPage;
