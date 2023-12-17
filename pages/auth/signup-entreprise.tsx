"use client";
import {useEffect, useState} from "react";

import SignupFormEntreprise from "../../components/auth/signup/SignupEntreprise";
import NextStepSignupEntreprise from "../../components/auth/signup/NextStepSignupEntreprise";
import {NavBarAuth} from "../../components/auth/NavBarAuth/NavBarAuth";
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
            <NavBar/>
            <div className="flex items-center mt-8">
                <div className="w-1/2 pr-4">
                    {step === 1 && <SignupFormEntreprise onNextStep={handleNextStep}/>}
                    {step === 2 && (
                        <NextStepSignupEntreprise
                            // onNextStep={handleNextStep}
                            onSkip={handleSkip}
                        />
                    )}
                </div>

                <div className="w-1/2 pl-4">
                    <img
                        src="/img4.jpg"
                        className="rounded-3xl w-2/5 -my-96 md:absolute"
                        // className="-mt-14 w-[750px]  md:w-full md:right-7 md:absolute"
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
