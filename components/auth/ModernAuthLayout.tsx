"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AuthErrorBoundary from "./AuthErrorBoundary";

interface ModernAuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  backgroundImage?: string;
  showBackButton?: boolean;
}

const ModernAuthLayout: React.FC<ModernAuthLayoutProps> = ({
  children,
  title,
  subtitle,
  backgroundImage = "/images/photo-login.jpg",
  showBackButton = true,
}) => {
  useEffect(() => {
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlHeight = document.documentElement.style.height;
    const previousBodyHeight = document.body.style.height;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.documentElement.style.height = "100%";
    document.body.style.height = "100%";

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.height = previousHtmlHeight;
      document.body.style.height = previousBodyHeight;
    };
  }, []);

  return (
    <AuthErrorBoundary>
      <div className="flex h-screen h-dvh overflow-hidden bg-slate-50">
        {/* Left Side - Form */}
        <div className="h-full flex-1 overflow-y-auto overscroll-contain bg-white">
          <div className="mx-auto w-full max-w-xl px-5 py-6 sm:px-8 lg:px-12 lg:py-8">
            {/* Back Button */}
            {showBackButton && (
              <div className="mb-5">
                <Link
                  href="/"
                  className="inline-flex items-center text-sm font-medium text-slate-500 transition-colors hover:text-emerald-700"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour à l'accueil
                </Link>
              </div>
            )}

            {/* Logo */}
            <div className="mb-7 flex items-center justify-between border-b border-slate-100 pb-5">
              <Link href="/" className="flex items-center">
                <Image
                  src="/facejobLogo.png"
                  alt="FaceJob"
                  width={120}
                  height={40}
                  className="h-9 w-auto"
                />
              </Link>
              <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Espace sécurisé</span>
            </div>

            {/* Form Content - Scrollable */}
            <div className="auth-content pb-8">
              {children}
            </div>
          </div>
        </div>

        {/* Right Side - Image */}
        <div className="relative hidden h-full w-[46%] shrink-0 lg:block">
          <div className="absolute inset-0 bg-slate-900">
            <Image
              src={backgroundImage}
              alt="Authentication"
              fill
              className="object-cover"
              priority
            />
          </div>
          
          {/* Overlay Content */}
          <div className="absolute inset-0 flex items-end bg-gradient-to-t from-slate-950 via-slate-950/35 to-emerald-950/10">
            <div className="max-w-xl p-10 text-white xl:p-14">
              <span className="mb-4 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] backdrop-blur-sm">FaceJob</span>
              {title && (
                <h2 className="mb-4 text-3xl font-bold leading-tight">{title}</h2>
              )}
              {subtitle && (
                <p className="text-base leading-7 text-slate-200">{subtitle}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthErrorBoundary>
  );
};

export default ModernAuthLayout;
