'use client';

import Link from 'next/link';
import { XCircle } from 'lucide-react';

export default function CheckoutCancelPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <XCircle className="w-10 h-10" />
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">Pago Cancelado</h1>
                <p className="text-gray-600 mb-6">
                    El proceso de pago fue cancelado o no se pudo completar. No se ha realizado ningún cargo.
                </p>

                <div className="space-y-3">
                    <Link
                        href="/"
                        className="block w-full py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition-all shadow-lg"
                    >
                        Volver a Intentar
                    </Link>
                </div>
            </div>
        </div>
    );
}
