"use client";
import { useEffect, useState } from "react";

import SignupFormEntreprise from "../../../components/auth/signup/SignupEntreprise";
import NextStepSignupEntreprise from "../../../components/auth/signup/NextStepSignupEntreprise";
import NavBar from "../../../components/NavBar";
import Image from "next/image";

const SignupEntreprisePage = () => {
  const [step, setStep] = useState(1);

  useEffect(() => {
    const userId =
      typeof window !== "undefined"
        ? window.sessionStorage?.getItem("userId") || ""
        : "";

    // If the userId already exists in session storage, skip to Step 2
    if (userId) {
      setStep(2);
    }
  }, []);

  const handleNextStep = () => {
    setStep((prevStep) => prevStep + 1);
  };

  const handleSkip = () => {
    setStep((prevStep) => prevStep + 1);
  };

  return (
    <>
      <NavBar />
      <div className="flex flex-col md:flex-row items-center mt-8">
        {step === 1 && (
          <>
            <div className="w-full md:w-1/2 px-4">
              <SignupFormEntreprise onNextStep={handleNextStep} />
            </div>
            <div className="w-full md:w-1/2 p-4">
              <Image
                src="/img6.jpg"
                className="rounded-3xl w-full md:w-2/5 md:-my-56 md:absolute"
                alt="image-signup"
                width={1000}
                height={1000}
              />
            </div>
          </>
        )}
        {step === 2 && (
          <div className="mx-auto w-full md:w-1/2 px-4">
            <NextStepSignupEntreprise onSkip={handleSkip} />
          </div>
        )}
      </div>
    </>
  );
};

export default SignupEntreprisePage;
