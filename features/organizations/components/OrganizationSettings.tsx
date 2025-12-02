"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { Loader2, Save, Upload, X } from "lucide-react";
import CustomPhoneInput from "@/components/ui/PhoneInput";

const LATAM_COUNTRIES = [
    { code: "CO", name: "Colombia" },
    { code: "MX", name: "México" },
    { code: "CL", name: "Chile" },
    { code: "PE", name: "Perú" },
    { code: "AR", name: "Argentina" },
    { code: "EC", name: "Ecuador" },
    { code: "VE", name: "Venezuela" },
    { code: "BO", name: "Bolivia" },
    { code: "PY", name: "Paraguay" },
    { code: "UY", name: "Uruguay" },
    { code: "PA", name: "Panamá" },
    { code: "CR", name: "Costa Rica" },
    { code: "DO", name: "República Dominicana" },
    { code: "GT", name: "Guatemala" },
    { code: "SV", name: "El Salvador" },
    { code: "HN", name: "Honduras" },
    { code: "NI", name: "Nicaragua" }
];

export const OrganizationSettings = () => {
    const { currentOrganization } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        // Fiscal Data
        legalName: "",
        tradeName: "",
        taxId: "",
        address: "",
        city: "",
        country: "CO",
        phone: "",
        email: "",
        website: "",
        taxSystem: "general",
        vatRate: 19,
        // Settings
        logoUrl: ""
    });

    useEffect(() => {
        if (currentOrganization) {
            setFormData({
                name: currentOrganization.name || "",
                slug: currentOrganization.slug || "",
                legalName: currentOrganization.fiscalData?.legalName || "",
                tradeName: currentOrganization.fiscalData?.tradeName || "",
                taxId: currentOrganization.fiscalData?.taxId || "",
                address: currentOrganization.fiscalData?.address || "",
                city: currentOrganization.fiscalData?.city || "",
                country: currentOrganization.fiscalData?.country || "CO",
                phone: currentOrganization.fiscalData?.phone || "",
                email: currentOrganization.fiscalData?.email || "",
                website: currentOrganization.fiscalData?.website || "",
                taxSystem: currentOrganization.fiscalData?.taxSystem || "general",
                vatRate: currentOrganization.fiscalData?.vatRate || 19,
                logoUrl: currentOrganization.settings?.logoUrl || ""
            });
        }
    }, [currentOrganization]);

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !currentOrganization) return;

        // Validate file type and size
        if (!file.type.startsWith('image/')) {
            setMessage({ type: 'error', text: 'Solo se permiten archivos de imagen.' });
            return;
        }

        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            setMessage({ type: 'error', text: 'La imagen no debe superar los 2MB.' });
            return;
        }

        setIsUploadingLogo(true);
        setMessage({ type: '', text: '' });

        try {
            const timestamp = Date.now();
            const filename = `organizations/${currentOrganization.id}/logo_${timestamp}_${file.name}`;
            const storageRef = ref(storage, filename);

            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);

            setFormData(prev => ({ ...prev, logoUrl: downloadURL }));
            setMessage({ type: 'success', text: 'Logo subido correctamente. No olvides guardar los cambios.' });
        } catch (error) {
            console.error("Error uploading logo:", error);
            setMessage({ type: 'error', text: 'Error al subir el logo.' });
        } finally {
            setIsUploadingLogo(false);
        }
    };

    const handleRemoveLogo = () => {
        setFormData(prev => ({ ...prev, logoUrl: "" }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentOrganization) return;

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const orgRef = doc(db, 'organizations', currentOrganization.id);

            await updateDoc(orgRef, {
                name: formData.name,
                updatedAt: new Date(),
                settings: {
                    ...currentOrganization.settings,
                    logoUrl: formData.logoUrl
                },
                fiscalData: {
                    legalName: formData.name, // Use Organization Name as Legal Name
                    tradeName: formData.tradeName,
                    taxId: formData.taxId,
                    address: formData.address,
                    city: formData.city,
                    country: formData.country,
                    phone: formData.phone,
                    email: formData.email,
                    website: formData.website,
                    taxSystem: formData.taxSystem,
                    vatRate: Number(formData.vatRate)
                }
            });
            setMessage({ type: 'success', text: 'Configuración guardada correctamente.' });
        } catch (error) {
            console.error("Error updating organization:", error);
            setMessage({ type: 'error', text: 'Error al guardar la configuración.' });
        } finally {
            setLoading(false);
        }
    };

    if (!currentOrganization) return null;

    return (
        <div className="max-w-4xl space-y-6">
            <div>
                <h2 className="text-lg font-semibold text-gray-900">Configuración de la Organización</h2>
                <p className="text-sm text-gray-500">Administra los datos generales y fiscales de tu empresa.</p>
            </div>

            <form onSubmit={handleSave} className="space-y-8">
                {message.text && (
                    <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {message.text}
                    </div>
                )}

                {/* 1. General Info */}
                <div className="bg-white p-6 border border-gray-200 rounded-xl space-y-6">
                    <h3 className="text-md font-semibold text-gray-900 border-b pb-2">Información General</h3>

                    {/* Logo Upload */}
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        <div className="w-full md:w-1/3">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Logo de la Organización</label>
                            <div className="relative group">
                                {formData.logoUrl ? (
                                    <div className="relative w-full aspect-video bg-gray-50 rounded-lg border border-gray-200 overflow-hidden flex items-center justify-center">
                                        <img
                                            src={formData.logoUrl}
                                            alt="Organization Logo"
                                            className="max-w-full max-h-full object-contain"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleRemoveLogo}
                                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                            title="Eliminar logo"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className={`flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${isUploadingLogo ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            {isUploadingLogo ? (
                                                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-2" />
                                            ) : (
                                                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                            )}
                                            <p className="text-xs text-gray-500">
                                                {isUploadingLogo ? 'Subiendo...' : 'Click para subir logo'}
                                            </p>
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleLogoUpload}
                                            disabled={isUploadingLogo}
                                        />
                                    </label>
                                )}
                                <p className="text-xs text-gray-500 mt-1">Recomendado: PNG o JPG, máx 2MB.</p>
                            </div>
                        </div>

                        <div className="w-full md:w-2/3 grid grid-cols-1 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Nombre de la Organización / Razón Social</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="Ej: Eventos SAS"
                                />
                                <p className="text-xs text-gray-500">Se utilizará para la facturación y visualización.</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Slug (URL)</label>
                                <input
                                    type="text"
                                    value={formData.slug}
                                    disabled
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Fiscal Data */}
                <div className="bg-white p-6 border border-gray-200 rounded-xl space-y-6">
                    <h3 className="text-md font-semibold text-gray-900 border-b pb-2">Datos Fiscales y Facturación</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Nombre Comercial</label>
                            <input
                                type="text"
                                value={formData.tradeName}
                                onChange={(e) => setFormData({ ...formData, tradeName: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="Ej: Holifes"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">NIT / Identificación Fiscal</label>
                            <input
                                type="text"
                                value={formData.taxId}
                                onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="Ej: 900.123.456-7"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Sitio Web</label>
                            <input
                                type="url"
                                value={formData.website}
                                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="https://..."
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-gray-700">Dirección Fiscal</label>
                            <input
                                type="text"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Ciudad</label>
                            <input
                                type="text"
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">País</label>
                            <select
                                value={formData.country}
                                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                {LATAM_COUNTRIES.map(country => (
                                    <option key={country.code} value={country.code}>
                                        {country.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Teléfono</label>
                            <CustomPhoneInput
                                value={formData.phone}
                                onChange={(value) => setFormData({ ...formData, phone: value || "" })}
                                placeholder="+57 300 123 4567"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Email de Facturación</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* 3. Tax Configuration */}
                <div className="bg-white p-6 border border-gray-200 rounded-xl space-y-6">
                    <h3 className="text-md font-semibold text-gray-900 border-b pb-2">Configuración de Impuestos</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Régimen Fiscal</label>
                            <select
                                value={formData.taxSystem}
                                onChange={(e) => setFormData({ ...formData, taxSystem: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                <option value="general">Régimen General</option>
                                <option value="simplified">Régimen Simplificado</option>
                                <option value="monotax">Monotributo</option>
                                <option value="exempt">Exento</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Tarifa IVA (%)</label>
                            <input
                                type="number"
                                value={formData.vatRate}
                                onChange={(e) => setFormData({ ...formData, vatRate: Number(e.target.value) })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 shadow-sm"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Guardar Configuración
                    </button>
                </div>
            </form>
        </div>
    );
};
