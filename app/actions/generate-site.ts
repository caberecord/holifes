"use server";

import { generateEventSiteTheme } from "@/lib/ai/gemini";

export async function generateSiteAction(
    description: string,
    name: string,
    customInstructions?: string,
    eventDetails?: { date?: string; location?: string; priceRange?: string; }
) {
    return await generateEventSiteTheme(description, name, customInstructions, eventDetails);
}
