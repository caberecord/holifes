"use client";
import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, onSnapshot } from "firebase/firestore";
import { Event } from "@/types/event";
import {
    Calendar,
    ChevronRight,
    CheckCircle,
    ArrowLeft,
    ShoppingBag,
    Trash2,
    CreditCard,
    Banknote,
    Sparkles
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
import { POSEventSelector } from "./components/POSEventSelector";
import { POSCart } from "./components/POSCart";
import { POSCustomerForm } from "./components/POSCustomerForm";
import { POSPayment } from "./components/POSPayment";
import { POSSuccess } from "./components/POSSuccess";
import { usePOS } from "@/hooks/usePOS";
import { posService } from "@/services/posService";

// Estilos CSS en línea para animaciones
const styles = `
  @keyframes orbit {
    from { transform: rotate(0deg) translateX(50px) rotate(0deg); }
    to   { transform: rotate(360deg) translateX(50px) rotate(-360deg); }
  }
  .animate-orbit {
    animation: orbit 10s linear infinite;
  }
  .animate-orbit-delay {
    animation-delay: -5s;
  }
  @keyframes slideIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-slide-in {
    animation: slideIn 0.4s ease-out forwards;
  }
`;

const steps = [
    { id: 1, name: "Evento" },
    { id: 2, name: "Entradas" },
    { id: 3, name: "Cliente" },
    { id: 4, name: "Pago" },
];

export default function POSModule() {
    const { user, appUser } = useAuth();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);

    const {
        cart,
        setCart,
        mainAttendee,
        setMainAttendee,
        paymentMethod,
        setPaymentMethod,
        cashReceived,
        setCashReceived,
        isProcessing,
        lastSaleData,
        soldByZone,
        handleAddToCart,
        handleClearCart,
        totalAmount,
        totalItems,
        processSale,
        resetSale,
        isSearchingContact,
        setIsSearchingContact,
        selectedSeats,
        handleSelectSeats
    } = usePOS(user, selectedEvent);

    useEffect(() => {
        const fetchEvents = async () => {
            if (!user || !appUser) return;
            try {
                const organizerId = appUser.role === 'staff' && appUser.createdBy
                    ? appUser.createdBy
                    : user.uid;

                const now = new Date();
                const yesterday = new Date(now);
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];

                const q = query(
                    collection(db, "events"),
                    where("organizerId", "==", organizerId),
                    where("status", "==", "published"),
                    where("date", ">=", yesterdayStr)
                );

                const querySnapshot = await getDocs(q);
                const eventsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Event[];

                const activeEvents = eventsData.filter(event => {
                    const hasManualSales =
                        event.distribution?.methods?.includes('manual') ||
                        event.distribution?.method === 'manual';

                    if (!hasManualSales) return false;

                    if (!event.date) return false;
                    const eventDateStr = event.date;
                    const eventTimeStr = event.endTime || "23:59";
                    const eventEndDateTime = new Date(`${eventDateStr}T${eventTimeStr}`);
                    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                    return eventEndDateTime > oneDayAgo;
                });

                activeEvents.sort((a, b) => {
                    const dateA = new Date(a.date || 0).getTime();
                    const dateB = new Date(b.date || 0).getTime();
                    return dateB - dateA;
                });

                setEvents(activeEvents);
            } catch (error) {
                console.error("Error fetching events:", error);
                toast.error("Error al cargar eventos. Verifique su conexión.");
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, [user, appUser]);

    useEffect(() => {
        if (!selectedEvent?.id) return;
        const unsubscribe = onSnapshot(doc(db, "events", selectedEvent.id), (doc) => {
            if (doc.exists()) {
                const updatedEvent = { id: doc.id, ...doc.data() } as Event;
                setSelectedEvent(prev => ({ ...prev, ...updatedEvent }));

                // Sync with events list to prevent stale data when going back to Step 1
                setEvents(prevEvents => prevEvents.map(e => e.id === updatedEvent.id ? updatedEvent : e));
            }
        });
        return () => unsubscribe();
    }, [selectedEvent?.id]);

    const handleEventSelect = (event: Event) => {
        setSelectedEvent(event);
        handleClearCart();
        setCurrentStep(2);
    };

    const handleSearchContact = async (idNumber: string) => {
        if (!idNumber || idNumber.trim().length < 5) return;
        setIsSearchingContact(true);
        try {
            const q = query(collection(db, "contacts"), where("identification.number", "==", idNumber.trim()));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const contactDoc = querySnapshot.docs[0];
                const contactData = contactDoc.data();
                setMainAttendee(prev => ({
                    ...prev,
                    name: contactData.name || "",
                    email: contactData.email || "",
                    phone: contactData.phone || "",
                    idNumber: contactData.identification?.number || idNumber
                }));
                toast.success("Cliente encontrado");
            }
        } catch (error) {
            console.error("Error searching contact:", error);
        } finally {
            setIsSearchingContact(false);
        }
    };

    const handleCompleteSale = async () => {
        await processSale(() => setCurrentStep(5));
    };

    const handleNewSale = () => {
        resetSale();
        setCurrentStep(1);
    };

    const handlePrint = () => window.print();

    const handleResendEmail = async () => {
        if (!lastSaleData || !lastSaleData.attendees) return;
        const toastId = toast.loading("Reenviando correos...");
        try {
            await posService.sendBatchEmail(mainAttendee.email, lastSaleData.event, lastSaleData.attendees);
            toast.update(toastId, { render: "Correos reenviados correctamente", type: "success", isLoading: false, autoClose: 3000 });
        } catch (error) {
            console.error("Error resending emails:", error);
            toast.update(toastId, { render: "Error al reenviar correos", type: "error", isLoading: false, autoClose: 3000 });
        }
    };

    const handleDownloadTickets = async () => {
        if (!lastSaleData || !lastSaleData.attendees) return;
        const toastId = toast.loading("Generando PDF...");
        try {
            const token = await auth.currentUser?.getIdToken();
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const response = await fetch('/api/tickets/download', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    tickets: lastSaleData.attendees.map((attendee: any) => {
                        let formattedDate = "Fecha por confirmar";
                        try {
                            if (lastSaleData.event.date) {
                                const d = new Date(lastSaleData.event.date);
                                if (!isNaN(d.getTime())) {
                                    const day = String(d.getDate()).padStart(2, '0');
                                    const month = String(d.getMonth() + 1).padStart(2, '0');
                                    const year = d.getFullYear();
                                    formattedDate = `${day}/${month}/${year}`;
                                }
                            }
                        } catch (e) { }

                        return {
                            ticketId: attendee.ticketId,
                            eventName: lastSaleData.event.name,
                            eventDate: formattedDate,
                            eventTime: lastSaleData.event.startTime || lastSaleData.event.endTime || "N/A",
                            eventLocation: lastSaleData.event.location,
                            zone: attendee.Zone,
                            seat: attendee.Seat,
                            attendeeName: attendee.Name,
                            qrPayload: attendee.qrPayload
                        };
                    })
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || "Error generando PDF");
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Tickets-${lastSaleData.event.name}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.update(toastId, { render: "Tickets descargados", type: "success", isLoading: false, autoClose: 3000 });
        } catch (error) {
            console.error("Download error:", error);
            toast.update(toastId, { render: "Error al descargar tickets", type: "error", isLoading: false, autoClose: 3000 });
        }
    };

    return (
        <>
            <style>{styles}</style>
            <div className="flex h-[calc(100vh-6rem)] gap-6 max-w-7xl mx-auto animate-slide-in p-4">

                {/* COLUMNA IZQUIERDA: Flujo Principal */}
                <div className="flex-1 flex flex-col min-w-0">

                    {/* Indicador de Pasos */}
                    {currentStep !== 5 && (
                        <div className="mb-6 bg-white p-3 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
                            <div className="flex gap-2 sm:gap-4 overflow-x-auto no-scrollbar">
                                {steps.map((s) => (
                                    <div key={s.id} className={`flex items-center gap-2 whitespace-nowrap ${currentStep === s.id ? 'text-indigo-700 font-bold' : 'text-gray-400'}`}>
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border shrink-0 ${currentStep >= s.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-gray-300'}`}>
                                            {currentStep > s.id ? <CheckCircle size={12} /> : s.id}
                                        </div>
                                        <span className="text-sm hidden sm:inline">{s.name}</span>
                                        {s.id < 4 && <ChevronRight size={14} className="text-gray-300 ml-1 sm:ml-2" />}
                                    </div>
                                ))}
                            </div>
                            {currentStep > 1 && (
                                <button onClick={() => setCurrentStep(prev => Math.max(1, prev - 1) as any)} className="text-xs font-medium text-gray-500 hover:text-indigo-600 flex items-center gap-1 shrink-0 ml-2">
                                    <ArrowLeft size={14} /> Atrás
                                </button>
                            )}
                        </div>
                    )}

                    {/* Contenido Dinámico */}
                    <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col relative">

                        {currentStep === 1 && (
                            <POSEventSelector
                                events={events}
                                onSelect={handleEventSelect}
                                loading={loading}
                            />
                        )}

                        {currentStep === 2 && selectedEvent && (
                            <POSCart
                                selectedEvent={selectedEvent}
                                cart={cart}
                                soldByZone={soldByZone}
                                onAddToCart={handleAddToCart}
                                onNext={() => setCurrentStep(3)}
                                selectedSeats={selectedSeats}
                                onSelectSeats={handleSelectSeats}
                            />
                        )}

                        {currentStep === 3 && (
                            <POSCustomerForm
                                mainAttendee={mainAttendee}
                                setMainAttendee={setMainAttendee}
                                onSearchContact={handleSearchContact}
                                isSearchingContact={isSearchingContact}
                            />
                        )}

                        {currentStep === 4 && (
                            <POSPayment
                                paymentMethod={paymentMethod}
                                setPaymentMethod={setPaymentMethod}
                                cashReceived={cashReceived}
                                setCashReceived={setCashReceived}
                                totalAmount={totalAmount}
                                onCompleteSale={handleCompleteSale}
                                isProcessing={isProcessing}
                            />
                        )}

                        {currentStep === 5 && lastSaleData && (
                            <POSSuccess
                                lastSaleData={lastSaleData}
                                onPrint={handlePrint}
                                onDownload={handleDownloadTickets}
                                onResendEmail={handleResendEmail}
                                onNewSale={handleNewSale}
                            />
                        )}

                        {/* Print Layout */}
                        <div className="hidden print:grid print:grid-cols-2 print:gap-4 print:p-4 print:absolute print:top-0 print:left-0 print:w-full print:bg-white">
                            <style>{`
                                    @media print {
                                        @page { size: letter; margin: 0.5cm; }
                                        body * { visibility: hidden; }
                                        .print\\:grid, .print\\:grid * { visibility: visible; }
                                        .print\\:grid { display: grid !important; }
                                    }
                                `}</style>
                            {lastSaleData?.attendees?.map((ticket: any, i: number) => (
                                <div key={i} className="border border-gray-300 rounded-lg p-4 flex flex-col items-center text-center h-[45vh] break-inside-avoid">
                                    <h3 className="font-bold text-lg mb-2">{lastSaleData.event.name}</h3>
                                    <p className="text-sm mb-1">{new Date(lastSaleData.event.date).toLocaleDateString()}</p>
                                    <p className="text-sm mb-4">{lastSaleData.event.startTime || "N/A"}</p>
                                    <div className="mb-4">
                                        <img
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(ticket.qrPayload || ticket.ticketId)}`}
                                            alt="QR"
                                            className="w-32 h-32"
                                        />
                                    </div>
                                    <div className="text-left w-full text-sm space-y-1 mt-auto">
                                        <p><strong>Asistente:</strong> {ticket.Name}</p>
                                        <p><strong>Zona:</strong> {ticket.Zone}</p>
                                        {ticket.Seat && <p><strong>Asiento:</strong> {ticket.Seat}</p>}
                                        <p className="text-xs text-gray-500 mt-2 font-mono">{ticket.ticketId}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* COLUMNA DERECHA: Resumen de Pedido */}
                {currentStep !== 5 && (
                    <div className="w-80 flex flex-col shrink-0">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 h-full flex flex-col sticky top-4">
                            <div className="p-5 border-b border-gray-100 bg-gray-50 rounded-t-2xl">
                                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                    <ShoppingBag size={18} className="text-indigo-600" />
                                    Resumen de Compra
                                </h3>
                            </div>

                            <div className="flex-1 p-5 overflow-y-auto">
                                {!selectedEvent && (
                                    <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 space-y-3 opacity-60">
                                        <Calendar size={48} className="text-gray-200" />
                                        <p className="text-sm">Selecciona un evento para comenzar tu orden</p>
                                    </div>
                                )}

                                {selectedEvent && (
                                    <div className="mb-6 animate-slide-in">
                                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Evento</div>
                                        <div className="flex gap-3 items-start">
                                            <div className={`w-10 h-10 rounded-lg bg-indigo-50 shrink-0 flex items-center justify-center`}>
                                                <Calendar size={16} className="text-indigo-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm text-gray-900 line-clamp-2">{selectedEvent.name}</h4>
                                                <p className="text-xs text-gray-500">{new Date(selectedEvent.date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {selectedEvent && totalItems > 0 && (
                                    <div className="animate-slide-in">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Entradas</div>
                                            <button onClick={handleClearCart} className="text-xs text-red-500 hover:underline flex items-center gap-1">
                                                <Trash2 size={10} /> Borrar
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            {Object.entries(cart).map(([zoneName, qty]) => {
                                                if (qty === 0) return null;
                                                const zone = selectedEvent.venue?.zones.find(z => z.name === zoneName);
                                                return (
                                                    <div key={zoneName} className="flex justify-between text-sm bg-gray-50 p-2 rounded-lg border border-gray-100">
                                                        <span className="text-gray-600 flex gap-2">
                                                            <span className="font-bold text-indigo-600">x{qty}</span> {zoneName}
                                                        </span>
                                                        <span className="font-medium">${((zone?.price || 0) * qty).toLocaleString()}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {selectedEvent && totalItems === 0 && (
                                    <div className="text-center py-8 text-sm text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                        No has seleccionado entradas
                                    </div>
                                )}

                                {currentStep === 4 && paymentMethod && (
                                    <div className="mt-6 pt-4 border-t border-dashed border-gray-200 animate-slide-in">
                                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Pago con</div>
                                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                                            {paymentMethod === 'card' ? <CreditCard size={16} className="text-indigo-600" /> : <Banknote size={16} className="text-green-600" />}
                                            {paymentMethod === 'card' ? 'Tarjeta de Crédito' : 'Efectivo'}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-5 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                                <div className="flex justify-between items-end mb-4">
                                    <span className="text-sm text-gray-500">Total a pagar</span>
                                    <span className="text-2xl font-black text-gray-900">${totalAmount.toLocaleString()}</span>
                                </div>

                                {currentStep === 1 && (
                                    <button disabled className="w-full py-3 rounded-xl bg-gray-200 text-gray-400 font-bold text-sm cursor-not-allowed">
                                        Selecciona Evento
                                    </button>
                                )}
                                {currentStep === 2 && (
                                    <button
                                        onClick={() => setCurrentStep(3)}
                                        disabled={totalItems === 0}
                                        className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2"
                                    >
                                        Continuar <ChevronRight size={16} />
                                    </button>
                                )}
                                {currentStep === 3 && (
                                    <button
                                        onClick={() => {
                                            if (!mainAttendee.name || !mainAttendee.email) {
                                                toast.error("Completa los datos del cliente");
                                                return;
                                            }
                                            setCurrentStep(4);
                                        }}
                                        className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                                    >
                                        Ir al Pago <ChevronRight size={16} />
                                    </button>
                                )}
                                {currentStep === 4 && (
                                    <button
                                        onClick={handleCompleteSale}
                                        disabled={!paymentMethod || isProcessing}
                                        className="w-full py-3 rounded-xl bg-black hover:bg-gray-800 text-white font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isProcessing ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : <Sparkles size={16} className="text-yellow-400" />}
                                        Confirmar Venta
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
