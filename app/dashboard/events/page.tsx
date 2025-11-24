"use client";
import EventList from "../../../components/Dashboard/EventList";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function MyEventsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Mis Eventos</h1>
                    <p className="text-sm text-gray-500">Gestiona y edita tus eventos creados.</p>
                </div>
                <Link
                    href="/dashboard/create"
                    className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Crear Nuevo Evento
                </Link>
            </div>

            <EventList />
        </div>
    );
}
