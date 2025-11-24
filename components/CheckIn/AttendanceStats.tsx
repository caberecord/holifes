"use client";
import { Users, TrendingUp } from "lucide-react";

interface AttendanceStatsProps {
    checkedIn: number;
    total: number;
    percentage: number;
}

export default function AttendanceStats({ checkedIn, total, percentage }: AttendanceStatsProps) {
    const getColorClass = () => {
        if (percentage >= 95) return 'text-red-600 bg-red-50 border-red-200';
        if (percentage >= 80) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        return 'text-green-600 bg-green-50 border-green-200';
    };

    const getProgressColor = () => {
        if (percentage >= 95) return 'bg-red-500';
        if (percentage >= 80) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    return (
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-lg">
            {/* Title */}
            <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-gray-900">Asistencia en Tiempo Real</h3>
            </div>

            {/* Large Percentage Display */}
            <div className={`${getColorClass()} border-2 rounded-xl p-6 mb-4 text-center`}>
                <div className="text-6xl font-black mb-2">
                    {percentage}%
                </div>
                <div className="flex items-center justify-center gap-2 text-sm font-medium">
                    <Users className="w-4 h-4" />
                    <span>{checkedIn} / {total}</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
                <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className={`h-full ${getProgressColor()} transition-all duration-500 ease-out`}
                        style={{ width: `${percentage}%` }}
                    ></div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <p className="text-xs text-blue-600 uppercase tracking-wider mb-1">Registrados</p>
                    <p className="text-2xl font-bold text-blue-900">{checkedIn}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-600 uppercase tracking-wider mb-1">Pendientes</p>
                    <p className="text-2xl font-bold text-gray-900">{total - checkedIn}</p>
                </div>
            </div>

            {/* Status Indicator */}
            <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Actualización automática</span>
                </div>
            </div>
        </div>
    );
}
