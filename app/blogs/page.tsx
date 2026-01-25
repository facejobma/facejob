import React from "react";
import NavBar from "../../components/NavBar";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Blog FaceJob - Actualités Emploi et Recrutement au Maroc",
    description: "Découvrez les dernières tendances du marché de l'emploi au Maroc, conseils de recrutement et actualités professionnelles sur FaceJob.ma",
    keywords: "emploi maroc, recrutement maroc, blog emploi, conseils carrière, marché travail maroc",
    openGraph: {
        title: "Blog FaceJob - Actualités Emploi et Recrutement au Maroc",
        description: "Découvrez les dernières tendances du marché de l'emploi au Maroc",
        type: "website",
        locale: "fr_FR",
    },
};

const blogs = [
    {
        title: "Le Maroc de 2026 : Pourquoi le recrutement ne sera plus jamais comme avant",
        content: "Du nord au sud, d'Agadir à Oujda, le Maroc vit une transformation sans précédent. En 2026, avec des projets colossaux comme l'organisation de la Coupe du Monde, le développement de l'Hydrogène vert et l'essor de la \"Digital Factory\" nationale, le marché de l'emploi explose.",
        link: "/blogs/blog1",
        image: "/img1.jpg",
        date: "25 Janvier 2026",
        readTime: "5 min",
        category: "Marché de l'emploi",
    },
    {
        title: "Recrutement : Comment diviser votre temps de pré-sélection par deux ?",
        content: "Dans le dynamisme économique actuel du Maroc, le temps est la ressource la plus précieuse des recruteurs. Découvrez comment le CV vidéo révolutionne votre processus de recrutement et optimise votre temps.",
        link: "/blogs/blog2",
        image: "/img2.jpg",
        date: "20 Janvier 2026",
        readTime: "4 min",
        category: "Optimisation RH",
    },
    {
        title: "Brillez devant l'objectif : 5 secrets pour oublier la caméra et décrocher votre job au Maroc",
        content: "Découvrez nos 5 astuces pour transformer votre stress en charisme et captiver les recruteurs avec votre CV vidéo. Conseils pratiques pour réussir votre présentation vidéo.",
        link: "/blogs/blog3",
        image: "/img3.jpg",
        date: "15 Janvier 2026",
        readTime: "6 min",
        category: "Conseils Candidats",
    },
];

const BlogPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
            <NavBar/>
            
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
                <div className="container mx-auto px-6 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Blog FaceJob
                    </h1>
                    <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
                        Découvrez les dernières tendances du marché de l'emploi au Maroc et nos conseils pour réussir votre carrière
                    </p>
                </div>
            </div>

            {/* Blog Articles */}
            <div className="container mx-auto px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {blogs.map((blog, index) => (
                        <article
                            key={index}
                            className="bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                        >
                            <div className="relative h-48 overflow-hidden">
                                <Image
                                    src={blog.image}
                                    alt={blog.title}
                                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                                    width={400}
                                    height={200}
                                />
                                <div className="absolute top-4 left-4">
                                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                                        {blog.category}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="p-6">
                                <div className="flex items-center text-gray-500 text-sm mb-3">
                                    <span>{blog.date}</span>
                                    <span className="mx-2">•</span>
                                    <span>{blog.readTime} de lecture</span>
                                </div>
                                
                                <h2 className="text-xl font-bold mb-3 text-gray-800 line-clamp-2 hover:text-blue-600 transition-colors">
                                    {blog.title}
                                </h2>
                                
                                <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                                    {blog.content}
                                </p>
                                
                                <Link 
                                    href={blog.link} 
                                    className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold transition-colors group"
                                >
                                    Lire l'article
                                    <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>
            </div>

            {/* Newsletter Section */}
            <div className="bg-gray-100 py-16">
                <div className="container mx-auto px-6 text-center">
                    <h3 className="text-3xl font-bold mb-4 text-gray-800">
                        Restez informé des dernières actualités
                    </h3>
                    <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                        Recevez nos articles directement dans votre boîte mail et ne manquez aucune opportunité d'emploi au Maroc
                    </p>
                    <div className="max-w-md mx-auto flex gap-4">
                        <input
                            type="email"
                            placeholder="Votre adresse email"
                            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                            S'abonner
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogPage;
