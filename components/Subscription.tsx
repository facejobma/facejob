"use client"
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { apiRequest, handleApiError } from "@/lib/apiUtils";

type Props = {};

export default function Subscription({}: Props) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!email.trim()) {
      toast.error("Veuillez entrer votre adresse email");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Veuillez entrer une adresse email valide");
      return;
    }

    setIsLoading(true);
    try {
      const result = await apiRequest(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/newsletter/subscribe`,
        {
          method: "POST",
          body: JSON.stringify({ 
            email: email,
            source: 'homepage_subscription'
          }),
        }
      );

      if (result.success) {
        setEmail("");
        
        if (result.data.already_subscribed) {
          toast.success("Vous êtes déjà abonné à notre newsletter !");
        } else if (result.data.reactivated) {
          toast.success("Votre abonnement a été réactivé avec succès !");
        } else {
          toast.success("Merci pour votre abonnement ! Vous recevrez bientôt nos actualités.");
        }
      } else {
        handleApiError(result, toast);
      }
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="relative w-full pb-10 mx-auto my-10 md:w-8/12">
      <div className="md:h-[70px] md:w-[70px] w-[40px] h-[40px] right-0 bg-gradient-to-r rounded-full grid place-items-center absolute md:-right-5 -top-5 from-primary to-[#8ac36b] z-10 p-1">
        <Image
          src="/images/send.svg"
          alt={"send logo"}
          width={30}
          height={30}
        />
      </div>

      <div className="relative">
        <div className="overflow-hidden relative w-full h-96 bg-optional1  md:rounded-b-2xl md:rounded-tr-2xl md:rounded-tl-[6rem]"></div>

        <div className="absolute hidden md:block -right-24 -bottom-16">
          <Image
            src="/images/bottom-pattern.svg"
            role="none"
            alt={"scroll icon"}
            width={24}
            height={24}
          />
        </div>
        <div className="absolute top-0 flex items-center w-full h-full">
          <div className="flex flex-col items-center max-w-2xl mx-auto my-16">
            <h1 className="max-w-sm text-xl leading-normal text-center text-secondary md:max-w-full md:text-2xl font-semibold font-default">
              Abonnez-vous pour recevoir des informations, les dernières
              nouvelles et d&apos;autres offres intéressantes sur facejob
            </h1>
            <div className="flex flex-col w-full gap-5 mt-10 md:flex-row md:mt-20">
              <div className="relative w-full text-gray-600">
                <span className="absolute inset-y-0 left-0 flex items-center pl-2">
                  <label htmlFor="email" className="p-1">
                    <Image
                      src="/images/email.svg"
                      role="none"
                      className="w-6 h-6"
                      width={24}
                      height={24}
                      alt={"email logo"}
                    />
                  </label>
                </span>
                <input
                  type="email"
                  name="q"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="p-5 pl-12 text-sm bg-white font-default rounded-lg w-full md:h-[55px] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="email@example.com"
                  autoComplete="off"
                  id="email"
                  required
                />
              </div>

              <button
                onClick={handleSubscribe}
                disabled={isLoading}
                className="bg-gradient-to-r inline-block from-primary to-primary font-default px-7 py-2 rounded-lg text-white text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? "Abonnement..." : "S'inscrire"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
