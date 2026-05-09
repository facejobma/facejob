"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { Search, Briefcase, Building, MapPin, Calendar, Filter, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { stripHtmlTags } from "@/lib/textUtils";
import { JobListingStructuredData, WebSiteStructuredData } from "@/components/StructuredData";

// Import Select dynamically to avoid SSR issues
const Select = dynamic(() => import("react-select"), { ssr: false });

const CACHE_KEYS = {
  SCROLL_POSITION: 'facejob_scroll_position',
  UI_STATE: 'facejob_ui_state_v2',
  OFFERS_DATA: 'facejob_offers_data_v2',
  FILTER_METADATA: 'facejob_filter_metadata_v2',
};

const PAGE_SIZE = 12;

// Read saved UI state synchronously (called once at init)
function readSavedUIState() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(CACHE_KEYS.UI_STATE);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

// Read cached offers data
function readCachedOffers() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(CACHE_KEYS.OFFERS_DATA);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

// Read cached filter metadata
function readCachedFilterMetadata() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(CACHE_KEYS.FILTER_METADATA);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

// Save offers data to cache
function saveOffersToCache(data: any) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(CACHE_KEYS.OFFERS_DATA, JSON.stringify(data));
  } catch { /* quota exceeded */ }
}

// Save filter metadata to cache
function saveFilterMetadataToCache(data: any) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(CACHE_KEYS.FILTER_METADATA, JSON.stringify(data));
  } catch { /* quota exceeded */ }
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
  const [loadingMore, setLoadingMore] = useState(false);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [allCities, setAllCities] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalOffers, setTotalOffers] = useState(0);
  const [applyingOfferId, setApplyingOfferId] = useState<number | null>(null);

  // Initialize filter state - use empty values for SSR, load from cache after hydration
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState("");
  const [selectedJob, setSelectedJob] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const [daysAgoMap, setDaysAgoMap] = useState<Record<number, number>>({});
  const scrollRestoredRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef<string | false>(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Cache refs - initialized after hydration
  const saved = useRef<any>(null);
  const cachedOffers = useRef<any>(null);
  const cachedFilterMetadata = useRef<any>(null);

  // Generate cache key for current filter state
  const getCacheKey = () => {
    if (!isHydrated) return '';
    return `${debouncedSearchQuery}-${selectedSector}-${selectedJob}-${selectedCity}`;
  };

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
    
    // Initialize cache refs after hydration
    saved.current = readSavedUIState();
    cachedOffers.current = readCachedOffers();
    cachedFilterMetadata.current = readCachedFilterMetadata();
    
    // Restore filter state from cache
    if (saved.current) {
      console.log('Restoring filter state from cache:', saved.current);
      setSearchQuery(saved.current.searchQuery || "");
      setDebouncedSearchQuery(saved.current.searchQuery || "");
      setSelectedSector(saved.current.selectedSector || "");
      setSelectedJob(saved.current.selectedJob || "");
      setSelectedCity(saved.current.selectedCity || "");
    } else {
      console.log('No saved filter state found');
    }
    
    // Load cached filter metadata if available
    if (cachedFilterMetadata.current) {
      const metadata = cachedFilterMetadata.current;
      setSectors(metadata.sectors || []);
      setJobs(metadata.jobs || []);
      setAllCities(metadata.cities || []);
      console.log('Loaded filter metadata from cache');
    }
    
    // Load cached offers if they match current filter state (after restoring filters)
    setTimeout(() => {
      if (cachedOffers.current) {
        const currentCacheKey = getCacheKey();
        if (cachedOffers.current.cacheKey === currentCacheKey) {
          const cached = cachedOffers.current;
          console.log('Initial hydration: Found matching cached offers:', cached.offers?.length);
          // Les offres seront chargées par l'effet de reset des filtres
        } else {
          console.log('Initial hydration: No matching cached offers found');
        }
      }
    }, 0);
  }, []);

  // Force update Select components when metadata is loaded and filters are restored
  useEffect(() => {
    if (isHydrated && sectors.length > 0 && saved.current) {
      // Force re-render of Select components with restored values
      const savedState = saved.current;
      if (savedState.selectedSector && savedState.selectedSector !== selectedSector) {
        console.log('Force updating sector selection:', savedState.selectedSector);
        setSelectedSector(savedState.selectedSector);
      }
      if (savedState.selectedJob && savedState.selectedJob !== selectedJob) {
        console.log('Force updating job selection:', savedState.selectedJob);
        setSelectedJob(savedState.selectedJob);
      }
      if (savedState.selectedCity && savedState.selectedCity !== selectedCity) {
        console.log('Force updating city selection:', savedState.selectedCity);
        setSelectedCity(savedState.selectedCity);
      }
      if (savedState.searchQuery && savedState.searchQuery !== searchQuery) {
        console.log('Force updating search query:', savedState.searchQuery);
        setSearchQuery(savedState.searchQuery);
        setDebouncedSearchQuery(savedState.searchQuery);
      }
    }
  }, [isHydrated, sectors.length, allCities.length]);

  // Load filter metadata if not cached
  useEffect(() => {
    
    const loadFilterMetadata = async () => {
      // Skip if we already have metadata (from cache or previous load)
      if (sectors.length > 0 && jobs.length > 0 && allCities.length > 0) {
        console.log('Filter metadata already loaded');
        return;
      }
      
      try {
        console.log('Loading filter metadata from API...');
        const metadataRes = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/offres/filter-metadata`,
          { headers: { 'ngrok-skip-browser-warning': 'true' } }
        );

        if (metadataRes.ok) {
          const metadata = await metadataRes.json();
          const filterData: {
            sectors: Sector[];
            cities: string[];
            jobs: Job[];
          } = {
            sectors: Array.isArray(metadata.sectors) ? metadata.sectors : [],
            cities: Array.isArray(metadata.cities) ? metadata.cities : [],
            jobs: []
          };
          
          setSectors(filterData.sectors);
          setAllCities(filterData.cities);
          
          // Extract jobs from sectors
          const allJobs: Job[] = [];
          if (Array.isArray(metadata.sectors)) {
            metadata.sectors.forEach((sector: any) => {
              if (sector.jobs && Array.isArray(sector.jobs)) {
                sector.jobs.forEach((job: any) => {
                  allJobs.push({
                    id: job.id,
                    name: job.name,
                    sector_id: sector.id
                  });
                });
              }
            });
          }
          setJobs(allJobs);
          filterData.jobs = allJobs;
          
          // Cache filter metadata
          saveFilterMetadataToCache(filterData);
          
          console.log('Filter metadata loaded and cached:', {
            sectors: filterData.sectors.length,
            cities: filterData.cities.length,
            jobs: allJobs.length
          });
        } else {
          console.error('Failed to fetch filter metadata:', metadataRes.status);
          // Fallback to old method
          await loadFallbackMetadata();
        }
      } catch (error) {
        console.error('Error loading filter metadata:', error);
        await loadFallbackMetadata();
      }
    };

    const loadFallbackMetadata = async () => {
      try {
        // Fallback to old method for sectors
        const sectorsRes = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/sectors`,
          { headers: { 'ngrok-skip-browser-warning': 'true' } }
        );
        if (sectorsRes.ok) {
          const sectorsData = (await sectorsRes.json()).data || await sectorsRes.json();
          setSectors(sectorsData);
        }

        // Load cities from all offers
        const allOffersRes = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/offres?per_page=1000`,
          { headers: { 'ngrok-skip-browser-warning': 'true' } }
        );
        if (allOffersRes.ok) {
          const allOffersData = await allOffersRes.json();
          const cities = Array.from(
            new Set((allOffersData.data || []).map((o: any) => o.location).filter(Boolean))
          ).sort() as string[];
          setAllCities(cities);
          
          const uniqueJobs = Array.from(
            new Map(
              (allOffersData.data || [])
                .filter((o: any) => o.job_name && o.job_id)
                .map((o: any) => [o.job_id, { id: o.job_id, name: o.job_name, sector_id: o.sector_id }])
            ).values()
          ) as Job[];
          setJobs(uniqueJobs);
        }
      } catch (error) {
        console.error('Fallback metadata loading failed:', error);
      }
    };

    loadFilterMetadata();
  }, [isHydrated, sectors.length, jobs.length, allCities.length]);

  // Restore scroll position after offers are rendered
  useEffect(() => {
    if (!loading && allOffers.length > 0 && !scrollRestoredRef.current) {
      const saved = sessionStorage.getItem(CACHE_KEYS.SCROLL_POSITION);
      if (saved) {
        scrollRestoredRef.current = true;
        requestAnimationFrame(() => {
          window.scrollTo(0, parseInt(saved));
          // Ne pas supprimer immédiatement la position de scroll
          // Elle sera supprimée lors de la prochaine navigation
        });
      }
    }
  }, [loading, allOffers.length]);

  // Save scroll on navigation away (but not when going to offers)
  useEffect(() => {
    const handler = () => {
      // Sauvegarder la position de scroll seulement si on ne navigue pas vers une offre
      if (!sessionStorage.getItem('facejob_navigating_to_offer')) {
        sessionStorage.setItem(CACHE_KEYS.SCROLL_POSITION, window.scrollY.toString());
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  // Persist UI state on every change (more frequent saves)
  useEffect(() => {
    if (!isHydrated) return;
    
    try {
      const uiState = {
        searchQuery,
        selectedSector,
        selectedJob,
        selectedCity,
      };
      sessionStorage.setItem(CACHE_KEYS.UI_STATE, JSON.stringify(uiState));
      console.log('Saved UI state:', uiState);
    } catch { /* quota exceeded, ignore */ }
  }, [isHydrated, searchQuery, selectedSector, selectedJob, selectedCity]);

  // Save offers to cache when they change (only after hydration and when we have data)
  useEffect(() => {
    if (!isHydrated || allOffers.length === 0) return;
    
    const cacheData = {
      cacheKey: getCacheKey(),
      offers: allOffers,
      currentPage,
      hasMore,
      totalOffers,
      timestamp: Date.now()
    };
    
    saveOffersToCache(cacheData);
    console.log('Saved to cache:', cacheData.offers.length, 'offers with key:', cacheData.cacheKey);
  }, [isHydrated, allOffers, currentPage, hasMore, totalOffers, debouncedSearchQuery, selectedSector, selectedJob, selectedCity]);

  // Save current state when navigating away
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (allOffers.length > 0) {
        const cacheData = {
          cacheKey: getCacheKey(),
          offers: allOffers,
          currentPage,
          hasMore,
          totalOffers,
          timestamp: Date.now()
        };
        saveOffersToCache(cacheData);
        console.log('Saved state before navigation:', cacheData.offers.length, 'offers');
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && allOffers.length > 0) {
        const cacheData = {
          cacheKey: getCacheKey(),
          offers: allOffers,
          currentPage,
          hasMore,
          totalOffers,
          timestamp: Date.now()
        };
        saveOffersToCache(cacheData);
        console.log('Saved state on visibility change:', cacheData.offers.length, 'offers');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [allOffers, currentPage, hasMore, totalOffers, debouncedSearchQuery, selectedSector, selectedJob, selectedCity]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearchQuery(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Reset to page 1 when filters change (only after hydration)
  useEffect(() => {
    if (!isHydrated) return;
    
    console.log('Filters changed, resetting to page 1');
    setCurrentPage(1);
    setAllOffers([]);
    setHasMore(true);
    loadingRef.current = false;
  }, [isHydrated, debouncedSearchQuery, selectedSector, selectedJob, selectedCity]);

  // Load data when page changes or filters change (only after hydration)
  useEffect(() => {
    if (!isHydrated) return;
    
    const loadPage = async () => {
      console.log('Loading page:', currentPage, 'with filters:', {
        search: debouncedSearchQuery,
        sector: selectedSector,
        job: selectedJob,
        city: selectedCity
      });
      
      // Check cache for navigation back (when returning from offer page)
      const isReturningFromOffer = sessionStorage.getItem('facejob_navigating_to_offer') === 'true';
      const cached = readCachedOffers();
      const currentCacheKey = getCacheKey();
      
      if (isReturningFromOffer && cached && cached.cacheKey === currentCacheKey && 
          cached.offers && cached.offers.length > 0 && currentPage === 1) {
        console.log('Navigation back from offer detected, using cached data:', cached.offers.length, 'offers');
        setAllOffers(cached.offers);
        setHasMore(cached.hasMore || false);
        setTotalOffers(cached.totalOffers || 0);
        setLoading(false);
        // Nettoyer le flag de navigation
        sessionStorage.removeItem('facejob_navigating_to_offer');
        return;
      }
      
      // Nettoyer le flag si on n'utilise pas le cache
      sessionStorage.removeItem('facejob_navigating_to_offer');
      
      // Prevent duplicate loading for the same request
      const requestKey = `${currentPage}-${debouncedSearchQuery}-${selectedSector}-${selectedJob}-${selectedCity}`;
      if (loadingRef.current === requestKey) return;
      
      loadingRef.current = requestKey;
      
      try {
        if (currentPage === 1) setLoading(true);
        else setLoadingMore(true);

        // Build query params
        const params = new URLSearchParams({
          page: currentPage.toString(),
          per_page: PAGE_SIZE.toString(),
        });

        if (debouncedSearchQuery) params.append('search', debouncedSearchQuery);
        if (selectedSector) params.append('sector_id', selectedSector);
        if (selectedJob) params.append('job_id', selectedJob);
        if (selectedCity) params.append('location', selectedCity);

        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/offres?${params.toString()}`;
        
        console.log('Filters being sent:', {
          search: debouncedSearchQuery,
          sector_id: selectedSector,
          job_id: selectedJob,
          location: selectedCity,
          url: url
        });

        const offersRes = await fetch(url, {
          headers: { 'ngrok-skip-browser-warning': 'true' }
        });

        if (!offersRes.ok) {
          toast.error("Impossible de charger les offres d'emploi");
          return;
        }

        const response = await offersRes.json();
        const offersData: Offer[] = response.data || [];
        const pagination = response.pagination || {};

        console.log('API Response received:', {
          page: pagination.current_page,
          offersCount: offersData.length,
          totalOffers: pagination.total
        });

        if (currentPage === 1) {
          setAllOffers(offersData);
        } else {
          setAllOffers(prev => [...prev, ...offersData]);
        }

        setHasMore(pagination.current_page < pagination.last_page);
        setTotalOffers(pagination.total || 0);

      } catch (error) {
        console.error('Load page error:', error);
        toast.error("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
        setLoadingMore(false);
        loadingRef.current = false;
      }
    };

    // Toujours charger les données quand les dépendances changent
    loadPage();
  }, [isHydrated, currentPage, debouncedSearchQuery, selectedSector, selectedJob, selectedCity]);

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

  // IntersectionObserver for infinite scroll - load next page from backend
  useEffect(() => {
    if (!sentinelRef.current || !hasMore || loadingMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore && !loading) {
          setCurrentPage(prev => prev + 1);
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading]);

  const availableJobs = useMemo(() => {
    if (!selectedSector) return jobs;
    return jobs.filter(j => j.sector_id === Number(selectedSector));
  }, [jobs, selectedSector]);

  const handleApply = async (offerId: number) => {
    sessionStorage.setItem(CACHE_KEYS.SCROLL_POSITION, window.scrollY.toString());
    setApplyingOfferId(offerId);
    
    // Vérifier si l'utilisateur est connecté en vérifiant le token
    try {
      const authToken = document.cookie.split('authToken=')[1]?.split(';')[0]?.replace(/['"]/g, '');
      
      if (!authToken) {
        // Pas de token, rediriger vers la connexion
        router.push(`/auth/login-candidate?returnUrl=/dashboard/candidat/offres&offerId=${offerId}`);
        return;
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/candidate-profile`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        // Utilisateur connecté, rediriger vers la liste des offres avec l'ID pour ouvrir la popup
        console.log('User is authenticated, redirecting to offers page with popup');
        router.push(`/dashboard/candidat/offres?offerId=${offerId}`);
      } else {
        // Utilisateur non connecté, rediriger vers la page de connexion
        console.log('User not authenticated, redirecting to login');
        router.push(`/auth/login-candidate?returnUrl=/dashboard/candidat/offres&offerId=${offerId}`);
      }
    } catch (error) {
      // En cas d'erreur, rediriger vers la page de connexion par sécurité
      console.log('Error checking authentication, redirecting to login');
      router.push(`/auth/login-candidate?returnUrl=/dashboard/candidat/offres&offerId=${offerId}`);
    } finally {
      setApplyingOfferId(null);
    }
  };

  const handleLinkClick = () => {
    sessionStorage.setItem(CACHE_KEYS.SCROLL_POSITION, window.scrollY.toString());
    // Marquer qu'on navigue vers une offre (pour détecter le retour)
    sessionStorage.setItem('facejob_navigating_to_offer', 'true');
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedSector("");
    setSelectedJob("");
    setSelectedCity("");
    // Clear cached data when filters are cleared
    try {
      sessionStorage.removeItem(CACHE_KEYS.OFFERS_DATA);
    } catch { /* ignore */ }
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
                <span className="text-sm font-medium text-primary">
                  {isHydrated ? (
                    (selectedSector || selectedJob || selectedCity || searchQuery) ? 
                      `${totalOffers} offres trouvées` : 
                      `${totalOffers} offres disponibles`
                  ) : (
                    `${totalOffers} offres disponibles`
                  )}
                </span>
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
                  <Select
                    instanceId="sector-select"
                    value={selectedSector ? { value: selectedSector, label: sectors.find(s => s.id === Number(selectedSector))?.name } : null}
                    onChange={(opt: any) => { 
                      console.log('Sector changed:', opt);
                      setSelectedSector(opt ? opt.value : ""); 
                      setSelectedJob(""); 
                    }}
                    options={sectors.map(s => ({ value: s.id.toString(), label: s.name }))}
                    placeholder="Tous les secteurs"
                    isClearable
                    styles={customSelectStyles}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 font-body">Métier</label>
                  <Select
                    instanceId="job-select"
                    value={selectedJob ? { value: selectedJob, label: availableJobs.find(j => j.id === Number(selectedJob))?.name } : null}
                    onChange={(opt: any) => {
                      console.log('Job changed:', opt);
                      setSelectedJob(opt ? opt.value : "");
                    }}
                    options={availableJobs.map(j => ({ value: j.id.toString(), label: j.name }))}
                    placeholder="Tous les métiers"
                    isClearable
                    isDisabled={!selectedSector}
                    styles={customSelectStyles}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 font-body">Ville</label>
                  <Select
                    instanceId="city-select"
                    value={selectedCity ? { value: selectedCity, label: selectedCity } : null}
                    onChange={(opt: any) => {
                      console.log('City changed:', opt);
                      setSelectedCity(opt ? opt.value : "");
                    }}
                    options={allCities.map(c => ({ value: c, label: c }))}
                    placeholder="Toutes les villes"
                    isClearable
                    styles={customSelectStyles}
                  />
                </div>
              </div>
              {isHydrated && (selectedSector || selectedJob || selectedCity || searchQuery) && (
                <div className="mt-6 pt-6 border-t border-gray-100 flex justify-between items-center">
                  <p className="text-sm text-gray-600 font-body">
                    <span className="font-semibold text-primary">{totalOffers}</span> offre(s) trouvée(s)
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
              {allOffers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {allOffers.map((offer, index) => (
                    <Link
                      key={`${offer.id}-${index}`}
                      href={`/offres/${offer.id}`}
                      onClick={() => {
                        handleLinkClick();
                        console.log('Navigating to offer:', offer.id, 'Current filters:', {
                          search: searchQuery,
                          sector: selectedSector,
                          job: selectedJob,
                          city: selectedCity
                        });
                      }}
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
                          disabled={applyingOfferId === offer.id}
                          className="group/btn w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-green-600 hover:from-green-600 hover:to-primary text-white font-accent font-bold text-sm py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {applyingOfferId === offer.id ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Vérification...
                            </>
                          ) : (
                            <>
                              Postuler
                              <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                            </>
                          )}
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
              {hasMore && allOffers.length > 0 && (
                <div ref={sentinelRef} className="flex justify-center items-center py-10">
                  {loadingMore && <Loader2 className="h-8 w-8 animate-spin text-primary" />}
                </div>
              )}

              {/* End of results */}
              {!hasMore && allOffers.length > 0 && (
                <p className="text-center text-sm text-gray-400 font-body py-10">
                  Toutes les offres ont été chargées ({totalOffers})
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
