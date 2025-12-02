'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, Smartphone, AlertCircle } from 'lucide-react';

function WaitingContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const transactionId = searchParams.get('transactionId');
    const orderId = searchParams.get('orderId');

    const [status, setStatus] = useState('PENDING');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!transactionId) return;

        const checkStatus = async () => {
            try {
                const res = await fetch(`/api/checkout/nequi/status?transactionId=${transactionId}`);
                const data = await res.json();

                if (data.status === 'COMPLETED') {
                    router.push(`/checkout/success?order=${orderId}`);
                } else if (data.status === 'REJECTED' || data.status === 'FAILED' || data.status === 'EXPIRED') {
                    router.push('/checkout/cancel');
                } else {
                    setStatus(data.status);
                }
            } catch (err) {
                console.error('Polling error:', err);
                // No mostrar error fatal, seguir intentando
            }
        };

        // Polling cada 3 segundos
        const interval = setInterval(checkStatus, 3000);

        // Timeout de seguridad (60 segundos)
        const timeout = setTimeout(() => {
            clearInterval(interval);
            setError('La transacción ha tardado demasiado. Por favor revisa tu Nequi.');
        }, 60000);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [transactionId, orderId, router]);

    if (!transactionId) {
        return <div className="p-8 text-center text-red-500">Falta el ID de transacción</div>;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                    <Smartphone className="w-10 h-10" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                        <span className="text-xs font-bold text-yellow-900">!</span>
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">Revisa tu Nequi</h1>
                <p className="text-gray-600 mb-6">
                    Hemos enviado una solicitud de pago a tu celular. Por favor abre la App Nequi y acepta la transacción en tus notificaciones.
                </p>

                {error ? (
                    <div className="bg-yellow-50 p-4 rounded-lg flex items-center gap-3 text-yellow-800 text-left mb-6">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p className="text-sm">{error}</p>
                    </div>
                ) : (
                    <div className="flex items-center justify-center gap-2 text-indigo-600 font-medium bg-indigo-50 py-3 rounded-lg mb-6">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Esperando confirmación...
                    </div>
                )}

                <p className="text-xs text-gray-400">
                    ID Transacción: {transactionId}
                </p>
            </div>
        </div>
    );
}

export default function NequiWaitingPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">Cargando...</div>}>
            <WaitingContent />
        </Suspense>
    );
}
