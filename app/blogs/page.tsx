import React from "react";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Recrutement au Maroc - Actualités Emploi et Conseils Carrière",
    description: "Découvrez les dernières tendances du marché de l'emploi au Maroc, conseils de recrutement et actualités professionnelles sur FaceJob.ma",
    keywords: "emploi maroc, recrutement maroc, blog emploi, conseils carrière, marché travail maroc",
    openGraph: {
        title: "Recrutement au Maroc - Actualités Emploi et Conseils Carrière",
        description: "Découvrez les dernières tendances du marché de l'emploi au Maroc",
        type: "website",
        locale: "fr_FR",
    },
};

const blogs = [
    {
        title: "Le Maroc de 2026 : Pourquoi le recrutement ne sera plus jamais comme avant",
        content: "Du nord au sud, d'Agadir à Oujda, le Maroc vit une transformation sans précédent. En 2026, avec des projets colossaux comme l'organisation de la Coupe du Monde, le développement de l'Hydrogène vert et l'essor de la \"Digital Factory\" nationale, le marché de l'emploi explose.",
        link: "/blogs/maroc-2026-recrutement-transformation",
        image: "/img1.jpg",
        date: "25 Janvier 2026",
        readTime: "5 min",
        category: "Marché de l'emploi",
    },
    {
        title: "Recrutement : Comment diviser votre temps de pré-sélection par deux ?",
        content: "Dans le dynamisme économique actuel du Maroc, le temps est la ressource la plus précieuse des recruteurs. Découvrez comment le CV vidéo révolutionne votre processus de recrutement et optimise votre temps.",
        link: "/blogs/optimiser-temps-preselection-recrutement",
        image: "/img2.jpg",
        date: "20 Janvier 2026",
        readTime: "4 min",
        category: "Optimisation RH",
    },
    {
        title: "Brillez devant l'objectif : 5 secrets pour oublier la caméra et décrocher votre job au Maroc",
        content: "Découvrez nos 5 astuces pour transformer votre stress en charisme et captiver les recruteurs avec votre CV vidéo. Conseils pratiques pour réussir votre présentation vidéo.",
        link: "/blogs/cv-video-conseils-reussir-candidature",
        image: "/img3.jpg",
        date: "15 Janvier 2026",
        readTime: "6 min",
        category: "Conseils Candidats",
    },
];

const BlogPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-optional1">
            <NavBar/>
            
            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-white via-optional1 to-green-50/30 pt-20 pb-20 overflow-hidden">
                {/* Background decorations */}
                <div className="absolute -top-20 -right-20 w-72 h-72 bg-gradient-to-br from-primary/20 to-green-400/20 rounded-full blur-3xl opacity-60 pointer-events-none animate-pulse" />
                <div className="absolute bottom-0 -left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-50 pointer-events-none" />
                
                <div className="container mx-auto px-6 text-center max-w-7xl relative">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-green-100/50 backdrop-blur-sm border border-primary/20 rounded-full px-4 py-2 mb-6 shadow-sm">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        <span className="text-sm font-medium text-primary">Actualités & Conseils</span>
                    </div>

                    <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold text-secondary mb-6 leading-tight tracking-tight">
                        Recrutement au{" "}
                        <span className="relative inline-block">
                            <span className="bg-gradient-to-r from-primary via-green-600 to-primary-1 bg-clip-text text-transparent">
                                Maroc
                            </span>
                            <svg className="absolute -bottom-2 left-0 w-full" height="12" viewBox="0 0 200 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2 10C50 2 150 2 198 10" stroke="#60894B" strokeWidth="3" strokeLinecap="round" opacity="0.3"/>
                            </svg>
                        </span>
                    </h1>
                    
                    <p className="font-body text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Découvrez les dernières tendances du marché de l'emploi au Maroc et nos conseils pour réussir votre carrière
                    </p>
                </div>
            </div>

            {/* Blog Articles */}
            <div className="container mx-auto px-6 pb-16 max-w-7xl">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {blogs.map((blog, index) => (
                        <article
                            key={index}
                            className="group bg-white rounded-2xl border-2 border-gray-100 hover:border-primary/30 shadow-sm hover:shadow-xl overflow-hidden transform transition-all duration-300 hover:-translate-y-2"
                        >
                            <div className="relative h-56 overflow-hidden">
                                <Image
                                    src={blog.image}
                                    alt={blog.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    width={400}
                                    height={224}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <div className="absolute top-4 left-4">
                                    <span className="bg-gradient-to-r from-primary to-green-600 text-white px-4 py-1.5 rounded-full text-sm font-semibold font-accent shadow-lg">
                                        {blog.category}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="p-6">
                                <div className="flex items-center text-gray-500 text-sm mb-4 font-body">
                                    <svg className="w-4 h-4 mr-1.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span>{blog.date}</span>
                                    <span className="mx-2">•</span>
                                    <svg className="w-4 h-4 mr-1.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>{blog.readTime} de lecture</span>
                                </div>
                                
                                <h2 className="font-heading text-xl font-bold mb-3 text-secondary line-clamp-2 group-hover:text-primary transition-colors">
                                    {blog.title}
                                </h2>
                                
                                <p className="font-body text-gray-600 mb-5 line-clamp-3 leading-relaxed">
                                    {blog.content}
                                </p>
                                
                                <Link 
                                    href={blog.link} 
                                    className="inline-flex items-center text-primary hover:text-primary-1 font-accent font-semibold transition-all duration-300 group/link"
                                >
                                    Lire l'article
                                    <svg className="w-5 h-5 ml-2 transform group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>
            </div>

            {/* Newsletter Section */}
            <div className="relative bg-gradient-to-br from-white via-optional1 to-green-50/30 py-20 overflow-hidden">
                {/* Background decorations */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/10 to-green-400/10 rounded-full blur-3xl opacity-60 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl opacity-50 pointer-events-none" />
                
                <div className="container mx-auto px-6 text-center max-w-7xl relative">
                    <div className="max-w-3xl mx-auto">
                        {/* Icon */}
                        <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-green-100/50 rounded-2xl flex items-center justify-center mx-auto mb-6 border-2 border-primary/20">
                            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>

                        <h3 className="font-heading text-3xl md:text-4xl font-bold mb-4 text-secondary">
                            Restez informé des dernières actualités
                        </h3>
                        <p className="font-body text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                            Recevez nos articles directement dans votre boîte mail et ne manquez aucune opportunité d'emploi au Maroc
                        </p>
                        
                        <div className="max-w-md mx-auto">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <input
                                    type="email"
                                    placeholder="Votre adresse email"
                                    className="flex-1 px-5 py-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 font-body"
                                />
                                <button className="group bg-gradient-to-r from-primary to-green-600 hover:from-green-600 hover:to-primary text-white px-8 py-4 rounded-xl font-accent font-bold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
                                    S'abonner
                                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </button>
                            </div>
                            <p className="text-sm text-gray-500 mt-4 font-body flex items-center justify-center gap-2">
                                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Vos données sont protégées et ne seront jamais partagées
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            
            <Footer />
        </div>
    );
};

export default BlogPage;
