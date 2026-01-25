"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth";
import SecureLoginForm from "../../../components/auth/login/SecureLoginForm";
import NavBar from "../../../components/NavBar";

const LoginCandidatPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in using secure method
    const checkAuth = async () => {
      const user = await getAuthenticatedUser();
      if (user) {
        // Redirect to appropriate dashboard based on actual role from backend
        if (user.role === "candidat") {
          router.push("/dashboard/candidat");
        } else if (user.role === "entreprise") {
          router.push("/dashboard/entreprise");
        } else if (user.role === "admin") {
          router.push("/dashboard/admin");
        }
      }
    };

    checkAuth();
  }, [router]);

  return (
    <>
      <NavBar />
      <div className="flex flex-col md:flex-row items-center mt-16">
        <div className="md:w-1/2 px-4 md:px-20">
          <SecureLoginForm loginFor={"candidate"} />
        </div>
        <div className="w-0 px-4 md:w-1/2 mt-4 md:mt-0">
          <img
            src="/images/photo-login.jpg"
            className="rounded-3xl w-full md:w-4/5 mx-auto"
            alt="image-signup"
          />
        </div>
      </div>
    </>
  );
};

export default LoginCandidatPage;
