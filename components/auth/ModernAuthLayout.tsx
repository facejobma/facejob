"use client";

import React from "react";
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
  return (
    <AuthErrorBoundary>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Left Side - Form */}
        <div className="flex-1 flex flex-col">
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
        <div className="hidden lg:block relative w-0 flex-1 sticky top-0 h-screen">
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