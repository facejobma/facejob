"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// import "../../styles/globals.css";
import SignupForm from "../../components/auth/signup";

const SignupCandidatPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  // const {data: session} = useSession()
  const router = useRouter();

  // useEffect(() => {
  //     if (session && !session.user.isCompleted) router.push('/register')
  //     // if the client is logged in and has completed his profile, redirect him to the dashboard page
  //     if (session && session.user.userRole === UserRole.Client && session.user.isCompleted) router.push('/dashboard')
  //     // if the freelancer is logged in and has completed his profile, redirect him to the find-work page
  //     if (session && session.user.userRole === UserRole.Freelancer && session.user.isCompleted) router.push('/find-work')
  // }, [session])

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <nav className="container mx-auto font-default p-6">
        <div className="flex items-center justify-between">
          <div>
            <div>
              <a href="#" className="flex items-center px-2 py-2">
                <img src="/facejobLogo.png" alt="Logo" className="w-3/4 mr-2" />
              </a>
            </div>
            {/* <p className="text-primary font-bold text-2xl px-6">FaceJob</p> */}
          </div>
          <div className="md:hidden">
            <button
              className="text-gray-500 hover:text-gray-600 focus:outline-none"
              onClick={toggleNavbar}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </div>
      </nav>
      <div className="flex items-center mt-8">
        <div className="w-1/2 pr-4">
          <SignupForm />
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

export default SignupCandidatPage;

// TODO: Adresse Real
// VILLA 11, RESIDENCE RYAD AL ANDALOUS, VILLE NOUVELLE IBN BATTOUTA, TANGER
