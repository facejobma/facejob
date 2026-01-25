"use client";
import AboutUs from "../components/AboutUs";
import AboutUsArabic from "../components/AboutUsArabic";
import Category from "../components/Category";
import FAQs from "../components/FAQs";
import Footer from "../components/Footer";
import Hero from "../components/Hero";
import HowWorks from "../components/HowWorks";
import Subscription from "../components/Subscription";
import Testimonials from "../components/Testimonials";
import FeaturedOffers from "../components/FeaturedOffers";
import { 
  OrganizationStructuredData, 
  WebSiteStructuredData, 
  FAQStructuredData,
  BreadcrumbStructuredData 
} from "../components/StructuredData";

export default function Home() {
    const breadcrumbItems = [
        { name: "Accueil", url: "/" }
    ];

    return (
        <div className="relative">
            {/* Enhanced Structured Data */}
            <OrganizationStructuredData />
            <WebSiteStructuredData />
            <FAQStructuredData />
            <BreadcrumbStructuredData items={breadcrumbItems} />
            
            {/* Hero Section - Above the fold content */}
            <Hero/>
            
            {/* Main Content - Optimized section order for conversion */}
            <main>
                {/* Social Proof - Early trust building */}
                <section className="bg-white py-8 border-b border-gray-100">
                    <div className="container mx-auto px-6 text-center">
                        <div className="flex flex-wrap justify-center items-center gap-8 text-gray-600">
                            <div className="flex items-center gap-2">
                                <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="font-semibold">783+ candidats recrutés</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span className="font-semibold">1000+ offres d'emploi</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                </svg>
                                <span className="font-semibold">100% gratuit</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How It Works - Core value proposition */}
                <HowWorks/>
                
                {/* Job Categories - Help users find relevant opportunities */}
                <Category/>
                
                {/* Featured Offers - Show real opportunities */}
                <FeaturedOffers/>
                
                {/* Testimonials - Social proof and credibility */}
                <Testimonials/>
                
                {/* Benefits/Subscription - Value proposition for different user types */}
                <Subscription/>
                
                {/* FAQ - Address common concerns */}
                <FAQs/>
                
                {/* About sections - Company credibility */}
                <AboutUs/>
                <AboutUsArabic/>
                
                {/* Footer - Contact and additional links */}
                <Footer/>
            </main>
        </div>
    );
}
