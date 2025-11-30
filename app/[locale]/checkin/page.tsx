"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Event } from "@/types/event";
import { ValidationResult } from "@/types/user";
import { validateAndCheckIn, getAttendanceStats } from "@/lib/checkin/validateTicket";
import QRScanner from "@/components/CheckIn/QRScanner";
import { playErrorSound } from "@/lib/sounds";
import ValidationResultDisplay from "@/components/CheckIn/ValidationResult";
import AttendanceStats from "@/components/CheckIn/AttendanceStats";
import { QrCode, ChevronDown, Shield, LogOut } from "lucide-react";

export default function CheckInPage() {
    const { appUser, isStaff, loading, logout } = useAuth();
    const router = useRouter();
    const [assignedEvents, setAssignedEvents] = useState<Event[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<string>("");
    const [loadingEvents, setLoadingEvents] = useState(true);
    const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [attendanceStats, setAttendanceStats] = useState({ checkedIn: 0, total: 0, percentage: 0 });

    useEffect(() => {
        if (!loading && !isStaff) {
            router.push("/dashboard");
        }
    }, [loading, isStaff, router]);

    useEffect(() => {
        if (appUser && isStaff) {
            loadAssignedEvents();
        }
    }, [appUser, isStaff]);

    useEffect(() => {
        if (selectedEventId) {
            loadAttendanceStats();
            // Refresh stats every 5 seconds
            const interval = setInterval(loadAttendanceStats, 5000);
            return () => clearInterval(interval);
        }
    }, [selectedEventId]);

    const loadAssignedEvents = async () => {
        try {
            setLoadingEvents(true);
            const eventIds = appUser?.assignedEvents || [];

            if (eventIds.length === 0) {
                setAssignedEvents([]);
                return;
            }

            const eventsQuery = query(
                collection(db, "events"),
                where("__name__", "in", eventIds)
            );
            const querySnapshot = await getDocs(eventsQuery);
            const events: Event[] = [];
            querySnapshot.forEach((doc) => {
                events.push({ id: doc.id, ...doc.data() } as Event);
            });
            setAssignedEvents(events);

            // Auto-select first event if only one
            if (events.length === 1) {
                setSelectedEventId(events[0].id!);
            }
        } catch (error) {
            console.error("Error loading events:", error);
        } finally {
            setLoadingEvents(false);
        }
    };

    const loadAttendanceStats = async () => {
        if (!selectedEventId) return;
        const stats = await getAttendanceStats(selectedEventId);
        setAttendanceStats(stats);
    };

    const handleScan = async (ticketId: string) => {
        if (!selectedEventId || isProcessing) return;

        setIsProcessing(true);
        const result = await validateAndCheckIn(
            ticketId,
            selectedEventId,
            appUser?.uid || "",
            appUser?.displayName || appUser?.email || "Staff"
        );
        setValidationResult(result);
        setIsProcessing(false);

        // Refresh stats after successful check-in
        if (result.status === 'VALID') {
            await loadAttendanceStats();
        } else {
            playErrorSound();
        }
    };

    const selectedEvent = assignedEvents.find(e => e.id === selectedEventId);

    if (loading || !appUser) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
                <div className="text-lg text-gray-600">Cargando...</div>
            </div>
        );
    }

    if (!isStaff) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-indigo-600 flex items-center justify-center">
                                <QrCode className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Check-in Scanner</h1>
                                <p className="text-sm text-gray-500">{appUser.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => logout()}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Cerrar Sesión"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
                {/* Event Selector */}
                {loadingEvents ? (
                    <div className="bg-white rounded-xl border-2 border-gray-200 p-6 text-center">
                        <p className="text-gray-500">Cargando eventos...</p>
                    </div>
                ) : assignedEvents.length === 0 ? (
                    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 text-center">
                        <Shield className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-yellow-900 mb-2">
                            No tienes eventos asignados
                        </h3>
                        <p className="text-yellow-700">
                            Contacta al organizador para que te asigne eventos
                        </p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border-2 border-gray-200 p-4 shadow-lg">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Selecciona el Evento
                        </label>
                        <div className="relative">
                            <select
                                value={selectedEventId}
                                onChange={(e) => setSelectedEventId(e.target.value)}
                                className="w-full px-4 py-3 pr-10 border-2 border-gray-300 rounded-lg appearance-none bg-white text-gray-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="">-- Selecciona un evento --</option>
                                {assignedEvents.map((event) => (
                                    <option key={event.id} value={event.id}>
                                        {event.name || event.title} - {event.date}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                        </div>
                    </div>
                )}

                {/* Scanner and Stats */}
                {selectedEventId && (
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* QR Scanner */}
                        <div>
                            <QRScanner
                                key={selectedEventId} // Force remount on event change
                                onScan={handleScan}
                                isProcessing={isProcessing || validationResult !== null}
                            />
                        </div>

                        {/* Attendance Stats */}
                        <div>
                            <AttendanceStats
                                checkedIn={attendanceStats.checkedIn}
                                total={attendanceStats.total}
                                percentage={attendanceStats.percentage}
                            />

                            {/* Event Info */}
                            <div className="mt-4 bg-white rounded-xl border-2 border-gray-200 p-4 shadow-lg">
                                <h4 className="font-bold text-gray-900 mb-2">{selectedEvent?.name || selectedEvent?.title}</h4>
                                <div className="text-sm space-y-1 text-gray-600">
                                    <p>📅 {selectedEvent?.date}</p>
                                    <p>🕐 {selectedEvent?.startTime} - {selectedEvent?.endTime}</p>
                                    <p>📍 {selectedEvent?.location}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Instructions */}
                {!selectedEventId && assignedEvents.length > 0 && (
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 text-center">
                        <QrCode className="w-16 h-16 text-blue-600 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-blue-900 mb-2">
                            Selecciona un evento para comenzar
                        </h3>
                        <p className="text-blue-700">
                            El escáner se activará automáticamente al seleccionar un evento
                        </p>
                    </div>
                )}
            </main>

            {/* Validation Result Modal */}
            {validationResult && (
                <ValidationResultDisplay
                    result={validationResult}
                    canViewDetails={appUser.permissions?.canViewAttendeeDetails || false}
                    onClose={() => setValidationResult(null)}
                />
            )}
        </div>
    );
}
