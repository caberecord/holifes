import Navbar from "../../components/Landing/Navbar";
import Footer from "../../components/Landing/Footer";

export default function CookiesPage() {
    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto prose prose-indigo">
                    <h1 className="text-4xl font-bold text-gray-900 mb-8">Política de Cookies</h1>

                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
                        <p className="text-sm text-yellow-700 m-0">
                            <strong>Nota Legal:</strong> Este documento explica el uso de cookies en nuestra plataforma.
                        </p>
                    </div>

                    <p className="text-gray-600 mb-6">
                        Última actualización: {new Date().toLocaleDateString()}
                    </p>

                    <h2>1. ¿Qué son las cookies?</h2>
                    <p>
                        Las cookies son pequeños archivos de texto que los sitios web que visita colocan en su ordenador o dispositivo móvil. Se utilizan ampliamente para hacer que los sitios web funcionen, o funcionen de manera más eficiente, así como para proporcionar información a los propietarios del sitio.
                    </p>

                    <h2>2. ¿Cómo usamos las cookies?</h2>
                    <p>
                        Utilizamos cookies para:
                    </p>
                    <ul>
                        <li>Mantener su sesión iniciada mientras navega por el sitio.</li>
                        <li>Recordar sus preferencias y configuraciones.</li>
                        <li>Entender cómo utiliza nuestro sitio web para mejorarlo.</li>
                        <li>Personalizar su experiencia en nuestro sitio.</li>
                    </ul>

                    <h2>3. Tipos de cookies que utilizamos</h2>

                    <h3>Cookies Estrictamente Necesarias</h3>
                    <p>
                        Estas cookies son esenciales para que pueda navegar por el sitio web y utilizar sus funciones. Sin estas cookies, no se pueden proporcionar servicios como el inicio de sesión seguro.
                    </p>

                    <h3>Cookies de Rendimiento</h3>
                    <p>
                        Estas cookies recopilan información sobre cómo los visitantes utilizan un sitio web, por ejemplo, qué páginas visitan con más frecuencia y si reciben mensajes de error de las páginas web. Estas cookies no recopilan información que identifique a un visitante.
                    </p>

                    <h3>Cookies de Funcionalidad</h3>
                    <p>
                        Estas cookies permiten que el sitio web recuerde las elecciones que realiza (como su nombre de usuario, idioma o la región en la que se encuentra) y proporcione funciones mejoradas y más personales.
                    </p>

                    <h2>4. Cómo controlar las cookies</h2>
                    <p>
                        Puede controlar y/o eliminar las cookies como desee. Puede eliminar todas las cookies que ya están en su ordenador y puede configurar la mayoría de los navegadores para evitar que se coloquen. Sin embargo, si hace esto, es posible que tenga que ajustar manualmente algunas preferencias cada vez que visite un sitio y que algunos servicios y funcionalidades no funcionen.
                    </p>

                    <h2>5. Más información</h2>
                    <p>
                        Si desea obtener más información sobre las cookies y cómo gestionarlas, visite <a href="https://www.aboutcookies.org" target="_blank" rel="noopener noreferrer">aboutcookies.org</a>.
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    );
}
