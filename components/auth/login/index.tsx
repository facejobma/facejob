"use client";

import { FormEvent, useState } from "react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";
import google from "@/public/svg/google.svg";
import linkedin from "@/public/svg/linkedin.svg";
import { useRouter } from "next/navigation";
import { secureLogin } from "@/lib/auth";

const LoginForm = (props: { loginFor: "candidate" | "entreprise" }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const router = useRouter();

  const validateEmail = (value: string) => {
    if (!value) {
      toast.error("Veuillez entrer une adresse email.");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(value)) {
      toast.error("L’adresse mail est invalide.");
      return false;
    }
    return true;
  };

  const validatePassword = (value: string) => {
    if (!value) {
      toast.error("Veuillez entrer votre mot de passe.");
      return false;
    }
    if (value.length < 8) {
      toast.error("Le mot de passe doit comporter au moins 8 caractères.");
      return false;
    }
    return true;
  };

  const validateFields = () => {
    let isValid = true;

    if (!validateEmail(email)) {
      isValid = false;
    }
    if (!validatePassword(password)) {
      isValid = false;
    }
    return isValid;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateFields()) {
      return;
    }

    try {
      const apiVersion = process.env.NEXT_PUBLIC_API_VERSION || 'v1';
      const response = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_URL +
          `/api/${apiVersion}/auth/${props.loginFor}/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        },
      );

      if (!response.ok) {
        toast.error("Email ou mot de passe ne sont pas valides");
        return;
      }

      const userData = await response.json();
      console.log("Logged in successfully", userData.data);

      sessionStorage.setItem("user", JSON.stringify(userData.data));
      sessionStorage.setItem("userRole", props.loginFor === "candidate" ? "candidat" : "entreprise");

      const { token } = userData;

      Cookies.set("authToken", token, { expires: 7 });

      toast.success("connecté avec succès");

      if (props.loginFor === "candidate") {
        router.push("/dashboard/candidat");
      } else if (props.loginFor == "entreprise") {
        router.push("/dashboard/entreprise");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(
        error.message || "Une erreur s’est produite lors de la connexion",
      );
    }
  };

  const handleGoogleLogin = async () => {
    try {
      // Use secure role-specific endpoint
      const endpoint = props.loginFor === 'candidate' 
        ? '/api/v1/auth/candidate/google'
        : '/api/v1/auth/entreprise/google';
        
      const response = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_URL + endpoint,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Include cookies
        }
      );

      if (!response.ok) {
        toast.error("Erreur lors de la connexion avec Google");
        return;
      }

      const data = await response.json();

      sessionStorage.setItem("userRole", props.loginFor === "candidate" ? "candidat" : "entreprise");
      window.location.href = data.url;
    } catch (error: any) {
      console.error(error);
      toast.error("Une erreur s’est produite lors de la connexion");
    }
  };

  const handleLinkedinLogin = async () => {
    try {
      // Use secure role-specific endpoint
      const endpoint = props.loginFor === 'candidate' 
        ? '/api/v1/auth/candidate/linkedin'
        : '/api/v1/auth/entreprise/linkedin';
        
      console.log('🔐 LinkedIn OAuth - Starting secure flow:', {
        loginFor: props.loginFor,
        endpoint: endpoint,
        fullUrl: process.env.NEXT_PUBLIC_BACKEND_URL + endpoint
      });
        
      const response = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_URL + endpoint,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Include cookies
        }
      );

      console.log('🔐 LinkedIn OAuth - Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        console.error('❌ LinkedIn OAuth - Request failed:', {
          status: response.status,
          statusText: response.statusText
        });
        toast.error("Erreur lors de la connexion avec Linkedin");
        return;
      }

      const data = await response.json();
      
      console.log('🔐 LinkedIn OAuth - Redirect data:', {
        provider: data.provider,
        hasUrl: !!data.url,
        urlLength: data.url?.length
      });

      console.log('🔐 LinkedIn OAuth - Redirecting to LinkedIn...');
      window.location.href = data.url;
    } catch (error: any) {
      console.error(error);
      toast.error("Une erreur s’est produite lors de la connexion");
    }
  };

  return (
    <div className="flex flex-col items-center rounded-lg border border-newColor p-4 font-default max-w-md mx-auto md:max-w-2xl">
      <h2 className="text-2xl font-semibold text-second my-2 py-4 mb-4 text-center">
        {props.loginFor === "candidate"
          ? "Connectez-vous et trouvez le travail de vos rêves !"
          : "Connectez-vous à votre compte ou inscrivez-vous pour créer votre espace Entreprise"}
      </h2>
      <div className="mt-4 grid space-y-4">
        <button
          type="submit"
          className="group h-12 px-20 border-2 border-gray-300 rounded-full transition duration-300
        hover:border-green-200 focus:bg-blue-50 active:bg-blue-100"
          onClick={handleGoogleLogin}
        >
          <div className="relative flex items-center space-x-10 justify-center">
            <Image
              width={100}
              height={100}
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
          className="group h-12 px-20 border-2 border-gray-300 rounded-full transition duration-300
    hover:border-green-200 focus:bg-blue-50 active:bg-blue-100"
          onClick={handleLinkedinLogin}
        >
          <div className="relative flex items-center space-x-10 justify-center">
            <Image
              width={100}
              height={100}
              src={linkedin}
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
        <span className="text-gray-400 font-normal">Ou</span>
        <span className="h-px w-16 bg-gray-200"></span>
      </div>
      <form className="flex flex-col space-y-4 w-full" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
          }}
          onFocus={() => setIsEmailFocused(true)} // Champ sélectionné
          onBlur={() => {
            setIsEmailFocused(false); // Champ non sélectionné
          }}
          className={`w-full px-4 py-2 rounded border border-gray `}
        />

        <input
          type="password"
          placeholder="Mot de passe (8 caractères ou plus)"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
          }}
          className={`w-full px-4 py-2 rounded border border-gray `}
        />

        <p className="text-base text-second text-center">
          <span className="mx-1"> Mot de passe</span>
          <Link
            href={`/auth/${props.loginFor}/forget-password`}
            className="text-primary"
          >
            oublié ?
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
