"use client";

import {
    playSuccessStandard, playSuccessIndustrial, playSuccessArcade,
    playErrorStandard, playErrorAlarm, playError8Bit
} from "@/lib/sounds";
import { Volume2, AlertTriangle, CheckCircle, Zap, Music, Siren, Gamepad2 } from "lucide-react";

export default function TestSoundsPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 gap-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-gray-900">Prueba de Sonidos</h1>
                <p className="text-gray-600 max-w-lg mx-auto">
                    Prueba las diferentes variantes para encontrar la mejor para ambientes ruidosos.
                    <br />
                    <span className="text-xs font-mono bg-gray-200 px-2 py-1 rounded mt-2 inline-block">
                        Actualmente activo: Industrial (Éxito) / Alarma (Error)
                    </span>
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">

                {/* SUCCESS SECTION */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-green-800 text-center border-b border-green-200 pb-2">Variantes de Éxito</h2>

                    <button onClick={() => playSuccessStandard()} className="w-full flex items-center gap-4 p-4 bg-white border border-green-100 rounded-xl hover:bg-green-50 transition-colors text-left">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center"><CheckCircle className="w-5 h-5 text-green-600" /></div>
                        <div><h3 className="font-bold text-gray-900">1. Estándar (Suave)</h3><p className="text-xs text-gray-500">Beep simple (Sine wave)</p></div>
                    </button>

                    <button onClick={() => playSuccessIndustrial()} className="w-full flex items-center gap-4 p-4 bg-white border-2 border-green-500 rounded-xl shadow-md hover:bg-green-50 transition-colors text-left ring-2 ring-green-200">
                        <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center"><Zap className="w-5 h-5 text-white" /></div>
                        <div><h3 className="font-bold text-gray-900">2. Industrial (Intenso) ⭐</h3><p className="text-xs text-gray-500">Onda cuadrada, penetrante</p></div>
                    </button>

                    <button onClick={() => playSuccessArcade()} className="w-full flex items-center gap-4 p-4 bg-white border border-green-100 rounded-xl hover:bg-green-50 transition-colors text-left">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center"><Music className="w-5 h-5 text-green-600" /></div>
                        <div><h3 className="font-bold text-gray-900">3. Arcade (Musical)</h3><p className="text-xs text-gray-500">Acorde mayor rápido</p></div>
                    </button>
                </div>

                {/* ERROR SECTION */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-red-800 text-center border-b border-red-200 pb-2">Variantes de Error</h2>

                    <button onClick={() => playErrorStandard()} className="w-full flex items-center gap-4 p-4 bg-white border border-red-100 rounded-xl hover:bg-red-50 transition-colors text-left">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-red-600" /></div>
                        <div><h3 className="font-bold text-gray-900">1. Estándar (Buzz)</h3><p className="text-xs text-gray-500">Zumbido grave</p></div>
                    </button>

                    <button onClick={() => playErrorAlarm()} className="w-full flex items-center gap-4 p-4 bg-white border-2 border-red-500 rounded-xl shadow-md hover:bg-red-50 transition-colors text-left ring-2 ring-red-200">
                        <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center"><Siren className="w-5 h-5 text-white" /></div>
                        <div><h3 className="font-bold text-gray-900">2. Alarma (Intenso) ⭐</h3><p className="text-xs text-gray-500">Sirena descendente fuerte</p></div>
                    </button>

                    <button onClick={() => playError8Bit()} className="w-full flex items-center gap-4 p-4 bg-white border border-red-100 rounded-xl hover:bg-red-50 transition-colors text-left">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center"><Gamepad2 className="w-5 h-5 text-red-600" /></div>
                        <div><h3 className="font-bold text-gray-900">3. 8-Bit Fail</h3><p className="text-xs text-gray-500">Sonido de "Game Over"</p></div>
                    </button>
                </div>

            </div>

            <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3 max-w-md text-sm text-blue-800 mt-4">
                <Volume2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p>
                    <strong>Nota:</strong> He configurado por defecto las opciones "Intenso" (⭐) que son ideales para ambientes ruidosos.
                </p>
            </div>
        </div>
    );
}
