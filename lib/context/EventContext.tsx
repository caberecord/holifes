'use client';

import { createContext, useContext } from 'react';
import type { Event } from '../../types/event';

const EventContext = createContext<Event | null>(null);

export function EventContextProvider({
    event,
    children
}: {
    event: Event;
    children: React.ReactNode
}) {
    return (
        <EventContext.Provider value={event}>
            {children}
        </EventContext.Provider>
    );
}

export function useEventContext() {
    return useContext(EventContext);
}
