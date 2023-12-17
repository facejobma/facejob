"use client";
import { useState } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";

interface SignupFormCandidatProps {
  onNextStep: () => void;
}

const SignupFormEntreprise: React.FC<SignupFormCandidatProps> = ({
  onNextStep,
}) => {
  const [raisonSociale, setRaisonSociale] = useState("");
  const [tel, setTel] = useState("");
  // const [effectif, setEffectif] = useState("");
  // const [secteur, setSecteur] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const formData = {
      raisonSociale,
      tel,
      // secteur,
      email,
      password,
      passwordConfirm,
      acceptTerms,
    };
    if (!validateEmail(email)) {
      toast.error("email est invalide");
      return;
    }

    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_UR + "/api/auth/enterprise/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        const responseData = await response.json();
        const userId = responseData.user_id;

        sessionStorage.setItem("userId", userId);

        toast.success("Your account created successfuly!");

        onNextStep();
      } else {
        const errorData = await response.json();
        toast.error("Registration failed!");
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
      <div className="flex flex-col space-y-4 w-full">
        <button
          // onClick={() => ()}
          className="w-full py-2 md:px-36 rounded-full font-medium text-base bg-primary-2 text-white"
        >
          Continuer avec Google
        </button>
        <button
          // onClick={() => ()}
          className="w-full py-2 md:px-36 rounded-full font-medium text-base bg-primary-2 text-white"
        >
          Continuer avec Linkedin
        </button>
      </div>
      <p className="mx-4 my-2 text-gray-500 font-medium">Ou</p>
      <form
        className="flex flex-col space-y-6 my-4 w-full"
        onSubmit={async (e) => {
          e.preventDefault();
          await handleSubmit(e);
        }}
      >
        <input
          required={true}
          type="text"
          placeholder="Raison sociale"
          value={raisonSociale}
          onChange={(e) => setRaisonSociale(e.target.value)}
          className="px-4 py-2 rounded border border-gray w-full"
        />
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
          className="px-4 py-2 rounded border border-gray w-full"
        />
        <input
          required={true}
          type="password"
          placeholder="Confirmer le mot de passe"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          className="px-4 py-2 rounded border border-gray w-full"
        />
        <div className="flex flex-col space-y-4">
          <div className="flex flex-row space-x-4 justify-center">
            {/* ... (your existing code for terms checkbox) */}
          </div>
        </div>
        <button
          type="submit"
          className="py-2 px-20 rounded-full font-medium text-base text-white bg-primary"
        >
          créer mon compte
        </button>
        <p className="font-normal text-center my-2 md:mx-28 text-second">
          Vous avez déjà un compte ?{" "}
          <Link href="/auth/login-candidat" className="text-primary">
            se connecter
          </Link>
        </p>
      </form>
    </div>
  );
};

export default SignupFormEntreprise;
