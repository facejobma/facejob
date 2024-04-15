import Footer from "../../../components/Footer";
import NavBar from "../../../components/NavBar";
import Link from "next/link";

export default function Terms() {
  return (
    <div className="relative overflow-hidden font-default bg-optional1">
      <NavBar />
      <main className="container mx-auto p-10 md:p-24 md:px-32 bg-white rounded-md shadow-lg">
        <section className="mb-8">
          <h1 className="text-3xl font-bold mb-4 border-b-2 text-secondary border-primary  pb-4">
            Partenaires commerciaux & prospects
          </h1>
          <p className="text-third text-start font-default font-medium text-base md:text-lg lg:text-xl mt-8 md:mt-4 px-5 md:px-1 py-2 md:py-4">
            Au sein de notre entreprise, la protection des données personnelles
            est un enjeu majeur. La présente politique présente les conditions
            dans lesquelles nous collectons et traitons les données personnelles
            de nos interlocuteurs ou contacts au sein des entreprises avec
            lesquelles nous sommes en relation.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 border-b-2 text-secondary border-gray-300 pb-4">
            A. Définition
          </h2>
          <p className="text-third text-start font-default font-medium text-base md:text-lg lg:text-xl mt-8 md:mt-4 px-5 md:px-1 py-1 md:py-1">
            Dans le cadre du présent document, « nous » désigne la société
            “facejob”.
          </p>
          <p className="text-third text-start font-default font-medium text-base md:text-lg lg:text-xl mt-8 md:mt-2 px-5 md:px-1 py-2 md:py-4">
            Le terme « Données Personnelles » fait référence à toute information
            permettant d’identifier directement ou indirectement l’un de nos
            contacts / interlocuteurs (personne physique) au sein des
            entreprises avec lesquelles nous sommes en relation.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 border-b-2 text-secondary border-gray-300 pb-4">
            B. Quelles sont les Données Personnelles que nous pouvons être
            amenés à collecter et à traiter ?
          </h2>
          <p className="text-third text-start font-default font-medium text-base md:text-lg lg:text-xl mt-8 md:mt-4 px-5 md:px-1 py-1 md:py-1">
            Sont principalement traitées les catégories de Données Personnelles
            suivantes (liste non exhaustive) :
          </p>
          <ul className="list-disc pl-6 mb-4 text-third font-default">
            <li className="font-default text-third">
              Données d’identification et de contact : nom, prénom, numéro
              client, adresse, email, numéro de téléphone...
            </li>
            <li className="font-default text-third">
              Données dites « techniques » : données d’identification, de
              connexion...
            </li>
            <li className="font-default text-third">
              Données personnelles déclaratives ou relatives à la vie
              professionnelle
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 border-b-2 text-secondary border-gray-300 pb-4">
            C. Sur quel fondement juridique sont collectées ces Données
            Personnelles et par quel(s) moyen(s) ?
          </h2>
          <p className="text-third text-start font-default font-medium text-base md:text-lg lg:text-xl mt-8 md:mt-4 px-5 md:px-1 py-1 md:py-1">
            Conformément à la réglementation en vigueur, les traitements que
            nous faisons des Données Personnelles reposent sur la poursuite de
            nos intérêts légitimes, sous réserve de ne pas affecter les intérêts
            et droits fondamentaux des personnes concernées par les traitements.
          </p>
          <p className="text-third text-start font-default font-medium text-base md:text-lg lg:text-xl mt-8 md:mt-4 px-5 md:px-1 py-1 md:py-1">
            Pour tout traitement complémentaire ou accessoire, nous pourrons
            recueillir le consentement exprès préalable des personnes
            concernées. Les Données Personnelles sont collectées et traitées par
            nos équipes, mais nous pouvons également utiliser des systèmes et
            processus semi-automatisés pour assurer un meilleur niveau de
            service.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-bold mb-4 border-b-2 text-secondary border-gray-300 pb-4">
            D. A quelles fins collectons-nous et traitons-nous les Données
            Personnelles ?
          </h2>
          <p className="text-third text-start font-default font-medium text-base md:text-lg lg:text-xl mt-8 md:mt-4 px-5 md:px-1 py-1 md:py-1">
            Nous collectons et traitons les Données Personnelles dans le cadre
            de nos activités et de l’exécution des services que nous proposons,
            aux fins de (liste non exhaustive) :
          </p>
          <ul className="list-disc pl-6 mb-4 font-default text-third">
            <li>Fournir un service personnalisé </li>
            <li>
              Établir tout contrat ou toute déclaration en lien avec nos
              activités, conformément à la réglementation en vigueur
            </li>
            <li>Délivrer nos services conformément à vos demandes </li>
            <li>
              Créer des contacts entre vous et nos candidats, dans le cadre de
              notre activité et/ou de l’exécution de la mission / du contrat
            </li>
            <li>Échanger avec vous par tous moyens de communication </li>
            <li>Gérer et assurer le suivi des missions / contrats </li>
            <li>Contrôler le respect des procédures mises en place </li>
            <li>Évaluer la satisfaction et notre niveau de service.</li>
          </ul>
        </section>
        <section className="mb-6">
        <p className="text-third text-start font-default font-medium text-base md:text-lg lg:text-xl mt-8 md:mt-4 px-5 md:px-1 py-1 md:py-1">
            {" "}
            Plus généralement nous pouvons être amenés à utiliser certaines
            Données Personnelles pour (liste non exhaustive) :
          </p>
          <ul className="list-disc pl-6 mb-4 font-default text-third">
            <li>
              Gérer et assurer le suivi de nos relations commerciales et de nos
              relations avec nos contacts / interlocuteurs
            </li>
            <li>
              Mener des études, audits, ou réaliser des statistiques à usage
              interne ou non{" "}
            </li>
            <li>Développer, améliorer et sécuriser nos systèmes/processus </li>
            <li>
              Assurer la gestion de services proposés par des tiers avec
              lesquels nous avons un lien contractuel (plateformes,
              dématérialisation, externalisation de services...)
            </li>
            <li>
              A des fins d’opérations marketing, de publicité ou de
              communication pour vous informer sur les actualités de notre
              société, sur les éventuelles opérations évènementielles en cours
            </li>
            <li>
              Gérer les opt-in, opt-out, newsletter et demandes de désabonnement{" "}
            </li>
            <li>
              Satisfaire à l’ensemble de nos obligations légales, règlementaires
              et conventionnelles
            </li>
            <li>
              Gérer les éventuelles actions légales, assurer notre défense ou
              encore coopérer dans le cadre d’investigations menées par les
              autorités.
            </li>
          </ul>
        </section>
        <section className="mb-6">
          <h2 className="text-2xl font-bold mb-4 border-b-2 text-secondary border-gray-300 pb-4">
            E. Qui est responsable du traitement des Données Personnelles ?
          </h2>
          <p className="text-third text-start font-default font-medium text-base md:text-lg lg:text-xl mt-8 md:mt-4 px-5 md:px-1 py-1 md:py-1">
            Nous sommes responsables du traitement que nous faisons des Données
            Personnelles collectées et du respect des obligations posées par la
            réglementation applicable.
          </p>
          <p className="text-third text-start font-default font-medium text-base md:text-lg lg:text-xl mt-8 md:mt-4 px-5 md:px-1 py-1 md:py-1">
            Les entreprises avec lesquelles nous sommes en relation sont seules
            responsables de l’information, par tout moyen, des personnes
            concernées concernant l’existence et les finalités du traitement des
            Données Personnelles que nous pouvons être amenés à réaliser.
          </p>
        </section>
        <section className="mb-6">
          <h2 className="text-2xl font-bold mb-4 border-b-2 text-secondary border-gray-300 pb-4">
            F. A qui les Données Personnelles peuvent-elles être communiquées ?
            Peut-il y avoir des transferts hors du Maroc ?
          </h2>
          <p className="text-third text-start font-default font-medium text-base md:text-lg lg:text-xl mt-8 md:mt-4 px-5 md:px-1 py-1 md:py-1">
            Dans le cadre des traitements présentés ci-dessus, nous pouvons
            communiquer les Données à des tiers.
          </p>
          <p className="text-third text-start font-default font-medium text-base md:text-lg lg:text-xl mt-8 md:mt-4 px-5 md:px-1 py-1 md:py-1">
            Ces tiers peuvent se trouver au Maroc (auquel cas ils sont également
            soumis à la même réglementation marocaine en matière de données
            personnelles) ou hors du Maroc.
          </p>
          <p className="text-third text-start font-default font-medium text-base md:text-lg lg:text-xl mt-8 md:mt-4 px-5 md:px-1 py-1 md:py-1">
            Les transferts hors du Maroc respectent strictement la
            réglementation applicable et sont effectués soit vers un pays
            reconnu comme « à protection adéquate », soit dans le cadre de
            clauses contractuelles type adoptées par le Maroc, soit sous couvert
            de règles d’entreprise contraignantes.
          </p>
          <p className="text-third text-start font-default font-medium text-base md:text-lg lg:text-xl mt-8 md:mt-4 px-5 md:px-1 py-1 md:py-1">
            Davantage d’informations sur la protection des données sont
            disponibles sur le site internet de la CNDP (
            <Link
              href="https://www.cndp.ma"
              className="text-blue-500"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://www.cndp.ma
            </Link>
            ).
          </p>
          <p className="text-third text-start font-default font-medium text-base md:text-lg lg:text-xl mt-8 md:mt-4 px-5 md:px-1 py-1 md:py-1">
            Nous nous efforçons d’assurer la protection des Données Personnelles
            en toutes circonstances, aussi nous rappelons que ces données
            peuvent faire l’objet d’un transfert dans les cas et aux conditions
            ci-après détaillées.
          </p>
          <ul className="list-disc pl-6 mb-4 font-default text-third">
            <li>
              Les Données peuvent être transférées en interne, au personnel
              habilité de nos services. Tous les collaborateurs de facejob sont
              soumis à une obligation de confidentialité.
            </li>
            <li>
              Les Données peuvent être transférées à toutes les autres sociétés
              du groupe facejob, au sein ou hors du Maroc. facejob veille à ce
              que toutes ses filiales garantissent un bon niveau de protection
              des données personnelles.
            </li>
            <li>
              Les Données peuvent être transférées à certains de nos partenaires
              au sein ou hors du Maroc, dans les conditions susvisées.
            </li>
            <li>
              Les Données peuvent être transférées aux organismes de droit
              public ou privé dans les cas prévus par la loi ou aux autorités si
              nous disposons d’une raison légitime.
            </li>
          </ul>
        </section>
        <section className="mb-6">
          <h2 className="text-2xl font-bold mb-4 border-b-2 text-secondary border-gray-300 pb-4">
            G. Combien de temps sont conservées vos Données Personnelles ?
          </h2>
          <p className="text-third text-start font-default font-medium text-base md:text-lg lg:text-xl mt-8 md:mt-4 px-5 md:px-1 py-1 md:py-1">
            Les Données Personnelles seront conservées dans la mesure
            strictement nécessaire à l’exécution de nos obligations et le temps
            nécessaire pour atteindre les finalités pour lesquelles les Données
            ont été recueillies, conformément à la réglementation applicable.
          </p>
          <p className="text-third text-start font-default font-medium text-base md:text-lg lg:text-xl mt-8 md:mt-4 px-5 md:px-1 py-1 md:py-1">
            Les Données Personnelles de nos contacts ou interlocuteurs chez nos
            partenaires commerciaux seront conservées pendant une durée maximale
            de 10 ans à compter de la cessation des relations commerciales, à
            moins qu’une période de conservation plus longue ne soit nécessaire
            en raison d’une exigence légale, y compris la nécessité d’engager
            une action en justice ou de s’en défendre.
          </p>
        </section>
        <section className="mb-6">
          <h2 className="text-2xl font-bold mb-4 border-b-2 text-secondary border-gray-300 pb-4">
            H. De quels droits bénéficient les personnes concernées sur leurs
            Données et comment exercer ces droits ?
          </h2>
          <p className="text-third text-start font-default font-medium text-base md:text-lg lg:text-xl mt-8 md:mt-4 px-5 md:px-1 py-1 md:py-1">
            Conformément à la réglementation en vigueur, les personnes
            concernées par les traitements disposent d’un droit d’accès aux
            Données Personnelles, du droit à l’effacement des Données, ainsi que
            d’un droit de rectification, d’opposition et de limitation.
          </p>
          <p className="text-third text-start font-default font-medium text-base md:text-lg lg:text-xl mt-8 md:mt-4 px-5 md:px-1 py-1 md:py-1">
            Pour l&apos;exercice de ces droits, vous pouvez adresser votre demande :
          </p>
          <ul className="list-disc pl-6 mb-4 font-default text-third">
            <li>
              via{" "}
              <a
                href="mailto:facejob.contact@gmail.com"
                className="text-blue-500"
              >
                facejob.contact@gmail.com
              </a>
            </li>
            <li>ou par voie postale à facejob - Service Juridique</li>
          </ul>
          <p className="text-third text-start font-default font-medium text-base md:text-lg lg:text-xl mt-8 md:mt-4 px-5 md:px-1 py-1 md:py-1">
            Nous nous réservons le droit, à l’occasion de l’exercice de l’un des
            droits susvisés, de procéder à une vérification de votre identité.
          </p>
          <p className="text-third text-start font-default font-medium text-base md:text-lg lg:text-xl mt-8 md:mt-4 px-5 md:px-1 py-1 md:py-1">
            Nous nous réservons le droit de modifier à tout moment la présente
            politique de gestion des données personnelles. Il conviendra de s’y
            référer dès que nécessaire et de vérifier régulièrement si des
            modifications ont pu y être apportées (date d’entrée en vigueur sur
            la première page).
          </p>
        </section>

        {/* </div> */}
      </main>
      <Footer />
    </div>
  );
}
