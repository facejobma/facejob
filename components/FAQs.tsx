"use client"
import React, { useState } from "react";

const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  return (
    <div className="container my-24 px-2 mx-auto md:px-6 xl:px-40 w-full mt-36 font-default">
      {/* Section: Design Block */}
      <section className="mb-32">
        <h2 className="mb-6 pl-6 text-5xl font-bold text-gray-800">
          Questions fréquemment posées
        </h2>

        <div id="accordionFlushExample">
          {/* Question 1 */}
          <div className="rounded-none border border-t-0 border-l-0 border-r-0 text-secondary">
            <h2 className="mb-0" id="flush-headingOne">
              <button
                className="group relative flex w-full items-center rounded-none border-0 py-4 px-5 text-left text-xl font-bold transition [overflow-anchor:none] hover:z-[2] focus:z-[3] focus:outline-none [&:not([data-te-collapse-collapsed])]:text-primary [&:not([data-te-collapse-collapsed])]:[box-shadow:inset_0_-1px_0_rgba(229,231,235)] dark:[&:not([data-te-collapse-collapsed])]:text-primary-400"
                type="button"
                onClick={() => handleToggle(0)}
              >
                Qui sommes-nous ?
                <span
                  className={`ml-auto h-5 w-5 shrink-0 rotate-[-180deg] fill-[#336dec] transition-transform duration-200 ease-in-out group-[[data-te-collapse-collapsed]]:rotate-0 group-[[data-te-collapse-collapsed]]:fill-[#212529] motion-reduce:transition-none dark:fill-[#8FAEE0] dark:group-[[data-te-collapse-collapsed]]:fill-[#eee] ${
                    openIndex === 0 ? "rotate-0 fill-[#212529]" : ""
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                    <path
                      fillRule="evenodd"
                      d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
                    />
                  </svg>
                </span>
              </button>
            </h2>
            <div
              id="flush-collapseOne"
              className={`!visible ${openIndex === 0 ? "" : "hidden"} border-0`}
              data-te-collapse-item=""
              aria-labelledby="flush-headingOne"
              data-te-parent="#accordionFlushExample"
            >
              <div className="py-4 px-5">
                facejob est la solution en ligne qui met à la fois le pouvoir
                des réseaux sociaux et celui du digital entre les mains des
                recruteurs et des chercheurs d’emploi.
              </div>
            </div>
          </div>

          {/* Question 2 */}
          <div className="rounded-none border border-l-0 border-r-0 border-t-0 text-secondary">
            <h2 className="mb-0" id="flush-headingTwo">
              <button
                className="group relative flex w-full items-center rounded-none border-0 py-4 px-5 text-left text-xl font-bold transition [overflow-anchor:none] hover:z-[2] focus:z-[3] focus:outline-none [&:not([data-te-collapse-collapsed])]:text-primary [&:not([data-te-collapse-collapsed])]:[box-shadow:inset_0_-1px_0_rgba(229,231,235)] dark:[&:not([data-te-collapse-collapsed])]:text-primary-400"
                type="button"
                onClick={() => handleToggle(1)}
              >
                Comment ça marche ?
                <span
                  className={`ml-auto h-5 w-5 shrink-0 rotate-[-180deg] fill-[#336dec] transition-transform duration-200 ease-in-out group-[[data-te-collapse-collapsed]]:rotate-0 group-[[data-te-collapse-collapsed]]:fill-[#212529] motion-reduce:transition-none dark:fill-[#8FAEE0] dark:group-[[data-te-collapse-collapsed]]:fill-[#eee] ${
                    openIndex === 1 ? "rotate-0 fill-[#212529]" : ""
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                    <path
                      fillRule="evenodd"
                      d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
                    />
                  </svg>
                </span>
              </button>
            </h2>
            <div
              id="flush-collapseTwo"
              className={`!visible ${openIndex === 1 ? "" : "hidden"} border-0`}
              data-te-collapse-item=""
              aria-labelledby="flush-headingTwo"
              data-te-parent="#accordionFlushExample"
            >
              <div className="py-4 px-5 space-y-4">
                <div>
                  <span className="font-bold">Le candidat</span> enregistre et
                  dépose son CV vidéo dans la plateforme &quot;facejob&quot; en
                  renseignant des informations complémentaires. Il peut soit
                  répondre directement à une offre diffusée sur la plateforme
                  soit laisser son CV vidéo en candidature spontanée. Grâce à ce
                  petit film, le candidat améliore la visibilité de sa
                  candidature.
                </div>
                <div>
                  <span className="font-bold">Le recruteur</span> navigue dans
                  la plateforme et visualise les CV vidéos jusqu’à dénicher
                  le(s) candidat(s) qui répond(ent) à son besoin, le CV vidéo
                  aide en fait le recruteur à mieux cerner le profil du candidat
                  et s’en faire une idée un peu plus précise. Avant même
                  l’entretien, le recruteur peut juger l’aisance orale, la
                  posture et la communication non verbale du candidat, lui
                  permettant ainsi de mieux cibler et de réduire le nombre de
                  candidats convoqués pour entretien physique.
                </div>
              </div>
            </div>
          </div>

          {/* Question 3 */}
          <div className="rounded-none border border-l-0 border-r-0 border-b-0 border-t-0 text-secondary">
            <h2 className="mb-0" id="flush-headingThree">
              <button
                className="group relative flex w-full items-center rounded-none border-0 py-4 px-5 text-left text-xl font-bold transition [overflow-anchor:none] hover:z-[2] focus:z-[3] focus:outline-none [&:not([data-te-collapse-collapsed])]:text-primary [&:not([data-te-collapse-collapsed])]:[box-shadow:inset_0_-1px_0_rgba(229,231,235)] dark:[&:not([data-te-collapse-collapsed])]:text-primary-400"
                type="button"
                onClick={() => handleToggle(2)}
              >
                Quelle est notre valeur ajoutée ?
                <span
                  className={`ml-auto h-5 w-5 shrink-0 rotate-[-180deg] fill-[#336dec] transition-transform duration-200 ease-in-out group-[[data-te-collapse-collapsed]]:rotate-0 group-[[data-te-collapse-collapsed]]:fill-[#212529] motion-reduce:transition-none dark:fill-[#8FAEE0] dark:group-[[data-te-collapse-collapsed]]:fill-[#eee] ${
                    openIndex === 2 ? "rotate-0 fill-[#212529]" : ""
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                    <path
                      fillRule="evenodd"
                      d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
                    />
                  </svg>
                </span>
              </button>
            </h2>
            <div
              id="flush-collapseThree"
              className={`!visible ${
                openIndex === 2 ? "" : "hidden"
              } rounded-b-lg border-0`}
              data-te-collapse-item=""
              aria-labelledby="flush-headingThree"
              data-te-parent="#accordionFlushExample"
            >
              <div className="py-4 px-5 space-y-6">
                <div className="space-y-4">
                  <p>
                    <span className="font-bold">Vous êtes une entreprise</span>{" "}
                    …Évitez les piles interminables de CV sur vos bureaux,
                    rencontrez en avant première les candidats et dénichez les
                    talents cachés …
                  </p>
                  <p>
                    La mise en valeur de la personnalité du candidat : La
                    communication est aussi non verbale et grâce à la vidéo,
                    vous allez pouvoir visualiser certains éléments qui vous
                    permettront de mieux cerner vos candidats.
                  </p>
                  <p>
                    Tester les compétences linguistiques du candidat : Si le
                    poste convoité demande des compétences linguistiques, le
                    recruteur n’a aucun moyen de les vérifier avant l’entretien
                  </p>
                </div>
                <div className="space-y-4">
                  <p>
                    <span className="font-bold">
                      Vous êtes un candidat en recherche d’emploi
                    </span>{" "}
                    … Démarquez vous et trouvez votre job même depuis chez vous
                    …
                  </p>
                  <p>
                    Le CV Vidéo est une manière originale de se présenter : Il
                    est assez difficile de saisir la personnalité d’une personne
                    simplement en lisant un texte bref sur une feuille de
                    papier. Grâce au CV vidéo, il est possible de véritablement
                    illustrer votre créativité et votre originalité.
                  </p>
                  <p>
                    Un CV Vidéo permet de se démarquer des autres candidats :
                    Réaliser un CV vidéo vous donne la chance de montrer votre
                    véritable personnalité et votre dynamisme. Cela peut aussi
                    vous aider à vous dépeindre comme un leader et ainsi marquer
                    l’esprit des recruteurs, car vous avez le courage d’essayer
                    quelque chose de différent.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Section: Design Block */}
    </div>
  );
};

export default FaqSection;
