import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

export interface GeneratedTheme {
    colorPalette: {
        primary: string;
        secondary: string;
        background: string;
        text: string;
        accent: string;
    };
    typography: {
        headingFont: string;
        bodyFont: string;
    };
    content: {
        hero: {
            title: string;
            subtitle: string;
            ctaText: string;
            scarcityText?: string;
        };
        valueProp: {
            headline: string;
            description: string;
            keyPoints: string[];
        };
        tickets: {
            headline: string;
            items: { name: string; price: string; benefits: string[]; recommended?: boolean }[];
        };
        logistics: {
            venueName: string;
            address: string;
            schedule: { time: string; activity: string }[];
            faq: { question: string; answer: string }[];
        };
        socialProof: {
            headline: string;
        };
        footer: {
            contactEmail: string;
            socials: { platform: string; handle: string }[];
        };
    };
    vibe: string;
    imageKeyword: string;
    error?: string;
}

export async function generateEventSiteTheme(
    eventDescription: string,
    eventName: string,
    customInstructions?: string,
    eventDetails?: {
        date?: string;
        location?: string;
        priceRange?: string;
    }
): Promise<GeneratedTheme> {
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not set");
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // List of models to try in order of preference
    // Updated to include latest Gemini 3 and 2.5 models
    const modelsToTry = ["gemini-2.0-flash-001", "gemini-1.5-pro", "gemini-1.5-flash"];

    let lastError;

    for (const modelName of modelsToTry) {
        try {
            console.log(`Attempting to generate with model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });

            const prompt = `
            You are an expert UI/UX designer and copywriter.
            Create a comprehensive, professional landing page theme for an event.

            Event Details:
            - Name: "${eventName}"
            - Description: "${eventDescription}"
            - Date: "${eventDetails?.date || 'TBD'}"
            - Location: "${eventDetails?.location || 'TBD'}"
            ${eventDetails?.priceRange ? `- Price Range: "${eventDetails.priceRange}"` : ''}

            ${customInstructions ? `IMPORTANT - USER INSTRUCTIONS: "${customInstructions}"` : ''}

            Based on the above, generate a design system and detailed copy for a 6-section landing page:
            1. Hero (Hook): High impact, urgency.
            2. Value Prop (Why): Emotional connection, key benefits.
            3. Tickets (Decision): Clear comparison, anchored pricing.
            4. Logistics (Friction reduction): Venue, schedule, FAQ.
            5. Social Proof (Trust): Placeholder for sponsors/gallery.
            6. Closing (Retargeting): Final CTA.

            Return ONLY a JSON object with the following structure (no markdown, no extra text):
            {
              "colorPalette": {
                "primary": "hex code",
                "secondary": "hex code",
                "background": "hex code",
                "text": "hex code",
                "accent": "hex code (high contrast for CTAs)"
              },
              "typography": {
                "headingFont": "Font Name (Google Fonts)",
                "bodyFont": "Font Name (Google Fonts)"
              },
              "content": {
                "hero": {
                    "title": "Event Name - Tour/Edition",
                    "subtitle": "Date @ Venue",
                    "ctaText": "BUY TICKETS NOW",
                    "scarcityText": "Urgency message (e.g. 'Less than 50 VIP tickets left')"
                },
                "valueProp": {
                    "headline": "Emotional Headline",
                    "description": "Persuasive intro text describing the experience.",
                    "keyPoints": ["Point 1", "Point 2", "Point 3"]
                },
                "tickets": {
                    "headline": "Choose Your Experience",
                    "items": [
                        { "name": "General", "price": "$XX", "benefits": ["Benefit A", "Benefit B"] },
                        { "name": "VIP", "price": "$XX", "benefits": ["All General benefits", "Benefit C", "Benefit D"], "recommended": true }
                    ]
                },
                "logistics": {
                    "venueName": "Venue Name",
                    "address": "Full Address",
                    "schedule": [
                        { "time": "19:00", "activity": "Doors Open" },
                        { "time": "21:00", "activity": "Main Act" }
                    ],
                    "faq": [
                        { "question": "Parking?", "answer": "Details..." },
                        { "question": "Age limit?", "answer": "Details..." }
                    ]
                },
                "socialProof": {
                    "headline": "Supported By"
                },
                "footer": {
                    "contactEmail": "contact@event.com",
                    "socials": [
                        { "platform": "Instagram", "handle": "@event" }
                    ]
                }
              },
              "vibe": "A short description of the visual style",
              "imageKeyword": "A specific, descriptive English prompt for an AI image generator to create a hero background image for this event (e.g. 'neon cyberpunk concert crowd', 'elegant wedding floral arrangement')"
            }
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Clean up potential markdown code blocks
            const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();

            return JSON.parse(jsonString) as GeneratedTheme;
        } catch (error) {
            console.warn(`Failed with model ${modelName}:`, error);
            lastError = error;
            // Continue to next model
        }
    }

    // If all models fail
    console.error("All Gemini models failed. Last error:", lastError);
    return {
        error: lastError instanceof Error ? lastError.message : String(lastError),
        colorPalette: {
            primary: "#4F46E5",
            secondary: "#818CF8",
            background: "#FFFFFF",
            text: "#1F2937",
            accent: "#F59E0B"
        },
        typography: {
            headingFont: "Inter",
            bodyFont: "Inter"
        },
        content: {
            hero: {
                title: eventName,
                subtitle: "Join us for an unforgettable experience.",
                ctaText: "Get Tickets",
                scarcityText: "Limited tickets available!"
            },
            valueProp: {
                headline: "Why You Can't Miss This",
                description: eventDescription || "More details coming soon.",
                keyPoints: ["Unforgettable Atmosphere", "Live Performance", "Exclusive Access"]
            },
            tickets: {
                headline: "Tickets",
                items: [
                    { name: "General Admission", price: "TBD", benefits: ["Entry to event"] }
                ]
            },
            logistics: {
                venueName: eventDetails?.location || "TBD",
                address: eventDetails?.location || "Address TBD",
                schedule: [],
                faq: []
            },
            socialProof: {
                headline: "Partners"
            },
            footer: {
                contactEmail: "info@example.com",
                socials: []
            }
        },
        vibe: "Clean and Modern",
        imageKeyword: "abstract modern event background"
    };
}
