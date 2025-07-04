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

export default function Home() {
    return (
        <div className="relative">
            <Hero/>
            <main>
                <Category/>
                <HowWorks/>
                <Testimonials/>
                <Subscription/>
                <FAQs/>
                <AboutUs/>
                <AboutUsArabic/>
                <Footer/>
            </main>
        </div>
    );
}
