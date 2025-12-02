"use client";
import { useState } from "react";
import { useEventWizardStore } from "@/store/eventWizardStore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Calendar, Clock, MapPin, Type, AlignLeft, Link as LinkIcon, Tag, Map, Upload, X, Loader2 } from "lucide-react";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import { EventBasicInfoSchema, EventBasicInfo } from "@/lib/schemas/eventSchema";

type FormData = EventBasicInfo;

export default function Step1BasicInfo() {
    const { basicInfo, updateBasicInfo, setStep } = useEventWizardStore();
    const [coverImage, setCoverImage] = useState<string | undefined>(basicInfo.coverImage);
    const [uploading, setUploading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(EventBasicInfoSchema),
        defaultValues: basicInfo,
    });

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert("La imagen no debe superar 10MB");
            return;
        }

        setUploading(true);
        try {
            const timestamp = Date.now();
            const filename = `event-covers/${timestamp}_${file.name}`;
            const storageRef = ref(storage, filename);

            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);

            setCoverImage(downloadURL);
        } catch (error) {
            console.error("Error uploading image:", error);
            alert("Error al subir la imagen");
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveImage = () => {
        setCoverImage(undefined);
    };

    const onSubmit = (data: FormData) => {
        updateBasicInfo({ ...data, coverImage });
        setStep(2);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="mb-8 border-b border-gray-100 pb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Datos Básicos del Evento</h2>
                    <p className="text-gray-500 mt-1">Comencemos con la información principal de tu evento.</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    {/* Nombre del Evento */}
                    <div className="grid grid-cols-1 gap-6">
                        <div className="relative group">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Nombre del Evento <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Type className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                </div>
                                <input
                                    {...register("name")}
                                    className="block w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                    placeholder="Ej: Concierto de Verano 2025"
                                />
                            </div>
                            {errors.name && (
                                <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                                    <span className="w-1 h-1 rounded-full bg-red-500"></span>
                                    {errors.name.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Cover Image Upload */}
                    <div className="relative group">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Portada del Evento <span className="text-gray-400 text-xs">(opcional)</span>
                        </label>
                        {!coverImage ? (
                            <div className="relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    disabled={uploading}
                                    className="hidden"
                                    id="cover-upload"
                                />
                                <label
                                    htmlFor="cover-upload"
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
                                    src={coverImage}
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
                                    {...register("date")}
                                    className="block w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                />
                            </div>
                            {errors.date && (
                                <p className="mt-2 text-sm text-red-500">{errors.date.message}</p>
                            )}
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
                                    {...register("startTime")}
                                    className="block w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                />
                            </div>
                            {errors.startTime && (
                                <p className="mt-2 text-sm text-red-500">{errors.startTime.message}</p>
                            )}
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
                                    {...register("endTime")}
                                    className="block w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                />
                            </div>
                            {errors.endTime && (
                                <p className="mt-2 text-sm text-red-500">{errors.endTime.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Ubicación y Dirección */}
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
                                    {...register("location")}
                                    className="block w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                    placeholder="Ej: Bogotá, Colombia"
                                />
                            </div>
                            {errors.location && (
                                <p className="mt-2 text-sm text-red-500">{errors.location.message}</p>
                            )}
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
                                    {...register("address")}
                                    className="block w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                    placeholder="Ej: Calle 123 # 45-67, Auditorio Principal"
                                />
                            </div>
                            {errors.address && (
                                <p className="mt-2 text-sm text-red-500">{errors.address.message}</p>
                            )}
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
                                    {...register("googleMapsUrl")}
                                    className="block w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                    placeholder="https://maps.google.com/..."
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
                                    {...register("category")}
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
                            {errors.category && (
                                <p className="mt-2 text-sm text-red-500">{errors.category.message}</p>
                            )}
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
                                {...register("description")}
                                rows={4}
                                className="block w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                                placeholder="Describe de qué trata tu evento..."
                            />
                        </div>
                        <div className="mt-1 text-right text-xs text-gray-400">
                            Máximo 500 caracteres
                        </div>
                        {errors.description && (
                            <p className="mt-2 text-sm text-red-500">{errors.description.message}</p>
                        )}
                    </div>

                    {/* Botón Submit */}
                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            className="px-8 py-3.5 bg-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 hover:shadow-indigo-600/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all transform hover:-translate-y-0.5"
                        >
                            Continuar al Plan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
