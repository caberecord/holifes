"use client";
import { CheckCircle, XCircle, AlertTriangle, Clock } from "lucide-react";
import { ValidationResult } from "../../types/user";

interface ValidationResultDisplayProps {
    result: ValidationResult | null;
    canViewDetails: boolean;
    onClose: () => void;
}

export default function ValidationResultDisplay({ result, canViewDetails, onClose }: ValidationResultDisplayProps) {
    if (!result) return null;

    const getStatusConfig = () => {
        switch (result.status) {
            case 'VALID':
                return {
                    bg: 'bg-green-600',
                    icon: <CheckCircle className="w-24 h-24" />,
                    title: '¡Check-in Exitoso!',
                };
            case 'ALREADY_CHECKED_IN':
                return {
                    bg: 'bg-yellow-500',
                    icon: <Clock className="w-24 h-24" />,
                    title: 'Ya Registrado',
                };
            case 'WRONG_EVENT':
                return {
                    bg: 'bg-orange-500',
                    icon: <AlertTriangle className="w-24 h-24" />,
                    title: 'Evento Incorrecto',
                };
            default:
                return {
                    bg: 'bg-red-600',
                    icon: <XCircle className="w-24 h-24" />,
                    title: 'Ticket Inválido',
                };
        }
    };

    const config = getStatusConfig();

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
            onClick={onClose}
        >
            <div
                className="w-full max-w-md animate-in fade-in zoom-in duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Status Header */}
                <div className={`${config.bg} text-white p-8 rounded-t-2xl text-center`}>
                    <div className="flex justify-center mb-4">
                        {config.icon}
                    </div>
                    <h2 className="text-3xl font-bold mb-2">{config.title}</h2>
                    <p className="text-white/90">{result.message}</p>
                </div>

                {/* Attendee Details */}
                <div className="bg-white p-6 rounded-b-2xl">
                    {result.attendee && (
                        <div className="space-y-4">
                            {/* Name - Always shown */}
                            <div className="text-center pb-4 border-b border-gray-200">
                                <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Asistente</p>
                                <h3 className="text-2xl font-bold text-gray-900">{result.attendee.Name}</h3>
                            </div>

                            {/* Details - Only if staff has permission */}
                            {canViewDetails && (
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-500 mb-1">Email</p>
                                        <p className="font-medium text-gray-900 truncate">{result.attendee.Email}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 mb-1">Zona</p>
                                        <p className="font-medium text-gray-900">{result.attendee.Zone || 'General'}</p>
                                    </div>
                                    {result.attendee.Seat && (
                                        <div>
                                            <p className="text-gray-500 mb-1">Asiento</p>
                                            <p className="font-medium text-gray-900">{result.attendee.Seat}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Check-in Info */}
                            {result.checkInInfo && result.status === 'ALREADY_CHECKED_IN' && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                    <p className="text-xs text-yellow-800">
                                        Registrado: {new Date(result.checkInInfo.checkInTime!).toLocaleString('es-ES')}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="w-full mt-6 bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                    >
                        Continuar Escaneando
                    </button>
                </div>
            </div>
        </div>
    );
}
