'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { uploadImage } from '../../lib/firebaseStorage';
import { toast } from 'react-toastify';

interface ImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
    path: string; // Storage path prefix
    label?: string;
    className?: string;
}

export function ImageUpload({ value, onChange, path, label, className = "" }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            toast.error('Por favor sube un archivo de imagen válido');
            return;
        }

        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            toast.error('La imagen no debe superar los 10MB');
            return;
        }

        setUploading(true);
        try {
            // Generate unique filename
            const timestamp = Date.now();
            const extension = file.name.split('.').pop();
            const filename = `${timestamp}.${extension}`;
            const fullPath = `${path}/${filename}`;

            const url = await uploadImage(file, fullPath);
            onChange(url);
            toast.success('Imagen subida correctamente');
        } catch (error) {
            console.error(error);
            toast.error('Error al subir la imagen');
        } finally {
            setUploading(false);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    return (
        <div className={`w-full ${className}`}>
            {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}

            {value ? (
                <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-gray-200 group">
                    <img src={value} alt="Uploaded" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                            onClick={() => inputRef.current?.click()}
                            className="p-2 bg-white rounded-full text-gray-900 hover:bg-gray-100 transition-colors"
                            title="Cambiar imagen"
                        >
                            <Upload className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onChange('')}
                            className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                            title="Eliminar imagen"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            ) : (
                <div
                    className={`relative border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors
                        ${dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-gray-400 bg-gray-50'}
                        ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => !uploading && inputRef.current?.click()}
                >
                    {uploading ? (
                        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-2" />
                    ) : (
                        <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                    )}
                    <p className="text-sm text-gray-600 font-medium">
                        {uploading ? 'Subiendo...' : 'Haz clic o arrastra una imagen'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF hasta 10MB</p>
                </div>
            )}

            <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleChange}
                disabled={uploading}
            />
        </div>
    );
}
