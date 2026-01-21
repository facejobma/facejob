"use client";
import { FC, FormEvent, useState } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import google from "@/public/svg/google.svg";
import Image from "next/image";

interface SignupFormCandidatProps {
  onNextStep: () => void;
}

const SignupFormCandidate: FC<SignupFormCandidatProps> = ({ onNextStep }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [tel, setTel] = useState("");
  const [sex, setSex] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) {
      toast.error("Veuillez entrer une adresse email.");
      return false;
    }

    if (!emailRegex.test(value)) {
      toast.error("Veuillez entrer une adresse email valide.");
      return false;
    }
    return true;
  };

  const validatePassword = (value: string) => {
    if (value.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères.");
      return false;
    }
    return true;
  };

  const validateFields = () => {
    let isValid = true;

    if (!firstName) {
      toast.error("Veuillez entrer votre prénom.");
      isValid = false;
    }
    if (!lastName) {
      toast.error("Veuillez entrer votre nom.");
      isValid = false;
    }
    if (!tel) {
      toast.error("Veuillez entrer votre numéro de téléphone.");
      isValid = false;
    }
    if (!sex) {
      toast.error("Veuillez choisir votre sexe.");
      isValid = false;
    }
    if (!validateEmail(email)) {
      isValid = false;
    }

    if (!validatePassword(password)) {
      isValid = false;
    }

    if (password !== passwordConfirm) {
      toast.error("Les mots de passe ne correspondent pas.");
      isValid = false;
    }
    if (!acceptTerms) {
      toast.error("Veuillez accepter les conditions d'utilisation.");
      isValid = false;
    }

    return isValid;
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!validateFields()) {
      return;
    }

    const formData = {
      firstName,
      lastName,
      tel,
      sex,
      email,
      password,
      passwordConfirm,
      acceptTerms,
    };

    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_URL + "/api/auth/candidate/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        },
      );

      if (response.ok) {
        const responseData = await response.json();
        const userId = responseData.user_id;

        sessionStorage.setItem("userId", userId);

        toast.success("Votre compte a été créé avec succès !");

        onNextStep();
      } else {
        const errorData = await response.json();
        toast.error("L’enregistrement a échoué! email déjà utilisé");
        console.error("Registration failed:", errorData);
      }
    } catch (error) {
      toast.error("Error during registration!");
      console.error("Error during registration:", error);
    }
  }

  return (
    <div className="flex flex-col items-center font-default rounded-lg border border-newColor p-4 max-w-xl mx-auto">
      <h2 className="text-3xl font-semibold text-second my-2 py-4 mb-4 text-center">
        Créez votre compte et trouvez le job idéal
      </h2>
      <div className="mt-4 grid space-y-4">
        <button
          type="submit"
          className="group h-12 px-20 border-2 border-gray-300 rounded-full transition duration-300 
          hover:border-green-200 focus:bg-blue-50 active:bg-blue-100"
          // onClick={handleGoogleLogin}
        >
          <div className="relative flex items-center space-x-10 justify-center">
            <Image
              src={google}
              className="absolute left-0 w-5"
              alt="google logo"
            />
            <span className="block w-max font-semibold tracking-wide text-gray-700 text-sm transition duration-300 group-hover:text-green-700 sm:text-base">
              Continuer avec Google
            </span>
          </div>
        </button>
        <button
          type="submit"
          className="group h-12 px-20 border-2 border-gray-300 rounded-full transition duration-300 
      hover:border-green-200 focus:bg-blue-50 active:bg-blue-100"
          // onClick={handleLinkedinLogin}
        >
          <div className="relative flex items-center space-x-10 justify-center">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png"
              alt="LinkedIn logo"
              className="absolute left-0 w-5"
            />
            <span className="block w-max font-semibold tracking-wide text-gray-700 text-sm transition duration-300 group-hover:text-green-700 sm:text-base">
              Continuer avec LinkedIn
            </span>
          </div>
        </button>
      </div>
      <div className="flex items-center justify-center space-x-2 my-5">
        <span className="h-px w-16 bg-gray-200"></span>
        <span className="text-gray-400 font-normal">ou</span>
        <span className="h-px w-16 bg-gray-200"></span>
      </div>
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
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="px-4 py-2 rounded border border-gray w-full md:w-1/2"
            />
            <input
              required={true}
              type="text"
              placeholder="Nom"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="px-4 py-2 rounded border border-gray w-full md:w-1/2"
            />
          </div>
          <input
            required={true}
            type="tel"
            placeholder="Téléphone"
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
              value="female"
              checked={sex === "female"}
              onChange={() => setSex("female")}
            />
            <div
              className={`w-5 h-5 border-2 rounded ${
                sex === "female"
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
              value="male"
              checked={sex === "male"}
              onChange={() => setSex("male")}
            />
            <div
              className={`w-5 h-5 border-2 rounded ${
                sex === "male"
                  ? "bg-primary border-primary"
                  : "border-gray-300"
              }`}
            ></div>
            <span className="ml-2 text-gray-700">Homme</span>
          </label>
        </div>

        <div className="flex flex-col space-y-4">
          <div className="flex flex-row space-x-4 justify-center">
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
              <Link href="/termes/candidats" className="text-primary">
                les conditions d'utilisation de facejob.
              </Link>
            </label>
          </div>
        </div>
        {/* <div className="my-2"> */}
        <button
          type="submit"
          className="py-2 px-20 rounded-full font-medium text-base text-white bg-primary"
        >
          créer mon compte
        </button>
        <p className="font-normal my-2 mx-16 text-second">
          Vous avez déjà un compte ?{" "}
          <Link href="/auth/login-candidate" className="text-primary">
            se connecter
          </Link>
        </p>
        {/* </div> */}
      </form>
    </div>
  );
};
export default SignupFormCandidate;
