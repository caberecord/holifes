"use client";
import { useEffect, useState } from "react";
import { useEventWizardStore } from "@/store/eventWizardStore";
import VenueBuilder from "@/components/Builder/VenueBuilder";
import { useVenueBuilderStore } from "@/store/venueBuilderStore";
import type { TicketZone } from "@/store/eventWizardStore";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, writeBatch, doc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { showToast } from "@/lib/toast";
import { Loader2 } from "lucide-react";

export default function Step4VenueDesign() {
    const {
        setStep,
        venue,
        setVenueMap,
        updateZones,
        basicInfo,
        selectedPlan,
        distribution,
        resetWizard
    } = useEventWizardStore();
    const { elements, stageConfig, loadElements, setStageConfig } = useVenueBuilderStore();
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();
    const { user } = useAuth();

    // Load existing data on mount
    useEffect(() => {
        if (venue.venueMap) {
            loadElements(venue.venueMap.elements || []);
            if (venue.venueMap.stageConfig) {
                setStageConfig(venue.venueMap.stageConfig);
            }
        }
    }, []);

    const handleFinish = async () => {
        if (!user) {
            showToast.error("Debes estar autenticado para crear un evento.");
            return;
        }

        // Validation
        const sellableZones = elements.filter(el => el.type === 'general' || el.type === 'numbered');

        if (sellableZones.length === 0) {
            showToast.error('⚠️ Debes agregar al menos una zona de venta (Rectángulo o Asientos)');
            return;
        }

        // Validate all zones have valid data
        const invalidZones = sellableZones.filter(el =>
            !el.name ||
            el.price <= 0 ||
            (el.type === 'general' && (!el.capacity || el.capacity <= 0)) ||
            (el.type === 'numbered' && (!el.rows || !el.cols || el.rows <= 0 || el.cols <= 0))
        );

        if (invalidZones.length > 0) {
            showToast.error(`⚠️ ${invalidZones.length} zona(s) tienen datos incompletos.\n\nVerifica que todas las zonas tengan:\n• Nombre\n• Precio mayor a 0\n• Capacidad o Filas/Columnas válidas`);
            return;
        }

        try {
            setIsSaving(true);

            // 1. Save raw builder state
            const venueMap = {
                elements,
                stageConfig
            };

            // 2. Map to TicketZones for backend logic
            const zones: TicketZone[] = sellableZones.map(el => ({
                id: el.id,
                name: el.name,
                capacity: el.type === 'numbered'
                    ? (el.rows || 0) * (el.cols || 0)
                    : (el.capacity || 0),
                price: el.price,
                color: el.fill,
                x: el.x,
                y: el.y,
                width: el.width,
                height: el.height,
                rotation: el.rotation,
                type: el.type === 'numbered' ? 'seating' : 'standing',
                shape: 'rectangle'
            }));

            const totalCapacity = zones.reduce((sum, zone) => sum + zone.capacity, 0);

            // Calculate initial stats from uploaded guests
            const initialAttendeesCount = distribution.uploadedGuests.length;

            const eventData = {
                ...basicInfo,
                plan: selectedPlan,
                venue: {
                    type: venue.type || 'custom',
                    zones,
                    totalCapacity,
                    venueMap
                },
                distribution: {
                    methods: distribution.methods, // Array of selected methods
                    isFree: distribution.methods.includes('free'),
                    hasGuestList: distribution.uploadedGuests.length > 0,
                    guestCount: initialAttendeesCount
                },
                stats: {
                    totalSold: 0,
                    totalRevenue: 0,
                    soldByZone: {},
                    attendeesCount: initialAttendeesCount,
                    checkedInCount: 0
                },
                organizerId: user.uid,
                organizerEmail: user.email,
                createdAt: serverTimestamp(),
                status: 'draft',
                coverImage: basicInfo.coverImage || null
            };

            // Save to Firestore
            const docRef = await addDoc(collection(db, "events"), eventData);
            // console.log("Event created with ID: ", docRef.id);

            // 3. Save Uploaded Guests to Subcollection
            if (distribution.uploadedGuests.length > 0) {
                const batchSize = 500;
                const guests = distribution.uploadedGuests;
                const attendeesCollectionRef = collection(db, "events", docRef.id, "attendees");

                for (let i = 0; i < guests.length; i += batchSize) {
                    const batch = writeBatch(db);
                    const chunk = guests.slice(i, i + batchSize);

                    chunk.forEach((guest) => {
                        const newDocRef = doc(attendeesCollectionRef);
                        batch.set(newDocRef, {
                            ...guest,
                            eventId: docRef.id,
                            organizerId: user.uid,
                            createdAt: serverTimestamp(),
                            status: 'valid', // Default status
                            source: 'upload'
                        });
                    });

                    await batch.commit();
                }
            }

            // Send confirmation email
            try {
                await fetch('/api/send-event-confirmation', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: user.email,
                        userName: user.displayName || user.email?.split('@')[0],
                        event: { ...eventData, id: docRef.id }
                    }),
                });
            } catch (emailError) {
                console.error("Error sending confirmation email:", emailError);
            }

            showToast.success("¡Evento creado exitosamente! Se ha enviado un correo de confirmación.");
            resetWizard();
            router.push("/dashboard");
        } catch (error) {
            console.error("Error adding document: ", error);
            showToast.error("Hubo un error al guardar el evento. Inténtalo de nuevo.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8 border-b border-gray-100 pb-6">
                <h2 className="text-2xl font-bold text-gray-900">Diseño del Escenario</h2>
                <p className="text-gray-500 mt-1">Selecciona una herramienta y haz clic en el lienzo para añadir elementos.</p>
            </div>

            <VenueBuilder />

            <div className="flex justify-between pt-8 border-t border-gray-100 mt-8">
                <button
                    onClick={() => setStep(3)}
                    className="text-gray-600 px-6 py-2 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                >
                    Atrás
                </button>
                <button
                    onClick={handleFinish}
                    disabled={isSaving}
                    className={`px-8 py-3 rounded-lg transition-colors font-bold shadow-lg flex items-center ${isSaving
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                        : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-xl hover:-translate-y-0.5"
                        }`}
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Guardando...
                        </>
                    ) : (
                        "Crear Evento"
                    )}
                </button>
            </div>
        </div>
    );
}
