import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, UserRoundPlus, Video } from "lucide-react";

const steps = [
  { number: "01", title: "Créez votre profil", description: "Présentez votre parcours, vos compétences et vos objectifs professionnels dans un profil clair.", icon: UserRoundPlus },
  { number: "02", title: "Enregistrez votre CV vidéo", description: "Exprimez votre personnalité et votre motivation avec une présentation courte et authentique.", icon: Video },
  { number: "03", title: "Postulez aux bonnes offres", description: "Découvrez les opportunités adaptées à votre profil et envoyez votre candidature simplement.", icon: BriefcaseBusiness },
];

export default function HowWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-24 bg-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Comment ça marche</span>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Une candidature plus humaine, en trois étapes</h2>
          <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">FaceJob associe un profil professionnel complet à la force du CV vidéo pour vous aider à mieux vous présenter.</p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {steps.map(({ number, title, description, icon: Icon }) => (
            <article key={number} className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm shadow-emerald-200"><Icon className="h-5 w-5" aria-hidden="true" /></span>
                <span className="text-sm font-bold tracking-widest text-slate-300">{number}</span>
              </div>
              <h3 className="mt-6 text-lg font-bold text-slate-900">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
            </article>
          ))}
        </div>
        <div className="mt-9 flex justify-center">
          <Link href="/auth/signup-candidate" className="inline-flex items-center gap-2 font-semibold text-emerald-700 transition hover:text-emerald-800">Commencer mon profil <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </div>
      </div>
    </section>
  );
}
