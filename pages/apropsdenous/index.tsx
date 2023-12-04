import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";

export default function () {
    return (
        <div className="relative overflow-x-hidden font-default bg-gray-100">
            <NavBar/>
            <main className="container mx-auto p-10 md:p-28 bg-white rounded-md shadow-lg">
                <section className="mb-6">
                    <h1 className="text-3xl font-bold mb-8 border-b-2 border-primary pb-2">
                        À Propos de nous
                    </h1>
                    <p className="text-third text-start font-default font-medium text-base md:text-lg lg:text-xl mt-8 md:mt-8 px-5 md:px-1 py-2 md:py-2">
                        Notre philosophie est simple : Offrir à toutes les entreprises, à
                        tous les chercheurs d’emploi la chance de s’entrecroiser, de se
                        connecter de la manière la plus facile que jamais, la plus efficace
                        que jamais.
                    </p>
                    <p className="text-third text-start font-default font-medium text-base md:text-lg lg:text-xl mt-8 md:mt-3 px-5 md:px-1 py-2 md:py-2">
                        Pendant des années nous avons écouté les besoins, recueilli les
                        confidences, cherché des solutions aux problèmes du recrutement … et
                        avons découvert que la plus simple étape consistant à
                        l’entrecroisement entre les entreprises et les chercheurs d’emploi,
                        était souvent la plus fondamentale mais souvent la plus négligée.
                    </p>
                    <p className="text-third text-start font-default font-medium text-base md:text-lg lg:text-xl mt-8 md:mt-3 px-5 md:px-1 py-2 md:py-2">
                        De cette conviction forte est née une idée, celle de mettre le
                        Digital au service de cet entrecroisement. Nous avons lancé Facejob
                        en 2022 en nous focalisant uniquement sur cette plateforme et en
                        apportant un positionnement unique sur le marché marocain.
                    </p>
                    <p className="text-third text-start font-default font-medium text-base md:text-lg lg:text-xl mt-8 md:mt-3 px-5 md:px-1 py-2 md:py-2">
                        Inspiré de la force du social media, facejob introduit au Maroc le
                        concept du CV-vidéo. Les recruteurs, par souci d’efficacité et de
                        gain de temps, hésitent souvent à convoquer certains profils en
                        entretien et passent donc à côté du candidat idéal pour le poste.
                    </p>
                    <p className="text-third text-start font-default font-medium text-base md:text-lg lg:text-xl mt-8 md:mt-3 px-5 md:px-1 py-2 md:py-2">
                        Pour les candidats, le CV papier est perçu comme réducteur et n’est
                        pas vraiment le reflet de soi-même, le candidat a donc envie de
                        déclencher le « feeling ». Le CV vidéo ajoute de l’humain et montre
                        plus sur la façon d’être et favorise la rapidité dans la sélection
                        et dans la rencontre.
                    </p>
                    <p className="text-third text-start font-default font-medium text-base md:text-lg lg:text-xl mt-8 md:mt-3 px-5 md:px-1 py-2 md:py-2">
                        Notre objectif est de faire apparaître les chercheurs d’emploi comme
                        s’ils rencontraient le recruteur in vivo dans des conditions
                        optimales.
                    </p>
                </section>
            </main>
            <Footer/>
        </div>
    );
}
