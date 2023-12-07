import { useState } from "react";
import LoginForm from "../../components/auth/login";

const LoginCandidatPage = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <nav className="container mx-auto p-4 font-default bg-danger">
        <div className="flex items-center justify-between">
          <div>
            <a href="#" className="flex items-center">
              <img src="/facejobLogo.png" alt="Logo" className="w-3/4" />
            </a>
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
      <div className="flex flex-col md:flex-row items-center mt-16">
        <div className="md:w-1/2 px-4 md:px-20">
          <LoginForm />
        </div>
        <div className="md:w-1/2 mt-4 md:mt-0">
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
