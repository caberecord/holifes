import React from 'react';
import { CreditCard, Banknote, CheckCircle, Wallet, Sparkles } from "lucide-react";

interface POSPaymentProps {
    paymentMethod: string | null;
    setPaymentMethod: (method: string) => void;
    cashReceived: string;
    setCashReceived: (amount: string) => void;
    totalAmount: number;
    onCompleteSale: () => void;
    isProcessing: boolean;
}

export const POSPayment: React.FC<POSPaymentProps> = ({
    paymentMethod,
    setPaymentMethod,
    cashReceived,
    setCashReceived,
    totalAmount,
    onCompleteSale,
    isProcessing
}) => {
    return (
        <div className="flex flex-col h-full animate-slide-in">
            <div className="p-5 border-b border-gray-100 bg-gray-50">
                <h2 className="text-lg font-bold text-gray-900">Método de Pago</h2>
                <p className="text-xs text-gray-500">Selecciona cómo desea pagar el cliente</p>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {/* Opción Tarjeta */}
                    <button
                        onClick={() => setPaymentMethod('card')}
                        className={`relative flex flex-col items-center justify-center p-6 border-2 rounded-2xl transition-all ${paymentMethod === 'card' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-100 bg-white hover:border-indigo-200'}`}
                    >
                        {paymentMethod === 'card' && <div className="absolute top-3 right-3 text-indigo-600"><CheckCircle size={20} className="fill-current" /></div>}
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${paymentMethod === 'card' ? 'bg-indigo-200 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}>
                            <CreditCard size={24} />
                        </div>
                        <span className={`font-bold ${paymentMethod === 'card' ? 'text-indigo-900' : 'text-gray-700'}`}>Tarjeta Crédito/Débito</span>
                        <span className="text-xs text-gray-400 mt-1">Visa, Mastercard, Amex</span>
                    </button>

                    {/* Opción Efectivo */}
                    <button
                        onClick={() => setPaymentMethod('cash')}
                        className={`relative flex flex-col items-center justify-center p-6 border-2 rounded-2xl transition-all ${paymentMethod === 'cash' ? 'border-green-600 bg-green-50' : 'border-gray-100 bg-white hover:border-green-200'}`}
                    >
                        {paymentMethod === 'cash' && <div className="absolute top-3 right-3 text-green-600"><CheckCircle size={20} className="fill-current" /></div>}
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${paymentMethod === 'cash' ? 'bg-green-200 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            <Banknote size={24} />
                        </div>
                        <span className={`font-bold ${paymentMethod === 'cash' ? 'text-green-900' : 'text-gray-700'}`}>Efectivo</span>
                        <span className="text-xs text-gray-400 mt-1">Pago directo en caja</span>
                    </button>
                </div>

                {paymentMethod === 'cash' && (
                    <div className="animate-slide-in p-4 bg-yellow-50 rounded-xl border border-yellow-100 text-yellow-800 text-sm flex gap-3">
                        <Wallet className="shrink-0" size={20} />
                        <div className="w-full">
                            <p className="mb-2">Recuerda entregar el cambio exacto.</p>
                            <input
                                type="number"
                                placeholder="Dinero recibido"
                                value={cashReceived}
                                onChange={(e) => setCashReceived(e.target.value)}
                                className="w-full p-2 border border-yellow-300 rounded-lg"
                            />
                            {parseFloat(cashReceived) >= totalAmount && (
                                <p className="mt-2 font-bold text-green-700">Cambio: ${(parseFloat(cashReceived) - totalAmount).toLocaleString()}</p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="p-5 border-t border-gray-100 bg-gray-50">
                <button
                    onClick={onCompleteSale}
                    disabled={!paymentMethod || isProcessing}
                    className="w-full py-3 rounded-xl bg-black hover:bg-gray-800 text-white font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isProcessing ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : <Sparkles size={16} className="text-yellow-400" />}
                    Confirmar Venta
                </button>
            </div>
        </div>
    );
};
