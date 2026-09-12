import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Clock3, Newspaper } from "lucide-react";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import Subscription from "../../components/Subscription";

export const metadata: Metadata = {
  title: "Recrutement au Maroc - Actualités Emploi et Conseils Carrière",
  description: "Découvrez les dernières tendances du marché de l'emploi au Maroc, conseils de recrutement et actualités professionnelles sur FaceJob.ma",
  keywords: "emploi maroc, recrutement maroc, blog emploi, conseils carrière, marché travail maroc",
  openGraph: { title: "Recrutement au Maroc - Actualités Emploi et Conseils Carrière", description: "Découvrez les dernières tendances du marché de l'emploi au Maroc", type: "website", locale: "fr_FR" },
};

const blogs = [
  { title: "Le Maroc de 2026 : Pourquoi le recrutement ne sera plus jamais comme avant", content: "Du nord au sud, d'Agadir à Oujda, le Maroc vit une transformation sans précédent. Découvrez les évolutions qui redessinent le marché de l’emploi.", link: "/blogs/maroc-2026-recrutement-transformation", image: "/img1.jpg", date: "25 janvier 2026", readTime: "5 min", category: "Marché de l'emploi" },
  { title: "Recrutement : Comment diviser votre temps de pré-sélection par deux ?", content: "Le temps est une ressource précieuse pour les recruteurs. Découvrez comment le CV vidéo simplifie la pré-sélection et améliore le processus.", link: "/blogs/optimiser-temps-preselection-recrutement", image: "/img2.jpg", date: "20 janvier 2026", readTime: "4 min", category: "Recrutement agile" },
  { title: "Brillez devant l’objectif : 5 secrets pour réussir votre CV vidéo", content: "Transformez le stress face à la caméra en une présentation naturelle et convaincante grâce à cinq conseils simples et pratiques.", link: "/blogs/cv-video-conseils-reussir-candidature", image: "/img3.jpg", date: "15 janvier 2026", readTime: "6 min", category: "Conseils candidats" },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <header className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-white via-emerald-50/50 to-white pb-16 pt-20 sm:pb-20">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700"><Newspaper className="h-4 w-4" /> Actualités & conseils</span>
          <h1 className="mx-auto mt-5 max-w-3xl text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">Comprendre le recrutement et faire avancer votre carrière</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">Tendances du marché marocain, bonnes pratiques RH et conseils concrets pour mieux présenter votre potentiel.</p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div><p className="text-sm font-semibold text-emerald-700">À la une</p><h2 className="mt-1 text-2xl font-bold text-slate-900">Nos derniers articles</h2></div>
          <span className="hidden text-sm text-slate-500 sm:block">{blogs.length} articles disponibles</span>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {blogs.map((blog) => (
            <article key={blog.link} className="group flex overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_6px_24px_rgba(15,23,42,0.04)] transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_16px_36px_rgba(15,23,42,0.09)] md:flex-col">
              <Link href={blog.link} className="relative block w-32 shrink-0 overflow-hidden md:h-52 md:w-full">
                <Image src={blog.image} alt={blog.title} fill sizes="(max-width: 768px) 128px, (max-width: 1024px) 50vw, 33vw" className="object-cover transition duration-500 group-hover:scale-105" />
                <span className="absolute left-3 top-3 hidden rounded-full bg-slate-950/85 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm md:inline-flex">{blog.category}</span>
              </Link>
              <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
                <span className="mb-2 text-xs font-semibold text-emerald-700 md:hidden">{blog.category}</span>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400"><span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{blog.date}</span><span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" />{blog.readTime}</span></div>
                <h2 className="mt-3 line-clamp-2 text-base font-bold leading-snug text-slate-900 transition group-hover:text-emerald-700 sm:text-lg">{blog.title}</h2>
                <p className="mt-3 hidden flex-1 text-sm leading-6 text-slate-500 md:line-clamp-3">{blog.content}</p>
                <Link href={blog.link} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-800 transition group-hover:text-emerald-700">Lire l’article <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" /></Link>
              </div>
            </article>
          ))}
        </div>
      </main>
      <Subscription />
      <Footer />
    </div>
  );
}
