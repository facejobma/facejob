"use client";
import { useEffect, useState } from "react";
import SignupFormCandidate from "../../components/auth/signup/SignupCandidat";
import NextStepSignupCandidat from "../../components/auth/signup/NextStepSignupCandidat";
import Image from "next/image";
import { NavBarAuth } from "../../components/auth/NavBarAuth/NavBarAuth";
import NavBar from "../../components/NavBar";

const SignupCandidatPage = () => {
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
          {step === 1 && <SignupFormCandidate onNextStep={handleNextStep} />}
          {step === 2 && <NextStepSignupCandidat onSkip={handleSkip} />}
        </div>

        <div className="w-full p-4 md:w-1/2">
          <Image
            src="/img4.jpg"
            className="rounded-3xl w-full md:w-2/5 md:-my-56 md:absolute"
            alt="image-signup"
            width={500}
            height={500}
          />
        </div>
      </div>
    </>
  );
};

export default SignupCandidatPage;
