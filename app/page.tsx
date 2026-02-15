"use client";
import dynamic from "next/dynamic";
import Hero from "../components/Hero";
import HowWorks from "../components/HowWorks";
import { 
  OrganizationStructuredData, 
  WebSiteStructuredData, 
  FAQStructuredData,
  BreadcrumbStructuredData 
} from "../components/StructuredData";

// Lazy load below-the-fold components
const Category = dynamic(() => import("../components/Category"), {
  loading: () => <div className="h-96 bg-gray-50 animate-pulse" />
});
const FeaturedOffers = dynamic(() => import("../components/FeaturedOffers"), {
  loading: () => <div className="h-96 bg-gray-50 animate-pulse" />
});
const Testimonials = dynamic(() => import("../components/Testimonials"), {
  loading: () => <div className="h-96 bg-optional1 animate-pulse" />
});
const Subscription = dynamic(() => import("../components/Subscription"), {
  loading: () => <div className="h-80 bg-gray-50 animate-pulse" />
});
const FAQs = dynamic(() => import("../components/FAQs"), {
  loading: () => <div className="h-96 bg-white animate-pulse" />
});
const AboutUs = dynamic(() => import("../components/AboutUs"), {
  loading: () => <div className="h-64 bg-gray-50 animate-pulse" />
});
const AboutUsArabic = dynamic(() => import("../components/AboutUsArabic"), {
  loading: () => <div className="h-64 bg-gray-50 animate-pulse" />
});
const Footer = dynamic(() => import("../components/Footer"), {
  loading: () => <div className="h-96 bg-gray-900 animate-pulse" />
});

export default function Home() {
    const breadcrumbItems = [
        { name: "Accueil", url: "/" }
    ];

    return (
        <div className="relative overflow-x-hidden w-full max-w-[100vw]">
            {/* Enhanced Structured Data */}
            <OrganizationStructuredData />
            <WebSiteStructuredData />
            <FAQStructuredData />
            <BreadcrumbStructuredData items={breadcrumbItems} />
            
            {/* Hero Section - Above the fold content - Load immediately */}
            <Hero/>
            
            {/* Main Content - Optimized section order for conversion */}
            <main className="overflow-x-hidden w-full">
                {/* Social Proof - Early trust building */}
                <section className="bg-white py-6 sm:py-8 border-b border-gray-100">
                    <div className="container mx-auto px-4 sm:px-6 text-center">
                        <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-4 sm:gap-6 md:gap-8 text-gray-600">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="font-semibold text-sm sm:text-base">783+ candidats recrutés</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span className="font-semibold text-sm sm:text-base">1000+ offres d'emploi</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                </svg>
                                <span className="font-semibold text-sm sm:text-base">100% gratuit</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How It Works - Core value proposition - Load immediately */}
                <HowWorks/>
                
                {/* Job Categories - Lazy loaded */}
                <Category/>
                
                {/* Featured Offers - Lazy loaded */}
                <FeaturedOffers/>
                
                {/* Testimonials - Lazy loaded */}
                <Testimonials/>
                
                {/* Benefits/Subscription - Lazy loaded */}
                <Subscription/>
                
                {/* FAQ - Lazy loaded */}
                <FAQs/>
                
                {/* About sections - Lazy loaded */}
                <AboutUs/>
                <AboutUsArabic/>
                
                {/* Footer - Lazy loaded */}
                <Footer/>
            </main>
        </div>
    );
}
