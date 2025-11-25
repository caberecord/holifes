import { Render } from "@measured/puck";
import { config } from "../../../puck.config";
import { getEventBySubdomain } from "../../../lib/services/eventService";
import { EventContextProvider } from "../../../lib/context/EventContext";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { EventJsonLd } from "../../../components/seo/EventJsonLd";

type PageProps = {
    params: Promise<{ subdomain: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(props: PageProps): Promise<Metadata> {
    const params = await props.params;
    const event = await getEventBySubdomain(params.subdomain);

    if (!event) {
        return {
            title: 'Evento no encontrado',
        };
    }

    const heroImage = event.layout_data?.root?.props?.image || event.layout_data?.root?.props?.backgroundImage;

    return {
        title: `${event.name} | Entradas y Registro`,
        description: event.description || `Asiste a ${event.name}. Consigue tus entradas aquí.`,
        openGraph: {
            title: event.name,
            description: event.description || `Detalles del evento ${event.name}`,
            images: heroImage ? [{ url: heroImage }] : [],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: event.name,
            description: event.description || `Detalles del evento ${event.name}`,
            images: heroImage ? [heroImage] : [],
        },
    };
}

export default async function EventSitePage(props: PageProps) {
    try {
        const params = await props.params;
        const event = await getEventBySubdomain(params.subdomain);

        if (!event) {
            return notFound();
        }

        // Si el sitio no está publicado, mostrar error (o login para preview)
        if (event.status_site !== 'published') {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">Próximamente</h1>
                        <p className="text-gray-600 mb-8">
                            Este evento aún no ha sido publicado. Vuelve pronto.
                        </p>
                        <Link href="/" className="text-indigo-600 hover:text-indigo-500 font-medium">
                            Ir a Holifes Tickets
                        </Link>
                    </div>
                </div>
            );
        }

        const layoutData = event.layout_data || { content: [], root: {} };

        return (
            <main className="min-h-screen bg-white">
                <EventJsonLd event={event} />
                <EventContextProvider event={event}>
                    <Render config={config} data={layoutData} />
                </EventContextProvider>
            </main>
        );
    } catch (error: any) {
        console.error("CRITICAL ERROR in EventSitePage:", error);
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 px-4 text-center">
                <h1 className="text-2xl font-bold text-red-800 mb-4">Error al cargar el sitio</h1>
                <p className="text-red-600 mb-4">Ocurrió un problema inesperado.</p>
                <pre className="bg-red-100 p-4 rounded text-left text-xs overflow-auto max-w-lg mx-auto text-red-900">
                    {error?.message || JSON.stringify(error)}
                    {error?.stack && `\n\n${error.stack}`}
                </pre>
            </div>
        );
    }
}
