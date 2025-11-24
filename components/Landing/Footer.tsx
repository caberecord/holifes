import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <img src="/logo_blanco_holifes.png" alt="Holifes" className="h-10 w-auto" />
                        </div>
                        <p className="text-sm text-gray-400">
                            La plataforma completa para gestionar eventos exitosos.
                        </p>
                    </div>

                    {/* Product */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Producto</h3>
                        <ul className="space-y-2">
                            <li><Link href="/#features" className="text-sm hover:text-white transition-colors">Características</Link></li>
                            <li><Link href="/#pricing" className="text-sm hover:text-white transition-colors">Precios</Link></li>
                            <li><Link href="/dashboard" className="text-sm hover:text-white transition-colors">Dashboard</Link></li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Compañía</h3>
                        <ul className="space-y-2">
                            <li><Link href="/about" className="text-sm hover:text-white transition-colors">Sobre Nosotros</Link></li>
                            <li><Link href="/contact" className="text-sm hover:text-white transition-colors">Contacto</Link></li>
                            <li><Link href="/blog" className="text-sm hover:text-white transition-colors">Blog</Link></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Legal</h3>
                        <ul className="space-y-2">
                            <li><Link href="/privacy" className="text-sm hover:text-white transition-colors">Privacidad</Link></li>
                            <li><Link href="/terms" className="text-sm hover:text-white transition-colors">Términos</Link></li>
                            <li><Link href="/cookies" className="text-sm hover:text-white transition-colors">Cookies</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-12 pt-8">
                    <p className="text-center text-sm text-gray-400">
                        © 2025 Holifes. Todos los derechos reservados.
                    </p>
                </div>
            </div>
        </footer>
    );
}
