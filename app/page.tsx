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
        <div className="w-full">
            {/* Enhanced Structured Data */}
            <OrganizationStructuredData />
            <WebSiteStructuredData />
            <FAQStructuredData />
            <BreadcrumbStructuredData items={breadcrumbItems} />
            
            {/* Hero Section - Above the fold content - Load immediately */}
            <Hero/>
            
            {/* Main Content - Optimized section order for conversion */}
            <main className="w-full">
                {/* Social Proof - Early trust building */}
                <section className="bg-gradient-to-b from-white to-gray-50 py-12 border-b border-gray-100">
                    <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100">
                                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mb-4 shadow-lg">
                                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <p className="text-3xl font-bold text-gray-900 mb-1">783+</p>
                                <p className="text-gray-600 font-medium">Candidats recrutés</p>
                            </div>

                            <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100">
                                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mb-4 shadow-lg">
                                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                                        <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                                    </svg>
                                </div>
                                <p className="text-3xl font-bold text-gray-900 mb-1">1000+</p>
                                <p className="text-gray-600 font-medium">Offres d'emploi</p>
                            </div>

                            <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100">
                                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center mb-4 shadow-lg">
                                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <p className="text-3xl font-bold text-gray-900 mb-1">100%</p>
                                <p className="text-gray-600 font-medium">Gratuit</p>
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
