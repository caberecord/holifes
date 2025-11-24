import { create } from 'zustand';

// Simple ID generator
const generateId = () => Math.random().toString(36).substr(2, 9);

export type ToolType = 'select' | 'rectangle' | 'circle' | 'text' | 'seat-matrix' | 'stage' | 'door';
export type ElementType = 'general' | 'numbered' | 'decoration' | 'text' | 'stage' | 'door';

export interface CanvasElement {
    id: string;
    type: ElementType;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    fill: string;
    stroke?: string;
    // Business Data
    name: string;
    price: number;
    capacity?: number; // For general admission
    rows?: number; // For numbered
    cols?: number; // For numbered
    // Text specific
    text?: string;
    fontSize?: number;
    // Decoration specific
    shape?: 'rectangle' | 'circle' | 'T' | 'L';
}

interface VenueBuilderState {
    // Canvas State
    elements: CanvasElement[];
    selectedId: string | null;
    tool: ToolType;
    stageConfig: {
        scale: number;
        x: number;
        y: number;
    };

    // Actions
    setTool: (tool: ToolType) => void;
    selectElement: (id: string | null) => void;
    addElement: (type: ElementType, x: number, y: number) => void;
    updateElement: (id: string, updates: Partial<CanvasElement>) => void;
    removeElement: (id: string) => void;
    setStageConfig: (config: { scale: number; x: number; y: number }) => void;
    loadElements: (elements: CanvasElement[]) => void;
}

export const useVenueBuilderStore = create<VenueBuilderState>((set) => ({
    elements: [],
    selectedId: null,
    tool: 'select',
    stageConfig: { scale: 1, x: 0, y: 0 },

    setTool: (tool) => set({ tool, selectedId: null }), // Deselect when changing tools

    selectElement: (id) => set({ selectedId: id }),

    addElement: (type, x, y) => set((state) => {
        // Type-specific defaults
        const typeDefaults: Record<ElementType, Partial<CanvasElement>> = {
            'general': {
                width: 150,
                height: 100,
                fill: '#4f46e5',
                name: `Zona ${state.elements.length + 1}`,
                capacity: 100,
                price: 0,
            },
            'numbered': {
                width: 200,
                height: 150,
                fill: '#8b5cf6',
                name: `Asientos ${state.elements.length + 1}`,
                price: 0,
                rows: 5,
                cols: 10,
            },
            'decoration': {
                width: 80,
                height: 80,
                fill: '#e5e7eb',
                name: `Decoración ${state.elements.length + 1}`,
                price: 0,
                shape: 'circle',
            },
            'text': {
                width: 200,
                height: 50,
                fill: '#1e293b',
                name: 'Texto',
                text: 'Texto',
                fontSize: 24,
                price: 0,
            },
            'stage': {
                width: 250,
                height: 80,
                fill: '#fbbf24',
                name: 'Escenario',
                price: 0,
                shape: 'rectangle',
            },
            'door': {
                width: 60,
                height: 120,
                fill: '#10b981',
                name: 'Puerta',
                price: 0,
            },
        };

        const defaults = typeDefaults[type] || {};

        const newElement: CanvasElement = {
            id: generateId(),
            type,
            x,
            y,
            rotation: 0,
            ...defaults,
        } as CanvasElement;

        return { elements: [...state.elements, newElement], selectedId: newElement.id };
    }),

    updateElement: (id, updates) => set((state) => ({
        elements: state.elements.map((el) =>
            el.id === id ? { ...el, ...updates } : el
        ),
    })),

    removeElement: (id) => set((state) => ({
        elements: state.elements.filter((el) => el.id !== id),
        selectedId: null,
    })),

    setStageConfig: (config) => set({ stageConfig: config }),

    loadElements: (elements) => set({ elements }),
}));
