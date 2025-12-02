'use client';

import Link from 'next/link';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function SuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('order');

    return (
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">¡Pago Exitoso!</h1>
            <p className="text-gray-600 mb-6">
                Tu compra ha sido procesada correctamente. Hemos enviado los detalles a tu correo electrónico.
            </p>

            {orderId && (
                <div className="bg-gray-100 p-3 rounded-lg mb-6 text-sm text-gray-500 font-mono">
                    Orden: {orderId}
                </div>
            )}

            <div className="space-y-3">
                <Link
                    href="/"
                    className="block w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl"
                >
                    Volver al Inicio
                </Link>
            </div>
        </div>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Suspense fallback={<div className="text-center">Cargando...</div>}>
                <SuccessContent />
            </Suspense>
        </div>
    );
}
