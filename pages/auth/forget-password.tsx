"use client";
import { useState } from "react";
import ForgetPasswordForm from "../../components/auth/forgetPassword";
import ResetPasswordSent from "../../components/auth/forgetPassword/ResetPasswordSent";
import toast from "react-hot-toast";
import NavBar from "../../components/NavBar";


const forgetPasswordPage = () => {
  // const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isResetPasswordSent, setIsResetPasswordSent] = useState(false);

  // const [email, setEmail] = useState("");

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  const handleForgetPassword = async (formData: any) => {

    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_URL + `/api/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        toast.error(
          data.message || "Une erreur s’est produite lors de la connexion"
        );
        return;
      }

      const data = await response.json();

      toast.success("Le jeton de réinitialisation a été envoyé avec succès !");
      setIsResetPasswordSent(true);

    } catch (error: any) {
      console.error(error);
      toast.error(
        error.message || "Une erreur s’est produite lors de la connexion"
      );
    }

  };

  return (
    <>
      <NavBar />
      <div className="flex flex-col md:flex-row items-center mt-16">
        {isResetPasswordSent ? ( 
          <ResetPasswordSent />
        ) : (
          <ForgetPasswordForm onSubmit={handleForgetPassword} />
        )}
      </div>
    </>
  );
};

export default forgetPasswordPage;