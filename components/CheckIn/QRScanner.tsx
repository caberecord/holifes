"use client";
import { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface QRScannerProps {
    onScan: (ticketId: string) => void;
    isProcessing: boolean;
}

export default function QRScanner({ onScan, isProcessing }: QRScannerProps) {
    const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null);
    const [cameraError, setCameraError] = useState<string>("");

    const lastScanRef = useRef<number>(0);
    const lastCodeRef = useRef<string>("");

    useEffect(() => {
        const qrScanner = new Html5QrcodeScanner(
            "qr-reader",
            {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0,
            },
            false
        );

        qrScanner.render(
            (decodedText) => {
                const now = Date.now();
                // Debounce: Ignore if scanned recently (2 seconds) or if processing
                if (!isProcessing && (now - lastScanRef.current > 2000 || decodedText !== lastCodeRef.current)) {
                    lastScanRef.current = now;
                    lastCodeRef.current = decodedText;
                    onScan(decodedText);
                }
            },
            (error) => {
                // Silently handle scan errors (they happen constantly)
            }
        );

        setScanner(qrScanner);

        return () => {
            qrScanner.clear().catch((err) => {
                console.error("Failed to clear scanner:", err);
            });
        };
    }, []);

    return (
        <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-lg">
            {cameraError && (
                <div className="bg-red-50 border-b border-red-200 p-4">
                    <div className="flex items-center gap-2 text-red-800">
                        <AlertCircle className="w-5 h-5" />
                        <p className="text-sm font-medium">{cameraError}</p>
                    </div>
                    <p className="text-xs text-red-600 mt-1">
                        Asegúrate de permitir el acceso a la cámara en tu navegador
                    </p>
                </div>
            )}

            <div id="qr-reader" className="w-full"></div>

            <div className="p-4 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Escáner activo - apunta a un código QR</span>
                </div>
            </div>
        </div>
    );
}
