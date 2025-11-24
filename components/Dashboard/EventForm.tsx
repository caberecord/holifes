"use client";
import { useState, FormEvent, useEffect } from "react";
import { Event } from "../../types/event";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { addDoc, collection, Timestamp, doc, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";

interface EventFormProps {
    initialData?: Event;
}

export default function EventForm({ initialData }: EventFormProps) {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Simplified form data for legacy support or simple edits
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        date: "",
        startTime: "",
        endTime: "",
        location: "",
        capacity: 0,
        price: 0,
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || initialData.title || "",
                description: initialData.description || "",
                date: initialData.date || "",
                startTime: initialData.startTime || "",
                endTime: initialData.endTime || "",
                location: initialData.location || "",
                capacity: initialData.venue?.totalCapacity || initialData.capacity || 0,
                price: initialData.venue?.zones?.[0]?.price || initialData.price || 0,
            });
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "capacity" || name === "price" ? Number(value) : value,
        }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);
        setError("");

        try {
            const eventData = {
                ...formData,
                // Ensure required fields for Event interface
                status: initialData?.status || 'draft',
                organizerId: user.uid,
                createdAt: initialData?.createdAt || Timestamp.now(),
            };

            if (initialData && initialData.id) {
                // Update existing event
                const eventRef = doc(db, "events", initialData.id);
                await updateDoc(eventRef, eventData);
            } else {
                // Create new event
                await addDoc(collection(db, "events"), eventData);
            }
            router.push("/dashboard");
        } catch (err: any) {
            setError("Error al guardar el evento: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="glass-panel mx-auto max-w-3xl space-y-8 rounded-2xl p-8 sm:p-10">
            <div className="grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-6">
                <div className="sm:col-span-4">
                    <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-300">
                        Nombre del Evento
                    </label>
                    <div className="mt-2">
                        <input
                            type="text"
                            name="name"
                            id="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="glass-input block w-full rounded-md py-2 px-3 shadow-sm sm:text-sm sm:leading-6"
                            placeholder="Ej: Conferencia Tech 2025"
                        />
                    </div>
                </div>

                <div className="col-span-full">
                    <label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-300">
                        Descripción
                    </label>
                    <div className="mt-2">
                        <textarea
                            id="description"
                            name="description"
                            rows={3}
                            required
                            value={formData.description}
                            onChange={handleChange}
                            className="glass-input block w-full rounded-md py-2 px-3 shadow-sm sm:text-sm sm:leading-6"
                            placeholder="Detalles del evento..."
                        />
                    </div>
                </div>

                <div className="sm:col-span-3">
                    <label htmlFor="date" className="block text-sm font-medium leading-6 text-gray-300">
                        Fecha
                    </label>
                    <div className="mt-2">
                        <input
                            type="date"
                            name="date"
                            id="date"
                            required
                            value={formData.date}
                            onChange={handleChange}
                            className="glass-input block w-full rounded-md py-2 px-3 shadow-sm sm:text-sm sm:leading-6"
                        />
                    </div>
                </div>

                <div className="sm:col-span-3">
                    <label htmlFor="startTime" className="block text-sm font-medium leading-6 text-gray-300">
                        Hora Inicio
                    </label>
                    <div className="mt-2">
                        <input
                            type="time"
                            name="startTime"
                            id="startTime"
                            required
                            value={formData.startTime}
                            onChange={handleChange}
                            className="glass-input block w-full rounded-md py-2 px-3 shadow-sm sm:text-sm sm:leading-6"
                        />
                    </div>
                </div>

                <div className="sm:col-span-3">
                    <label htmlFor="endTime" className="block text-sm font-medium leading-6 text-gray-300">
                        Hora Fin
                    </label>
                    <div className="mt-2">
                        <input
                            type="time"
                            name="endTime"
                            id="endTime"
                            required
                            value={formData.endTime}
                            onChange={handleChange}
                            className="glass-input block w-full rounded-md py-2 px-3 shadow-sm sm:text-sm sm:leading-6"
                        />
                    </div>
                </div>

                <div className="sm:col-span-3">
                    <label htmlFor="location" className="block text-sm font-medium leading-6 text-gray-300">
                        Ubicación
                    </label>
                    <div className="mt-2">
                        <input
                            type="text"
                            name="location"
                            id="location"
                            required
                            value={formData.location}
                            onChange={handleChange}
                            className="glass-input block w-full rounded-md py-2 px-3 shadow-sm sm:text-sm sm:leading-6"
                            placeholder="Ej: Centro de Convenciones"
                        />
                    </div>
                </div>

                <div className="sm:col-span-2">
                    <label htmlFor="capacity" className="block text-sm font-medium leading-6 text-gray-300">
                        Aforo Máximo
                    </label>
                    <div className="mt-2">
                        <input
                            type="number"
                            name="capacity"
                            id="capacity"
                            required
                            min="1"
                            value={formData.capacity}
                            onChange={handleChange}
                            className="glass-input block w-full rounded-md py-2 px-3 shadow-sm sm:text-sm sm:leading-6"
                        />
                    </div>
                </div>

                <div className="sm:col-span-2">
                    <label htmlFor="price" className="block text-sm font-medium leading-6 text-gray-300">
                        Precio ($)
                    </label>
                    <div className="mt-2">
                        <input
                            type="number"
                            name="price"
                            id="price"
                            required
                            min="0"
                            step="0.01"
                            value={formData.price}
                            onChange={handleChange}
                            className="glass-input block w-full rounded-md py-2 px-3 shadow-sm sm:text-sm sm:leading-6"
                        />
                    </div>
                </div>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <div className="flex justify-end gap-x-4 pt-4 border-t border-white/10">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="text-sm font-semibold leading-6 text-gray-300 hover:text-white transition-colors"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="btn-neon rounded-md px-6 py-2 text-sm font-semibold shadow-sm disabled:opacity-50"
                >
                    {loading ? "Guardando..." : initialData ? "Actualizar Evento" : "Crear Evento"}
                </button>
            </div>
        </form>
    );
}
