"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, HelpCircle, MessageCircle, Search, X } from "lucide-react";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";

const tabs = [
  {
    label: "Général",
    faqs: [
      {
        question: "Qu'est-ce que FaceJob ?",
        answer: "FaceJob est la première plateforme d'emploi au Maroc qui permet aux candidats de créer leur CV vidéo gratuitement et aux entreprises de découvrir les talents cachés. Notre solution met le pouvoir des réseaux sociaux et du digital entre les mains des recruteurs et des chercheurs d'emploi."
      },
      {
        question: "Dans quelles villes du Maroc FaceJob est-il disponible ?",
        answer: "FaceJob est disponible dans tout le Maroc. Nous avons des offres d'emploi dans toutes les principales villes : Casablanca, Rabat, Marrakech, Fès, Tanger, Agadir, Meknès, Oujda, Kenitra, Tétouan et bien d'autres. Notre plateforme couvre tous les secteurs d'activité au niveau national."
      },
      {
        question: "Comment contacter le support FaceJob ?",
        answer: "Vous pouvez nous contacter via la page Contact de notre site. Notre équipe répond généralement dans les 24h ouvrées."
      }
    ]
  },
  {
    label: "Candidats",
    faqs: [
      {
        question: "Comment créer un CV vidéo sur FaceJob ?",
        answer: "C'est simple en 3 étapes : 1) Créez votre compte candidat gratuitement en 2 minutes, 2) Enregistrez votre vidéo de présentation de 2 minutes maximum où vous parlez de votre parcours et motivations, 3) Publiez votre profil et postulez aux offres qui vous intéressent."
      },
      {
        question: "Quels sont les avantages du CV vidéo pour les candidats ?",
        answer: "Démarquez-vous des autres candidats avec votre personnalité, montrez votre aisance orale et communication non verbale, créez une connexion directe avec les recruteurs, et testez vos compétences linguistiques."
      },
      {
        question: "Puis-je modifier mon CV vidéo après l'avoir créé ?",
        answer: "Oui, vous pouvez modifier votre CV vidéo à tout moment depuis votre espace candidat. Cliquez sur 'Ma liste des vidéos' puis sur 'Modifier' pour la vidéo concernée."
      },
      {
        question: "Comment suivre mes candidatures ?",
        answer: "Toutes vos candidatures sont visibles dans votre espace candidat. Vous recevrez également des notifications par email pour les mises à jour importantes."
      }
    ]
  },
  {
    label: "Entreprises",
    faqs: [
      {
        question: "Comment publier une offre d'emploi sur FaceJob ?",
        answer: "Créez votre compte entreprise, accédez à votre espace recruteur, puis cliquez sur 'Publier une offre'. Remplissez les informations du poste et votre offre sera visible par tous les candidats."
      },
      {
        question: "Quels sont les avantages du CV vidéo pour les entreprises ?",
        answer: "Évitez les piles interminables de CV traditionnels, rencontrez les candidats en avant-première, dénichez les talents cachés plus facilement et réduisez le nombre d'entretiens physiques."
      },
      {
        question: "Comment accéder aux profils des candidats ?",
        answer: "Depuis votre espace entreprise, vous pouvez parcourir les profils candidats, visionner leurs CV vidéo et les contacter directement via la plateforme."
      }
    ]
  },
  {
    label: "Tarifs",
    faqs: [
      {
        question: "FaceJob est-il gratuit ?",
        answer: "Oui, FaceJob est 100% gratuit pour les candidats. Vous pouvez créer votre compte, enregistrer votre CV vidéo, postuler aux offres et être contacté par les recruteurs sans aucun frais."
      },
      {
        question: "Y a-t-il des frais cachés ?",
        answer: "Non, il n'y a aucun frais caché. L'inscription ne prend que 2 minutes et vous avez accès à toutes les fonctionnalités gratuitement."
      },
      {
        question: "Quels sont les tarifs pour les entreprises ?",
        answer: "Contactez notre équipe commerciale via la page Contact pour obtenir nos offres adaptées à vos besoins de recrutement."
      }
    ]
  }
];

type FAQ = { question: string; answer: string };

