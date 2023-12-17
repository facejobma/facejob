import React, { useState } from "react";
import { Logo } from "../../Logo";
import Link from "next/link";

export function NavBarAuth() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };
  return (
    <nav className="container mx-auto p-4 font-default bg-danger">
      <div className="flex items-center justify-between">
        <div>
          <Logo />
        </div>
        <ul className="hidden md:flex gap-10 text-base font-medium text-secondary font-poppins">
          <li className="transition-all duration-300 ease-in-out hover:text-primary">
            <Link href="/">Accueil</Link>
          </li>
          <li className="transition-all duration-300 ease-in-out hover:text-primary">
            <Link href="/contact">Contact</Link>
          </li>
          <li className="transition-all duration-300 ease-in-out hover:text-primary">
            <Link href="/blogs">Blogs</Link>
          </li>
        </ul>
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
  );
}
