import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-indigo-600 mb-4">404</h1>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Evento no encontrado</h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    El evento que buscas no existe, ha sido eliminado o la dirección es incorrecta.
                </p>
                <Link
                    href="/"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Volver al inicio
                </Link>
            </div>
        </div>
    );
}
