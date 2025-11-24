"use client";
import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion } from "firebase/firestore";
import { Event } from "@/types/event";
import {
    Ticket, Users, CreditCard, CheckCircle, Search, Calendar, MapPin, Mail,
    User, Phone, CreditCard as IdCard, Printer, Download, RefreshCw, Check, ChevronRight, DollarSign, FileText
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { generateSecureTicketId, generateQRPayload } from "@/lib/ticketSecurity";
import { toast } from "react-toastify";
import { QRCodeSVG } from 'qrcode.react';

const steps = [
    { id: 1, name: "Evento" },
    { id: 2, name: "Asistentes" },
    { id: 3, name: "Pago" },
    { id: 4, name: "Fin" },
];

export default function POSModule() {
    const { user } = useAuth();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

    // Ticket Selection State
    const [selectedZone, setSelectedZone] = useState<string>("");
    const [ticketQuantity, setTicketQuantity] = useState<number>(1);

    // Attendee Data State
    const [sameInfo, setSameInfo] = useState(true);
    const [mainAttendee, setMainAttendee] = useState({ name: "", email: "", phone: "", idNumber: "" });
    const [attendeesList, setAttendeesList] = useState<any[]>([]);

    // Payment State
    const [paymentMethod, setPaymentMethod] = useState("Efectivo");
    const [cashReceived, setCashReceived] = useState<string>("");
    const [isProcessing, setIsProcessing] = useState(false);

    // Receipt & Ticket State
    const [lastSaleData, setLastSaleData] = useState<any>(null);
    const receiptRef = useRef<HTMLDivElement>(null);
    const ticketsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchEvents = async () => {
            if (!user) return;

            try {
                const q = query(
                    collection(db, "events"),
                    where("organizerId", "==", user.uid),
                    where("status", "==", "published")
                );

                const querySnapshot = await getDocs(q);
                const eventsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Event[];

                const now = new Date();
                const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

                const activeEvents = eventsData.filter(event => {
                    const hasManualSales =
                        event.distribution?.methods?.includes('manual') ||
                        event.distribution?.method === 'manual';

                    if (!hasManualSales) return false;

                    if (!event.date) return false;

                    const eventDateStr = event.date;
                    const eventTimeStr = event.endTime || "23:59";
                    const eventEndDateTime = new Date(`${eventDateStr}T${eventTimeStr}`);

                    return eventEndDateTime > oneDayAgo;
                });

                // Sort events by date (newest first)
                activeEvents.sort((a, b) => {
                    const dateA = new Date(a.date || 0).getTime();
                    const dateB = new Date(b.date || 0).getTime();
                    return dateB - dateA;
                });

                setEvents(activeEvents);
            } catch (error) {
                console.error("Error fetching events:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, [user]);

    const handleEventSelect = (event: Event) => {
        setSelectedEvent(event);
        setSelectedZone(event.venue?.zones[0]?.name || "");
        setCurrentStep(1);
    };

    const handleContinueToAttendees = () => {
        if (!selectedZone) {
            toast.error("Selecciona una zona");
            return;
        }

        const newAttendees = Array(ticketQuantity).fill(null).map(() => ({
            name: "", email: "", phone: "", idNumber: ""
        }));

        if (sameInfo && mainAttendee.name) {
            newAttendees.forEach(a => {
                a.name = mainAttendee.name;
                a.email = mainAttendee.email;
                a.phone = mainAttendee.phone;
                a.idNumber = mainAttendee.idNumber;
            });
        }

        setAttendeesList(newAttendees);
        setCurrentStep(2);
    };

    const handleContinueToPayment = () => {
        if (sameInfo) {
            if (!mainAttendee.name || !mainAttendee.email) {
                toast.error("Completa los datos del comprador principal");
                return;
            }
        } else {
            const isValid = attendeesList.every(a => a.name && a.email);
            if (!isValid) {
                toast.error("Completa los datos de todos los asistentes");
                return;
            }
        }
        setCurrentStep(3);
    };

    const handleCompleteSale = async () => {
        if (!selectedEvent || !selectedEvent.id || !user) return;

        const selectedZonePrice = selectedEvent?.venue?.zones.find(z => z.name === selectedZone)?.price || 0;
        const total = selectedZonePrice * ticketQuantity;

        if (paymentMethod === "Efectivo") {
            const cash = parseFloat(cashReceived) || 0;
            if (cash < total) {
                toast.error("El monto recibido es insuficiente");
                return;
            }
        }

        setIsProcessing(true);

        try {
            const finalAttendees = sameInfo
                ? Array(ticketQuantity).fill(mainAttendee)
                : attendeesList;

            const processedAttendees = await Promise.all(finalAttendees.map(async (att, index) => {
                const uniqueSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
                const timestamp = Date.now().toString(36).toUpperCase();
                const baseTicketId = `POS-${timestamp}-${uniqueSuffix}`;

                const secureTicketId = await generateSecureTicketId(
                    baseTicketId,
                    att.email,
                    selectedEvent.id!
                );

                // Generate JSON QR payload (new secure format)
                const qrPayload = await generateQRPayload(
                    baseTicketId,
                    selectedEvent.id!,
                    att.email
                );

                return {
                    id: Date.now() + index,
                    Name: att.name,
                    Email: att.email,
                    Phone: att.phone,
                    IdNumber: att.idNumber,
                    Zone: selectedZone,
                    Status: "Activo", // Changed to Activo per user request
                    ticketId: secureTicketId,
                    qrPayload: qrPayload,
                    purchaseDate: new Date().toISOString(),
                    paymentMethod: paymentMethod,
                    soldBy: user.email,
                    checkedIn: false,
                    checkInTime: null,
                    checkInBy: null
                };
            }));

            const eventRef = doc(db, "events", selectedEvent.id);
            await updateDoc(eventRef, {
                "distribution.uploadedGuests": arrayUnion(...processedAttendees)
            });

            // Send Emails (Non-blocking)
            processedAttendees.forEach(async (attendee) => {
                try {
                    await fetch('/api/send-ticket', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: attendee.Email,
                            attendeeName: attendee.Name,
                            eventName: selectedEvent.name,
                            eventDate: selectedEvent.date,
                            eventTime: selectedEvent.startTime,
                            eventLocation: selectedEvent.location,
                            ticketId: attendee.ticketId,
                            eventId: selectedEvent.id, // New: Pass eventId for QR generation
                            qrPayload: attendee.qrPayload, // New: Send JSON payload
                            zone: attendee.Zone,
                            seat: "General"
                        }),
                    });
                } catch (emailError) {
                    console.error("Error sending email to", attendee.Email, emailError);
                }
            });

            // Save sale data for receipt
            setLastSaleData({
                event: selectedEvent,
                attendees: processedAttendees,
                total: total,
                cashReceived: parseFloat(cashReceived) || total,
                change: (parseFloat(cashReceived) || total) - total,
                date: new Date(),
                paymentMethod
            });

            toast.success("¡Venta completada exitosamente!");
            setCurrentStep(4);

        } catch (error) {
            console.error("Error completing sale:", error);
            toast.error("Hubo un error al procesar la venta.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePrintReceipt = () => {
        if (!receiptRef.current) return;
        const printContent = receiptRef.current.innerHTML;
        const originalContents = document.body.innerHTML;

        document.body.innerHTML = printContent;
        window.print();
        document.body.innerHTML = originalContents;
        window.location.reload();
    };

    const handlePrintTickets = () => {
        if (!ticketsRef.current) return;
        const printContent = ticketsRef.current.innerHTML;
        const originalContents = document.body.innerHTML;

        document.body.innerHTML = printContent;
        window.print();
        document.body.innerHTML = originalContents;
        window.location.reload();
    };

    const handleNewSale = () => {
        setSelectedEvent(null);
        setCurrentStep(1);
        setTicketQuantity(1);
        setMainAttendee({ name: "", email: "", phone: "", idNumber: "" });
        setAttendeesList([]);
        setCashReceived("");
        setLastSaleData(null);
    };

    const chunkArray = (arr: any[], size: number) => {
        return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
            arr.slice(i * size, i * size + size)
        );
    };

    const selectedZonePrice = selectedEvent?.venue?.zones.find(z => z.name === selectedZone)?.price || 0;
    const total = selectedZonePrice * ticketQuantity;
    const change = (parseFloat(cashReceived) || 0) - total;

    if (loading) return <div className="p-8 text-center">Cargando eventos...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Progress Bar */}
            <div className="mb-8 max-w-3xl mx-auto">
                <div className="flex items-center justify-between relative">
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 -z-10" />
                    <div
                        className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-indigo-600 -z-10 transition-all duration-500"
                        style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                    />

                    {steps.map((step) => (
                        <div key={step.id} className="flex flex-col items-center bg-white px-2">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${step.id < currentStep
                                    ? "bg-indigo-600 border-indigo-600 text-white"
                                    : step.id === currentStep
                                        ? "border-indigo-600 text-indigo-600 bg-white"
                                        : "border-gray-300 text-gray-400 bg-white"
                                    }`}
                            >
                                {step.id < currentStep ? (
                                    <Check className="w-6 h-6" />
                                ) : (
                                    <span className="font-semibold">{step.id}</span>
                                )}
                            </div>
                            <span
                                className={`mt-2 text-sm font-medium ${step.id <= currentStep ? "text-indigo-600" : "text-gray-500"
                                    }`}
                            >
                                {step.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Steps */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 min-h-[500px]">

                        {/* Step 1: Event & Tickets */}
                        {currentStep === 1 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-4">Selecciona un Evento (v1.1)</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {events.map(event => (
                                            <div
                                                key={event.id}
                                                onClick={() => handleEventSelect(event)}
                                                className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${selectedEvent?.id === event.id ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200' : 'border-gray-200 hover:border-gray-300 hover:shadow-md'}`}
                                            >
                                                <h3 className="font-bold text-gray-900">{event.name}</h3>
                                                <p className="text-sm text-gray-500 flex items-center mt-2">
                                                    <Calendar className="w-4 h-4 mr-1.5" /> {event.date}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {selectedEvent && (
                                    <div className="pt-6 border-t border-gray-100">
                                        <h2 className="text-xl font-bold text-gray-900 mb-4">Configura los Tickets</h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Zona / Localidad</label>
                                                <select
                                                    value={selectedZone}
                                                    onChange={(e) => setSelectedZone(e.target.value)}
                                                    className="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 py-3"
                                                >
                                                    {selectedEvent.venue?.zones.map(zone => (
                                                        <option key={zone.id} value={zone.name}>
                                                            {zone.name} - ${zone.price.toLocaleString()}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad</label>
                                                <div className="flex items-center">
                                                    <button
                                                        onClick={() => setTicketQuantity(Math.max(1, ticketQuantity - 1))}
                                                        className="w-12 h-12 rounded-l-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-xl font-bold text-gray-600"
                                                    >-</button>
                                                    <input
                                                        type="number"
                                                        value={ticketQuantity}
                                                        readOnly
                                                        className="w-24 h-12 border-y border-gray-300 text-center text-lg font-bold focus:ring-0"
                                                    />
                                                    <button
                                                        onClick={() => setTicketQuantity(Math.min(10, ticketQuantity + 1))}
                                                        className="w-12 h-12 rounded-r-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-xl font-bold text-gray-600"
                                                    >+</button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-8 flex justify-end">
                                            <button
                                                onClick={handleContinueToAttendees}
                                                className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                            >
                                                Continuar <ChevronRight className="w-5 h-5 ml-2" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 2: Attendees */}
                        {currentStep === 2 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                                    <h2 className="text-xl font-bold text-gray-900">Datos del Asistente</h2>
                                    {ticketQuantity > 1 && (
                                        <div className="bg-indigo-50 p-1.5 rounded-lg flex">
                                            <button
                                                onClick={() => setSameInfo(true)}
                                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${sameInfo ? 'bg-white text-indigo-700 shadow-sm' : 'text-indigo-600 hover:bg-indigo-100'}`}
                                            >
                                                Mismos datos para todos
                                            </button>
                                            <button
                                                onClick={() => setSameInfo(false)}
                                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${!sameInfo ? 'bg-white text-indigo-700 shadow-sm' : 'text-indigo-600 hover:bg-indigo-100'}`}
                                            >
                                                Datos individuales
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {sameInfo ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type="text"
                                                    value={mainAttendee.name}
                                                    onChange={(e) => setMainAttendee({ ...mainAttendee, name: e.target.value })}
                                                    className="w-full pl-10 py-3 rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                                                    placeholder="Ej. Juan Pérez"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type="email"
                                                    value={mainAttendee.email}
                                                    onChange={(e) => setMainAttendee({ ...mainAttendee, email: e.target.value })}
                                                    className="w-full pl-10 py-3 rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                                                    placeholder="juan@ejemplo.com"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type="tel"
                                                    value={mainAttendee.phone}
                                                    onChange={(e) => setMainAttendee({ ...mainAttendee, phone: e.target.value })}
                                                    className="w-full pl-10 py-3 rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                                                    placeholder="+57 300..."
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Cédula / ID</label>
                                            <div className="relative">
                                                <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type="text"
                                                    value={mainAttendee.idNumber}
                                                    onChange={(e) => setMainAttendee({ ...mainAttendee, idNumber: e.target.value })}
                                                    className="w-full pl-10 py-3 rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                                                    placeholder="123456789"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {attendeesList.map((att, idx) => (
                                            <div key={idx} className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                                                <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                                                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs mr-2">{idx + 1}</span>
                                                    Asistente #{idx + 1}
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <input
                                                        type="text"
                                                        placeholder="Nombre"
                                                        value={att.name}
                                                        onChange={(e) => {
                                                            const newList = [...attendeesList];
                                                            newList[idx].name = e.target.value;
                                                            setAttendeesList(newList);
                                                        }}
                                                        className="rounded-lg border-gray-300 py-2"
                                                    />
                                                    <input
                                                        type="email"
                                                        placeholder="Email"
                                                        value={att.email}
                                                        onChange={(e) => {
                                                            const newList = [...attendeesList];
                                                            newList[idx].email = e.target.value;
                                                            setAttendeesList(newList);
                                                        }}
                                                        className="rounded-lg border-gray-300 py-2"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="mt-8 flex justify-between pt-6 border-t border-gray-100">
                                    <button
                                        onClick={() => setCurrentStep(1)}
                                        className="text-gray-600 font-medium hover:text-gray-900 px-4 py-2"
                                    >
                                        Atrás
                                    </button>
                                    <button
                                        onClick={handleContinueToPayment}
                                        className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                    >
                                        Continuar al Pago <ChevronRight className="w-5 h-5 ml-2" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Payment */}
                        {currentStep === 3 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-6">Método de Pago</h2>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                                        {['Efectivo', 'Transferencia', 'Nequi', 'Daviplata', 'Tarjeta'].map(method => (
                                            <button
                                                key={method}
                                                onClick={() => setPaymentMethod(method)}
                                                className={`p-4 rounded-xl border-2 text-sm font-bold transition-all flex flex-col items-center justify-center gap-2 h-24 ${paymentMethod === method ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200' : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}
                                            >
                                                {method === 'Efectivo' && <DollarSign className="w-6 h-6" />}
                                                {method === 'Tarjeta' && <CreditCard className="w-6 h-6" />}
                                                {['Transferencia', 'Nequi', 'Daviplata'].includes(method) && <RefreshCw className="w-6 h-6" />}
                                                {method}
                                            </button>
                                        ))}
                                    </div>

                                    {paymentMethod === 'Efectivo' && (
                                        <div className="bg-green-50 rounded-xl p-6 border border-green-100 mb-6">
                                            <label className="block text-sm font-bold text-green-800 mb-2">Dinero Recibido</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-green-600 font-bold text-lg">$</span>
                                                <input
                                                    type="number"
                                                    value={cashReceived}
                                                    onChange={(e) => setCashReceived(e.target.value)}
                                                    className="w-full pl-8 pr-4 py-3 rounded-lg border-green-200 focus:ring-green-500 focus:border-green-500 text-lg font-bold text-green-900 placeholder-green-300"
                                                    placeholder="0"
                                                />
                                            </div>
                                            {/* Explicitly showing Change here as requested */}
                                            <div className="mt-4 flex justify-between items-center pt-4 border-t border-green-200">
                                                <span className="text-green-700 font-medium text-lg">Vueltas / Cambio:</span>
                                                <span className={`text-2xl font-bold ${change >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                                                    ${change >= 0 ? change.toLocaleString() : 'Insuficiente'}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-8 flex justify-start pt-6 border-t border-gray-100">
                                    <button
                                        onClick={() => setCurrentStep(2)}
                                        className="text-gray-600 font-medium hover:text-gray-900 px-4 py-2"
                                    >
                                        Atrás
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Success & Receipt */}
                        {currentStep === 4 && lastSaleData && (
                            <div className="text-center py-8 animate-in zoom-in duration-300">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Check className="w-10 h-10 text-green-600" />
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">¡Venta Exitosa!</h2>
                                <p className="text-gray-500 mb-8">Los tickets han sido enviados a {mainAttendee.email}</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto">
                                    <button
                                        onClick={handlePrintReceipt}
                                        className="flex items-center justify-center px-6 py-4 border-2 border-gray-200 rounded-xl font-bold text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all"
                                    >
                                        <FileText className="w-5 h-5 mr-2" />
                                        Imprimir Tirilla
                                    </button>
                                    <button
                                        onClick={handlePrintTickets}
                                        className="flex items-center justify-center px-6 py-4 border-2 border-gray-200 rounded-xl font-bold text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all"
                                    >
                                        <Printer className="w-5 h-5 mr-2" />
                                        Imprimir Boletos
                                    </button>
                                    <button
                                        onClick={handlePrintTickets} // Using same print view for now, user can save as PDF
                                        className="flex items-center justify-center px-6 py-4 border-2 border-gray-200 rounded-xl font-bold text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all"
                                    >
                                        <Download className="w-5 h-5 mr-2" />
                                        Descargar PDF
                                    </button>
                                    <button
                                        onClick={handleNewSale}
                                        className="flex items-center justify-center px-6 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl"
                                    >
                                        <RefreshCw className="w-5 h-5 mr-2" />
                                        Nueva Venta
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Persistent Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                            <CreditCard className="w-5 h-5 mr-2 text-indigo-600" />
                            Resumen de Venta
                        </h3>

                        {selectedEvent ? (
                            <div className="space-y-4">
                                <div className="pb-4 border-b border-gray-100">
                                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Evento</p>
                                    <p className="font-medium text-gray-900">{selectedEvent.name}</p>
                                    <p className="text-sm text-gray-500">{selectedEvent.date}</p>
                                </div>

                                <div className="pb-4 border-b border-gray-100">
                                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Tickets</p>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-700">{ticketQuantity}x {selectedZone}</span>
                                        <span className="font-medium text-gray-900">${(selectedZonePrice * ticketQuantity).toLocaleString()}</span>
                                    </div>
                                </div>

                                {paymentMethod === 'Efectivo' && currentStep >= 3 && (
                                    <div className="pb-4 border-b border-gray-100 bg-green-50 p-3 rounded-lg -mx-2">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-green-700">Recibido:</span>
                                            <span className="font-bold text-green-700">${parseFloat(cashReceived || "0").toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-green-700">Cambio:</span>
                                            <span className={`font-bold ${change >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                                                ${change >= 0 ? change.toLocaleString() : 'Insuficiente'}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <div className="pt-2">
                                    <div className="flex justify-between items-center mb-6">
                                        <span className="text-lg font-bold text-gray-900">Total</span>
                                        <span className="text-2xl font-bold text-indigo-600">${total.toLocaleString()}</span>
                                    </div>

                                    {currentStep === 3 && (
                                        <button
                                            onClick={handleCompleteSale}
                                            disabled={isProcessing || (paymentMethod === 'Efectivo' && change < 0)}
                                            className="w-full bg-green-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isProcessing ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                                    Procesando...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle className="w-6 h-6 mr-2" />
                                                    Confirmar Venta
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-400">
                                <Search className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                <p>Selecciona un evento para ver el resumen</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Hidden Receipt for Printing */}
            <div className="hidden">
                <div ref={receiptRef} className="p-4 font-mono text-xs w-[300px]">
                    <div className="text-center mb-4">
                        <h1 className="text-lg font-bold">COMPROBANTE DE VENTA</h1>
                        <p>{new Date().toLocaleString()}</p>
                    </div>
                    {lastSaleData && (
                        <>
                            <div className="border-b border-black pb-2 mb-2">
                                <p><strong>Evento:</strong> {lastSaleData.event.name}</p>
                                <p><strong>Lugar:</strong> {lastSaleData.event.location}</p>
                                <p><strong>Fecha:</strong> {lastSaleData.event.date}</p>
                            </div>
                            <div className="mb-2">
                                {lastSaleData.attendees.map((att: any, i: number) => (
                                    <div key={i} className="mb-1">
                                        <p>Ticket #{att.ticketId}</p>
                                        <p>{att.Zone} - {att.Name}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-black pt-2 mb-4">
                                <div className="flex justify-between">
                                    <span>Total:</span>
                                    <span>${lastSaleData.total.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Efectivo:</span>
                                    <span>${lastSaleData.cashReceived.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Cambio:</span>
                                    <span>${lastSaleData.change.toLocaleString()}</span>
                                </div>
                            </div>
                        </>
                    )}
                    <div className="text-center">
                        <p>¡Gracias por su compra!</p>
                        <p>Conserve este recibo.</p>
                    </div>
                </div>
            </div>

            {/* Hidden Tickets for Printing */}
            <div className="hidden">
                <div ref={ticketsRef}>
                    <style type="text/css" media="print">
                        {`
                            @page { size: letter; margin: 0.5cm; }
                            .ticket-page { page-break-after: always; height: 100vh; display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 1cm; padding: 0.5cm; }
                            .ticket-page:last-child { page-break-after: auto; }
                        `}
                    </style>
                    {lastSaleData && chunkArray(lastSaleData.attendees, 4).map((chunk: any[], pageIndex: number) => (
                        <div key={pageIndex} className="ticket-page">
                            {chunk.map((att: any, i: number) => (
                                <div key={i} className="w-full h-full bg-white rounded-3xl border border-gray-200 overflow-hidden relative flex flex-col">
                                    {/* Header */}
                                    <div className="bg-indigo-600 p-4 text-center text-white relative overflow-hidden shrink-0">
                                        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                                        <h2 className="text-xl font-bold relative z-10 truncate">{lastSaleData.event.name}</h2>
                                        <p className="text-indigo-100 text-xs mt-1 relative z-10">{lastSaleData.event.date} • {lastSaleData.event.startTime}</p>
                                    </div>

                                    {/* Content */}
                                    <div className="p-4 flex-1 flex flex-col justify-between">
                                        {/* Attendee */}
                                        <div className="text-center">
                                            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">ASISTENTE</p>
                                            <p className="text-lg font-bold text-gray-900 truncate">{att.Name}</p>
                                            <p className="text-gray-500 text-xs truncate">{att.Email}</p>
                                        </div>

                                        {/* Divider */}
                                        <div className="border-t-2 border-dashed border-gray-100 my-2 relative">
                                            <div className="absolute -left-6 -top-2 w-4 h-4 bg-white border-r border-gray-200 rounded-full"></div>
                                            <div className="absolute -right-6 -top-2 w-4 h-4 bg-white border-l border-gray-200 rounded-full"></div>
                                        </div>

                                        {/* Details */}
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="text-left">
                                                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">ZONA</p>
                                                <p className="text-indigo-600 font-bold text-sm">{att.Zone}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">TICKET ID</p>
                                                <p className="text-gray-600 font-mono text-[10px] break-all max-w-[100px]">{att.ticketId}</p>
                                            </div>
                                        </div>

                                        {/* QR Code */}
                                        <div className="flex justify-center mt-auto pt-2">
                                            <QRCodeSVG value={att.qrPayload || att.ticketId} size={120} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
