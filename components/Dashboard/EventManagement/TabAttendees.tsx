"use client";
import { Event } from "../../../types/event";
import { Search, Download, Filter, MoreHorizontal, Upload, Ticket, Plus, FileSpreadsheet, Check, X, Eye, Info, Printer, Mail } from "lucide-react";
import { useState, useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import * as XLSX from 'xlsx';
import { generateSecureTicketId } from "../../../lib/ticketSecurity";
import { generateGenericTickets, generateTicketsPDF } from "../../../lib/pdfTickets";
import { useAuth } from "../../../context/AuthContext";
import { Edit } from "lucide-react";

interface TabAttendeesProps {
    event: Event;
}

export default function TabAttendees({ event }: TabAttendeesProps) {
    const { user } = useAuth();
    const [activeView, setActiveView] = useState<"list" | "generate">("list");
    const [attendees, setAttendees] = useState<any[]>(event.distribution?.uploadedGuests || []);
    const [isUploading, setIsUploading] = useState(false);
    const [showTicketModal, setShowTicketModal] = useState<any | null>(null);
    const [editingAttendee, setEditingAttendee] = useState<any | null>(null);

    // Manual Add State
    const [manualName, setManualName] = useState("");
    const [manualEmail, setManualEmail] = useState("");
    const [manualZone, setManualZone] = useState("");
    const [manualSeat, setManualSeat] = useState("");

    // Generic Tickets State
    const [isGeneratingGeneric, setIsGeneratingGeneric] = useState(false);
    const [genericCount, setGenericCount] = useState("");

    const hasAllowedDistribution = event.distribution?.methods?.some((m: string) => ['free', 'invite'].includes(m)) || false;

    useEffect(() => {
        if (!hasAllowedDistribution && activeView === "generate") {
            setActiveView("list");
        }
    }, [hasAllowedDistribution, activeView]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);

        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);

                // Process data - map needs to be async now
                const processedData = await Promise.all(data.map(async (row: any) => {
                    // Generate base ticket ID
                    const uniqueSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
                    const timestamp = Date.now().toString(36).toUpperCase();
                    const baseTicketId = `TKT-${timestamp}-${uniqueSuffix}`;

                    // Generate HMAC-signed ticket ID
                    const email = row['Email'] || row['Correo'] || "";
                    const secureTicketId = await generateSecureTicketId(
                        baseTicketId,
                        email,
                        event.id || "unknown"
                    );

                    return {
                        id: Date.now() + Math.random(),
                        Name: row['Nombre'] || row['Name'] || "Desconocido",
                        Email: email,
                        Zone: row['Zona'] || row['Zone'] || "General",
                        Seat: row['Silla'] || row['Seat'] || "",
                        Status: "Confirmado",
                        ticketId: secureTicketId
                    };
                }));

                const newAttendees = processedData;

                const updatedAttendees = [...attendees, ...newAttendees];
                setAttendees(updatedAttendees);

                // Update in Firestore
                if (event.id) {
                    const eventRef = doc(db, "events", event.id);
                    await updateDoc(eventRef, {
                        "distribution.uploadedGuests": updatedAttendees
                    });
                }

                alert(`Se importaron ${newAttendees.length} asistentes correctamente.`);
                setActiveView("list");
            } catch (error) {
                console.error("Error parsing Excel:", error);
                alert("Error al procesar el archivo Excel. Verifica el formato.");
            } finally {
                setIsUploading(false);
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleManualAdd = async () => {
        if (!manualName || !manualEmail) {
            alert("Nombre y Email son obligatorios");
            return;
        }

        // Generate base ticket ID
        const uniqueSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
        const timestamp = Date.now().toString(36).toUpperCase();
        const baseTicketId = `TKT-${timestamp}-${uniqueSuffix}`;

        // Generate HMAC-signed ticket ID
        const secureTicketId = await generateSecureTicketId(
            baseTicketId,
            manualEmail,
            event.id || "unknown"
        );

        const newAttendee = {
            id: Date.now(),
            Name: manualName,
            Email: manualEmail,
            Zone: manualZone || "General",
            Seat: manualSeat || "",
            Status: "Confirmado",
            ticketId: secureTicketId
        };

        const updatedAttendees = [...attendees, newAttendee];
        setAttendees(updatedAttendees);

        // Update in Firestore
        if (event.id) {
            try {
                const eventRef = doc(db, "events", event.id);
                await updateDoc(eventRef, {
                    "distribution.uploadedGuests": updatedAttendees
                });
                alert("Asistente agregado correctamente");
                // Reset form
                setManualName("");
                setManualEmail("");
                setManualZone("");
                setManualSeat("");
            } catch (error) {
                console.error("Error saving attendee:", error);
                alert("Error al guardar el asistente");
            }
        }
    };

    const handleGenerateGenericTickets = async () => {
        const count = parseInt(genericCount);
        if (!count || count <= 0 || count > 10000) {
            alert("Ingresa una cantidad válida (1-10000)");
            return;
        }

        setIsGeneratingGeneric(true);
        try {
            const tickets = await generateGenericTickets(count, {
                name: event.name,
                date: event.date,
                startTime: event.startTime || "",
                location: event.location,
                id: event.id || "unknown"
            });

            // Convert tickets to attendee format and add to list
            const newAttendees = tickets.map((ticket, index) => ({
                id: Date.now() + index,
                Name: `Ticket Genérico #${index + 1}`,
                Email: `generic-${index + 1}@event.local`,
                Zone: ticket.zone || "General",
                Seat: ticket.seat || "",
                Status: "Confirmado",
                ticketId: ticket.ticketId,
                isGeneric: true
            }));

            const updatedAttendees = [...attendees, ...newAttendees];
            setAttendees(updatedAttendees);

            // Save to Firestore
            if (event.id) {
                const eventRef = doc(db, "events", event.id);
                await updateDoc(eventRef, {
                    "distribution.uploadedGuests": updatedAttendees
                });
            }

            // Generate and download PDF
            generateTicketsPDF(tickets, `${event.name}-tickets.pdf`);

            alert(`Se generaron ${count} boletos genéricos correctamente y se agregaron a la lista.`);
            setGenericCount("");
            setActiveView("list");
        } catch (error) {
            console.error("Error generating generic tickets:", error);
            alert("Error al generar los boletos.");
        } finally {
            setIsGeneratingGeneric(false);
        }
    };

    const handleSaveEdit = async () => {
        if (!editingAttendee) return;

        try {
            const updatedList = attendees.map(a =>
                a.id === editingAttendee.id ? editingAttendee : a
            );

            setAttendees(updatedList);

            if (event.id) {
                const eventRef = doc(db, "events", event.id);
                await updateDoc(eventRef, {
                    "distribution.uploadedGuests": updatedList
                });
                alert("Asistente actualizado correctamente");
                setEditingAttendee(null);
            }
        } catch (error) {
            console.error("Error updating attendee:", error);
            alert("Error al actualizar el asistente");
        }
    };

    return (
        <div className="p-6">
            {/* Sub-navigation */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit mb-6">
                <button
                    onClick={() => setActiveView("list")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeView === "list" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                >
                    Lista de Asistentes
                </button>
                <div className="relative group">
                    <button
                        onClick={() => hasAllowedDistribution && setActiveView("generate")}
                        disabled={!hasAllowedDistribution}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeView === "generate"
                                ? "bg-white text-indigo-600 shadow-sm"
                                : !hasAllowedDistribution
                                    ? "text-gray-400 cursor-not-allowed"
                                    : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        Generar Tickets / Importar
                    </button>
                    {!hasAllowedDistribution && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                            Requiere distribución "Gratis" o "Invitacional"
                            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                        </div>
                    )}
                </div>
            </div>

            {activeView === "list" && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    {/* Toolbar */}
                    <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 justify-between items-center">
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar asistente..."
                                className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <button className="flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                                <Filter className="w-4 h-4 mr-2" />
                                Filtros
                            </button>
                            <button className="flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                                <Download className="w-4 h-4 mr-2" />
                                Exportar
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zona / Silla</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {attendees.map((attendee: any, idx: number) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs mr-3">
                                                    {attendee.Name?.charAt(0) || "U"}
                                                </div>
                                                <div className="text-sm font-medium text-gray-900">{attendee.Name || "Desconocido"}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{attendee.Email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {attendee.Zone || "General"}
                                            {attendee.Seat ? ` - ${attendee.Seat}` : ""}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${attendee.Status === 'Confirmado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {attendee.Status || "Registrado"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {attendee.ticketId ? (
                                                <button
                                                    onClick={() => setShowTicketModal(attendee)}
                                                    className="flex items-center text-indigo-600 hover:text-indigo-900"
                                                    title={attendee.ticketId}
                                                >
                                                    <Ticket className="w-4 h-4 mr-1" />
                                                    <span className="font-mono text-xs">
                                                        {attendee.ticketId.length > 20
                                                            ? `${attendee.ticketId.substring(0, 20)}...`
                                                            : attendee.ticketId
                                                        }
                                                    </span>
                                                </button>
                                            ) : (
                                                <span className="text-gray-400 italic">No generado</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                {attendee.ticketId && (
                                                    <button
                                                        onClick={async () => {
                                                            if (!confirm(`¿Enviar ticket por correo a ${attendee.Email}?`)) return;

                                                            try {
                                                                // Show loading state (optional: could use a toast)
                                                                const btn = document.getElementById(`send-btn-${attendee.id}`);
                                                                if (btn) btn.style.opacity = '0.5';

                                                                const response = await fetch('/api/send-ticket', {
                                                                    method: 'POST',
                                                                    headers: { 'Content-Type': 'application/json' },
                                                                    body: JSON.stringify({
                                                                        email: attendee.Email,
                                                                        attendeeName: attendee.Name,
                                                                        eventName: event.name,
                                                                        eventDate: event.date,
                                                                        eventTime: event.startTime,
                                                                        eventLocation: event.location,
                                                                        ticketId: attendee.ticketId,
                                                                        zone: attendee.Zone,
                                                                        seat: attendee.Seat
                                                                    }),
                                                                });

                                                                if (response.ok) {
                                                                    alert('✅ Ticket enviado exitosamente');
                                                                } else {
                                                                    const data = await response.json();
                                                                    alert(`⚠️ Error: ${data.error}`);
                                                                }
                                                            } catch (error) {
                                                                console.error('Error sending ticket:', error);
                                                                alert('❌ Error al enviar el ticket');
                                                            } finally {
                                                                const btn = document.getElementById(`send-btn-${attendee.id}`);
                                                                if (btn) btn.style.opacity = '1';
                                                            }
                                                        }}
                                                        id={`send-btn-${attendee.id}`}
                                                        className="text-blue-600 hover:text-blue-900 p-1"
                                                        title="Enviar Ticket por Email"
                                                    >
                                                        <Mail className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button className="text-gray-400 hover:text-gray-600 p-1">
                                                    <MoreHorizontal className="w-5 h-5" />
                                                </button>
                                                {user?.uid === event.organizerId && (
                                                    <button
                                                        onClick={() => setEditingAttendee(attendee)}
                                                        className="text-indigo-600 hover:text-indigo-900 p-1"
                                                        title="Editar Asistente"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeView === "generate" && (
                <div className="max-w-3xl mx-auto space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
                        <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileSpreadsheet className="w-8 h-8 text-indigo-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Importar Lista de Invitados</h3>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto">
                            Sube un archivo Excel (.xlsx) con los datos de tus invitados para generar sus tickets automáticamente.
                        </p>

                        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-6 text-left text-sm text-indigo-800">
                            <h4 className="font-bold flex items-center mb-2">
                                <Info className="w-4 h-4 mr-2" />
                                Formato Requerido del Excel
                            </h4>
                            <p className="mb-2">El archivo debe tener las siguientes columnas (la primera fila debe ser el encabezado):</p>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li><strong>Nombre</strong>: Nombre completo del asistente.</li>
                                <li><strong>Email</strong>: Correo electrónico para enviar el ticket.</li>
                                <li><strong>Zona</strong> (Opcional): Tipo de entrada (ej: VIP, General).</li>
                                <li><strong>Silla</strong> (Opcional): Número de asiento asignado.</li>
                            </ul>
                        </div>

                        <div className="flex justify-center">
                            <label className="relative cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center">
                                {isUploading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Procesando...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-5 h-5 mr-2" />
                                        Subir Excel
                                    </>
                                )}
                                <input
                                    type="file"
                                    className="hidden"
                                    accept=".xlsx, .xls, .csv"
                                    onChange={handleFileUpload}
                                    disabled={isUploading}
                                />
                            </label>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                            <Plus className="w-5 h-5 mr-2 text-indigo-600" />
                            Agregar Manualmente
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <input
                                type="text"
                                placeholder="Nombre Completo *"
                                className="rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                                value={manualName}
                                onChange={(e) => setManualName(e.target.value)}
                            />
                            <input
                                type="email"
                                placeholder="Correo Electrónico *"
                                className="rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                                value={manualEmail}
                                onChange={(e) => setManualEmail(e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="Zona / Tipo de Entrada"
                                className="rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                                value={manualZone}
                                onChange={(e) => setManualZone(e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="Asiento / Ubicación (Opcional)"
                                className="rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                                value={manualSeat}
                                onChange={(e) => setManualSeat(e.target.value)}
                            />
                        </div>
                        <div className="flex justify-end">
                            <button
                                onClick={handleManualAdd}
                                className="bg-indigo-600 text-white font-medium px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                Agregar y Generar Ticket
                            </button>
                        </div>
                    </div>

                    {/* Generic Tickets Section */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
                        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Printer className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Generar Boletos Genéricos</h3>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto">
                            Genera boletos sin nombre para eventos gratuitos. Ideal para imprimir y distribuir en la entrada.
                        </p>

                        <div className="max-w-md mx-auto space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Cantidad de Boletos (basado en aforo)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="10000"
                                    value={genericCount}
                                    onChange={(e) => setGenericCount(e.target.value)}
                                    placeholder={`Ej: ${event.venue?.totalCapacity || 100}`}
                                    className="w-full rounded-lg border-gray-300 focus:ring-green-500 focus:border-green-500"
                                />
                                {event.venue?.totalCapacity && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Aforo del evento: {event.venue.totalCapacity} personas
                                    </p>
                                )}
                            </div>

                            <button
                                onClick={handleGenerateGenericTickets}
                                disabled={isGeneratingGeneric || !genericCount}
                                className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center disabled:opacity-50"
                            >
                                {isGeneratingGeneric ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Generando PDF...
                                    </>
                                ) : (
                                    <>
                                        <Printer className="w-5 h-5 mr-2" />
                                        Generar y Descargar PDF
                                    </>
                                )}
                            </button>

                            <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-left text-xs text-green-800">
                                <p className="font-bold mb-1">📄 Formato de Impresión:</p>
                                <p>4 boletos por hoja tamaño carta/A4</p>
                                <p>Con código QR único para validación</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Ticket Preview Modal */}
            {showTicketModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full overflow-hidden shadow-2xl">
                        <div className="bg-indigo-600 p-6 text-white text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                            <h3 className="text-2xl font-bold relative z-10">{event.name}</h3>
                            <p className="text-indigo-100 relative z-10">{event.date} • {event.startTime}</p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="text-center border-b border-dashed border-gray-300 pb-6">
                                <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Asistente</p>
                                <h4 className="text-xl font-bold text-gray-900">{showTicketModal.Name}</h4>
                                <p className="text-gray-600">{showTicketModal.Email}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div>
                                    <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Zona</p>
                                    <p className="font-bold text-indigo-600">{showTicketModal.Zone}</p>
                                    {showTicketModal.Seat && <p className="text-xs text-gray-500 mt-1">Asiento: {showTicketModal.Seat}</p>}
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Ticket ID</p>
                                    <p className="font-mono text-gray-700">{showTicketModal.ticketId}</p>
                                </div>
                            </div>
                            <div className="flex justify-center pt-4">
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${showTicketModal.ticketId}`}
                                    alt="QR Code"
                                    className="w-32 h-32"
                                />
                            </div>
                        </div>
                        <div className="bg-gray-50 p-4 flex justify-end">
                            <button
                                onClick={() => setShowTicketModal(null)}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Generating Tickets Progress Modal */}
            {isGeneratingGeneric && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full overflow-hidden shadow-2xl">
                        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white text-center">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
                            <h3 className="text-xl font-bold">Generando Boletos...</h3>
                            <p className="text-green-100 mt-2">Por favor espera, esto puede tomar unos momentos</p>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0">
                                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                            <div className="w-3 h-3 bg-green-600 rounded-full animate-pulse"></div>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Generando {genericCount} tickets únicos</p>
                                        <p className="text-xs text-gray-500">Cada ticket con firma HMAC y QR</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0">
                                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                            <div className="w-3 h-3 bg-green-600 rounded-full animate-pulse"></div>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Creando documento PDF</p>
                                        <p className="text-xs text-gray-500">Formato: 4 boletos por página</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0">
                                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                            <div className="w-3 h-3 bg-green-600 rounded-full animate-pulse"></div>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Guardando en base de datos</p>
                                        <p className="text-xs text-gray-500">Para registro y validación</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <p className="text-sm font-bold text-yellow-800 flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    ⚠️ NO REFRESQUES LA PÁGINA
                                </p>
                                <p className="text-xs text-yellow-700 mt-1">
                                    El proceso se completará automáticamente y se descargará el PDF.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Attendee Modal */}
            {editingAttendee && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full overflow-hidden shadow-2xl p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Editar Asistente</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                                <input
                                    type="text"
                                    value={editingAttendee.Name}
                                    onChange={(e) => setEditingAttendee({ ...editingAttendee, Name: e.target.value })}
                                    className="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={editingAttendee.Email}
                                    onChange={(e) => setEditingAttendee({ ...editingAttendee, Email: e.target.value })}
                                    className="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Zona</label>
                                    <input
                                        type="text"
                                        value={editingAttendee.Zone}
                                        onChange={(e) => setEditingAttendee({ ...editingAttendee, Zone: e.target.value })}
                                        className="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Asiento</label>
                                    <input
                                        type="text"
                                        value={editingAttendee.Seat || ''}
                                        onChange={(e) => setEditingAttendee({ ...editingAttendee, Seat: e.target.value })}
                                        className="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setEditingAttendee(null)}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
                            >
                                Guardar Cambios
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
