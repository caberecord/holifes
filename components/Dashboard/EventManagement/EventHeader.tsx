import { useState } from "react";
import { Eye, ExternalLink, Loader2, CheckCircle } from "lucide-react";
import { Event } from "../../../types/event";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { toast } from "react-toastify";

interface EventHeaderProps {
    event: Event;
}

export default function EventHeader({ event }: EventHeaderProps) {
    const [isPublishing, setIsPublishing] = useState(false);

    const handlePublish = async () => {
        if (!event.id) return;

        // Optional: Add validation before publishing (e.g., check for tickets, description)

        setIsPublishing(true);
        try {
            const eventRef = doc(db, "events", event.id);
            await updateDoc(eventRef, {
                status: 'published'
            });

            toast.success("¡Evento publicado exitosamente!");

            // Reload to reflect changes (or use a context/state update if available globally)
            window.location.reload();
        } catch (error) {
            console.error("Error publishing event:", error);
            toast.error("Error al publicar el evento");
        } finally {
            setIsPublishing(false);
        }
    };

    const isPublished = event.status === 'published';

    return (
        <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-200 bg-white">
            {/* Cover Image Banner */}
            {event.coverImage && (
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
                    <img
                        src={event.coverImage}
                        alt={event.name}
                        className="w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
            )}

            <div className="px-6 py-4 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{event.name}</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${event.status === 'published' ? 'bg-green-100 text-green-800' :
                            event.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                            {event.status === 'published' ? 'Publicado' : event.status === 'draft' ? 'En Construcción' : event.status}
                        </span>
                        <span className="text-sm text-gray-500 flex items-center">
                            ID: {event.id}
                        </span>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        <Eye className="w-4 h-4 mr-2" />
                        Previsualizar
                    </button>
                    <button
                        onClick={handlePublish}
                        disabled={isPublished || isPublishing}
                        className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isPublished
                            ? "bg-green-100 text-green-700 cursor-default"
                            : "bg-indigo-600 text-white hover:bg-indigo-700"
                            }`}
                    >
                        {isPublishing ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Publicando...
                            </>
                        ) : isPublished ? (
                            <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Publicado
                            </>
                        ) : (
                            <>
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Publicar Evento
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
