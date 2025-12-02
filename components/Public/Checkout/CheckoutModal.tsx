'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    zoneName: string;
    price: number;
    currency?: string;
    tenantId: string;
    connectedAccountId: string; // ID del organizador para Split Payment
}

export function CheckoutModal({
    isOpen,
    onClose,
    zoneName,
    price,
    currency = 'USD',
    tenantId,
    connectedAccountId
}: CheckoutModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '', // Nuevo campo para Nequi
        quantity: 1
    });

    if (!isOpen) return null;

    const total = price * formData.quantity;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tenantId,
                    connectedAccountId,
                    amount: total,
                    currency,
                    description: `Entradas para ${zoneName} (${formData.quantity})`,
                    payerEmail: formData.email,
                    orderId: `ORD-${Date.now()}`, // En prod, esto vendría del backend
                    applicationFee: total * 0.1, // Ejemplo: 10% de comisión
                    providerMetadata: {
                        phoneNumber: formData.phone // Enviar celular si existe
                    }
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al iniciar el pago');
            }

            // Redirigir a la pasarela
            window.location.href = data.checkoutUrl;

        } catch (err: any) {
            console.error('Checkout error:', err);
            setError(err.message || 'Ocurrió un error inesperado');
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
                    <h3 className="font-bold text-lg text-gray-800">Resumen de Compra</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <div className="mb-6 bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                        <p className="text-sm text-indigo-600 font-medium uppercase tracking-wider mb-1">Entrada</p>
                        <p className="text-xl font-bold text-indigo-900">{zoneName}</p>
                        <p className="text-indigo-700 mt-1">
                            ${price.toLocaleString()} x {formData.quantity} = <span className="font-bold">${total.toLocaleString()} {currency}</span>
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                placeholder="Ej: Juan Pérez"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                            <input
                                type="email"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                placeholder="juan@ejemplo.com"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Celular (Para Nequi)</label>
                            <input
                                type="tel"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                placeholder="3001234567"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                            <p className="text-xs text-gray-500 mt-1">Requerido si pagas con Nequi.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
                            <select
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                value={formData.quantity}
                                onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) })}
                            >
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                    <option key={num} value={num}>{num}</option>
                                ))}
                            </select>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Procesando...
                                </>
                            ) : (
                                'Pagar Ahora'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
