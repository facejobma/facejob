"use client";
import { FC, FormEvent, useState } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";

interface SignupFormCandidatProps {
  onNextStep: () => void;
}

const SignupFormCandidate: FC<SignupFormCandidatProps> = ({ onNextStep }) => {
  const [first_name, setFirstName] = useState("");
  const [nom, setNom] = useState("");
  const [tel, setTel] = useState("");
  const [sex, setSex] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const formData = {
      first_name,
      nom,
      tel,
      sex,
      email,
      password,
      passwordConfirm,
      acceptTerms,
    };

    if (!validateEmail(email)) {
      toast.error("email invalide");
      return;
    }

    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_URL + "/api/auth/candidate/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        // const responseData = await response.json();
        // const userId = responseData.user_id;

        toast.success("Votre compte a été créé avec succès !");

        onNextStep();
      } else {
        const errorData = await response.json();
        toast.error("L’enregistrement a échoué!");
        console.error("Registration failed:", errorData);
      }
    } catch (error) {
      toast.error("Error during registration!");
      console.error("Error during registration:", error);
    }
  }

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return !emailRegex.test(value);
  };

  const validatePassword = (value: string) => {
    return value.length < 8;
  };

  return (
    <div className="flex flex-col items-center font-default rounded-lg border border-newColor p-4 max-w-xl mx-auto">
      <h2 className="text-3xl font-semibold text-second my-2 py-4 mb-4 text-center">
        Créez votre compte et trouvez le job idéal
      </h2>
      <form
        className="flex flex-col space-y-6 my-4 w-full"
        onSubmit={async (e) => {
          e.preventDefault();
          await handleSubmit(e);
        }}
      >
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col space-y-2 md:flex-row md:space-x-4 md:space-y-0">
            <input
              required={true}
              type="text"
              placeholder="Prenom"
              value={first_name}
              onChange={(e) => setFirstName(e.target.value)}
              className="px-4 py-2 rounded border border-gray w-full md:w-1/2"
            />
            <input
              required={true}
              type="text"
              placeholder="Nom"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="px-4 py-2 rounded border border-gray w-full md:w-1/2"
            />
          </div>
          <input
            required={true}
            type="tel"
            placeholder="Tel"
            value={tel}
            onChange={(e) => {
              setTel(e.target.value);
            }}
            className="px-4 py-2 rounded border border-gray w-full"
          />
          <input
            required={true}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            className="px-4 py-2 rounded border border-gray w-full"
          />
          <input
            required={true}
            type="password"
            placeholder="Mot de passe (8 caractères ou plus)"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              validatePassword(e.target.value);
            }}
            className="px-4 py-2 rounded border  border-gray w-full"
          />
          <input
            required={true}
            type="password"
            placeholder="Confirmer le mot de passe"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            className="px-4 py-2 rounded border border-gray w-full"
          />
        </div>

        {/* <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between"> */}
        <div className="flex flex-row space-x-4 justify-center">
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="hidden"
              name="sex"
              value="Femme"
              checked={sex === "Femme"}
              onChange={() => setSex("Femme")}
            />
            <div
              className={`w-5 h-5 border-2 rounded ${
                sex === "Femme"
                  ? "bg-primary border-primary"
                  : "border-gray-300"
              }`}
            ></div>
            <span className="ml-2 text-gray-700">Femme</span>
          </label>

          <label className="inline-flex items-center">
            <input
              type="radio"
              className="hidden"
              name="sex"
              value="Homme"
              checked={sex === "Homme"}
              onChange={() => setSex("Homme")}
            />
            <div
              className={`w-5 h-5 border-2 rounded ${
                sex === "Homme"
                  ? "bg-primary border-primary"
                  : "border-gray-300"
              }`}
            ></div>
            <span className="ml-2 text-gray-700">Homme</span>
          </label>
        </div>

        <div className="flex space-x-2" style={{ width: "500px" }}>
          <input
            required={true}
            type="checkbox"
            id="termsCheckbox"
            className={`rounded border border-gray-300`}
            onClick={() => {
              setAcceptTerms((prv) => !prv);
            }}
          />
          <label
            htmlFor="termsCheckbox"
            className="text-gray-500 font-normal text-sm"
          >
            Oui, je comprends et j'accepte{" "}
            <Link href="/termes/entreprise" className="text-primary">
              les conditions d'utilisation de facejob.
            </Link>
          </label>
        </div>
        {/* </div> */}
        {/* <div className="my-2"> */}
        <button
          type="submit"
          className="py-2 px-20 rounded-full font-medium text-base text-white bg-primary"
        >
          créer mon compte
        </button>
        <p className="font-normal my-2 mx-32 text-second">
          Vous avez déjà un compte ?{" "}
          <Link href="/auth/login-candidat" className="text-primary">
            se connecter
          </Link>
        </p>
        {/* </div> */}
      </form>
    </div>
  );
};
export default SignupFormCandidate;
