/**
 * Calendar Utility Functions
 * Generates iCalendar (.ics) and JSON-LD data for events.
 */

interface EventData {
    eventName: string;
    description?: string;
    location: string;
    startDate: string; // ISO String or YYYY-MM-DD
    startTime: string; // HH:mm
    endTime?: string; // HH:mm
    organizerName?: string;
    organizerEmail?: string;
}

/**
 * Formats a date string to iCalendar format (YYYYMMDDTHHMMSSZ)
 * Assumes input date is local and converts to UTC or keeps as floating if no timezone info.
 * For simplicity in this context, we will treat times as local floating time (no Z) 
 * or we need to handle timezones properly. 
 * The user example used 'Z' which implies UTC.
 * Let's try to construct a Date object and output UTC.
 */
function formatDateToICS(dateStr: string, timeStr: string): string {
    try {
        // Construct a date object. 
        // Note: dateStr might be "2025-11-29" and timeStr "10:00"
        const combined = new Date(`${dateStr.split('T')[0]}T${timeStr}:00`);

        // If invalid, return fallback
        if (isNaN(combined.getTime())) return '';

        // Format to YYYYMMDDTHHMMSSZ (UTC)
        // We'll use the getUTC* methods
        const year = combined.getUTCFullYear();
        const month = String(combined.getUTCMonth() + 1).padStart(2, '0');
        const day = String(combined.getUTCDate()).padStart(2, '0');
        const hours = String(combined.getUTCHours()).padStart(2, '0');
        const minutes = String(combined.getUTCMinutes()).padStart(2, '0');
        const seconds = String(combined.getUTCSeconds()).padStart(2, '0');

        return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
    } catch (e) {
        console.error("Error formatting date for ICS:", e);
        return '';
    }
}

/**
 * Generates iCalendar (.ics) content
 */
export function generateICS(event: EventData): string {
    const uid = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}@holifes.com`;
    const dtStamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const dtStart = formatDateToICS(event.startDate, event.startTime);

    // Default duration 2 hours if no end time
    let dtEnd = '';
    if (event.endTime) {
        dtEnd = formatDateToICS(event.startDate, event.endTime);
    } else {
        // Add 2 hours to start
        const start = new Date(`${event.startDate.split('T')[0]}T${event.startTime}:00`);
        start.setHours(start.getHours() + 2);
        const year = start.getUTCFullYear();
        const month = String(start.getUTCMonth() + 1).padStart(2, '0');
        const day = String(start.getUTCDate()).padStart(2, '0');
        const hours = String(start.getUTCHours()).padStart(2, '0');
        const minutes = String(start.getUTCMinutes()).padStart(2, '0');
        const seconds = String(start.getUTCSeconds()).padStart(2, '0');
        dtEnd = `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
    }

    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Holifes//Events v1.0//EN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${dtStamp}
DTSTART:${dtStart}
DTEND:${dtEnd}
SUMMARY:${event.eventName}
LOCATION:${event.location}
DESCRIPTION:${event.description || `Asiste a ${event.eventName}`}
END:VEVENT
END:VCALENDAR`.replace(/\n/g, '\r\n');
}

/**
 * Generates JSON-LD for Google Gmail Actions
 */
export function generateEventJSONLD(event: EventData): string {
    // Construct ISO dates with timezone offset if possible, or Z if UTC.
    // For simplicity, we'll assume the input date/time is what we want to show.
    // JSON-LD prefers ISO 8601.

    const startIso = `${event.startDate.split('T')[0]}T${event.startTime}:00`;
    let endIso = '';

    if (event.endTime) {
        endIso = `${event.startDate.split('T')[0]}T${event.endTime}:00`;
    } else {
        const start = new Date(startIso);
        start.setHours(start.getHours() + 2);
        endIso = start.toISOString().split('.')[0]; // Rough approx
    }

    const data = {
        "@context": "http://schema.org",
        "@type": "Event",
        "name": event.eventName,
        "startDate": startIso,
        "endDate": endIso,
        "location": {
            "@type": "Place",
            "name": event.location,
            "address": event.location
        },
        "description": event.description || `Entradas para ${event.eventName}`,
        "organizer": {
            "@type": "Organization",
            "name": event.organizerName || "Holifes"
        }
    };

    return JSON.stringify(data);
}
