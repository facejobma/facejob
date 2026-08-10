"use client";

import Head from "next/head";
import React from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "./Logo";
import { User, LogOut } from "lucide-react";
import Cookies from "js-cookie";
import { clearInvalidAuthSession, getAuthenticatedUser, type UserRole } from "@/lib/auth";

type NavUserRole = Extract<UserRole, "candidat" | "entreprise">;

function normalizeNavRole(role: unknown): NavUserRole | null {
  if (role === "candidat" || role === "candidate") {
    return "candidat";
  }

  if (role === "entreprise" || role === "enterprise") {
    return "entreprise";
  }

  return null;
}

export default function NavBar() {
  const [open, setOpen] = React.useState(false);
  const [hidden, setHidden] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);
  const [userType, setUserType] = React.useState<NavUserRole | null>(null);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const { scrollY } = useScroll();

  React.useEffect(() => {
    setMounted(true);
    
    const checkAuth = async () => {
      const token = Cookies.get('authToken');
      
      if (!token) {
        clearInvalidAuthSession();
        setIsAuthenticated(false);
        setUserType(null);
        return;
      }
      
      // Verify token validity with backend
      try {
        const response = await fetch(`${(typeof window !== 'undefined' ? '' : process.env.NEXT_PUBLIC_BACKEND_URL)}/api/v1/user`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
        });
        
        if (!response.ok) {
          // Token is invalid or expired - clear everything
          clearInvalidAuthSession();
          setIsAuthenticated(false);
          setUserType(null);
          return;
        }
        
        const userData = await response.json();
        
        // Get role from backend response
        let role = normalizeNavRole(userData.role);
        
        if (!role && userData) {
          // Try to detect from user data structure
          if (userData.first_name || userData.last_name || userData.job_id !== undefined) {
            role = 'candidat';
          } else if (userData.company_name || userData.sector_id || userData.siret) {
            role = 'entreprise';
          }
        }

        role = normalizeNavRole(role);

        if (!role) {
          clearInvalidAuthSession();
          setIsAuthenticated(false);
          setUserType(null);
          return;
        }
        
        setIsAuthenticated(true);
        setUserType(role);
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
        setUserType(null);
      }
    };
    
    checkAuth();
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
    clearInvalidAuthSession();
    
    setIsAuthenticated(false);
    setUserType(null);
    router.push('/');
  };

  const getDashboardLink = () => {
    const role = normalizeNavRole(userType);
    if (role === 'candidat') return '/dashboard/candidat';
    if (role === 'entreprise') return '/dashboard/entreprise';
    return null;
  };

  const handleDashboardClick = async (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    const user = await getAuthenticatedUser();
    const role = normalizeNavRole(user?.role);

    if (!role) {
      clearInvalidAuthSession();
      setIsAuthenticated(false);
      setUserType(null);
      const loginPath = userType === 'candidat' ? '/auth/login-candidate' : '/auth/login-entreprise';
      const returnUrl = dashboardLink || '/dashboard/entreprise';
      router.push(`${loginPath}?returnUrl=${encodeURIComponent(returnUrl)}`);
      return;
    }

    setIsAuthenticated(true);
    setUserType(role);
    router.push(role === 'candidat' ? '/dashboard/candidat' : '/dashboard/entreprise');
  };

  const dashboardLink = getDashboardLink();
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
        <div className={`w-full px-4 lg:px-8 mx-auto transition-all ${
          open ? "py-3 pb-0" : "py-3"
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 xl:gap-6">
              <Logo />
              <ul className="hidden lg:flex gap-4 xl:gap-6 text-xs xl:text-sm font-medium text-secondary font-poppins">
                <li className="transition-all duration-300 ease-in-out hover:text-primary whitespace-nowrap">
                  <Link href="/"><span className={getActiveClass("/")}>Accueil</span></Link>
                </li>
                <li className="transition-all duration-300 ease-in-out hover:text-primary whitespace-nowrap">
                  <Link href="/offres"><span className={getActiveClass("/offres")}>Offres d'emploi</span></Link>
                </li>
                <li className="transition-all duration-300 ease-in-out hover:text-primary whitespace-nowrap">
                  <Link href="/blogs"><span className={getActiveClass("/blogs")}>Blogs</span></Link>
                </li>
                <li className="transition-all duration-300 ease-in-out hover:text-primary whitespace-nowrap">
                  <Link href="/faq"><span className={getActiveClass("/faq")}>FAQ</span></Link>
                </li>
                <li className="transition-all duration-300 ease-in-out hover:text-primary whitespace-nowrap">
                  <Link href="/apropsdenous"><span className={getActiveClass("/apropsdenous")}>À propos</span></Link>
                </li>
                <li className="transition-all duration-300 ease-in-out hover:text-primary whitespace-nowrap">
                  <Link href="/contact"><span className={getActiveClass("/contact")}>Contact</span></Link>
                </li>
              </ul>
            </div>
            <ul className="hidden lg:flex gap-3 font-bold text-sm">
              {!mounted ? (
                <>
                  <li>
                    <Link
                      href="/auth/login-candidate"
                      className="inline-flex items-center h-9 px-4 rounded-lg border-2 border-primary text-primary font-medium text-sm"
                    >
                      Candidat
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/auth/login-entreprise"
                      className="inline-flex items-center h-9 px-4 rounded-lg bg-primary text-white font-medium text-sm"
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
                      className="inline-flex items-center h-9 px-4 rounded-lg border-2 border-primary text-primary font-medium text-sm hover:bg-primary hover:text-white transition-all"
                    >
                      Candidat
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/auth/login-entreprise"
                      className="inline-flex items-center h-9 px-4 rounded-lg bg-primary text-white font-medium text-sm hover:bg-primary-1 transition-all"
                    >
                      Entreprise
                    </Link>
                  </li>
                </>
              ) : dashboardLink ? (
                <li className="flex items-center gap-2">
                  <Link
                    href={dashboardLink}
                    onClick={handleDashboardClick}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-medium text-sm hover:bg-primary-1 transition-all"
                  >
                    <User className="w-4 h-4" />
                    {userType === 'candidat' ? 'Mon Espace Candidat' : 'Mon Espace Entreprise'}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1 px-3 py-2 rounded-lg border-2 border-red-500 text-red-500 font-medium text-sm hover:bg-red-500 hover:text-white transition-all"
                    title="Se déconnecter"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </li>
              ) : (
                <>
                  <li>
                    <Link
                      href="/auth/login-candidate"
                      className="inline-flex items-center h-9 px-4 rounded-lg border-2 border-primary text-primary font-medium text-sm hover:bg-primary hover:text-white transition-all"
                    >
                      Candidat
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/auth/login-entreprise"
                      className="inline-flex items-center h-9 px-4 rounded-lg bg-primary text-white font-medium text-sm hover:bg-primary-1 transition-all"
                    >
                      Entreprise
                    </Link>
                  </li>
                </>
              )}
            </ul>
            <div className="flex items-center lg:hidden">
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
          <ul className="flex flex-col w-full divide-y divide-gray-100 lg:hidden font-poppins">
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
            <li className="hover:bg-gray-50 transition-colors">
              <Link href="/faq" className="flex items-center px-6 py-4" onClick={() => setOpen(false)}>
                <span className={`text-base font-medium ${getActiveMobileClass("/faq")}`}>
                  FAQ
                </span>
              </Link>
            </li>
            <li className="hover:bg-gray-50 transition-colors">
              <Link href="/apropsdenous" className="flex items-center px-6 py-4" onClick={() => setOpen(false)}>
                <span className={`text-base font-medium ${getActiveMobileClass("/apropsdenous")}`}>
                  À propos
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
                    href="/auth/login-entreprise"
                    className="w-full text-center px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary-1 transition-all"
                    onClick={() => setOpen(false)}
                  >
                    Espace Entreprise
                  </Link>
                </div>
              </li>
            ) : dashboardLink ? (
              <li className="p-6 bg-gray-50">
                <div className="flex flex-col gap-3">
                  <Link
                    href={dashboardLink}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary-1 transition-all"
                    onClick={(event) => {
                      setOpen(false);
                      handleDashboardClick(event);
                    }}
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
            ) : (
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
                    href="/auth/login-entreprise"
                    className="w-full text-center px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary-1 transition-all"
                    onClick={() => setOpen(false)}
                  >
                    Espace Entreprise
                  </Link>
                </div>
              </li>
            )}
          </ul>
        </div>
      </motion.nav>
    </>
  );
}
