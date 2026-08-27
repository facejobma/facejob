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
      <div className="flex h-screen h-dvh overflow-hidden bg-gray-50">
        {/* Left Side - Form */}
        <div className="h-full flex-1 overflow-y-auto overscroll-contain">
          <div className="mx-auto w-full max-w-2xl px-4 sm:px-6 lg:px-16 xl:px-20 py-6">
            {/* Back Button */}
            {showBackButton && (
              <div className="mb-4">
                <Link
                  href="/"
                  className="inline-flex items-center text-sm font-medium text-third hover:text-secondary transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour à l'accueil
                </Link>
              </div>
            )}

            {/* Logo */}
            <div className="mb-6">
              <Link href="/" className="flex items-center">
                <Image
                  src="/facejobLogo.png"
                  alt="FaceJob"
                  width={120}
                  height={40}
                  className="h-10 w-auto"
                />
              </Link>
            </div>

            {/* Form Content - Scrollable */}
            <div className="pb-8">
              {children}
            </div>
          </div>
        </div>

        {/* Right Side - Image */}
        <div className="relative hidden h-full w-0 flex-1 lg:block">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-green-600/20">
            <Image
              src={backgroundImage}
              alt="Authentication"
              fill
              className="object-cover"
              priority
            />
          </div>
          
          {/* Overlay Content */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end">
            <div className="p-12 text-white">
              {title && (
                <h2 className="text-3xl font-bold mb-4">{title}</h2>
              )}
              {subtitle && (
                <p className="text-lg opacity-90">{subtitle}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthErrorBoundary>
  );
};

export default ModernAuthLayout;
