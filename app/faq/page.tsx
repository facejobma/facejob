"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, HelpCircle, MessageCircle, Search, X } from "lucide-react";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";

const tabs = [
  { label: "Général", faqs: [
    { question: "Qu’est-ce que FaceJob ?", answer: "FaceJob est une plateforme d’emploi au Maroc qui permet aux candidats de créer un profil avec CV vidéo et aux entreprises de découvrir des talents au-delà du CV traditionnel." },
    { question: "Dans quelles villes FaceJob est-il disponible ?", answer: "FaceJob est accessible partout au Maroc. Les offres peuvent concerner Casablanca, Rabat, Marrakech, Fès, Tanger, Agadir, Meknès, Oujda, Kénitra, Tétouan et d’autres villes." },
    { question: "Comment contacter le support FaceJob ?", answer: "Vous pouvez nous écrire depuis la page Contact. Notre équipe vous répondra dès que possible pendant les jours ouvrés." },
  ]},
  { label: "Candidats", faqs: [
    { question: "Comment créer un CV vidéo sur FaceJob ?", answer: "Créez votre compte candidat, complétez votre profil, puis enregistrez votre vidéo de présentation depuis votre espace. Vous pourrez ensuite l’utiliser pour vos candidatures." },
    { question: "Quels sont les avantages du CV vidéo ?", answer: "Le CV vidéo permet de présenter votre personnalité, votre aisance orale, vos motivations et certaines compétences que le CV traditionnel montre difficilement." },
    { question: "Puis-je modifier mon CV vidéo après sa création ?", answer: "Oui. Vous pouvez gérer vos vidéos depuis votre espace candidat et mettre à jour votre présentation lorsque cela est nécessaire." },
    { question: "Comment suivre mes candidatures ?", answer: "L’historique de vos candidatures est disponible dans votre tableau de bord candidat, avec leur statut et les principales étapes de suivi." },
  ]},
  { label: "Entreprises", faqs: [
    { question: "Comment publier une offre d’emploi ?", answer: "Créez ou connectez-vous à votre compte entreprise, ouvrez la rubrique de publication, complétez les informations du poste puis envoyez l’offre pour validation." },
    { question: "Quels sont les avantages du CV vidéo pour une entreprise ?", answer: "Le CV vidéo aide à mieux comprendre la communication, la motivation et la personnalité d’un candidat avant les premières étapes d’entretien." },
    { question: "Comment accéder aux profils des candidats ?", answer: "Depuis votre espace entreprise, les profils et CV vidéo accessibles dépendent de vos offres, candidatures reçues et droits d’accès." },
  ]},
  { label: "Tarifs", faqs: [
    { question: "FaceJob est-il gratuit pour les candidats ?", answer: "La création du compte candidat, du profil et l’envoi de candidatures sont proposés sans frais aux candidats." },
    { question: "Y a-t-il des frais cachés ?", answer: "Les éventuelles conditions d’un service sont affichées avant son utilisation. Aucun paiement ne doit être effectué en dehors des parcours officiels de FaceJob." },
    { question: "Quels sont les tarifs pour les entreprises ?", answer: "Les formules entreprise dépendent des besoins de publication et de recrutement. Contactez notre équipe pour identifier l’offre adaptée." },
  ]},
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
            <input value={query} onChange={(event) => setQuery(event.target.value)} type="search" placeholder="Rechercher une question…" className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-12 text-sm text-slate-900 shadow-[0_10px_35px_rgba(15,23,42,0.08)] outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
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
