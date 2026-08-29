import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRight, Building2, Search, Video } from "lucide-react";
import Hero from "../components/Hero";
import HowWorks from "../components/HowWorks";
import { BreadcrumbStructuredData, FAQStructuredData, OrganizationStructuredData, WebSiteStructuredData } from "../components/StructuredData";

const FeaturedOffers = dynamic(() => import("../components/FeaturedOffers"), { loading: () => <div className="h-96 animate-pulse bg-slate-50" /> });
const Testimonials = dynamic(() => import("../components/Testimonials"), { loading: () => <div className="h-96 animate-pulse bg-emerald-50/50" /> });
const Subscription = dynamic(() => import("../components/Subscription"), { loading: () => <div className="h-80 animate-pulse bg-white" /> });
const Footer = dynamic(() => import("../components/Footer"), { loading: () => <div className="h-96 animate-pulse bg-slate-900" /> });

const benefits = [
  { icon: Video, title: "CV vidéo", text: "Présentez plus que votre parcours." },
  { icon: Search, title: "Offres pertinentes", text: "Trouvez plus vite les bonnes opportunités." },
  { icon: Building2, title: "Lien direct", text: "Facilitez la découverte par les recruteurs." },
];

export default function Home() {
  return (
    <div className="w-full overflow-hidden bg-white">
      <OrganizationStructuredData />
      <WebSiteStructuredData />
      <FAQStructuredData />
      <BreadcrumbStructuredData items={[{ name: "Accueil", url: "/" }]} />

      <Hero />

      <section aria-label="Les avantages FaceJob" className="relative z-10 border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl divide-y divide-slate-200 px-4 sm:px-6 md:grid-cols-3 md:divide-x md:divide-y-0 lg:px-8">
          {benefits.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-center gap-4 py-5 md:px-6">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><Icon className="h-5 w-5" aria-hidden="true" /></span>
              <div><p className="font-semibold text-slate-900">{title}</p><p className="mt-0.5 text-sm text-slate-500">{text}</p></div>
            </div>
          ))}
        </div>
      </section>

      <main className="w-full">
        <HowWorks />
        <FeaturedOffers />
        <Testimonials />
        <Subscription />

        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl bg-slate-900 px-6 py-10 sm:px-10 lg:flex lg:items-center lg:justify-between lg:px-14 lg:py-12">
              <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />
              <div className="relative max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-400">Notre mission</p>
                <h2 className="mt-3 text-2xl font-bold text-white sm:text-3xl">Rendre le recrutement plus humain au Maroc</h2>
                <p className="mt-4 leading-7 text-slate-300">FaceJob aide les candidats à montrer leur potentiel et permet aux entreprises de découvrir les profils au-delà du CV traditionnel.</p>
              </div>
              <Link href="/apropsdenous" className="relative mt-7 inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-emerald-50 lg:ml-10 lg:mt-0">Découvrir FaceJob <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            </div>
          </div>
        </section>
        <Footer />
      </main>
    </div>
  );
}
