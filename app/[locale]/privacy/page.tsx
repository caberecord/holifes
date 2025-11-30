import Navbar from "@/components/Landing/Navbar";
import Footer from "@/components/Landing/Footer";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto prose prose-indigo">
                    <h1 className="text-4xl font-bold text-gray-900 mb-8">Política de Privacidad</h1>

                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
                        <p className="text-sm text-yellow-700 m-0">
                            <strong>Nota Legal:</strong> Este documento es una plantilla estándar. Le recomendamos revisar y adaptar este contenido con su asesor legal para garantizar el cumplimiento total con las regulaciones locales (Habeas Data) e internacionales (GDPR).
                        </p>
                    </div>

                    <p className="text-gray-600 mb-6">
                        Última actualización: {new Date().toLocaleDateString()}
                    </p>

                    <h2>1. Introducción</h2>
                    <p>
                        En Holifes ("nosotros", "nuestro"), respetamos su privacidad y estamos comprometidos a proteger sus datos personales. Esta política de privacidad le informará sobre cómo cuidamos sus datos personales cuando visita nuestro sitio web y le informará sobre sus derechos de privacidad y cómo la ley lo protege.
                    </p>

                    <h2>2. Los datos que recopilamos</h2>
                    <p>
                        Podemos recopilar, usar, almacenar y transferir diferentes tipos de datos personales sobre usted, que hemos agrupado de la siguiente manera:
                    </p>
                    <ul>
                        <li><strong>Datos de Identidad:</strong> incluye nombre, apellido, nombre de usuario o identificador similar.</li>
                        <li><strong>Datos de Contacto:</strong> incluye dirección de correo electrónico y números de teléfono.</li>
                        <li><strong>Datos Técnicos:</strong> incluye dirección IP, datos de inicio de sesión, tipo y versión del navegador, configuración de zona horaria y ubicación.</li>
                        <li><strong>Datos de Uso:</strong> incluye información sobre cómo utiliza nuestro sitio web y servicios.</li>
                    </ul>

                    <h2>3. Cómo usamos sus datos personales</h2>
                    <p>
                        Solo utilizaremos sus datos personales cuando la ley lo permita. Más comúnmente, utilizaremos sus datos personales en las siguientes circunstancias:
                    </p>
                    <ul>
                        <li>Donde necesitemos realizar el contrato que estamos a punto de celebrar o hemos celebrado con usted.</li>
                        <li>Donde sea necesario para nuestros intereses legítimos (o los de un tercero) y sus intereses y derechos fundamentales no anulen esos intereses.</li>
                        <li>Donde necesitemos cumplir con una obligación legal o reglamentaria.</li>
                    </ul>

                    <h2>4. Seguridad de los datos</h2>
                    <p>
                        Hemos implementado medidas de seguridad apropiadas para evitar que sus datos personales se pierdan accidentalmente, se utilicen o accedan de forma no autorizada, se alteren o divulguen. Además, limitamos el acceso a sus datos personales a aquellos empleados, agentes, contratistas y otros terceros que tengan una necesidad comercial de conocerlos.
                    </p>

                    <h2>5. Sus derechos legales</h2>
                    <p>
                        Bajo ciertas circunstancias, tiene derechos bajo las leyes de protección de datos en relación con sus datos personales, incluyendo el derecho a solicitar acceso, corrección, eliminación, restricción, transferencia, y a oponerse al procesamiento.
                    </p>

                    <h2>6. Contacto</h2>
                    <p>
                        Si tiene alguna pregunta sobre esta política de privacidad o nuestras prácticas de privacidad, por favor contáctenos a través de nuestro formulario de contacto o enviando un correo electrónico a soporte@holifes.com.
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    );
}
