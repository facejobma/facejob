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
  const [scrolled, setScrolled] = React.useState(false);
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
    
    // Check user role from multiple sources
    let role = sessionStorage.getItem('userRole') || Cookies.get('userRole') || localStorage.getItem('user_type');
    
    // If still not found, try to detect from user object in sessionStorage
    if (!role) {
      const userStr = sessionStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          role = user.role || null;
        } catch (e) {
          console.error('Failed to parse user from sessionStorage');
        }
      }
    }
    
    setIsAuthenticated(!!token);
    setUserType(role || null);
  }, []);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious();
    if (previous !== undefined && latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
    // Set scrolled state for styling
    setScrolled(latest > 20);
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
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled 
            ? "bg-white shadow-md backdrop-blur-sm" 
            : "bg-transparent"
        }`}
      >
        <div className={`w-full px-4 md:px-10 mx-auto transition-all ${
          open ? "py-3 pb-0 md:py-2" : "py-3 md:py-2"
        }`}>
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
                className="outline-none p-2 hover:bg-gray-100 rounded-lg transition-colors"
                id="btn-mobile-menu"
                onClick={() => {
                  setOpen(!open);
                }}
                aria-label="Menu"
              >
                <svg
                  className="w-8 h-8 text-gray-700 hover:text-primary"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {open ? (
                    <path d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div
          id="mobile-menu"
          className={`transition transform duration-300 ease-linear bg-white shadow-lg ${
            open ? "flex" : "hidden"
          }`}
        >
          <ul className="flex flex-col w-full divide-y divide-gray-100 md:hidden font-poppins">
            {/* Navigation Links */}
            <li className="hover:bg-gray-50 transition-colors">
              <Link href="/" className="flex items-center px-6 py-4" onClick={() => setOpen(false)}>
                <span className={`text-base font-medium ${getActiveMobileClass("/")}`}>
                  Accueil
                </span>
              </Link>
            </li>
            <li className="hover:bg-gray-50 transition-colors">
              <Link href="/offres" className="flex items-center px-6 py-4" onClick={() => setOpen(false)}>
                <span className={`text-base font-medium ${getActiveMobileClass("/offres")}`}>
                  Offres d'emploi
                </span>
              </Link>
            </li>
            <li className="hover:bg-gray-50 transition-colors">
              <Link href="/contact" className="flex items-center px-6 py-4" onClick={() => setOpen(false)}>
                <span className={`text-base font-medium ${getActiveMobileClass("/contact")}`}>
                  Contact
                </span>
              </Link>
            </li>
            <li className="hover:bg-gray-50 transition-colors">
              <Link href="/blogs" className="flex items-center px-6 py-4" onClick={() => setOpen(false)}>
                <span className={`text-base font-medium ${getActiveMobileClass("/blogs")}`}>
                  Blogs
                </span>
              </Link>
            </li>
            
            {/* Auth Buttons */}
            {!isAuthenticated ? (
              <li className="p-6 bg-gray-50">
                <div className="flex flex-col gap-3">
                  <Link
                    href="/auth/login-candidate"
                    className="w-full text-center px-6 py-3 rounded-lg border-2 border-primary text-primary font-medium hover:bg-primary hover:text-white transition-all"
                    onClick={() => setOpen(false)}
                  >
                    Espace Candidat
                  </Link>
                  <Link
                    href="/auth/login-enterprise"
                    className="w-full text-center px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary-1 transition-all"
                    onClick={() => setOpen(false)}
                  >
                    Espace Entreprise
                  </Link>
                </div>
              </li>
            ) : (
              <li className="p-6 bg-gray-50">
                <div className="flex flex-col gap-3">
                  <Link
                    href={getDashboardLink()}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary-1 transition-all"
                    onClick={() => setOpen(false)}
                  >
                    <User className="w-5 h-5" />
                    {userType === 'candidat' ? 'Mon Espace' : 'Mon Espace'}
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg border-2 border-red-500 text-red-500 font-medium hover:bg-red-500 hover:text-white transition-all"
                  >
                    <LogOut className="w-5 h-5" />
                    Se déconnecter
                  </button>
                </div>
              </li>
            )}
          </ul>
        </div>
      </motion.nav>
    </>
  );
}
