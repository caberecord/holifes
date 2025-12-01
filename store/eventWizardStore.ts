import { create } from 'zustand';

export type EventPlan = 'freemium-a' | 'freemium-b' | 'pro' | 'enterprise';
export type VenueType = 'auditorium' | 'concert-hall' | 'open-field' | 'theater';
export type DistributionMethod = 'manual' | 'stripe' | 'invite' | 'free';

export interface TicketZone {
    id: string;
    name: string;
    capacity: number;
    price: number;
    color: string;
    x: number;
    y: number;
    width: number;
    height: number;
    type: 'standing' | 'seating' | 'numbered';
    shape: 'rectangle' | 'L' | 'T';
    rotation: number;
}

export interface WizardState {
    currentStep: number;
    // Step 1: Basic Info
    basicInfo: {
        name: string;
        date: string;
        startTime: string;
        endTime: string;
        location: string;
        googleMapsUrl?: string;
        category: string;
        description: string;
        address: string;
        coverImage?: string;
    };
    // Step 2: Plan
    selectedPlan: EventPlan | null;
    // Step 3: Venue
    venue: {
        type: VenueType | null;
        zones: TicketZone[];
        totalCapacity: number;
        venueMap?: any; // Full JSON state from VenueBuilder
    };
    // Step 4: Distribution
    distribution: {
        methods: DistributionMethod[]; // Changed to array for multi-select
        uploadedGuests: any[]; // Array from Excel
    };

    // Actions
    setStep: (step: number) => void;
    updateBasicInfo: (info: Partial<WizardState['basicInfo']>) => void;
    setPlan: (plan: EventPlan) => void;
    setVenueType: (type: VenueType) => void;
    updateZones: (zones: TicketZone[]) => void;
    setVenueMap: (map: any) => void;
    updateZonePosition: (id: string, x: number, y: number) => void;
    toggleDistributionMethod: (method: DistributionMethod) => void;
    setUploadedGuests: (guests: any[]) => void;
    resetWizard: () => void;
}

export const useEventWizardStore = create<WizardState>((set) => ({
    currentStep: 1,
    basicInfo: {
        name: '',
        date: '',
        startTime: '',
        endTime: '',
        location: '',
        googleMapsUrl: '',
        category: '',
        description: '',
        address: '',
    },
    selectedPlan: null,
    venue: {
        type: null,
        zones: [],
        totalCapacity: 0,
        venueMap: null,
    },
    distribution: {
        methods: [],
        uploadedGuests: [],
    },

    setStep: (step) => set({ currentStep: step }),
    updateBasicInfo: (info) =>
        set((state) => ({ basicInfo: { ...state.basicInfo, ...info } })),
    setPlan: (plan) => set({ selectedPlan: plan }),
    setVenueType: (type) =>
        set((state) => ({ venue: { ...state.venue, type } })),
    updateZones: (zones) =>
        set((state) => ({
            venue: {
                ...state.venue,
                zones,
                totalCapacity: zones.reduce((acc, zone) => acc + zone.capacity, 0),
            },
        })),
    setVenueMap: (map) =>
        set((state) => ({ venue: { ...state.venue, venueMap: map } })),
    updateZonePosition: (id, x, y) =>
        set((state) => ({
            venue: {
                ...state.venue,
                zones: state.venue.zones.map((z) => (z.id === id ? { ...z, x, y } : z)),
            },
        })),
    toggleDistributionMethod: (method) =>
        set((state) => {
            const currentMethods = state.distribution.methods;
            const isSelected = currentMethods.includes(method);
            const newMethods = isSelected
                ? currentMethods.filter(m => m !== method)
                : [...currentMethods, method];
            return {
                distribution: { ...state.distribution, methods: newMethods }
            };
        }),
    setUploadedGuests: (guests) =>
        set((state) => ({ distribution: { ...state.distribution, uploadedGuests: guests } })),
    resetWizard: () =>
        set({
            currentStep: 1,
            basicInfo: {
                name: '',
                date: '',
                startTime: '',
                endTime: '',
                location: '',
                googleMapsUrl: '',
                category: '',
                description: '',
                address: '',
            },
            selectedPlan: null,
            venue: { type: null, zones: [], totalCapacity: 0 },
            distribution: { methods: [], uploadedGuests: [] },
        }),
}));
