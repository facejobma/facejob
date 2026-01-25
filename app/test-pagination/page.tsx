"use client";

import React from 'react';
import PaginatedOffersList from '@/components/PaginatedOffersList';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';

export default function TestPaginationPage() {
  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Test de Pagination
            </h1>
            <p className="text-gray-600">
              Cette page démontre l'implémentation de la pagination pour les offres d'emploi.
            </p>
          </div>
          
          <PaginatedOffersList />
        </div>
      </div>
      <Footer />
    </>
  );
}