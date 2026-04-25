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

  return (
    <div className="min-h-screen bg-optional1 flex flex-col">
      <NavBar />
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-white via-optional1 to-green-50/30 pt-20 pb-16 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-gradient-to-br from-primary/20 to-green-400/20 rounded-full blur-3xl opacity-60 pointer-events-none animate-pulse" />
        <div className="absolute bottom-0 -left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-50 pointer-events-none" />
        
        <div className="container mx-auto px-6 relative">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-green-100/50 backdrop-blur-sm border border-primary/20 rounded-full px-4 py-2 mb-6 shadow-sm">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span className="text-sm font-medium text-primary">Notre Histoire</span>
            </div>

            <h1 className="font-heading text-4xl md:text-5xl font-extrabold text-secondary mb-4 leading-tight tracking-tight">
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
      </div>

      <main className="flex-1 pb-20  px-4">
        <div className="max-w-3xl mx-auto">
          {/* Video */}
          <div className="rounded-2xl overflow-hidden shadow-xl mb-10 border-2 border-gray-100 bg-white">
            <video
              className="w-full h-auto"
              controls
              muted
              playsInline
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
          <div className="flex gap-3 justify-center mb-10">
            <button
              onClick={() => setActiveTab("fr")}
              className={`px-8 py-3 rounded-xl font-accent font-semibold transition-all duration-300 ${
                activeTab === "fr"
                  ? "bg-gradient-to-r from-primary to-green-600 text-white shadow-lg scale-105"
                  : "bg-white border-2 border-gray-200 text-gray-600 hover:border-primary hover:text-primary hover:shadow-md"
              }`}
            >
              Français
            </button>
            <button
              onClick={() => setActiveTab("ar")}
              className={`px-8 py-3 rounded-xl font-accent font-semibold transition-all duration-300 ${
                activeTab === "ar"
                  ? "bg-gradient-to-r from-primary to-green-600 text-white shadow-lg scale-105"
                  : "bg-white border-2 border-gray-200 text-gray-600 hover:border-primary hover:text-primary hover:shadow-md"
              }`}
            >
              العربية
            </button>
          </div>

          {/* Content */}
          <div
            className={`bg-white rounded-2xl border-2 border-gray-100 shadow-lg p-8 sm:p-10 space-y-6 ${
              activeTab === "ar" ? "text-right" : "text-left"
            }`}
            dir={activeTab === "ar" ? "rtl" : "ltr"}
          >
            {(activeTab === "fr" ? contentFR : contentAR).map((para, i) => (
              <p key={i} className="font-body text-gray-700 leading-relaxed text-base">
                {i === 0 && activeTab === "fr" && (
                  <span className="text-primary font-bold font-heading">FaceJob — </span>
                )}
                {para}
              </p>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-10">
            <Link
              href="/auth/signup-candidate"
              className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-primary to-green-600 hover:from-green-600 hover:to-primary text-white font-accent font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
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
