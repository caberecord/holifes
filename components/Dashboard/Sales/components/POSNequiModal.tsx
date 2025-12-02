// components/Dashboard/Sales/components/POSNequiModal.tsx
import React, { useEffect, useState } from 'react';
import { Loader2, Smartphone, AlertCircle, CheckCircle } from 'lucide-react';

interface POSNequiModalProps {
    isOpen: boolean;
    onClose: () => void;
    transactionId: string;
    onSuccess: () => void;
    onCancel: () => void;
}

export const POSNequiModal: React.FC<POSNequiModalProps> = ({
    isOpen,
    onClose,
    transactionId,
    onSuccess,
    onCancel
}) => {
    const [status, setStatus] = useState('PENDING');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen || !transactionId) return;

        let interval: NodeJS.Timeout;
        let timeout: NodeJS.Timeout;

        const checkStatus = async () => {
            try {
                const res = await fetch(`/api/checkout/nequi/status?transactionId=${transactionId}`);
                const data = await res.json();

                if (data.status === 'COMPLETED') {
                    setStatus('COMPLETED');
                    clearInterval(interval);
                    setTimeout(() => onSuccess(), 1500); // Wait a bit to show success state
                } else if (data.status === 'REJECTED' || data.status === 'FAILED' || data.status === 'EXPIRED') {
                    setStatus('FAILED');
                    setError(data.errorMessage || 'El pago fue rechazado o expiró.');
                    clearInterval(interval);
                }
            } catch (err) {
                console.error('Polling error:', err);
            }
        };

        // Poll every 3 seconds
        interval = setInterval(checkStatus, 3000);

        // Timeout after 60 seconds
        timeout = setTimeout(() => {
            clearInterval(interval);
            setError('Tiempo de espera agotado.');
            setStatus('TIMEOUT');
        }, 60000);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [isOpen, transactionId]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl text-center relative">
                {status === 'PENDING' && (
                    <>
                        <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                            <Smartphone className="w-10 h-10" />
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                                <span className="text-xs font-bold text-yellow-900">!</span>
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Esperando Pago</h2>
                        <p className="text-gray-600 mb-6">
                            Solicitud enviada al celular del cliente. Por favor indícale que acepte la transacción en su App Nequi.
                        </p>
                        <div className="flex items-center justify-center gap-2 text-indigo-600 font-medium bg-indigo-50 py-3 rounded-lg mb-6">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Verificando estado...
                        </div>
                    </>
                )}

                {status === 'COMPLETED' && (
                    <>
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-10 h-10" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Pago Exitoso!</h2>
                        <p className="text-gray-600 mb-6">La transacción ha sido aprobada.</p>
                    </>
                )}

                {(status === 'FAILED' || status === 'TIMEOUT') && (
                    <>
                        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle className="w-10 h-10" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Pago Fallido</h2>
                        <p className="text-gray-600 mb-6">{error || 'Hubo un problema con la transacción.'}</p>
                    </>
                )}

                <div className="flex gap-3">
                    {(status === 'FAILED' || status === 'TIMEOUT' || status === 'PENDING') && (
                        <button
                            onClick={onCancel}
                            className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                        >
                            Cancelar
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
