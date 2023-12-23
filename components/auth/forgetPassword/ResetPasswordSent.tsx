import Link from "next/link";
import emailSent from "../../../public/images/reply.png";
import Image from "next/image";

const ResetPasswordSent = () => {
  return (
    <div className="flex flex-col mb-6 items-center rounded-lg border border-newColor p-4 font-default max-w-lg mx-auto md:max-w-2xl">
      <Image
        src={emailSent}
        alt="google"
        width={90}
        height={90}
        className="mt-10 flex space-x-4"
        // style={{ width: "110px", height: "110px" }}
      />
      <h2 className="text-3xl font-semibold text-second my-2 py-4 mb-4">
        Email envoyé!
      </h2>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div
        >
          <p className="text-secondary px-4 ">
            Nous avons envoyé un e-mail à votre adresse e-mail enregistrée.
            Veuillez suivre les instructions fournies dans l'e-mail pour mettre
            à jour votre mot de passe. Si vous ne souhaitez pas modifier votre
            mot de passe pour le moment, vous pouvez simplement choisir de vous
            connecter.
          </p>
        </div>
      </div>

      <button
        type="submit"
        className="py-2 px-8 m-12 rounded-full font-medium text-base text-white bg-primary"
      >
        <Link href="/">
          <span>Accueil</span>
        </Link>
      </button>
    </div>
  );
};

export default ResetPasswordSent;
