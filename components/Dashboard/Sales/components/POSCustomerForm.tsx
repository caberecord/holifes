import React from 'react';
import { CreditCard, User, Mail, Phone, Sparkles } from "lucide-react";
import { POSAttendee } from "@/types/pos";

interface POSCustomerFormProps {
    mainAttendee: POSAttendee;
    setMainAttendee: (data: POSAttendee) => void;
    onSearchContact: (idNumber: string) => void;
    isSearchingContact: boolean;
}

export const POSCustomerForm: React.FC<POSCustomerFormProps> = ({
    mainAttendee,
    setMainAttendee,
    onSearchContact,
    isSearchingContact
}) => {
    return (
        <div className="flex flex-col h-full animate-slide-in">
            <div className="p-5 border-b border-gray-100 bg-gray-50">
                <h2 className="text-lg font-bold text-gray-900">Datos del Cliente</h2>
                <p className="text-xs text-gray-500">Completa la información personal</p>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto">
                <div className="space-y-4 max-w-lg">
                    <div className="flex gap-2">
                        <div className="w-1/3">
                            <select
                                value={mainAttendee.idType}
                                onChange={(e) => setMainAttendee({ ...mainAttendee, idType: e.target.value as any })}
                                className="w-full p-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:bg-white transition-all"
                            >
                                <option value="CC">C.C.</option>
                                <option value="CE">C.E.</option>
                                <option value="TI">T.I.</option>
                                <option value="PASSPORT">Pasaporte</option>
                                <option value="NIT">NIT</option>
                            </select>
                        </div>
                        <div className="relative group flex-1">
                            <CreditCard size={16} className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                            <input
                                type="text"
                                placeholder="Número de Documento"
                                value={mainAttendee.idNumber}
                                onChange={(e) => setMainAttendee({ ...mainAttendee, idNumber: e.target.value })}
                                onBlur={() => onSearchContact(mainAttendee.idNumber)}
                                className="w-full pl-9 pr-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:bg-white transition-all"
                            />
                            {isSearchingContact && (
                                <div className="absolute right-3 top-3.5">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="relative group">
                        <User size={16} className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Nombre completo"
                            value={mainAttendee.name}
                            onChange={(e) => setMainAttendee({ ...mainAttendee, name: e.target.value })}
                            className="w-full pl-9 pr-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:bg-white transition-all"
                        />
                    </div>

                    <div className="relative group">
                        <Mail size={16} className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                        <input
                            type="email"
                            placeholder="Correo electrónico"
                            value={mainAttendee.email}
                            onChange={(e) => setMainAttendee({ ...mainAttendee, email: e.target.value })}
                            className="w-full pl-9 pr-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:bg-white transition-all"
                        />
                    </div>

                    <div className="relative group">
                        <Phone size={16} className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                        <input
                            type="tel"
                            placeholder="Teléfono (Opcional)"
                            value={mainAttendee.phone}
                            onChange={(e) => setMainAttendee({ ...mainAttendee, phone: e.target.value })}
                            className="w-full pl-9 pr-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:bg-white transition-all"
                        />
                    </div>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg flex items-start gap-2 text-xs text-blue-700 max-w-lg">
                    <Sparkles size={14} className="mt-0.5 shrink-0" />
                    <p>Estos datos se usarán para enviar los tickets QR y el recibo de compra.</p>
                </div>
            </div>
        </div>
    );
};
