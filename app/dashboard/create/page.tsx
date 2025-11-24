import CreateEventWizard from "@/components/Dashboard/Wizard/CreateEventWizard";

export default function CreateEventPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Crear Nuevo Evento</h1>
                    <p className="text-sm text-gray-500">Reglas de distribución: en plan Freemium solo están disponibles los métodos Invitacional y Gratis.</p>
                </div>
            </div>

            <CreateEventWizard />
        </div>
    );
}
