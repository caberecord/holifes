"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { X, Cookie } from "lucide-react";

export default function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if user has already consented
        const consent = localStorage.getItem("cookieConsent");
        if (!consent) {
            // Show banner after a small delay for better UX
            const timer = setTimeout(() => setIsVisible(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem("cookieConsent", "true");
        setIsVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem("cookieConsent", "false");
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-in slide-in-from-bottom-10 fade-in duration-500">
            <div className="bg-white/90 backdrop-blur-md border border-gray-200 shadow-2xl rounded-2xl p-6 relative">
                <button
                    onClick={handleDecline}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="flex items-start gap-4">
                    <div className="bg-indigo-100 p-2 rounded-full shrink-0">
                        <Cookie className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                            Valoramos tu privacidad
                        </h3>
                        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                            Utilizamos cookies para mejorar tu experiencia y analizar el tráfico.
                            Al continuar, aceptas nuestra <Link href="/cookies" className="text-indigo-600 hover:underline font-medium">Política de Cookies</Link>.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={handleAccept}
                                className="flex-1 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/10"
                            >
                                Aceptar
                            </button>
                            <button
                                onClick={handleDecline}
                                className="flex-1 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                            >
                                Rechazar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
