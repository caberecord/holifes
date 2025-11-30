"use client";
import Link from "next/link";
import { useState } from "react";
import LocaleSwitcher from "@/components/ui/LocaleSwitcher";

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <img src="/logo_gris_holifes.png" alt="Holifes" className="h-10 w-auto" />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="/#features" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">
                            Características
                        </Link>
                        <Link href="/#benefits" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">
                            Beneficios
                        </Link>
                        <Link href="/#pricing" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">
                            Precios
                        </Link>
                        <LocaleSwitcher />
                        <div className="h-6 w-px bg-gray-200" />
                        <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">
                            Iniciar Sesión
                        </Link>
                        <Link href="/register" className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                            Comenzar Gratis
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2 rounded-lg hover:bg-gray-100"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile menu */}
                {isMenuOpen && (
                    <div className="md:hidden py-4 border-t border-gray-200">
                        <div className="flex flex-col gap-4">
                            <Link href="/#features" className="text-sm font-medium text-gray-600 hover:text-indigo-600">
                                Características
                            </Link>
                            <Link href="/#benefits" className="text-sm font-medium text-gray-600 hover:text-indigo-600">
                                Beneficios
                            </Link>
                            <Link href="/#pricing" className="text-sm font-medium text-gray-600 hover:text-indigo-600">
                                Precios
                            </Link>
                            <div className="py-2">
                                <LocaleSwitcher />
                            </div>
                            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-indigo-600">
                                Iniciar Sesión
                            </Link>
                            <Link href="/register" className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg text-sm font-semibold text-center">
                                Comenzar Gratis
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
