import NavBar from "../../components/NavBar";

export default function () {
  return (
    <div className="relative overflow-x-hidden font-default bg-gray-100">
      <NavBar />
      <main className="container mx-auto p-10 md:p-24 bg-white rounded-md shadow-lg">
        <section className="mb-6">
          <h1 className="text-3xl font-bold mb-8 border-b-2 border-primary pb-2">
            Candidats
          </h1>
          <p className="text-third text-start font-default font-medium text-base md:text-lg lg:text-xl mt-8 md:mt-4 px-5 md:px-1 py-2 md:py-4">
            Vous venez de créer votre espace personnel, êtes dans l’attente de
            votre première mission ou êtes collaborateur (régulier ou non) de
            notre entreprise et nous vous en remercions.
          </p>
          <p className="text-third text-start font-default font-medium text-base md:text-lg lg:text-xl mt-8 md:mt-4 px-5 md:px-1 py-2 md:py-4">
            Dans le cadre de notre activité, afin de proposer le meilleur niveau
            de service à nos clients et d’assurer le suivi personnalisé de vos
            missions et de votre carrière, nous sommes amenés à collecter des
            données personnelles vous concernant.
          </p>
          <p className="text-third text-start font-default font-medium text-base md:text-lg lg:text-xl mt-8 md:mt-4 px-5 md:px-1 py-2 md:py-4">
            Au sein de notre entreprise, la protection de ces données est un
            enjeu majeur et nous avons particulièrement à cœur de protéger votre
            vie privée. Dans cette optique et conformément à la réglementation
            en vigueur sur la protection des données personnelles, nous avons
            mis en place la présente notice, destinée à vous expliquer le
            traitement que nous faisons de vos données personnelles, les
            dispositifs que nous mettons en place pour en assurer la sécurité et
            vos droits en la matière.
          </p>
          <p className="text-third text-start font-default font-medium text-base md:text-lg lg:text-xl mt-8 md:mt-4 px-5 md:px-1 py-2 md:py-4">
            Nous vous informons que dans le cadre du présent document, « nous »
            désigne la société facejob.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-bold mb-4">
            1. Quelles sont les informations personnelles vous concernant que
            nous pouvons être amenés à collecter et à traiter ?
          </h2>
          <p className="text-third text-start font-default font-medium text-base md:text-lg lg:text-xl mt-8 md:mt-4 px-5 md:px-1 py-2 md:py-4">
            Dès notre premier contact, nous sommes amenés à collecter et traiter
            certaines informations personnelles vous concernant :
          </p>
          <ul className="list-disc pl-6 mb-4 text-third font-default">
            <li>
              Données d’identification et de connexion si vous nous contactez en
              ligne, étant précisé que vos identifiants et mots de passe sont
              strictement personnels et que vous vous engagez à les conserver et
              à ne pas les communiquer
            </li>
            <li>
              Correspondance éventuelle et dossier de candidature « cv-vidéo »
            </li>
          </ul>

          <p className="text-third text-start font-default font-medium text-base md:text-lg lg:text-xl mt-8 md:mt-4 px-5 md:px-1 py-2 md:py-4">
            Pour la gestion de votre candidature, de votre carrière et / ou dans
            le cadre de l’exécution de votre mission / contrat, nous ou nos
            partenaires commerciaux pouvons avoir à traiter des données
            relatives à votre vie professionnelle et à votre vie personnelle,
            telles que (liste non exhaustive) :
          </p>

          <ul className="list-disc pl-6 mb-4 text-third font-default">
            <li>
              Nom(s), prénom(s), date et lieu de naissance, copie du ou des
              document(s) prouvant votre identité, numéro de sécurité sociale
            </li>
            <li>
              Informations de genre et de nationalité et, le cas échéant, copie
              de tout document attestant de votre droit de travailler
            </li>
            <li>
              Tout commentaire à votre sujet émanant de notre personnel ou de
              tiers, uniquement s’il est utile à la gestion de votre dossier et
              strictement limité à cette fin
            </li>
            <li>Photographie(s)</li>
            <li>Coordonnées personnelles et bancaires</li>
            <li>Informations de nature fiscale</li>
            <li>
              Informations relatives à vos ayants droit et parents proches, et
              notamment les coordonnées de la personne à contacter en cas
              d’accident
            </li>
            <li>
              Données relatives à vos qualifications, permis de conduire,
              informations mentionnées dans le CV et, le cas échéant, résultats
              des tests, entretiens et évaluations auxquels vous pourriez être
              soumis
            </li>
            <li>
              Les coordonnées de vos anciens employeurs dans le cadre d’un
              éventuel contrôle de référence
            </li>
            <li>
              Informations relatives à votre salaire, vos frais et avantages
            </li>
            <li>Données relatives à votre visite médicale</li>
            <li>
              Informations relatives, le cas échéant, à vos déplacements dans le
              cadre de l’exécution de votre contrat / mission
            </li>
            <li>
              Informations relatives à votre présence, votre formation, vos
              évaluations ou les éventuelles mesures disciplinaires
            </li>
            <li>
              Informations relatives à l’exécution de votre mission ou contrat
              communiquées par nos clients
            </li>
            <li>
              Les photos et vidéos de votre participation à des formations ou
              évènements, sous réserve de votre accord exprès
            </li>
            <li>Votre Cv-vidéo que vous enregistrez sur notre plateforme</li>
            <li>
              Les résultats des éventuels sondages ou vos commentaires
              concernant notre société ou nos clients qui pourraient être
              recueillis à l’occasion de l’exécution d’une mission ou d’un
              contrat...
            </li>
          </ul>

          <p className="text-third text-start font-default font-medium text-base md:text-lg lg:text-xl mt-8 md:mt-4 px-5 md:px-1 py-2 md:py-4">
            Pour remplir nos obligations légales pour ce qui a trait à la santé,
            à la sécurité, au travail et à l’emploi des travailleurs handicapés,
            nous pouvons être amenés à collecter des informations personnelles
            particulièrement sensibles vous concernant telles que des données
            médicales ou relatives à un handicap éventuel.
          </p>
          <p className="text-third text-start font-default font-medium text-base md:text-lg lg:text-xl mt-8 md:mt-4 px-5 md:px-1 py-2 md:py-4">
            Par ailleurs, pour certains postes particuliers, nous pouvons être
            amenés à vous demander l’extrait de votre casier judiciaire.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold mb-6">
            2. Sur quel fondement juridique sont collectées vos données et par
            quel(s) moyen(s) ?
          </h2>
          <p className="text-third text-start font-default font-medium text-base md:text-lg lg:text-xl mt-8 md:mt-4 px-5 md:px-1 py-2 md:py-4">
            Conformément à la réglementation en vigueur, les traitements que
            nous faisons de vos données personnelles reposent sur l’un des
            fondements suivants :
          </p>
          <ul className="list-disc pl-6 mb-4 text-third font-default">
            <li>
              L’exécution d’un contrat auquel vous êtes partie ou l’exécution de
              mesures précontractuelles
            </li>
            <li>
              La satisfaction d’une obligation légale ou réglementaire à
              laquelle nous serions soumis
            </li>
            <li>
              La sauvegarde des intérêts vitaux d’une personne ou l’exécution
              d’une mission d’intérêt public
            </li>
            <li>
              La poursuite de nos intérêts légitimes, sous réserve de ne pas
              affecter vos propres intérêts et droits fondamentaux.
            </li>
          </ul>
          <p className="text-third text-start font-default font-medium text-base md:text-lg lg:text-xl mt-8 md:mt-4 px-5 md:px-1 py-2 md:py-4">
            Pour tout traitement complémentaire ou accessoire, nous pourrons
            recueillir votre consentement exprès préalable. Vos données sont
            collectées et traitées par nos équipes, mais nous pouvons également
            utiliser des systèmes et processus semi automatisés pour assurer un
            meilleur niveau de service.
          </p>
        </section>
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-6">
            3. A quelles fins collectons-nous et traitons-nous vos informations
            personnelles ?
          </h2>
          <p className="text-third text-start font-default font-medium text-base md:text-lg lg:text-xl mt-8 md:mt-4 px-5 md:px-1 py-2 md:py-4">
            Nous collectons et traitons vos données personnelles dans le cadre
            de l’exécution de nos services et en notre qualité d’employeur, aux
            fins de (liste non exhaustive) :
          </p>
          <ul className="list-disc pl-6 mb-4 text-third font-default">
            <li>Vous fournir un service personnalisé </li>
            <li>
              Évaluer vos compétences et votre profil et préciser le périmètre
              de vos recherches{" "}
            </li>
            <li>
              Faciliter le processus de candidature et disposer des informations
              nécessaires à votre sélection
            </li>
            <li>
              Vous informer sur les missions en cours ou à venir, les
              opportunités d’emplois en rapport avec votre profil, vos
              compétences, votre disponibilité et vos attentes
            </li>
            <li>Échanger avec vous par tous moyens de communication </li>
            <li>
              Vous aider sur le plan de la formation et vous informer sur les
              programmes et aides auxquelles vous pouvez prétendre
            </li>
            <li>Améliorer votre employabilité </li>
            <li>
              Favoriser l’insertion professionnelle de certaines catégories de
              personnes{" "}
            </li>
            <li>
              Établir vos contrats conformément aux exigences en vigueur,
              établir vos bulletins de salaire, effectuer les paiements
              correspondants et prélèvements éventuels
            </li>
            <li>Procéder à toutes les déclarations obligatoires </li>
            <li>
              Vous évaluer et assurer la gestion et le suivi de vos missions et
              / ou contrat(s){" "}
            </li>
            <li>Gérer les éventuels accidents ou incidents.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold mb-2">
            Nous pouvons également être amenés à traiter vos données
            personnelles dans le cadre des relations avec nos clients et nos
            partenaires commerciaux, notamment dans les circonstances suivantes
            :
          </h2>
          <ul className="list-disc pl-6 mb-4 text-third font-default">
            <li>
              Gestion de la relation commerciale avec nos clients et partenaires{" "}
            </li>
            <li>Contrôle du respect des procédures mises en place </li>
            <li>
              Évaluation de la satisfaction et de notre niveau de service{" "}
            </li>
            <li>Études, audits, statistiques à usage interne ou non </li>
            <li>
              Développement, amélioration et sécurisation de nos
              systèmes/processus.
            </li>
          </ul>
          <p className="text-third text-start font-default font-medium text-base md:text-lg lg:text-xl mt-8 md:mt-4 px-5 md:px-1 py-2 md:py-4">
            Enfin, plus généralement nous pouvons être amenés à utiliser
            certaines de vos données à caractère personnel pour :
          </p>
          <ul className="list-disc pl-6 mb-4 text-third font-default">
            <li>
              Satisfaire à l’ensemble de nos obligations légales, règlementaires
              et conventionnelles
            </li>
            <li>
              Gérer les éventuelles actions légales, assurer notre défense ou
              encore coopérer dans le cadre d’investigations menées par les
              autorités
            </li>
            <li>
              A des fins d’opérations de communication, pour vous informer sur
              les actualités de notre société et sur les éventuelles opérations
              évènementielles en cours.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold mb-2">
            4. A qui vos données personnelles peuvent-elles être communiquées ?
            Peut-il y avoir des transferts hors du Maroc ?
          </h2>
          <p className="text-third text-start font-default font-medium text-base md:text-lg lg:text-xl mt-8 md:mt-4 px-5 md:px-1 py-2 md:py-4">
            Dans le cadre de leur traitement et aux fins des objectifs présentés
            ci-dessus, nous vous informons que nous pouvons communiquer
            certaines de vos informations personnelles à des tiers.
          </p>

          <p className="text-third text-start font-default font-medium text-base md:text-lg lg:text-xl mt-8 md:mt-4 px-5 md:px-1 py-2 md:py-4">
            Ces tiers peuvent se trouver au Maroc, ou hors du Maroc.
          </p>

          <p className="text-third text-start font-default font-medium text-base md:text-lg lg:text-xl mt-8 md:mt-4 px-5 md:px-1 py-2 md:py-4">
            Les transferts hors du Maroc respectent strictement la
            réglementation applicable et sont effectués soit vers un pays
            reconnu comme « à protection adéquate » par le Maroc, soit dans le
            cadre de clauses contractuelles type adoptées par le Maroc, soit
            sous couvert de règles d’entreprise contraignantes.
          </p>

          <p className="text-third text-start font-default font-medium text-base md:text-lg lg:text-xl mt-8 md:mt-4 px-5 md:px-1 py-2 md:py-4">
            Nous nous efforçons d’assurer la protection de vos informations
            personnelles en toutes circonstances, aussi nous vous informons que
            vos données peuvent faire l’objet d’un transfert dans les cas et aux
            conditions ci-après détaillées.
          </p>

          <ul className="list-disc pl-6 mb-4 text-third font-default">
            <li>
              Vos données peuvent être transférées à toutes les autres sociétés
              du groupe facejob, au sein ou hors du Maroc. Le groupe facejob
              veille à ce que toutes ses filiales garantissent un bon niveau de
              protection de vos données personnelles.
            </li>
            <li>
              Vos données peuvent être transférées à certains de nos partenaires
              au sein ou hors du Maroc, dans les conditions susvisées.
            </li>
            <li>
              Vos données peuvent être transférées à nos clients pour les
              besoins de l’examen de votre candidature et/ou pour les besoins de
              l’exécution de votre mission ou contrat. Les transferts de vos
              informations personnelles dans ce cas sont encadrés par des
              clauses contractuelles mettant un certain nombre d’obligations en
              matière de protection et de sécurité de vos données à leur charge.
            </li>
            <li>
              Vos données peuvent être transférées aux organismes de droit
              public ou privé dans les cas prévus par la loi ou aux autorités si
              nous disposons d’une raison légitime.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold mb-2">
            5. Combien de temps sont conservées vos données personnelles ?
          </h2>
          <p className="text-third text-start font-default font-medium text-base md:text-lg lg:text-xl mt-8 md:mt-4 px-5 md:px-1 py-2 md:py-4">
            Nous sommes tenus de conserver les informations personnelles vous
            concernant pendant une durée suffisante à l’accomplissement des
            finalités développées en 2 et conformément aux dispositions légales
            et réglementaires.
          </p>

          <p className="text-third text-start font-default font-medium text-base md:text-lg lg:text-xl mt-8 md:mt-4 px-5 md:px-1 py-2 md:py-4">
            Les principes généraux en matière de durée de conservation sont les
            suivants :
          </p>

          <ul className="list-disc pl-6 mb-4 text-third font-default">
            <li>
              Si vous êtes candidat et que vous n’avez effectué aucune mission
              pour notre compte, vos données seront conservées pendant une durée
              maximale de 12 mois à compter du dernier contact.
            </li>
            <li>
              Si vous avez déjà effectué une ou plusieurs mission(s) pour notre
              compte, vos données demeureront accessibles à notre réseau pendant
              une durée maximale de 10 ans à compter de la fin de votre contrat,
              à moins qu’une période de conservation plus longue ne soit
              nécessaire en raison d’une exigence légale, y compris la nécessité
              d’engager une action en justice ou de s’en défendre. Par ailleurs,
              vos données dites « de reconstitution de carrière » seront
              conservées en archives pendant la durée nécessaire pour la
              reconstitution de votre carrière.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-bold mb-2">
            6. Quels sont vos droits sur vos données personnelles et comment les
            exercer ?
          </h2>
          <p className="text-third text-start font-default font-medium text-base md:text-lg lg:text-xl mt-8 md:mt-4 px-5 md:px-1 py-2 md:py-4">
            Conformément à la réglementation en vigueur, vous disposez d’un
            certain nombre de droits concernant vos informations personnelles :
          </p>

          <ul className="list-disc pl-6 mb-4 text-third font-default">
            <li>
              <strong>Droit d’accès et droit à la portabilité :</strong> vous
              pouvez accéder à tout moment à vos données personnelles via votre
              Espace Personnel sur notre site{" "}
              <a href="www.facejob.ma" className="text-blue-500 underline">
                www.facejob.ma
              </a>
              . Vous avez également le droit de demander à tout moment une copie
              de vos données à caractère personnel. En vertu du droit à la
              portabilité, ces données pourront être transmises sous format
              électronique.
            </li>
            <li>
              <strong>Droit de rectification :</strong> si vous pouvez démontrer
              que les informations personnelles que nous avons collectées à
              votre sujet sont erronées ou incomplètes, vous pouvez solliciter
              leur rectification, en ligne ou directement auprès du service
              traitant votre dossier.
            </li>
            <li>
              <strong>Droit d’opposition :</strong> sous réserve que le
              traitement de vos données personnelles repose sur notre intérêt
              légitime ou concerne des opérations de prospection, vous pouvez
              vous opposer à ce que les données vous concernant soient
              diffusées, transmises ou conservées.
            </li>
            <li>
              <strong>Droit à l’effacement / droit à l’oubli :</strong> sauf
              motifs légitimes et impérieux et sous réserve de nos obligations
              en matière de durée de conservation, vous pouvez à tout moment
              demander la suppression de vos données personnelles.
            </li>
            <li>
              <strong>Droit à la limitation de traitement :</strong> vous avez
              le droit d’obtenir la limitation du traitement de vos données
              personnelles si vous vous y êtes expressément opposé, si vous
              contestez l’exactitude de ces données, si vous démontrez que le ou
              les traitement(s) en question est/sont illicite(s), ou lorsque
              vous avez besoin de ces données pour la constatation, l’exercice
              ou la défense de vos droits en justice.
            </li>
            <li>
              <strong>Droit de définir des directives particulières :</strong>{" "}
              vous disposez du droit de définir des directives particulières
              applicables en cas de décès relatives à la conservation, à
              l’effacement et à la communication de vos données à caractère
              personnel.
            </li>
          </ul>

          <p className="text-third text-start font-default font-medium text-base md:text-lg lg:text-xl mt-8 md:mt-4 px-5 md:px-1 py-2 md:py-4">
            Pour l'exercice de ces droits, vous pouvez adresser votre demande :
          </p>

          <ul className="list-disc pl-6 mb-4 text-third font-default">
            <li>
              via{" "}
              <a
                href="mailto:facejob.contact@gmail.com"
                className="text-blue-500 underline"
              >
                facejob.contact@gmail.com
              </a>
              .
            </li>
            <li>ou par voie postale à facejob - Service Juridique.</li>
          </ul>

          <p className="text-third text-start font-default font-medium text-base md:text-lg lg:text-xl mt-8 md:mt-4 px-5 md:px-1 py-2 md:py-4">
            Nous nous réservons le droit, à l’occasion de l’exercice de l’un des
            droits susvisés, de procéder à une vérification de votre identité.
          </p>
          <p className="text-third text-start font-default font-medium text-base md:text-lg lg:text-xl mt-8 md:mt-4 px-5 md:px-1 py-2 md:py-4">
            Nous nous réservons le droit de modifier à tout moment la présente
            politique de gestion des données personnelles. Nous vous invitons à
            vous y référer dès que nécessaire et à vérifier régulièrement si des
            modifications ont pu y être apportées.
          </p>
        </section>

        {/* </div> */}
      </main>
    </div>
  );
}
