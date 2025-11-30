"use client";
import EventList from "@/components/Dashboard/EventList";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function MyEventsPage() {
    return (
        <div className="space-y-6">
            <EventList />
        </div>
    );
}
