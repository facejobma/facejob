"use client";
import { FormEvent, useState } from "react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/router";

const LoginForm = (props: { loginFor: "candidate" | "enterprise" }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      return toast.error("Veuillez remplir tous les champs");
    }

    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_URL +
          `/api/auth/${props.loginFor}/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      console.log(response);

      if (!response.ok) {
        toast.error("Email ou mot de passe ne sont pas valides");
        return;
      }

      console.log("Logged in successfully");
      toast.success("connecté avec succès");
      router.push("/dashboard");
    } catch (error: any) {
      console.error(error);
      toast.error(
        error.message || "Une erreur s’est produite lors de la connexion"
      );
    }
  };

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError("L'adresse email invalide");
    } else {
      setEmailError("");
    }
  };

  const validatePassword = (value: string) => {
    if (value.length < 8) {
      setPasswordError("Le mot de passe doit comporter au moins 8 caractères");
    } else {
      setPasswordError("");
    }
  };

  return (
    <div className="flex flex-col items-center rounded-lg border border-newColor p-4 font-default max-w-md mx-auto md:max-w-2xl">
      {" "}
      <h2 className="text-2xl font-semibold text-second my-2 py-4 mb-4 text-center">
        Inscrivez-vous pour trouver un travail que vous aimez
      </h2>
      <div className="mt-4 space-y-4">
        <button
          onClick={() => {}}
          className="w-full py-2 rounded-full font-medium text-base bg-primary-3 text-white"
        >
          Continuer avec Google
        </button>
        <button
          onClick={() => {}}
          className="w-full py-2 rounded-full font-medium text-base bg-primary-3 text-white"
        >
          Continuer avec Linkedin
        </button>
      </div>
      <p className="my-2 text-gray-500 font-medium text-center">Ou</p>
      <form className="flex flex-col space-y-4 w-full" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            validateEmail(e.target.value);
          }}
          className={`w-full px-4 py-2 rounded border border-gray ${
            emailError ? "border-red-500" : ""
          }`}
        />
        {emailError && <p className="text-red-500 text-sm">{emailError}</p>}
        <input
          type="password"
          placeholder="Mot de passe (8 caractères ou plus)"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            validatePassword(e.target.value);
          }}
          className={`w-full px-4 py-2 rounded border border-gray ${
            passwordError ? "border-red-500" : ""
          }`}
        />
        {passwordError && (
          <p className="text-red-500 text-sm">{passwordError}</p>
        )}
        <p className="text-base text-second text-center">
          <span className="mx-1">Oublié votre</span>
          <Link href="/auth/forget-password" className="text-primary">
            mot de passe?
          </Link>
        </p>
        <button
          type="submit"
          className="w-full py-2 rounded-full font-medium text-base text-white bg-primary"
        >
          se connecter
        </button>
        <p className="my-2 text-second text-center">
          Je n’ai pas de compte ?{" "}
          <Link
            href={`/auth/signup-${props.loginFor}`}
            className="text-primary"
          >
            s'inscrire
          </Link>
        </p>
      </form>
    </div>
  );
};

export default LoginForm;
