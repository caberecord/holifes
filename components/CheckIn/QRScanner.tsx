"use client";
import { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { playSuccessSound } from "@/lib/sounds";

interface QRScannerProps {
    onScan: (ticketId: string) => void;
    isProcessing: boolean;
}

export default function QRScanner({ onScan, isProcessing }: QRScannerProps) {
    const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null);
    const [cameraError, setCameraError] = useState<string>("");
    const [isMounted, setIsMounted] = useState(false);

    // Semaphore to prevent multiple reads
    const isScanningRef = useRef(false);
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    useEffect(() => {
        setIsMounted(true);
        return () => setIsMounted(false);
    }, []);

    useEffect(() => {
        // If processing, do not start scanner
        if (isProcessing || !isMounted) return;

        // 1. Configuration
        const config = {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            supportedScanTypes: [0], // 0 = SCAN_TYPE_CAMERA (Disable file upload)
            rememberLastUsedCamera: true, // Persist camera choice
            videoConstraints: {
                facingMode: { exact: "environment" } // Force back camera
            }
        };

        // Fallback for devices that don't support "exact" facingMode
        const configFallback = {
            ...config,
            videoConstraints: {
                facingMode: "environment"
            }
        };

        let qrScanner: Html5QrcodeScanner;

        try {
            qrScanner = new Html5QrcodeScanner(
                "qr-reader",
                config,
                false
            );
        } catch (e) {
            // Retry with fallback config if initialization fails
            console.warn("Failed to init scanner with exact environment, retrying with fallback", e);
            qrScanner = new Html5QrcodeScanner(
                "qr-reader",
                configFallback,
                false
            );
        }

        scannerRef.current = qrScanner;
        isScanningRef.current = true; // Ready to scan

        // 2. Success Callback
        const onScanSuccess = (decodedText: string) => {
            // LOGIC GATE: If semaphore is red, ignore everything
            if (!isScanningRef.current) return;

            // 3. IMMEDIATE BLOCK
            isScanningRef.current = false;
            console.log(`QR Detected: ${decodedText}`);
            playSuccessSound();

            // 4. STOP CAMERA
            qrScanner.clear().then(() => {
                onScan(decodedText);
            }).catch(err => {
                console.error("Failed to clear scanner", err);
                // Even if clear fails, we still trigger onScan, but the semaphore prevents double reads
                onScan(decodedText);
            });
        };

        const onScanFailure = (error: any) => {
            // Ignore frame errors
        };

        // 5. Render
        try {
            qrScanner.render(onScanSuccess, onScanFailure);
            setScanner(qrScanner);
            setCameraError("");
        } catch (err) {
            console.error("Error rendering scanner:", err);
            setCameraError("No se pudo iniciar la cámara. Asegúrate de dar permisos.");
        }

        // Cleanup
        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(err => console.error("Failed to clear on unmount", err));
            }
        };
    }, [isProcessing, isMounted]); // Re-runs when isProcessing changes (e.g. back to false)

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

            {/* Container for html5-qrcode */}
            {!isProcessing && <div id="qr-reader" className="w-full"></div>}

            {/* Placeholder when processing/showing result */}
            {isProcessing && (
                <div className="w-full aspect-square bg-gray-100 flex flex-col items-center justify-center text-gray-400">
                    <CheckCircle className="w-16 h-16 mb-4 text-green-500 animate-pulse" />
                    <p className="font-medium">Procesando ticket...</p>
                </div>
            )}

            <div className="p-4 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <div className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-yellow-500' : 'bg-green-500 animate-pulse'}`}></div>
                    <span>{isProcessing ? 'Validando...' : 'Escáner activo - apunta a un código QR'}</span>
                </div>
            </div>
        </div>
    );
}
