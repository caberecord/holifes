"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Building2, Upload, X } from "lucide-react";
import { CompanyData, LATIN_AMERICAN_COUNTRIES, CountryCode, TaxRegime } from "../../types/company";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, storage } from "../../lib/firebase";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { showToast } from "@/lib/toast";

export default function CompanyTab() {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);

    const [companyData, setCompanyData] = useState<Partial<CompanyData>>({
        legalName: "",
        tradeName: "",
        country: "CO" as CountryCode,
        fiscalDocumentNumber: "",
        fiscalAddress: "",
        city: "",
        postalCode: "",
        phone: "",
        billingEmail: user?.email || "",
        vatEnabled: false,
        vatRate: 19,
        taxRegime: "general" as TaxRegime,
    });

    useEffect(() => {
        loadCompanyData();
    }, []);

    const loadCompanyData = async () => {
        if (!user) return;

        try {
            const companyDoc = await getDoc(doc(db, "users", user.uid, "companyData", "info"));
            if (companyDoc.exists()) {
                setCompanyData(companyDoc.data() as CompanyData);
            }
        } catch (error) {
            console.error("Error loading company data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        // Validate file type
        const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
        if (!validTypes.includes(file.type)) {
            showToast.error("Por favor selecciona un archivo PNG, JPG o SVG");
            return;
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            showToast.error("El archivo debe ser menor a 2MB");
            return;
        }

        setIsUploadingLogo(true);
        try {
            const fileExtension = file.name.split('.').pop();
            const fileName = `company-logo-${user.uid}-${Date.now()}.${fileExtension}`;
            const storageRef = ref(storage, `company-logos/${fileName}`);

            // Upload file
            await uploadBytes(storageRef, file);

            // Get download URL
            const downloadURL = await getDownloadURL(storageRef);

            // Delete old logo if exists
            if (companyData.logoUrl && companyData.logoUrl.includes('firebase')) {
                try {
                    const oldLogoPath = decodeURIComponent(companyData.logoUrl.split('/o/')[1].split('?')[0]);
                    const oldLogoRef = ref(storage, oldLogoPath);
                    await deleteObject(oldLogoRef);
                } catch (error) {
                    // Silently fail if old logo can't be deleted
                }
            }

            // Update state with new URL
            setCompanyData({ ...companyData, logoUrl: downloadURL });
            showToast.success("Logo cargado exitosamente");
        } catch (error: any) {
            console.error("Error uploading logo:", error);
            showToast.error(`Error al cargar el logo: ${error.message || 'Error desconocido'}`);
        } finally {
            setIsUploadingLogo(false);
        }
    };

    const handleRemoveLogo = () => {
        if (confirm("¿Estás seguro de eliminar el logo?")) {
            setCompanyData({ ...companyData, logoUrl: undefined });
        }
    };

    const selectedCountry = LATIN_AMERICAN_COUNTRIES.find(c => c.code === companyData.country);

    const handleSave = async () => {
        if (!user) return;

        // Validation
        if (!companyData.legalName || !companyData.fiscalDocumentNumber) {
            showToast.error("Por favor completa los campos requeridos (Nombre Legal y Número de Identificación)");
            return;
        }

        setIsSaving(true);
        try {
            // Build data object, excluding undefined values
            const dataToSave: any = {
                legalName: companyData.legalName!,
                country: companyData.country!,
                fiscalDocumentType: selectedCountry!.documentType,
                fiscalDocumentNumber: companyData.fiscalDocumentNumber!,
                fiscalAddress: companyData.fiscalAddress!,
                city: companyData.city!,
                phone: companyData.phone!,
                billingEmail: companyData.billingEmail!,
                vatEnabled: companyData.vatEnabled!,
                vatRate: companyData.vatRate!,
                taxRegime: companyData.taxRegime!,
                createdAt: companyData.createdAt || new Date(),
                updatedAt: new Date(),
            };

            // Only add optional fields if they have values
            if (companyData.tradeName) {
                dataToSave.tradeName = companyData.tradeName;
            }
            if (companyData.logoUrl) {
                dataToSave.logoUrl = companyData.logoUrl;
            }
            if (companyData.postalCode) {
                dataToSave.postalCode = companyData.postalCode;
            }

            await setDoc(doc(db, "users", user.uid, "companyData", "info"), dataToSave);
            setCompanyData(dataToSave as CompanyData);
            setIsEditing(false);
            showToast.success("Datos de empresa guardados exitosamente");
        } catch (error) {
            console.error("Error saving company data:", error);
            showToast.error("Error al guardar los datos de empresa");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="p-12 text-center">
                <p className="text-gray-500">Cargando datos de empresa...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Información de Empresa</h2>
                <p className="text-sm text-gray-500 mt-1">Administra los datos fiscales de tu empresa</p>
            </div>

            {/* Company Data Card */}
            <div className="bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Datos Fiscales</h3>
                        <p className="text-sm text-gray-500">Información para facturación e impuestos</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Basic Information Section */}
                    <div className="border-b border-gray-200 pb-6">
                        <h4 className="text-md font-semibold text-gray-900 mb-4">Información General</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nombre Legal (Razón Social) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={companyData.legalName || ""}
                                    onChange={(e) => setCompanyData({ ...companyData, legalName: e.target.value })}
                                    disabled={!isEditing}
                                    className={`w-full px-4 py-2 border rounded-lg ${isEditing ? "border-gray-300" : "border-gray-200 bg-gray-50"}`}
                                    placeholder="Ej: Eventos XYZ S.A.S."
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nombre Comercial
                                </label>
                                <input
                                    type="text"
                                    value={companyData.tradeName || ""}
                                    onChange={(e) => setCompanyData({ ...companyData, tradeName: e.target.value })}
                                    disabled={!isEditing}
                                    className={`w-full px-4 py-2 border rounded-lg ${isEditing ? "border-gray-300" : "border-gray-200 bg-gray-50"}`}
                                    placeholder="Ej: Holifes"
                                />
                            </div>

                            {/* Logo Section */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Logo de la Empresa
                                </label>
                                <div className="flex items-start gap-4">
                                    {/* Logo Preview */}
                                    {companyData.logoUrl && (
                                        <div className="relative flex-shrink-0 group">
                                            <img
                                                src={companyData.logoUrl}
                                                alt="Logo empresa"
                                                className="h-24 w-24 object-contain rounded-lg border-2 border-gray-200 bg-white p-2"
                                                onError={(e) => {
                                                    e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96'%3E%3Crect fill='%23f3f4f6' width='96' height='96'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%239ca3af' font-size='12'%3EError%3C/text%3E%3C/svg%3E";
                                                }}
                                            />
                                            {isEditing && (
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveLogo}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Eliminar logo"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    {/* Upload Button */}
                                    <div className="flex-1">
                                        {isEditing && (
                                            <div className="space-y-2">
                                                <label className="cursor-pointer">
                                                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg transition-colors">
                                                        <Upload className="w-5 h-5 text-gray-600" />
                                                        <span className="text-sm font-medium text-gray-700">
                                                            {isUploadingLogo ? "Subiendo..." : companyData.logoUrl ? "Cambiar Logo" : "Cargar Logo"}
                                                        </span>
                                                    </div>
                                                    <input
                                                        type="file"
                                                        accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                                                        onChange={handleLogoUpload}
                                                        disabled={isUploadingLogo}
                                                        className="hidden"
                                                    />
                                                </label>
                                                <p className="text-xs text-gray-500">
                                                    PNG, JPG o SVG. Máximo 2MB.
                                                </p>
                                            </div>
                                        )}
                                        {!isEditing && !companyData.logoUrl && (
                                            <p className="text-sm text-gray-500 italic">Sin logo</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Fiscal Information Section */}
                    <div className="border-b border-gray-200 pb-6">
                        <h4 className="text-md font-semibold text-gray-900 mb-4">Datos Fiscales</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    País <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={companyData.country}
                                    onChange={(e) => {
                                        const newCountry = LATIN_AMERICAN_COUNTRIES.find(c => c.code === e.target.value);
                                        setCompanyData({
                                            ...companyData,
                                            country: e.target.value as CountryCode,
                                            vatRate: newCountry?.defaultVAT || 0,
                                        });
                                    }}
                                    disabled={!isEditing}
                                    className={`w-full px-4 py-2 border rounded-lg ${isEditing ? "border-gray-300" : "border-gray-200 bg-gray-50"}`}
                                >
                                    {LATIN_AMERICAN_COUNTRIES.map((country) => (
                                        <option key={country.code} value={country.code}>
                                            {country.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tipo de Documento
                                </label>
                                <input
                                    type="text"
                                    value={selectedCountry?.documentName || ""}
                                    disabled
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 cursor-not-allowed"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Número de Identificación Fiscal <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={companyData.fiscalDocumentNumber || ""}
                                    onChange={(e) => setCompanyData({ ...companyData, fiscalDocumentNumber: e.target.value })}
                                    disabled={!isEditing}
                                    className={`w-full px-4 py-2 border rounded-lg ${isEditing ? "border-gray-300" : "border-gray-200 bg-gray-50"}`}
                                    placeholder={`Ej: ${selectedCountry?.documentType}-123456789`}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Dirección Fiscal <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={companyData.fiscalAddress || ""}
                                    onChange={(e) => setCompanyData({ ...companyData, fiscalAddress: e.target.value })}
                                    disabled={!isEditing}
                                    className={`w-full px-4 py-2 border rounded-lg ${isEditing ? "border-gray-300" : "border-gray-200 bg-gray-50"}`}
                                    placeholder="Calle, número, colonia/barrio"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Ciudad <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={companyData.city || ""}
                                    onChange={(e) => setCompanyData({ ...companyData, city: e.target.value })}
                                    disabled={!isEditing}
                                    className={`w-full px-4 py-2 border rounded-lg ${isEditing ? "border-gray-300" : "border-gray-200 bg-gray-50"}`}
                                    placeholder="Ej: Bogotá"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Código Postal
                                </label>
                                <input
                                    type="text"
                                    value={companyData.postalCode || ""}
                                    onChange={(e) => setCompanyData({ ...companyData, postalCode: e.target.value })}
                                    disabled={!isEditing}
                                    className={`w-full px-4 py-2 border rounded-lg ${isEditing ? "border-gray-300" : "border-gray-200 bg-gray-50"}`}
                                    placeholder="Ej: 110111"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Teléfono <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    value={companyData.phone || ""}
                                    onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })}
                                    disabled={!isEditing}
                                    className={`w-full px-4 py-2 border rounded-lg ${isEditing ? "border-gray-300" : "border-gray-200 bg-gray-50"}`}
                                    placeholder="+57 300 123 4567"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email de Facturación <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={companyData.billingEmail || ""}
                                    onChange={(e) => setCompanyData({ ...companyData, billingEmail: e.target.value })}
                                    disabled={!isEditing}
                                    className={`w-full px-4 py-2 border rounded-lg ${isEditing ? "border-gray-300" : "border-gray-200 bg-gray-50"}`}
                                    placeholder="facturacion@empresa.com"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Tax Configuration Section */}
                    <div className="pb-6">
                        <h4 className="text-md font-semibold text-gray-900 mb-4">Configuración de Impuestos</h4>
                        <div className="space-y-4">
                            <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                                <input
                                    type="checkbox"
                                    checked={companyData.vatEnabled || false}
                                    onChange={(e) => setCompanyData({ ...companyData, vatEnabled: e.target.checked })}
                                    disabled={!isEditing}
                                    className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        Habilitar Cobro de IVA
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Activar para incluir IVA en las facturas
                                    </p>
                                </div>
                            </label>

                            {companyData.vatEnabled && (
                                <div className="ml-8">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tarifa de IVA (%)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        value={companyData.vatRate || 0}
                                        onChange={(e) => setCompanyData({ ...companyData, vatRate: parseFloat(e.target.value) })}
                                        disabled={!isEditing}
                                        className={`w-full md:w-48 px-4 py-2 border rounded-lg ${isEditing ? "border-gray-300" : "border-gray-200 bg-gray-50"}`}
                                        placeholder="19.0"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Tasa estándar en {selectedCountry?.name}: {selectedCountry?.defaultVAT}%
                                    </p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Régimen Fiscal
                                </label>
                                <select
                                    value={companyData.taxRegime || "general"}
                                    onChange={(e) => setCompanyData({ ...companyData, taxRegime: e.target.value as TaxRegime })}
                                    disabled={!isEditing}
                                    className={`w-full md:w-64 px-4 py-2 border rounded-lg ${isEditing ? "border-gray-300" : "border-gray-200 bg-gray-50"}`}
                                >
                                    <option value="general">Régimen General</option>
                                    <option value="simplified">Régimen Simplificado</option>
                                    <option value="monotax">Monotributo</option>
                                    <option value="small_business">Pequeño Contribuyente</option>
                                    <option value="exempt">Exento</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                        >
                            Editar Datos
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSaving ? "Guardando..." : "Guardar Cambios"}
                            </button>
                            <button
                                onClick={() => {
                                    setIsEditing(false);
                                    loadCompanyData();
                                }}
                                disabled={isSaving}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                                Cancelar
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
