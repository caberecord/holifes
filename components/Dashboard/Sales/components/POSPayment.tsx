import React from 'react';
import { CreditCard, Banknote, CheckCircle, Wallet, Sparkles } from "lucide-react";

interface POSPaymentProps {
    paymentMethod: string | null;
    setPaymentMethod: (method: string) => void;
    cashReceived: string;
    setCashReceived: (amount: string) => void;
    nequiPhone: string;
    setNequiPhone: (phone: string) => void;
    totalAmount: number;
    onCompleteSale: () => void;
    isProcessing: boolean;
}

export const POSPayment: React.FC<POSPaymentProps> = ({
    paymentMethod,
    setPaymentMethod,
    cashReceived,
    setCashReceived,
    nequiPhone,
    setNequiPhone,
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
                <div className="grid grid-cols-3 gap-3 mb-6">
                    {/* Opción Tarjeta */}
                    <button
                        onClick={() => setPaymentMethod('card')}
                        className={`relative flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all ${paymentMethod === 'card' ? 'border-green-600 bg-green-50' : 'border-gray-100 bg-white hover:border-green-200'}`}
                    >
                        {paymentMethod === 'card' && <div className="absolute top-2 right-2 text-green-600"><CheckCircle size={16} className="fill-current" /></div>}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${paymentMethod === 'card' ? 'bg-green-200 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            <CreditCard size={20} />
                        </div>
                        <span className={`font-bold text-sm ${paymentMethod === 'card' ? 'text-green-900' : 'text-gray-700'}`}>Tarjeta</span>
                        <span className="text-[10px] text-gray-400 mt-0.5">Crédito/Débito</span>
                    </button>

                    {/* Opción Efectivo */}
                    <button
                        onClick={() => setPaymentMethod('cash')}
                        className={`relative flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all ${paymentMethod === 'cash' ? 'border-green-600 bg-green-50' : 'border-gray-100 bg-white hover:border-green-200'}`}
                    >
                        {paymentMethod === 'cash' && <div className="absolute top-2 right-2 text-green-600"><CheckCircle size={16} className="fill-current" /></div>}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${paymentMethod === 'cash' ? 'bg-green-200 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            <Banknote size={20} />
                        </div>
                        <span className={`font-bold text-sm ${paymentMethod === 'cash' ? 'text-green-900' : 'text-gray-700'}`}>Efectivo</span>
                        <span className="text-[10px] text-gray-400 mt-0.5">Pago en caja</span>
                    </button>

                    {/* Opción Nequi */}
                    <button
                        onClick={() => setPaymentMethod('nequi')}
                        className={`relative flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all ${paymentMethod === 'nequi' ? 'border-green-600 bg-green-50' : 'border-gray-100 bg-white hover:border-green-200'}`}
                    >
                        {paymentMethod === 'nequi' && <div className="absolute top-2 right-2 text-green-600"><CheckCircle size={16} className="fill-current" /></div>}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${paymentMethod === 'nequi' ? 'bg-green-200 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            <img src="/ico_nequi.png" alt="Nequi" className="w-6 h-6 object-contain" onError={(e) => e.currentTarget.src = "https://via.placeholder.com/32?text=N"} />
                        </div>
                        <span className={`font-bold text-sm ${paymentMethod === 'nequi' ? 'text-green-900' : 'text-gray-700'}`}>Nequi</span>
                        <span className="text-[10px] text-gray-400 mt-0.5">Notificación Push</span>
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

                {paymentMethod === 'nequi' && (
                    <div className="animate-slide-in p-4 bg-pink-50 rounded-xl border border-pink-100 text-pink-800 text-sm flex gap-3">
                        <div className="shrink-0 mt-1">
                            <img src="/ico_nequi.png" alt="Nequi" className="w-5 h-5 object-contain" />
                        </div>
                        <div className="w-full">
                            <p className="mb-2">Ingresa el celular del cliente para enviar el cobro.</p>
                            <input
                                type="tel"
                                placeholder="Número de celular (300...)"
                                value={nequiPhone}
                                onChange={(e) => setNequiPhone(e.target.value)}
                                className="w-full p-2 border border-pink-300 rounded-lg"
                            />
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
