import Image from "next/image";

const partners = [
  {
    name: "Come Work",
    logo: "/images/come-work.jpeg",
  },
  {
    name: "Groupe Scolaire La Méditerranée",
    logo: "/images/groupe-scolaire-la-mediterranee.jpg",
  },
  {
    name: "Groupe IKI",
    logo: "/images/iki.png",
  },
];

export default function PartnerSection() {
  return (
    <section
      aria-labelledby="partner-title"
      className="relative overflow-hidden border-y border-slate-200 bg-slate-50 py-16 sm:py-20"
    >
      <div className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-emerald-200/30 blur-3xl" />
      <div className="absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-sky-200/30 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2
            id="partner-title"
            className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
          >
            Des expertises qui se complètent
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            FaceJob s&apos;entoure d&apos;acteurs engagés pour proposer une expérience de
            recrutement plus humaine, plus simple et plus efficace.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {partners.map((partner) => (
            <div
              key={partner.name}
              tabIndex={0}
              className="group relative flex min-h-64 items-center justify-center overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)] outline-none transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_24px_65px_-35px_rgba(5,150,105,0.4)] focus-visible:border-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2"
            >
              <div className="relative h-48 w-full max-w-[230px] transition duration-300 group-hover:-translate-y-3 group-hover:scale-95 group-focus-visible:-translate-y-3 group-focus-visible:scale-95">
                <Image
                  src={partner.logo}
                  alt={`Logo de ${partner.name}, partenaire de FaceJob`}
                  fill
                  sizes="(max-width: 640px) 230px, (max-width: 1024px) 40vw, 230px"
                  className="object-contain"
                />
              </div>
              <div className="absolute inset-x-4 bottom-4 translate-y-3 rounded-2xl bg-slate-900/95 px-4 py-3 text-center opacity-0 shadow-lg backdrop-blur-sm transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                <p className="text-sm font-semibold text-white">{partner.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
