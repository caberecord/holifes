"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { Contact } from "@/types/contact";
import { showToast } from "@/lib/toast";
import { Loader2, Save, X } from "lucide-react";

interface ContactFormProps {
    initialData?: Partial<Contact>;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function ContactForm({ initialData, onSuccess, onCancel }: ContactFormProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<Contact>>({
        name: initialData?.name || "",
        email: initialData?.email || "",
        phone: initialData?.phone || "",
        identification: {
            type: initialData?.identification?.type || "CC",
            number: initialData?.identification?.number || ""
        },
        address: {
            address: initialData?.address?.address || "",
            city: initialData?.address?.city || "",
            department: initialData?.address?.department || ""
        },
        ...initialData
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        if (!formData.name || !formData.identification?.number) {
            showToast.error("Nombre y Número de Identificación son obligatorios");
            return;
        }

        setLoading(true);
        try {
            const contactData = {
                ...formData,
                organizerId: user.uid,
                updatedAt: serverTimestamp(),
                // Initialize stats if new
                totalSpent: initialData?.totalSpent || 0,
                totalTickets: initialData?.totalTickets || 0,
            };

            if (initialData?.id) {
                // Update
                await updateDoc(doc(db, "contacts", initialData.id), contactData);
                showToast.success("Contacto actualizado");
            } else {
                // Create
                await addDoc(collection(db, "contacts"), {
                    ...contactData,
                    createdAt: serverTimestamp()
                });
                showToast.success("Contacto creado");
            }
            onSuccess();
        } catch (error) {
            console.error("Error saving contact:", error);
            showToast.error("Error al guardar contacto");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Basic Info */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo *</label>
                    <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>

                {/* Identification */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo ID</label>
                    <select
                        value={formData.identification?.type}
                        onChange={(e) => setFormData({
                            ...formData,
                            identification: { ...formData.identification!, type: e.target.value as any }
                        })}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                        <option value="CC">Cédula (CC)</option>
                        <option value="NIT">NIT</option>
                        <option value="CE">Cédula Extranjería</option>
                        <option value="PASSPORT">Pasaporte</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Número ID *</label>
                    <input
                        type="text"
                        required
                        value={formData.identification?.number}
                        onChange={(e) => setFormData({
                            ...formData,
                            identification: { ...formData.identification!, number: e.target.value }
                        })}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                    <input
                        type="text"
                        value={formData.address?.address}
                        onChange={(e) => setFormData({
                            ...formData,
                            address: { ...formData.address!, address: e.target.value }
                        })}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
                    <input
                        type="text"
                        value={formData.address?.city}
                        onChange={(e) => setFormData({
                            ...formData,
                            address: { ...formData.address!, city: e.target.value }
                        })}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
                    <input
                        type="text"
                        value={formData.address?.department}
                        onChange={(e) => setFormData({
                            ...formData,
                            address: { ...formData.address!, department: e.target.value }
                        })}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Guardar
                </button>
            </div>
        </form>
    );
}
