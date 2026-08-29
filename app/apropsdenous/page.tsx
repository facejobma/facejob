"use client";
import React, { useState } from "react";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import Link from "next/link";

const contentFR = [
  "Notre philosophie est simple : Offrir à toutes les entreprises, à tous les chercheurs d'emploi la chance de s'entrecroiser, de se connecter de la manière la plus facile que jamais, la plus efficace que jamais.",
  "Pendant des années nous avons écouté les besoins, recueilli les confidences, cherché des solutions aux problèmes du recrutement… et avons découvert que la plus simple étape consistant à l'entrecroisement entre les entreprises et les chercheurs d'emploi, était souvent la plus fondamentale mais souvent la plus négligée.",
  "De cette conviction forte est née une idée, celle de mettre le Digital au service de cet entrecroisement. Nous avons lancé FaceJob en 2022 en nous focalisant uniquement sur cette plateforme et en apportant un positionnement unique sur le marché marocain.",
  "Inspiré de la force du social media, FaceJob introduit au Maroc le concept du CV vidéo. Les recruteurs, par souci d'efficacité et de gain de temps, hésitent souvent à convoquer certains profils en entretien et passent donc à côté du candidat idéal pour le poste.",
  "Pour les candidats, le CV papier est perçu comme réducteur et n'est pas vraiment le reflet de soi-même. Le CV vidéo ajoute de l'humain, montre plus sur la façon d'être et favorise la rapidité dans la sélection et dans la rencontre.",
  "Notre objectif est de faire apparaître les chercheurs d'emploi comme s'ils rencontraient le recruteur in vivo dans des conditions optimales.",
];

const contentAR = [
  "فلسفتنا بسيطة: تقديم الفرصة لجميع الشركات، وجميع الباحثين عن العمل، للتفاعل والتواصل بأسهل طريقة على الإطلاق، وأكثر الطرق كفاءة على الإطلاق.",
  "على مدار سنوات، استمعنا إلى الاحتياجات، وجمعنا الآراء، وبحثنا عن حلول لمشاكل التوظيف… واكتشفنا أن أبسط خطوة تتمثل في التواصل بين الشركات والباحثين عن عمل، كانت في الغالب الأكثر أهمية والأكثر إهمالاً.",
  "من هذا الاقتناع الراسخ وُلدت فكرة توظيف الرقمنة في خدمة هذا التواصل. أطلقنا FaceJob عام 2022 مع التركيز الكامل على هذه المنصة، مقدّمين موقعاً فريداً في السوق المغربية.",
  "مستوحىً من قوة وسائل التواصل الاجتماعي، تُدخل FaceJob إلى المغرب مفهوم السيرة الذاتية المرئية. كثيراً ما يتردد المسؤولون عن التوظيف في استدعاء بعض الملفات للمقابلات، فيفوّتون بذلك المرشح المثالي للمنصب.",
  "بالنسبة للمرشحين، يُعدّ السيرة الذاتية الورقية مُقيِّدة ولا تعكس الشخصية الحقيقية. السيرة الذاتية المرئية تُضفي الطابع الإنساني وتُظهر أسلوب الشخص وتُسرّع عملية الاختيار واللقاء.",
  "هدفنا هو إبراز الباحثين عن عمل كما لو كانوا يلتقون بالمسؤول عن التوظيف وجهاً لوجه في أفضل الظروف.",
];

export default function AProposPage() {
  const [activeTab, setActiveTab] = useState<"fr" | "ar">("fr");
  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.play().catch(() => undefined);
  }, [activeTab]);

  const handleTabChange = (tab: "fr" | "ar") => {
    setActiveTab(tab);
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <NavBar />
      
      {/* Hero Section */}
      <header className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-white via-emerald-50/50 to-white pb-16 pt-20">
        {/* Background decorations */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="absolute bottom-0 -left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-50 pointer-events-none" />
        
        <div className="container mx-auto px-6 relative">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span className="text-sm font-medium text-primary">Notre Histoire</span>
            </div>

            <h1 className="mb-4 text-3xl font-bold leading-tight tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
              À propos de{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-primary via-green-600 to-primary-1 bg-clip-text text-transparent">
                  FaceJob
                </span>
                <svg className="absolute -bottom-2 left-0 w-full" height="12" viewBox="0 0 200 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 10C50 2 150 2 198 10" stroke="#60894B" strokeWidth="3" strokeLinecap="round" opacity="0.3"/>
                </svg>
              </span>
            </h1>
            <p className="font-body text-lg text-gray-600 leading-relaxed">
              Découvrez la vision et la mission de FaceJob
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-4xl">
          {/* Video */}
          <div className="mb-8 overflow-hidden rounded-3xl border border-slate-200 bg-black shadow-[0_18px_50px_rgba(15,23,42,0.10)]">
            <video
              ref={videoRef}
              key={activeTab}
              className="w-full h-auto"
              controls
              autoPlay
              muted
              playsInline
              preload="metadata"
              poster="/videos/videoImage.png"
            >
              <source
                src={activeTab === "fr" ? "/videos/Facejob_VF_WEB.mp4" : "/videos/Facejob_VA_WEB.mp4"}
                type="video/mp4"
              />
              Votre navigateur ne supporte pas la lecture de vidéos.
            </video>
          </div>

          {/* Tabs */}
          <div className="mb-8 flex justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm mx-auto w-fit">
            <button
              onClick={() => handleTabChange("fr")}
              className={`rounded-xl px-6 py-2.5 text-sm font-semibold transition ${
                activeTab === "fr"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-emerald-700"
              }`}
            >
              Français
            </button>
            <button
              onClick={() => handleTabChange("ar")}
              className={`rounded-xl px-6 py-2.5 text-sm font-semibold transition ${
                activeTab === "ar"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-emerald-700"
              }`}
            >
              العربية
            </button>
          </div>

          {/* Content */}
          <div
            className={`space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10 ${
              activeTab === "ar" ? "text-right" : "text-left"
            }`}
            dir={activeTab === "ar" ? "rtl" : "ltr"}
          >
            {(activeTab === "fr" ? contentFR : contentAR).map((para, i) => (
              <p key={i} className="text-base leading-8 text-slate-600">
                {i === 0 && activeTab === "fr" && (
                  <span className="text-primary font-bold font-heading">FaceJob — </span>
                )}
                {para}
              </p>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-10 text-center">
            <Link
              href="/auth/signup-candidate"
              className="group inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              Rejoindre FaceJob gratuitement
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
