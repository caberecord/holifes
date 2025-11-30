import React from 'react';
import { Check, Printer, Download, Mail, RefreshCw } from "lucide-react";

interface POSSuccessProps {
    lastSaleData: any;
    onPrint: () => void;
    onDownload: () => void;
    onResendEmail: () => void;
    onNewSale: () => void;
}

export const POSSuccess: React.FC<POSSuccessProps> = ({
    lastSaleData,
    onPrint,
    onDownload,
    onResendEmail,
    onNewSale
}) => {
    if (!lastSaleData) return null;

    return (
        <div className="flex flex-col h-full items-center justify-center p-4 text-center animate-slide-in print:hidden">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                <Check size={32} strokeWidth={3} />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-1">¡Venta Exitosa!</h2>
            <p className="text-gray-500 mb-6 max-w-md text-sm">
                Enviado a <span className="font-bold text-gray-800">{lastSaleData.attendees[0]?.Email}</span>.
            </p>

            <div className="bg-gray-50 rounded-xl p-4 w-full max-w-sm border border-gray-200 mb-6">
                <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-200">
                    <span className="text-gray-500 text-sm">Total</span>
                    <span className="text-lg font-bold text-gray-900">${lastSaleData.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Método</span>
                    <span className="font-medium text-gray-900 capitalize">{lastSaleData.paymentMethod === 'card' ? 'Tarjeta' : 'Efectivo'}</span>
                </div>
                {lastSaleData.change > 0 && (
                    <div className="flex justify-between items-center text-green-600 text-sm mt-1">
                        <span>Cambio</span>
                        <span className="font-bold">${lastSaleData.change.toLocaleString()}</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-3 gap-3 w-full max-w-md mb-6">
                <button onClick={onPrint} className="flex flex-col items-center justify-center p-3 bg-white border border-gray-200 rounded-xl hover:border-indigo-500 hover:text-indigo-600 transition-all group">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mb-1 group-hover:bg-indigo-50 transition-colors">
                        <Printer size={18} />
                    </div>
                    <span className="font-bold text-xs">Imprimir</span>
                </button>
                <button onClick={onDownload} className="flex flex-col items-center justify-center p-3 bg-white border border-gray-200 rounded-xl hover:border-indigo-500 hover:text-indigo-600 transition-all group">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mb-1 group-hover:bg-indigo-50 transition-colors">
                        <Download size={18} />
                    </div>
                    <span className="font-bold text-xs">Descargar</span>
                </button>
                <button onClick={onResendEmail} className="flex flex-col items-center justify-center p-3 bg-white border border-gray-200 rounded-xl hover:border-indigo-500 hover:text-indigo-600 transition-all group">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mb-1 group-hover:bg-indigo-50 transition-colors">
                        <Mail size={18} />
                    </div>
                    <span className="font-bold text-xs">Reenviar</span>
                </button>
            </div>

            <button
                onClick={onNewSale}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 text-sm"
            >
                <RefreshCw size={16} /> Nueva Venta
            </button>
        </div>
    );
};
