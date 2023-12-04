import AboutUs from "../components/AboutUs";
import Brands from "../components/Brands";
import Category from "../components/Category";
import Destinations from "../components/Destinations";
import FAQs from "../components/FAQs";
import Footer from "../components/Footer";
import Hero from "../components/Hero";
import HowWorks from "../components/HowWorks";
import Subscription from "../components/Subscription";
import Testimonials from "../components/Testimonials";

export default function Home() {
    return (
        <div className="relative overflow-hidden">
            <Hero/>
            <main>
                <Category/>
                {/* <Destinations/> */}
                <HowWorks/>
                <Testimonials/>
                <Brands/>
                <Subscription/>
                <FAQs />
                <AboutUs/>
                <Footer/>
            </main>
        </div>
    );
}
