"use client";
import { useEffect, useState } from "react";

import SignupFormEntreprise from "../../components/auth/signup/SignupEntreprise";
import NextStepSignupEntreprise from "../../components/auth/signup/NextStepSignupEntreprise";
import { NavBarAuth } from "../../components/auth/NavBarAuth/NavBarAuth";
import NavBar from "../../components/NavBar";

const SignupEntreprisePage = () => {
  const [step, setStep] = useState(1);

  useEffect(() => {
    const userId = sessionStorage.getItem("userId");

    // ? JHere if the userId already existed in session (means he created his account) skip the step 1
    if (userId) {
      setStep(2);
    }
  }, []);

  const handleNextStep = () => {
    // setAdditionalInfo(info);
    setStep(step + 1);
  };

  const handleSkip = () => {
    setStep(step + 1);
  };

  return (
    <>
      <NavBar />
      <div className="flex flex-col md:flex-row items-center mt-8">
      <div className="w-full md:w-1/2 px-4">
          {step === 1 && <SignupFormEntreprise onNextStep={handleNextStep} />}
          {step === 2 && <NextStepSignupEntreprise onSkip={handleSkip} />}
        </div>

        <div className="w-full p-4 md:w-1/2">
          <img
            src="/img4.jpg"
            className="rounded-3xl w-full md:w-2/5 md:-my-56 md:absolute"
            alt="image-signup"
          />
        </div>
      </div>
    </>
  );
};

export default SignupEntreprisePage;

// TODO: Adresse Real
// VILLA 11, RESIDENCE RYAD AL ANDALOUS, VILLE NOUVELLE IBN BATTOUTA, TANGER
