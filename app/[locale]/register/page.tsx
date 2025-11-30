"use client";
import { useState, FormEvent, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useTranslations } from 'next-intl';
import CustomPhoneInput from "@/components/ui/PhoneInput";

export default function RegisterPage() {
    const { register, loginWithGoogle } = useAuth();
    const router = useRouter();
    const t = useTranslations('Auth');

    const [displayName, setDisplayName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Función para traducir errores de Firebase a mensajes amigables
    const getErrorMessage = (error: any): string => {
        const errorCode = error.code || error.message;

        const errorMessages: { [key: string]: string } = {
            'auth/email-already-in-use': 'emailInUse',
            'auth/invalid-email': 'invalidEmail',
            'auth/operation-not-allowed': 'operationNotAllowed',
            'auth/weak-password': 'weakPassword',
            'auth/network-request-failed': 'networkRequestFailed',
            'auth/too-many-requests': 'tooManyRequests',
            'auth/user-disabled': 'userDisabled',
            'auth/requires-recent-login': 'requiresRecentLogin',
            'permission-denied': 'permissionDenied',
            'unavailable': 'unavailable',
        };

        for (const [code, key] of Object.entries(errorMessages)) {
            if (errorCode.includes(code)) {
                return t(`errors.${key}`);
            }
        }

        return t('errors.genericRegister');
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

            particles.forEach((particle, i) => {
                particle.x += particle.vx;
                particle.y += particle.vy;

                if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
                if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(139, 92, 246, ${particle.opacity})`;
                ctx.fill();

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
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleSubmit = async () => {
        setError("");

        if (!displayName.trim()) {
            setError(t('validation.nameRequired'));
            return;
        }

        if (!email.trim()) {
            setError(t('validation.emailRequired'));
            return;
        }

        if (password.length < 6) {
            setError(t('validation.passwordLength'));
            return;
        }

        if (password !== confirmPassword) {
            setError(t('validation.passwordMismatch'));
            return;
        }

        setIsLoading(true);
        try {
            // Registrar usuario (siempre como personal inicialmente)
            await register(email, password, displayName, phone, "personal");

            // Redirigir al flujo de onboarding de organización
            router.push("/dashboard/organizations/new");
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

                <div>
                    <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-gray-900">
                        {t('createAccount')}
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        {t('registerSubtitle')}
                    </p>
                </div>

                <div className="mb-6">
                    <button
                        type="button"
                        onClick={async () => {
                            try {
                                setIsLoading(true);
                                await loginWithGoogle();
                                router.push("/dashboard");
                            } catch (err: any) {
                                setError(getErrorMessage(err));
                                setIsLoading(false);
                            }
                        }}
                        className="w-full flex items-center justify-center gap-3 bg-white text-gray-700 font-semibold py-3 px-4 rounded-lg border border-gray-300 shadow-sm hover:bg-gray-50 transition-all duration-200"
                    >
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                        {t('registerWithGoogle')}
                    </button>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">{t('orRegisterWithEmail')}</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Nombre Completo */}
                    <div>
                        <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                            {t('fullNameLabel')}
                        </label>
                        <input
                            id="displayName"
                            name="displayName"
                            type="text"
                            required
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            placeholder={t('fullNamePlaceholder')}
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            {t('emailLabel')}
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            placeholder={t('emailPlaceholder')}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    {/* Teléfono */}
                    <div>
                        <CustomPhoneInput
                            label={t('phoneLabel')}
                            value={phone}
                            onChange={(value) => setPhone(value || "")}
                            placeholder="+57 300 123 4567"
                        />
                    </div>

                    {/* Contraseña */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            {t('passwordLabel')}
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            placeholder={t('passwordPlaceholder')}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {/* Confirmar Contraseña */}
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            {t('confirmPasswordLabel')}
                        </label>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            required
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            placeholder={t('confirmPasswordPlaceholder')}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                {t('registering')}
                            </>
                        ) : (
                            <>
                                {t('registerAction')}
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </div>

                <div className="text-sm text-center">
                    <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                        {t('alreadyHaveAccount')}
                    </Link>
                </div>
            </div>
        </div>
    );
}
