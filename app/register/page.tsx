"use client";
import { useState, FormEvent, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Building2, ArrowRight, ArrowLeft } from "lucide-react";
import { LATIN_AMERICAN_COUNTRIES, CountryCode } from "../../types/company";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";

export default function RegisterPage() {
    const { register } = useAuth();
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);

    // Paso 1: Datos personales
    const [displayName, setDisplayName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [accountType, setAccountType] = useState<"personal" | "business">("personal");

    // Paso 2: Datos de empresa (solo para business)
    const [companyName, setCompanyName] = useState("");
    const [country, setCountry] = useState<CountryCode>("CO");
    const [fiscalDocumentNumber, setFiscalDocumentNumber] = useState("");

    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const selectedCountry = LATIN_AMERICAN_COUNTRIES.find(c => c.code === country);

    // Función para traducir errores de Firebase a mensajes amigables
    const getErrorMessage = (error: any): string => {
        const errorCode = error.code || error.message;

        const errorMessages: { [key: string]: string } = {
            'auth/email-already-in-use': 'Este correo electrónico ya está registrado. Por favor inicia sesión o usa otro correo.',
            'auth/invalid-email': 'El correo electrónico no es válido. Por favor verifica e intenta nuevamente.',
            'auth/operation-not-allowed': 'El registro de usuarios está deshabilitado temporalmente.',
            'auth/weak-password': 'La contraseña es muy débil. Debe tener al menos 6 caracteres.',
            'auth/network-request-failed': 'Error de conexión. Por favor verifica tu internet e intenta nuevamente.',
            'auth/too-many-requests': 'Demasiados intentos. Por favor espera unos minutos e intenta nuevamente.',
            'auth/user-disabled': 'Esta cuenta ha sido deshabilitada.',
            'auth/requires-recent-login': 'Por seguridad, necesitas volver a iniciar sesión.',
            'permission-denied': 'No tienes permisos para realizar esta acción.',
            'unavailable': 'El servicio no está disponible temporalmente. Intenta más tarde.',
        };

        // Buscar mensaje específico
        for (const [code, message] of Object.entries(errorMessages)) {
            if (errorCode.includes(code)) {
                return message;
            }
        }

        // Mensaje genérico si no se encuentra el código
        return 'Ocurrió un error al crear la cuenta. Por favor intenta nuevamente.';
    };

    // Animated particles effect
    useEffect(() => {
        const canvas = document.getElementById('particles-canvas') as HTMLCanvasElement;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles: Array<{
            x: number;
            y: number;
            radius: number;
            vx: number;
            vy: number;
            opacity: number;
        }> = [];

        // Create particles
        for (let i = 0; i < 80; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 2 + 1,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                opacity: Math.random() * 0.5 + 0.2
            });
        }

        function animate() {
            if (!ctx || !canvas) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw and update particles
            particles.forEach((particle, i) => {
                particle.x += particle.vx;
                particle.y += particle.vy;

                // Bounce off edges
                if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
                if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

                // Draw particle
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(139, 92, 246, ${particle.opacity})`;
                ctx.fill();

                // Draw connections
                particles.forEach((particle2, j) => {
                    if (i === j) return;
                    const dx = particle.x - particle2.x;
                    const dy = particle.y - particle2.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 120) {
                        ctx.beginPath();
                        ctx.moveTo(particle.x, particle.y);
                        ctx.lineTo(particle2.x, particle2.y);
                        ctx.strokeStyle = `rgba(139, 92, 246, ${0.1 * (1 - distance / 120)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                });
            });

            requestAnimationFrame(animate);
        }

        animate();

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const handleNextStep = () => {
        setError("");

        // Validaciones paso 1
        if (!displayName.trim()) {
            setError("Por favor ingresa tu nombre completo");
            return;
        }

        if (!email.trim()) {
            setError("Por favor ingresa tu correo electrónico");
            return;
        }

        if (password.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres");
            return;
        }

        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden");
            return;
        }

        // Si es personal, registrar directamente
        if (accountType === "personal") {
            handleSubmit();
        } else {
            // Si es empresa, ir al paso 2
            setCurrentStep(2);
        }
    };

    const handleSubmit = async () => {
        setError("");

        // Validaciones paso 2 (solo para empresas)
        if (accountType === "business" && currentStep === 2) {
            if (!companyName.trim()) {
                setError("Por favor ingresa el nombre de la empresa");
                return;
            }
            if (!fiscalDocumentNumber.trim()) {
                setError("Por favor ingresa el número de documento fiscal");
                return;
            }
        }

        setIsLoading(true);
        try {
            // Registrar usuario
            const userCredential = await register(email, password, displayName, phone, accountType);

            // Si es empresa, guardar datos de empresa
            if (accountType === "business" && userCredential.user) {
                const companyData = {
                    legalName: companyName,
                    country,
                    fiscalDocumentType: selectedCountry?.documentType,
                    fiscalDocumentNumber,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };

                await setDoc(doc(db, "users", userCredential.user.uid, "companyData", "info"), companyData);
            }

            router.push("/dashboard");
        } catch (err: any) {
            setError(getErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
            {/* Animated particles canvas */}
            <canvas
                id="particles-canvas"
                className="absolute inset-0 z-0"
                style={{ background: 'transparent' }}
            />

            <div className="glass-card w-full max-w-md space-y-6 rounded-2xl p-8 shadow-2xl relative z-10 bg-white/95 backdrop-blur-xl border border-gray-200">
                {/* Progress indicator */}
                <div className="flex items-center justify-center gap-2 mb-4">
                    <div className={`h-2 w-16 rounded-full transition-colors ${currentStep === 1 ? 'bg-indigo-600' : 'bg-gray-300'}`} />
                    {accountType === "business" && (
                        <div className={`h-2 w-16 rounded-full transition-colors ${currentStep === 2 ? 'bg-indigo-600' : 'bg-gray-300'}`} />
                    )}
                </div>

                <div>
                    <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-gray-900">
                        {currentStep === 1 ? "Crea tu cuenta" : "Datos de empresa"}
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        {currentStep === 1
                            ? "Comienza a organizar eventos increíbles"
                            : "Información fiscal de tu empresa"}
                    </p>
                </div>

                {/* Paso 1: Datos personales */}
                {currentStep === 1 && (
                    <div className="space-y-4">
                        {/* Nombre Completo */}
                        <div>
                            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                                Nombre completo
                            </label>
                            <input
                                id="displayName"
                                name="displayName"
                                type="text"
                                required
                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                placeholder="Tu nombre completo"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Correo electrónico
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                placeholder="tu@ejemplo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        {/* Teléfono */}
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                Teléfono/Celular <span className="text-gray-400 text-xs">(opcional)</span>
                            </label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                placeholder="+57 300 123 4567"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>

                        {/* Tipo de Cuenta */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tipo de cuenta
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setAccountType("personal")}
                                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${accountType === "personal"
                                            ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-md"
                                            : "border-gray-300 bg-white text-gray-600 hover:border-indigo-400"
                                        }`}
                                >
                                    <User className="w-6 h-6" />
                                    <span className="text-sm font-medium">Personal</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setAccountType("business")}
                                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${accountType === "business"
                                            ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-md"
                                            : "border-gray-300 bg-white text-gray-600 hover:border-indigo-400"
                                        }`}
                                >
                                    <Building2 className="w-6 h-6" />
                                    <span className="text-sm font-medium">Empresa</span>
                                </button>
                            </div>
                        </div>

                        {/* Contraseña */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Contraseña
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                placeholder="Mínimo 6 caracteres"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        {/* Confirmar Contraseña */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                Confirmar contraseña
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                placeholder="Repite tu contraseña"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {/* Paso 2: Datos de empresa */}
                {currentStep === 2 && accountType === "business" && (
                    <div className="space-y-4">
                        {/* Nombre de Empresa */}
                        <div>
                            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                                Nombre de la empresa <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="companyName"
                                name="companyName"
                                type="text"
                                required
                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                placeholder="Ej: Eventos XYZ S.A.S."
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                            />
                        </div>

                        {/* País */}
                        <div>
                            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                                País <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="country"
                                value={country}
                                onChange={(e) => setCountry(e.target.value as CountryCode)}
                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            >
                                {LATIN_AMERICAN_COUNTRIES.map((country) => (
                                    <option key={country.code} value={country.code}>
                                        {country.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Tipo de Documento */}
                        <div>
                            <label htmlFor="documentType" className="block text-sm font-medium text-gray-700 mb-1">
                                Tipo de documento
                            </label>
                            <input
                                id="documentType"
                                type="text"
                                disabled
                                value={`${selectedCountry?.documentName} (${selectedCountry?.documentType})`}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-600 cursor-not-allowed"
                            />
                        </div>

                        {/* Número de Documento */}
                        <div>
                            <label htmlFor="fiscalDocumentNumber" className="block text-sm font-medium text-gray-700 mb-1">
                                Número de identificación fiscal <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="fiscalDocumentNumber"
                                name="fiscalDocumentNumber"
                                type="text"
                                required
                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                placeholder={`Ej: ${selectedCountry?.documentType}-123456789`}
                                value={fiscalDocumentNumber}
                                onChange={(e) => setFiscalDocumentNumber(e.target.value)}
                            />
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-xs text-blue-700">
                                💡 Podrás completar el resto de la información de tu empresa más tarde en Configuración.
                            </p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <div className="flex gap-3">
                    {/* Botón Atrás */}
                    {currentStep === 2 && (
                        <button
                            type="button"
                            onClick={() => setCurrentStep(1)}
                            className="flex-1 flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-all"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Atrás
                        </button>
                    )}

                    {/* Botón Siguiente/Registrarse */}
                    <button
                        type="button"
                        onClick={currentStep === 1 ? handleNextStep : handleSubmit}
                        disabled={isLoading}
                        className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Registrando...
                            </>
                        ) : (
                            <>
                                {currentStep === 1 && accountType === "business" ? "Siguiente" : "Registrarse"}
                                {currentStep === 1 && accountType === "business" && <ArrowRight className="w-5 h-5" />}
                            </>
                        )}
                    </button>
                </div>

                <div className="text-sm text-center">
                    <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                        ¿Ya tienes cuenta? Inicia sesión
                    </Link>
                </div>
            </div>
        </div>
    );
}