function Accordion({ faqs }: { faqs: FAQ[] }) {
  const [openQuestion, setOpenQuestion] = useState<string | null>(faqs[0]?.question ?? null);
  return (
    <div className="space-y-3">
      {faqs.map((faq) => {
        const isOpen = openQuestion === faq.question;
        return (
          <article key={faq.question} className={`overflow-hidden rounded-2xl border bg-white transition ${isOpen ? "border-emerald-200 shadow-[0_10px_30px_rgba(15,23,42,0.06)]" : "border-slate-200 hover:border-emerald-200"}`}>
            <button type="button" onClick={() => setOpenQuestion(isOpen ? null : faq.question)} aria-expanded={isOpen} className="flex w-full items-center justify-between gap-5 px-5 py-4 text-left sm:px-6 sm:py-5">
              <span className={`text-sm font-semibold leading-6 sm:text-base ${isOpen ? "text-emerald-800" : "text-slate-800"}`}>{faq.question}</span>
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition ${isOpen ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"}`}><ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} /></span>
            </button>
            <div className={`grid transition-all duration-300 ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}><div className="overflow-hidden"><p className="border-t border-slate-100 px-5 pb-5 pt-4 text-sm leading-7 text-slate-600 sm:px-6">{faq.answer}</p></div></div>
          </article>
        );
      })}
    </div>
  );
}

export default function FAQPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLocaleLowerCase("fr");
  const visibleFaqs = useMemo(() => normalizedQuery ? tabs.flatMap((tab) => tab.faqs).filter((faq) => `${faq.question} ${faq.answer}`.toLocaleLowerCase("fr").includes(normalizedQuery)) : tabs[activeTab].faqs, [activeTab, normalizedQuery]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <NavBar />
      <header className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-white via-emerald-50/50 to-white pb-16 pt-20">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700"><HelpCircle className="h-4 w-4" /> Centre d’aide</span>
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">Comment pouvons-nous vous aider ?</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">Retrouvez les réponses essentielles sur les comptes, les candidatures, les offres et les services FaceJob.</p>
          <div className="relative mx-auto mt-8 max-w-2xl text-left">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} type="search" aria-label="Rechercher une question" placeholder="Rechercher une question…" className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-12 text-sm text-slate-900 shadow-[0_10px_35px_rgba(15,23,42,0.08)] outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
            {query && <button type="button" onClick={() => setQuery("")} aria-label="Effacer la recherche" className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X className="h-4 w-4" /></button>}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        {!normalizedQuery && <nav aria-label="Catégories de questions" className="mb-8 flex gap-2 overflow-x-auto pb-2 sm:justify-center">{tabs.map((tab, index) => <button key={tab.label} type="button" onClick={() => setActiveTab(index)} className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${activeTab === index ? "bg-slate-900 text-white shadow-sm" : "border border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700"}`}>{tab.label}</button>)}</nav>}
        {normalizedQuery && <p className="mb-5 text-sm text-slate-500"><span className="font-semibold text-slate-800">{visibleFaqs.length}</span> résultat(s) pour « {query.trim()} »</p>}
        {visibleFaqs.length ? <Accordion key={`${activeTab}-${normalizedQuery}`} faqs={visibleFaqs} /> : <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center"><Search className="mx-auto h-8 w-8 text-slate-300" /><h2 className="mt-4 font-semibold text-slate-900">Aucune réponse trouvée</h2><p className="mt-2 text-sm text-slate-500">Essayez avec des termes plus courts ou contactez notre équipe.</p></div>}

        <section className="relative mt-12 overflow-hidden rounded-3xl bg-slate-900 px-6 py-9 text-center sm:px-10">
          <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-emerald-500/20 blur-3xl" />
          <MessageCircle className="relative mx-auto h-7 w-7 text-emerald-400" />
          <h2 className="relative mt-4 text-2xl font-bold text-white">Vous n’avez pas trouvé votre réponse ?</h2>
          <p className="relative mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-300">Notre équipe peut vous accompagner pour toute question liée à votre compte ou à l’utilisation de la plateforme.</p>
          <Link href="/contact" className="relative mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400">Nous contacter <ArrowRight className="h-4 w-4" /></Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}
