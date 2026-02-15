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
    <section className="relative w-full pb-8 sm:pb-10 mx-auto my-8 sm:my-10 px-4 sm:px-6 md:w-10/12 lg:w-8/12">
      <div className="md:h-[70px] md:w-[70px] w-[50px] h-[50px] right-2 sm:right-4 bg-gradient-to-r rounded-full grid place-items-center absolute md:-right-5 -top-4 sm:-top-5 from-primary to-[#8ac36b] z-10 p-1">
        <Image
          src="/images/send.svg"
          alt={"send logo"}
          width={24}
          height={24}
          className="w-5 h-5 sm:w-6 sm:h-6 md:w-[30px] md:h-[30px]"
        />
      </div>

      <div className="relative">
        <div className="overflow-hidden relative w-full h-80 sm:h-96 bg-optional1 rounded-2xl md:rounded-b-2xl md:rounded-tr-2xl md:rounded-tl-[6rem]"></div>

        <div className="absolute hidden md:block -right-16 lg:-right-24 -bottom-12 lg:-bottom-16">
          <Image
            src="/images/bottom-pattern.svg"
            role="none"
            alt={"scroll icon"}
            width={24}
            height={24}
          />
        </div>
        <div className="absolute top-0 flex items-center w-full h-full px-4 sm:px-6">
          <div className="flex flex-col items-center max-w-2xl mx-auto my-8 sm:my-12 md:my-16">
            <h2 className="max-w-sm sm:max-w-md md:max-w-full text-lg sm:text-xl md:text-2xl leading-normal text-center text-secondary font-semibold font-default mb-6 sm:mb-8 md:mb-10">
              Abonnez-vous pour recevoir des informations, les dernières
              nouvelles et d&apos;autres offres intéressantes sur facejob
            </h2>
            <div className="flex flex-col w-full gap-3 sm:gap-4 md:gap-5 md:flex-row">
              <div className="relative w-full text-gray-600">
                <span className="absolute inset-y-0 left-0 flex items-center pl-2 sm:pl-3">
                  <label htmlFor="email" className="p-1">
                    <Image
                      src="/images/email.svg"
                      role="none"
                      className="w-5 h-5 sm:w-6 sm:h-6"
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
                  className="p-4 sm:p-5 pl-10 sm:pl-12 text-sm bg-white font-default rounded-lg w-full h-[48px] md:h-[55px] focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="email@example.com"
                  autoComplete="off"
                  id="email"
                  required
                />
              </div>

              <button
                onClick={handleSubscribe}
                disabled={isLoading}
                className="bg-gradient-to-r inline-block from-primary to-primary font-default px-6 sm:px-7 py-3 sm:py-2 rounded-lg text-white text-base sm:text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:opacity-90 active:scale-95 min-h-[48px] md:min-h-[55px] whitespace-nowrap touch-manipulation"
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
