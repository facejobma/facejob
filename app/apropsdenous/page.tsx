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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <NavBar />
      <main className="flex-1 pt-28 pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-secondary mb-3">
              À propos de nous
            </h1>
            <p className="text-gray-500 text-base sm:text-lg">
              Découvrez la vision et la mission de FaceJob
            </p>
          </div>

          {/* Video */}
          <div className="rounded-2xl overflow-hidden shadow-lg mb-10">
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
          <div className="flex gap-2 justify-center mb-8">
            <button
              onClick={() => setActiveTab("fr")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeTab === "fr"
                  ? "bg-primary text-white shadow-md"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-primary hover:text-primary"
              }`}
            >
              Français
            </button>
            <button
              onClick={() => setActiveTab("ar")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeTab === "ar"
                  ? "bg-primary text-white shadow-md"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-primary hover:text-primary"
              }`}
            >
              العربية
            </button>
          </div>

          {/* Content */}
          <div
            className={`bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-5 ${
              activeTab === "ar" ? "text-right" : "text-left"
            }`}
            dir={activeTab === "ar" ? "rtl" : "ltr"}
          >
            {(activeTab === "fr" ? contentFR : contentAR).map((para, i) => (
              <p key={i} className="text-gray-600 leading-relaxed text-sm sm:text-base">
                {i === 0 && activeTab === "fr" && (
                  <span className="text-primary font-semibold">FaceJob — </span>
                )}
                {para}
              </p>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-10">
            <Link
              href="/auth/signup-candidate"
              className="inline-flex items-center justify-center px-6 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-1 transition-colors text-sm"
            >
              Rejoindre FaceJob gratuitement
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
