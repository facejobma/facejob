"use client";

import Head from "next/head";
import React from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "./Logo";
import { User, LogOut } from "lucide-react";
import Cookies from "js-cookie";

export default function NavBar() {
  const [open, setOpen] = React.useState(false);
  const [hidden, setHidden] = React.useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);
  const [userType, setUserType] = React.useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const { scrollY } = useScroll();

  React.useEffect(() => {
    setMounted(true);
    // Check authentication status from cookies (primary) or localStorage (fallback)
    const token = Cookies.get('authToken') || localStorage.getItem('access_token');
    const role = Cookies.get('userRole') || localStorage.getItem('user_type');
    setIsAuthenticated(!!token);
    setUserType(role || null);
  }, []);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious();
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  const getActiveClass = (path: string) => {
    if (!mounted) return "";
    const active = path === "/" ? pathname === "/" : pathname.startsWith(path);
    return active ? "text-primary font-bold border-b-2 border-primary pb-1 inline-block" : "";
  };

  const getActiveMobileClass = (path: string) => {
    if (!mounted) return "";
    const active = path === "/" ? pathname === "/" : pathname.startsWith(path);
    return active ? "text-primary font-bold" : "";
  };

  const handleLogout = () => {
    // Clear cookies
    Cookies.remove('authToken');
    Cookies.remove('userRole');
    // Clear localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_type');
    localStorage.removeItem('auth_provider');
    // Clear sessionStorage
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('userRole');
    
    setIsAuthenticated(false);
    setUserType(null);
    router.push('/');
  };

  const getDashboardLink = () => {
    if (userType === 'candidat') return '/dashboard/candidat';
    if (userType === 'entreprise') return '/dashboard/entreprise';
    return '/';
  };
  return (
    <>
      <Head>
        <title>facejob</title>
        <meta charSet="UTF-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="shortcut icon" href="/images/favicon.png" />
        <meta
          name="description"
          content="Notre philosophie est simple : Offrir à toutes les entreprises, à tous les chercheurs d’emploi la chance de s’entrecroiser, de se connecter de la manière la plus facile que jamais, la plus efficace que jamais."
        />
        <link rel="canonical" href="https://facejob.ma/" />

        <meta property="og:locale" content="en_US" />
        <meta property="og:type”" content="website" />
        <meta
          property="og:title"
          content="facejob –  trouvez votre job même depuis chez vous."
        />
        <meta
          property="og:description"
          content="Notre philosophie est simple : Offrir à toutes les entreprises, à tous les chercheurs d’emploi la chance de s’entrecroiser, de se connecter de la manière la plus facile que jamais, la plus efficace que jamais."
        />
        <meta property="og:url" content="https://www.facejob.vercel.app/" />
        <meta property="og:site_name" content="facejob Travel Agency" />
        <meta property="og:image" content="" />
        <meta property="og:image:secure_url" content="" />
        <meta property="og:image:width" content="400" />
        <meta property="og:image:height" content="400" />
        <meta name="twitter:card" content="summary" />
        <meta
          name="twitter:description"
          content="facejob –  trouvez votre job même depuis chez vous."
        />
        <meta
          name="twitter:title"
          content="facejob –  trouvez votre job même depuis chez vous."
        />
        <meta name="twitter:site" content="@facejob" />
        <meta name="twitter:image" content="todo" />
        <meta name="twitter:creator" content="@facejob" />

        <meta
          name="robots"
          content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
        />
      </Head>

      <motion.nav
        variants={{
          visible: { y: 0 },
          hidden: { y: "-100%" },
        }}
        animate={hidden ? "hidden" : "visible"}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className="fixed top-0 left-0 right-0 z-50 bg-optional1"
      >
        <div className="w-full px-6 md:px-10 mx-auto py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-7">
              <div>
                <Logo />
              </div>
              <ul className="hidden md:flex gap-10 text-base font-medium text-secondary font-poppins">
                <li className="transition-all duration-300 ease-in-out hover:text-primary">
                  <Link href="/">
                    <span className={getActiveClass("/")}>
                      Accueil
                    </span>
                  </Link>
                </li>
                <li className="transition-all duration-300 ease-in-out hover:text-primary">
                  <Link href="/offres">
                    <span className={getActiveClass("/offres")}>
                      Offres d'emploi
                    </span>
                  </Link>
                </li>
                <li className="transition-all duration-300 ease-in-out hover:text-primary">
                  <Link href="/contact">
                    <span className={getActiveClass("/contact")}>
                      Contact
                    </span>
                  </Link>
                </li>
                <li className="transition-all duration-300 ease-in-out hover:text-primary">
                  <Link href="/blogs">
                    <span className={getActiveClass("/blogs")}>
                      Blogs
                    </span>
                  </Link>
                </li>
              </ul>
            </div>
            <ul className="hidden md:flex gap-5 font-bold text-sm">
              {!mounted ? (
                <>
                  <li>
                    <Link
                      href="/auth/login-candidate"
                      className="px-6 py-3 rounded-[15px] border-[2px] border-primary text-primary font-default"
                    >
                      Candidat
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/auth/login-enterprise"
                      className="px-6 py-3 rounded-[15px] bg-primary text-white font-default"
                    >
                      Entreprise
                    </Link>
                  </li>
                </>
              ) : !isAuthenticated ? (
                <>
                  <li>
                    <Link
                      href="/auth/login-candidate"
                      className="px-6 py-3 rounded-[15px] border-[2px] border-primary text-primary font-default hover:bg-primary hover:text-white transition-all"
                    >
                      Candidat
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/auth/login-enterprise"
                      className="px-6 py-3 rounded-[15px] bg-primary text-white font-default hover:bg-primary-1 transition-all"
                    >
                      Entreprise
                    </Link>
                  </li>
                </>
              ) : (
                <li className="flex items-center gap-3">
                  <Link
                    href={getDashboardLink()}
                    className="flex items-center gap-2 px-6 py-3 rounded-[15px] bg-primary text-white font-default hover:bg-primary-1 transition-all"
                  >
                    <User className="w-4 h-4" />
                    {userType === 'candidat' ? 'Mon Espace Candidat' : 'Mon Espace Entreprise'}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-3 rounded-[15px] border-[2px] border-red-500 text-red-500 font-default hover:bg-red-500 hover:text-white transition-all"
                    title="Se déconnecter"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </li>
              )}
            </ul>
            <div className="flex items-center md:hidden">
              <button
                className="outline-none"
                id="btn-mobile-menu"
                onClick={() => {
                  setOpen(!open);
                }}
              >
                <svg
                  className="w-6 h-6 text-gray-500 hover:text-primary"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div
          id="mobile-menu"
          className={`transition transform duration-300 ease-linear ${
            open ? "flex" : "hidden"
          }`}
        >
          <ul
            className={`flex flex-col items-center w-full p-4 mx-4 space-y-5 text-sm md:hidden font-poppins`}
          >
            <li className={"flex gap-2 mb-2"}>
              <div>
                <Link
                  href="/auth/login-candidate"
                  className="px-8 py-3 rounded-[15px] border-[2px] border-primary text-primary font-default"
                >
                  Candidat
                </Link>
              </div>
              <div>
                <Link
                  href="/auth/login-enterprise"
                  className="px-8 py-3 rounded-[15px] bg-primary text-white font-default"
                >
                  Entreprise
                </Link>
              </div>
            </li>
            <li>
              <Link href="/">
                <span className={getActiveMobileClass("/")}>
                  Home
                </span>
              </Link>
            </li>
            <li>
              <Link href="/offres">
                <span className={getActiveMobileClass("/offres")}>
                  Offres d'emploi
                </span>
              </Link>
            </li>
            <li>
              <Link href="/contact">
                <span className={getActiveMobileClass("/contact")}>
                  Contact
                </span>
              </Link>
            </li>
            <li>
              <Link href="/blogs">
                <span className={getActiveMobileClass("/blogs")}>
                  Blogs
                </span>
              </Link>
            </li>
          </ul>
        </div>
      </motion.nav>
    </>
  );
}
