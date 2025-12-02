"use client";
import { Event } from "../../../types/event";
import { useState, useEffect } from "react";
import { Save, MapPin, Calendar, Type, Ticket, Loader2, Clock, Map, Link as LinkIcon, Tag, AlignLeft, CreditCard, Mail, Gift, Lock, Check, Upload, X, ChevronLeft, ChevronRight } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../../lib/firebase";
import VenueBuilder from "../../Builder/VenueBuilder";
import { useVenueBuilderStore } from "@/store/venueBuilderStore";
import type { TicketZone, DistributionMethod } from "@/store/eventWizardStore";
import { VenueMapSchema } from "@/lib/schemas/venueSchema";
import { useAuth } from "@/context/AuthContext";
import { logEventAction, AuditAction } from "@/lib/auditLogger";
import { Shield } from "lucide-react";

interface TabConfigProps {
    event: Event;
}

export default function TabConfig({ event }: TabConfigProps) {
    const { user } = useAuth();
    const [activeSection, setActiveSection] = useState("basic");
    const [formData, setFormData] = useState(event);
    const [activePlan, setActivePlan] = useState(event.plan || 'freemium-a');
    const [distributionMethods, setDistributionMethods] = useState<DistributionMethod[]>(
        (event.distribution?.methods as DistributionMethod[]) || []
    );
    const [isSaving, setIsSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const { elements, stageConfig, canvasSize, loadElements, setStageConfig, setCanvasSize } = useVenueBuilderStore();

    // Load existing venue data when switching to design section
    useEffect(() => {
        if (activeSection === "design" && event.venue?.venueMap) {
            // console.log("📥 Loading venue data:", event.venue.venueMap);

            // Check for sold zones and lock them
            const soldSeats = event.soldSeats || [];
            const soldByZone = event.stats?.soldByZone || {};

            const elementsWithLocks = (event.venue.venueMap.elements || []).map((el: any) => {
                let isLocked = false;

                // Check Numbered Zones
                if (el.type === 'numbered' || el.type === 'seating') {
                    const hasSoldSeats = soldSeats.some(seatId => seatId.startsWith(`${el.name}:`));
                    if (hasSoldSeats) isLocked = true;
                }

                // Check General Zones
                if (el.type === 'general') {
                    if (soldByZone[el.name] && soldByZone[el.name] > 0) {
                        isLocked = true;
                    }
                }

                if (isLocked) {
                    return { ...el, locked: true };
                }
                return el;
            });

            loadElements(elementsWithLocks);

            if (event.venue.venueMap.stageConfig) {
                setStageConfig(event.venue.venueMap.stageConfig);
            }

            if (event.venue.venueMap.canvasSize) {
                setCanvasSize(event.venue.venueMap.canvasSize);
            }
        }
    }, [activeSection, event.venue, loadElements, setStageConfig, setCanvasSize, event.soldSeats, event.stats]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const toggleDistributionMethod = (method: DistributionMethod) => {
        const isSelected = distributionMethods.includes(method);
        const newMethods = isSelected
            ? distributionMethods.filter(m => m !== method)
            : [...distributionMethods, method];
        setDistributionMethods(newMethods);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Client-side resizing
        const resizeImage = (file: File): Promise<Blob> => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.src = URL.createObjectURL(file);
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 1920;
                    const MAX_HEIGHT = 1080;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);
                    canvas.toBlob((blob) => {
                        if (blob) resolve(blob);
                        else reject(new Error("Canvas to Blob failed"));
                    }, 'image/jpeg', 0.8);
                };
                img.onerror = reject;
            });
        };

        setUploading(true);
        try {
            const resizedBlob = await resizeImage(file);
            const timestamp = Date.now();
            const filename = `event-covers/${timestamp}_${file.name.replace(/\.[^/.]+$/, "")}.jpg`;
            const storageRef = ref(storage, filename);

            await uploadBytes(storageRef, resizedBlob);
            const downloadURL = await getDownloadURL(storageRef);

            setFormData({ ...formData, coverImage: downloadURL });
        } catch (error) {
            console.error("Error uploading image:", error);
            alert("Error al subir la imagen");
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveImage = () => {
        setFormData({ ...formData, coverImage: undefined });
    };

    const handleSave = async () => {
        if (!event.id) return;
        setIsSaving(true);
        try {
            const eventRef = doc(db, "events", event.id);

            // Prepare venue data
            let venueData = event.venue;

            // If we're in design section, update venue with current builder state
            if (activeSection === "design") {
                // Map builder elements to zones
                const zones: TicketZone[] = elements
                    .filter(el => el.type === 'general' || el.type === 'numbered')
                    .map(el => ({
                        id: el.id,
                        name: el.name,
                        price: el.price,
                        capacity: el.type === 'general' ? (el.capacity || 0) : ((el.rows || 0) * (el.cols || 0)),
                        type: el.type === 'general' ? 'standing' as const : 'seating' as const,
                        color: el.fill,
                        x: el.x,
                        y: el.y,
                        width: el.width,
                        height: el.height,
                        shape: (el.shape as 'rectangle' | 'L' | 'T') || 'rectangle',
                        rotation: el.rotation || 0,
                    }));

                const totalCapacity = zones.reduce((sum, zone) => sum + zone.capacity, 0);

                venueData = {
                    type: event.venue?.type || 'custom',
                    zones,
                    totalCapacity,
                    venueMap: {
                        elements,
                        stageConfig,
                        canvasSize,
                    },
                };

                // Schema Validation
                const validationResult = VenueMapSchema.safeParse(venueData.venueMap);
                if (!validationResult.success) {
                    console.error("❌ Venue Validation Failed:", validationResult.error);
                    alert("Error en la estructura del mapa: " + validationResult.error.issues.map(e => e.message).join(", "));
                    setIsSaving(false);
                    return;
                }

                // console.log("💾 Guardando diseño:", {
                //     totalZones: zones.length,
                //     totalCapacity,
                //     zones,
                //     venueMap: venueData.venueMap
                // });
            }

            await updateDoc(eventRef, {
                name: formData.name || "",
                date: formData.date || "",
                startTime: formData.startTime || "",
                endTime: formData.endTime || "",
                location: formData.location || "",
                googleMapsUrl: formData.googleMapsUrl || "",
                description: formData.description || "",
                address: formData.address || "",
                category: formData.category || "",
                coverImage: formData.coverImage || null,
                plan: activePlan,
                venue: venueData,
                ...(activeSection === "distribution" && {
                    distribution: {
                        methods: distributionMethods,
                        isFree: distributionMethods.includes('free'),
                        hasGuestList: event.distribution?.hasGuestList || false,
                        guestCount: event.distribution?.guestCount || 0,
                        method: distributionMethods[0] || 'manual', // Fallback for legacy
                        uploadedGuests: event.distribution?.uploadedGuests || []
                    }
                })
            });

            // console.log("✅ Evento actualizado correctamente");

            // Audit Log
            if (user) {
                let action: AuditAction = 'UPDATE_EVENT_DETAILS';
                let details = {};

                switch (activeSection) {
                    case 'design':
                        action = 'UPDATE_VENUE_MAP';
                        const totalCapacity = elements.reduce((acc, el) => acc + (el.capacity || 0), 0);
                        details = { totalZones: elements.length, totalCapacity };
                        break;
                    case 'plan':
                        action = 'UPDATE_PLAN';
                        details = { newPlan: activePlan };
                        break;
                    case 'distribution':
                        action = 'UPDATE_DISTRIBUTION';
                        details = { methods: distributionMethods };
                        break;
                }

                await logEventAction(event.id, action, user.uid, details);
            }

            alert("Cambios guardados correctamente");

            window.location.reload();
        } catch (error) {
            console.error("❌ Error updating event:", error);
            alert("Error al guardar los cambios");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row min-h-[600px] bg-gray-50 p-6 gap-6">
            {/* Sidebar Navigation */}
            <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-2 transition-all duration-300 flex flex-col ${isSidebarCollapsed ? 'w-20 items-center' : 'w-full lg:w-64'}`}>

                {/* Collapse Toggle */}
                <div className={`flex ${isSidebarCollapsed ? 'justify-center' : 'justify-end'} mb-2`}>
                    <button
                        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        {isSidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                    </button>
                </div>

                <button
                    onClick={() => setActiveSection("basic")}
                    className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all ${activeSection === "basic" ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50"} ${isSidebarCollapsed ? 'justify-center w-12 h-12 px-0' : 'w-full'}`}
                    title={isSidebarCollapsed ? "Información Básica" : ""}
                >
                    <Type className={`w-5 h-5 ${isSidebarCollapsed ? '' : 'mr-3'}`} />
                    {!isSidebarCollapsed && "Información Básica"}
                </button>
                <button
                    onClick={() => setActiveSection("plan")}
                    className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all ${activeSection === "plan" ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50"} ${isSidebarCollapsed ? 'justify-center w-12 h-12 px-0' : 'w-full'}`}
                    title={isSidebarCollapsed ? "Plan Actual" : ""}
                >
                    <Tag className={`w-5 h-5 ${isSidebarCollapsed ? '' : 'mr-3'}`} />
                    {!isSidebarCollapsed && "Plan Actual"}
                </button>
                <button
                    onClick={() => setActiveSection("distribution")}
                    className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all ${activeSection === "distribution" ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50"} ${isSidebarCollapsed ? 'justify-center w-12 h-12 px-0' : 'w-full'}`}
                    title={isSidebarCollapsed ? "Distribución y Venta" : ""}
                >
                    <CreditCard className={`w-5 h-5 ${isSidebarCollapsed ? '' : 'mr-3'}`} />
                    {!isSidebarCollapsed && "Distribución y Venta"}
                </button>
                <button
                    onClick={() => setActiveSection("tickets")}
                    className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all ${activeSection === "tickets" ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50"} ${isSidebarCollapsed ? 'justify-center w-12 h-12 px-0' : 'w-full'}`}
                    title={isSidebarCollapsed ? "Entradas y Zonas" : ""}
                >
                    <Ticket className={`w-5 h-5 ${isSidebarCollapsed ? '' : 'mr-3'}`} />
                    {!isSidebarCollapsed && "Entradas y Zonas"}
                </button>
                <button
                    onClick={() => setActiveSection("design")}
                    className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all ${activeSection === "design" ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50"} ${isSidebarCollapsed ? 'justify-center w-12 h-12 px-0' : 'w-full'}`}
                    title={isSidebarCollapsed ? "Diseño" : ""}
                >
                    <MapPin className={`w-5 h-5 ${isSidebarCollapsed ? '' : 'mr-3'}`} />
                    {!isSidebarCollapsed && "Diseño"}
                </button>

            </div>

            {/* Content Area */}
            <div className="flex-1 min-w-0">
                {activeSection === "basic" && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-4xl">
                        <div className="mb-8 border-b border-gray-100 pb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Datos Básicos del Evento</h2>
                            <p className="text-gray-500 mt-1">Edita la información principal de tu evento.</p>
                        </div>

                        <div className="space-y-8">
                            {/* Nombre del Evento */}
                            <div className="relative group">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Nombre del Evento <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Type className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="block w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                        placeholder="Ej: Concierto de Verano 2025"
                                    />
                                </div>
                            </div>

                            {/* Cover Image Upload */}
                            <div className="relative group">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Portada del Evento <span className="text-gray-400 text-xs">(opcional)</span>
                                </label>
                                {!formData.coverImage ? (
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            disabled={uploading}
                                            className="hidden"
                                            id="cover-upload-config"
                                        />
                                        <label
                                            htmlFor="cover-upload-config"
                                            className={`flex flex-col items-center justify-center w-full h-48 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {uploading ? (
                                                <>
                                                    <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mb-3" />
                                                    <p className="text-sm text-gray-500">Subiendo imagen...</p>
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="h-10 w-10 text-gray-400 mb-3" />
                                                    <p className="text-sm font-medium text-gray-700">Haz clic o arrastra para subir</p>
                                                    <p className="text-xs text-gray-500 mt-1">PNG, JPG hasta 10MB</p>
                                                </>
                                            )}
                                        </label>
                                    </div>
                                ) : (
                                    <div className="relative group/image">
                                        <img
                                            src={formData.coverImage}
                                            alt="Event Cover"
                                            className="w-full h-48 object-cover rounded-xl border-2 border-gray-200"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover/image:opacity-100 transition-opacity hover:bg-red-600"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}
                                <p className="text-xs text-gray-500 mt-2">
                                    Esta imagen se mostrará en las métricas del evento y en el punto de venta.
                                </p>
                            </div>

                            {/* Fecha y Horas */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="relative group">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Fecha <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Calendar className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                        </div>
                                        <input
                                            type="date"
                                            name="date"
                                            value={formData.date}
                                            onChange={handleChange}
                                            className="block w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="relative group">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Hora Inicio <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Clock className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                        </div>
                                        <input
                                            type="time"
                                            name="startTime"
                                            value={formData.startTime || ""}
                                            onChange={handleChange}
                                            className="block w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="relative group">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Hora Fin <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Clock className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                        </div>
                                        <input
                                            type="time"
                                            name="endTime"
                                            value={formData.endTime || ""}
                                            onChange={handleChange}
                                            className="block w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Ciudad y Dirección */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="relative group">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Ciudad / Ubicación General <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Map className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                        </div>
                                        <input
                                            type="text"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleChange}
                                            className="block w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                            placeholder="Ej: Bogotá, Colombia"
                                        />
                                    </div>
                                </div>

                                <div className="relative group">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Dirección Exacta <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <MapPin className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                        </div>
                                        <input
                                            type="text"
                                            name="address"
                                            value={formData.address || ""}
                                            onChange={handleChange}
                                            className="block w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                            placeholder="Ej: Calle 123 # 45-67, Auditorio Principal"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Google Maps y Categoría */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="relative group">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Link de Google Maps (Opcional)
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <LinkIcon className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                        </div>
                                        <input
                                            type="text"
                                            name="googleMapsUrl"
                                            value={formData.googleMapsUrl || ""}
                                            onChange={handleChange}
                                            placeholder="https://maps.google.com/..."
                                            className="block w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="relative group">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Categoría <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Tag className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                        </div>
                                        <select
                                            name="category"
                                            value={formData.category || ""}
                                            onChange={handleChange}
                                            className="block w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none"
                                        >
                                            <option value="">Selecciona una categoría</option>
                                            <option value="concierto">Concierto</option>
                                            <option value="teatro">Teatro</option>
                                            <option value="deportes">Deportes</option>
                                            <option value="conferencia">Conferencia</option>
                                            <option value="festival">Festival</option>
                                            <option value="otro">Otro</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Descripción */}
                            <div className="relative group">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Descripción
                                </label>
                                <div className="relative">
                                    <div className="absolute top-3.5 left-0 pl-4 flex items-start pointer-events-none">
                                        <AlignLeft className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                    </div>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={4}
                                        className="block w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                                        placeholder="Describe de qué trata tu evento..."
                                    />
                                </div>
                                <div className="mt-1 text-right text-xs text-gray-400">
                                    Máximo 500 caracteres
                                </div>
                            </div>

                            {/* Botón Submit */}
                            <div className="pt-4 flex justify-end">
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="px-8 py-3.5 bg-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 hover:shadow-indigo-600/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Guardando...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5" />
                                            Guardar Cambios
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === "plan" && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-4xl">
                        <div className="mb-8 border-b border-gray-100 pb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Plan Actual</h2>
                            <p className="text-gray-500 mt-1">Gestiona el plan de suscripción para este evento.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                {
                                    id: "freemium-a",
                                    name: "Freemium",
                                    price: "$0",
                                    features: ["Hasta 100 tickets", "Solo Invitacional/Gratis", "Sin pasarela de pagos"],
                                    color: "bg-blue-50 border-blue-200 text-blue-700",
                                    icon: <Gift className="w-6 h-6" />
                                },
                                {
                                    id: "pro",
                                    name: "Pro",
                                    price: "5% / ticket",
                                    features: ["Tickets ilimitados", "Venta Manual + Stripe", "Soporte prioritario"],
                                    color: "bg-purple-50 border-purple-200 text-purple-700",
                                    icon: <CreditCard className="w-6 h-6" />
                                },
                                {
                                    id: "enterprise",
                                    name: "Enterprise",
                                    price: "Personalizado",
                                    features: ["Todo incluido", "Marca blanca", "Gestor de cuenta"],
                                    color: "bg-emerald-50 border-emerald-200 text-emerald-700",
                                    icon: <Tag className="w-6 h-6" />
                                }
                            ].map((plan) => (
                                <button
                                    key={plan.id}
                                    onClick={() => setActivePlan(plan.id)}
                                    className={`relative p-6 rounded-xl border-2 text-left transition-all ${activePlan === plan.id
                                        ? "border-indigo-600 bg-indigo-50 shadow-md ring-1 ring-indigo-600"
                                        : "border-gray-200 hover:border-indigo-300 hover:shadow-sm"
                                        }`}
                                >
                                    {activePlan === plan.id && (
                                        <div className="absolute -top-3 -right-3 bg-indigo-600 text-white p-1.5 rounded-full shadow-sm">
                                            <Check className="w-4 h-4" />
                                        </div>
                                    )}
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${plan.color}`}>
                                        {plan.icon}
                                    </div>
                                    <h3 className="font-bold text-lg text-gray-900 mb-1">{plan.name}</h3>
                                    <p className="text-2xl font-bold text-gray-900 mb-4">{plan.price}</p>
                                    <ul className="space-y-2">
                                        {plan.features.map((feature, idx) => (
                                            <li key={idx} className="text-sm text-gray-600 flex items-start">
                                                <Check className="w-4 h-4 mr-2 text-green-500 shrink-0 mt-0.5" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </button>
                            ))}
                        </div>

                        <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                            <div className="p-2 bg-amber-100 rounded-full text-amber-600 shrink-0">
                                <Lock className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-amber-800">Importante</h4>
                                <p className="text-sm text-amber-700 mt-1">
                                    Cambiar el plan puede afectar la disponibilidad de ciertos métodos de distribución.
                                    Asegúrate de revisar la pestaña "Distribución y Venta" después de cambiar el plan.
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end pt-6 border-t border-gray-100 mt-8">
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-8 py-3.5 bg-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Guardar Cambios
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {activeSection === "distribution" && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-4xl">
                        <div className="mb-8 border-b border-gray-100 pb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Distribución y Venta</h2>
                            <p className="text-gray-500 mt-1">Selecciona los métodos de distribución para este evento.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            {[
                                {
                                    id: "manual" as DistributionMethod,
                                    title: "Venta Manual",
                                    icon: <Ticket className="w-8 h-8" />,
                                    iconColor: "text-indigo-600",
                                    desc: "Tú gestionas el pago y entregas el ticket.",
                                },
                                {
                                    id: "stripe" as DistributionMethod,
                                    title: "Pasarela de Pago",
                                    icon: <CreditCard className="w-8 h-8" />,
                                    iconColor: "text-purple-600",
                                    desc: "Venta automática con Stripe (Comisión 5%).",
                                },
                                {
                                    id: "invite" as DistributionMethod,
                                    title: "Invitacional",
                                    icon: <Mail className="w-8 h-8" />,
                                    iconColor: "text-emerald-600",
                                    desc: "Envía tickets por email a una lista.",
                                },
                                {
                                    id: "free" as DistributionMethod,
                                    title: "Boletería Gratis",
                                    icon: <Gift className="w-8 h-8" />,
                                    iconColor: "text-amber-600",
                                    desc: "Evento sin costo, acceso libre con registro.",
                                },
                            ].map((option) => {
                                const isSelected = distributionMethods.includes(option.id);

                                // Logic for availability based on plan
                                let isLocked = false;
                                let lockReason = "";

                                if (activePlan === 'freemium-a') {
                                    if (option.id === 'manual' || option.id === 'stripe') {
                                        isLocked = true;
                                        lockReason = "Disponible en planes Pro y Enterprise";
                                    }
                                } else if (activePlan === 'pro') {
                                    if (option.id === 'invite' || option.id === 'free') {
                                        isLocked = true;
                                        lockReason = "Disponible en planes Freemium y Enterprise";
                                    }
                                }

                                return (
                                    <div key={option.id} className="relative group">
                                        <button
                                            onClick={() => !isLocked && toggleDistributionMethod(option.id)}
                                            disabled={isLocked}
                                            className={`w-full p-6 rounded-xl border-2 text-left transition-all relative ${isLocked
                                                ? "border-gray-100 bg-gray-50 opacity-70 cursor-not-allowed"
                                                : isSelected
                                                    ? "border-indigo-600 bg-indigo-50 shadow-md"
                                                    : "border-gray-200 hover:border-indigo-300 hover:shadow-sm"
                                                }`}
                                        >
                                            {isLocked && (
                                                <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center rounded-xl">
                                                    <div className="bg-gray-900/80 text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 mb-2">
                                                        <Lock className="w-3 h-3" />
                                                        Bloqueado
                                                    </div>
                                                    <span className="text-xs text-gray-600 font-medium bg-white/90 px-2 py-1 rounded shadow-sm">
                                                        {lockReason}
                                                    </span>
                                                </div>
                                            )}

                                            {isSelected && !isLocked && (
                                                <div className="absolute top-3 right-3">
                                                    <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center">
                                                        <Check className="w-4 h-4 text-white" />
                                                    </div>
                                                </div>
                                            )}

                                            <div className="mb-4 bg-white w-14 h-14 rounded-lg flex items-center justify-center shadow-sm border border-gray-100">
                                                <div className={option.iconColor}>
                                                    {option.icon}
                                                </div>
                                            </div>
                                            <h3 className="font-bold mb-1 text-gray-900">
                                                {option.title}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                {option.desc}
                                            </p>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex justify-end pt-4 border-t border-gray-100">
                            <button
                                onClick={handleSave}
                                disabled={isSaving || distributionMethods.length === 0}
                                className={`flex items-center gap-2 px-8 py-3.5 rounded-xl transition-all font-semibold shadow-lg ${distributionMethods.length > 0 && !isSaving
                                    ? "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-0.5"
                                    : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                                    }`}
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Guardar Cambios
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {activeSection === "tickets" && (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 max-w-3xl">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                            <Ticket className="w-5 h-5 mr-2 text-indigo-600" />
                            Gestión de Entradas y Zonas
                        </h3>

                        <div className="space-y-4">
                            {event.venue?.zones?.map((zone: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                                            {zone.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">{zone.name}</h4>
                                            <p className="text-sm text-gray-500">{zone.capacity} entradas • ${zone.price}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setActiveSection("design")}
                                        className="text-sm text-indigo-600 font-medium hover:underline"
                                    >
                                        Editar en Diseño
                                    </button>
                                </div>
                            ))}

                            <button
                                onClick={() => setActiveSection("design")}
                                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 font-medium hover:border-indigo-500 hover:text-indigo-600 transition-colors"
                            >
                                + Gestionar Zonas en Diseño
                            </button>
                        </div>
                    </div>
                )}

                {activeSection === "design" && (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                                    <MapPin className="w-5 h-5 mr-2 text-indigo-600" />
                                    Diseño del Recinto
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">Selecciona una herramienta y haz clic en el lienzo para añadir elementos.</p>
                            </div>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex items-center px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                            >
                                {isSaving ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Save className="w-3 h-3 mr-1" />}
                                Guardar Diseño
                            </button>
                        </div>

                        <VenueBuilder />
                    </div>
                )}


            </div>
        </div >
    );
}
