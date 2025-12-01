import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

// --- CONSTANTS ---
export const PIXELS_PER_METER = 50; // 1 meter = 50 pixels

// --- TYPES ---
export type ToolType = 'select' | 'crop' | 'rectangle' | 'circle' | 'text' | 'seat-matrix' | 'stage' | 'door' | 'stand' | 'aisle' | 'general-curve' | 'seat-curve';
export type ElementType = 'general' | 'numbered' | 'decoration' | 'text' | 'stage' | 'door' | 'stand' | 'aisle';

export interface AllocatableUnit {
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
    name: string; // Label (e.g., "Stand A-101")
    price: number;
    capacity?: number; // For general/numbered

    // Numbered specific
    rows?: number;
    cols?: number;
    namingScheme?: {
        rowType: 'numeric' | 'alpha';
        seatType: 'numeric' | 'alpha';
    };

    // Decoration/Shape specific
    shape?: 'rectangle' | 'circle' | 'T' | 'L' | 'curve';

    // Text specific
    text?: string;
    fontSize?: number;
    textColor?: string;

    // Curved/Arc specific
    curveRadius?: number; // Outer radius for arcs
    curveAngle?: number; // Angle in degrees for arcs
    innerRadius?: number; // Inner radius for arcs (thickness)

    // Trade Show / Stand specific
    metadata?: {
        status: 'available' | 'reserved' | 'sold' | 'blocked';
        amenities?: string[]; // e.g., ['electricity', 'water']
        mergedFrom?: string[]; // IDs of stands merged into this one
        logo?: string; // URL/Base64 of brand logo
    };

    // Phase 2: Advanced Editing
    locked?: boolean;
    groupId?: string;
}

export interface VenueBuilderState {
    elements: AllocatableUnit[];
    selectedIds: string[];
    tool: ToolType;
    viewMode: 'normal' | 'heatmap';
    is3DPreviewOpen: boolean;
    stageConfig: any;

    // Background
    backgroundImage: string | null;
    backgroundScale: number;
    backgroundOpacity: number;
    backgroundX: number;
    backgroundY: number;

    // Canvas
    canvasSize: { width: number; height: number };
    setCanvasSize: (size: { width: number; height: number }) => void;

    // History
    past: AllocatableUnit[][];
    future: AllocatableUnit[][];
    clipboard: AllocatableUnit[];

    // Actions
    setTool: (tool: ToolType) => void;
    setViewMode: (mode: 'normal' | 'heatmap') => void;
    toggle3DPreview: () => void;

    addElement: (type: ElementType, x: number, y: number) => void;
    updateElement: (id: string, updates: Partial<AllocatableUnit>) => void;
    updateElements: (updates: { id: string; changes: Partial<AllocatableUnit> }[]) => void;
    removeElements: (ids: string[]) => void;
    selectElement: (id: string | null, multi?: boolean) => void;
    clearSelection: () => void;

    // Background Actions
    setBackgroundImage: (image: string | null) => void;
    updateBackground: (updates: { scale?: number; opacity?: number; x?: number; y?: number }) => void;

    // History Actions
    undo: () => void;
    redo: () => void;

    // Clipboard Actions
    copyElements: () => void;
    pasteElements: () => void;

    // Phase 2 Actions
    toggleLock: (ids: string[]) => void;
    bringToFront: (ids: string[]) => void;
    sendToBack: (ids: string[]) => void;
    groupElements: (ids: string[]) => void;
    ungroupElements: (ids: string[]) => void;
    mergeSelectedStands: () => void;

    // Compatibility / Loading
    loadElements: (elements: AllocatableUnit[]) => void;
    setStageConfig: (config: any) => void;
}

export const useVenueBuilderStore = create<VenueBuilderState>((set, get) => ({
    elements: [],
    selectedIds: [],
    tool: 'select',
    viewMode: 'normal',
    is3DPreviewOpen: false,
    stageConfig: {}, // Default empty

    backgroundImage: null,
    backgroundScale: 1,
    backgroundOpacity: 0.5,
    backgroundX: 0,
    backgroundY: 0,

    canvasSize: { width: 2000, height: 2000 },
    setCanvasSize: (size) => set({ canvasSize: size }),

    past: [],
    future: [],
    clipboard: [],

    setTool: (tool) => set({ tool, selectedIds: [] }),
    setViewMode: (mode) => set({ viewMode: mode }),
    toggle3DPreview: () => set((state) => ({ is3DPreviewOpen: !state.is3DPreviewOpen })),

    loadElements: (elements) => {
        set({ elements, past: [], future: [], selectedIds: [] });
    },
    setStageConfig: (config) => set({ stageConfig: config }),

    addElement: (type, x, y) => {
        const { elements, tool } = get();
        // Push to history
        set({ past: [...get().past, elements], future: [] });

        // Type-specific defaults
        const typeDefaults: Record<ElementType, Partial<AllocatableUnit>> = {
            'general': {
                width: 150,
                height: 100,
                fill: '#4f46e5',
                name: `Zona ${elements.length + 1}`,
                capacity: 100,
                price: 0,
                shape: 'rectangle'
            },
            'numbered': {
                width: 200,
                height: 150,
                fill: '#8b5cf6',
                name: `Asientos ${elements.length + 1}`,
                price: 0,
                rows: 5,
                cols: 10,
                shape: 'rectangle'
            },
            'decoration': {
                width: 80,
                height: 80,
                fill: '#e5e7eb',
                name: `Decoración ${elements.length + 1}`,
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
            'stand': {
                width: 3 * PIXELS_PER_METER, // 3x3 meters default
                height: 3 * PIXELS_PER_METER,
                fill: '#ffffff',
                stroke: '#334155',
                name: `Stand ${elements.length + 1}`,
                price: 1000,
                metadata: { status: 'available' }
            },
            'aisle': {
                width: 2 * PIXELS_PER_METER, // 2m wide aisle
                height: 10 * PIXELS_PER_METER,
                fill: '#f1f5f9', // Very light gray
                name: 'Pasillo',
                price: 0,
                capacity: 0,
                metadata: { status: 'blocked' } // Aisles are not sellable
            }
        };

        // Handle special tool types that map to base element types
        let actualType = type;
        let extraProps: Partial<AllocatableUnit> = {};

        if (type === 'general-curve' as any) {
            actualType = 'general';
            extraProps = {
                shape: 'curve',
                width: 200,
                height: 200,
                curveRadius: 100,
                curveAngle: 180,
                innerRadius: 50
            };
        } else if (type === 'seat-curve' as any) {
            actualType = 'numbered';
            extraProps = {
                shape: 'curve',
                width: 300,
                height: 200,
                curveRadius: 150,
                curveAngle: 180,
                innerRadius: 50,
                rows: 5,
                cols: 10
            };
        } else if (type === 'seat-matrix' as any) {
            actualType = 'numbered';
        }

        const defaults = typeDefaults[actualType] || {};

        const newElement: AllocatableUnit = {
            id: uuidv4(),
            type: actualType,
            x,
            y,
            rotation: 0,
            ...defaults,
            ...extraProps
        } as AllocatableUnit;

        set({ elements: [...elements, newElement], selectedIds: [newElement.id], tool: 'select' });
    },

    updateElement: (id, updates) => {
        const { elements } = get();
        // Push to history only on drag end or explicit update, but for now we wrap all updates
        // Optimization: In a real app, we'd debounce history for drag updates
        set({ past: [...get().past, elements], future: [] });

        set({
            elements: elements.map((el) => (el.id === id ? { ...el, ...updates } : el)),
        });
    },

    updateElements: (updates) => {
        const { elements } = get();
        set({ past: [...get().past, elements], future: [] });

        const updatesMap = new Map(updates.map(u => [u.id, u.changes]));

        set({
            elements: elements.map((el) => {
                const changes = updatesMap.get(el.id);
                return changes ? { ...el, ...changes } : el;
            }),
        });
    },

    removeElements: (ids) => {
        const { elements } = get();
        set({ past: [...get().past, elements], future: [] });
        set({
            elements: elements.filter((el) => !ids.includes(el.id)),
            selectedIds: [],
        });
    },

    selectElement: (id, multi = false) => {
        const { selectedIds, elements } = get();

        if (!id) {
            set({ selectedIds: [] });
            return;
        }

        // Check if element is part of a group
        const targetElement = elements.find(el => el.id === id);
        let idsToSelect = [id];

        if (targetElement?.groupId) {
            // Select all elements in the group
            idsToSelect = elements.filter(el => el.groupId === targetElement.groupId).map(el => el.id);
        }

        if (multi) {
            // Toggle selection
            const newSelected = selectedIds.includes(id)
                ? selectedIds.filter(sid => !idsToSelect.includes(sid))
                : [...new Set([...selectedIds, ...idsToSelect])];
            set({ selectedIds: newSelected });
        } else {
            set({ selectedIds: idsToSelect });
        }
    },

    clearSelection: () => set({ selectedIds: [] }),

    setBackgroundImage: (image) => set({ backgroundImage: image }),

    updateBackground: (updates) => set((state) => ({ ...state, ...updates })),

    undo: () => {
        const { past, future, elements } = get();
        if (past.length === 0) return;

        const previous = past[past.length - 1];
        const newPast = past.slice(0, past.length - 1);

        set({
            past: newPast,
            elements: previous,
            future: [elements, ...future],
            selectedIds: []
        });
    },

    redo: () => {
        const { past, future, elements } = get();
        if (future.length === 0) return;

        const next = future[0];
        const newFuture = future.slice(1);

        set({
            past: [...past, elements],
            elements: next,
            future: newFuture,
            selectedIds: []
        });
    },

    copyElements: () => {
        const { elements, selectedIds } = get();
        if (selectedIds.length === 0) return;
        const toCopy = elements.filter(el => selectedIds.includes(el.id));
        set({ clipboard: toCopy });
    },

    pasteElements: () => {
        const { clipboard, elements } = get();
        if (clipboard.length === 0) return;

        set({ past: [...get().past, elements], future: [] });

        const newElements = clipboard.map(el => ({
            ...el,
            id: uuidv4(),
            x: el.x + 20,
            y: el.y + 20,
            name: `${el.name} (Copia)`,
            groupId: undefined // Do not copy group ID, pasted elements should be independent
        }));

        set({
            elements: [...elements, ...newElements],
            selectedIds: newElements.map(el => el.id)
        });
    },

    // Phase 2 Actions Implementation
    toggleLock: (ids) => {
        const { elements } = get();
        set({ past: [...get().past, elements], future: [] });

        set({
            elements: elements.map(el =>
                ids.includes(el.id) ? { ...el, locked: !el.locked } : el
            )
        });
    },

    bringToFront: (ids) => {
        const { elements } = get();
        set({ past: [...get().past, elements], future: [] });

        const moving = elements.filter(el => ids.includes(el.id));
        const others = elements.filter(el => !ids.includes(el.id));

        set({ elements: [...others, ...moving] });
    },

    sendToBack: (ids) => {
        const { elements } = get();
        set({ past: [...get().past, elements], future: [] });

        const moving = elements.filter(el => ids.includes(el.id));
        const others = elements.filter(el => !ids.includes(el.id));

        set({ elements: [...moving, ...others] });
    },

    groupElements: (ids) => {
        if (ids.length < 2) return;
        const { elements } = get();
        set({ past: [...get().past, elements], future: [] });

        const newGroupId = uuidv4();
        set({
            elements: elements.map(el =>
                ids.includes(el.id) ? { ...el, groupId: newGroupId } : el
            )
        });
    },

    ungroupElements: (ids) => {
        const { elements } = get();
        set({ past: [...get().past, elements], future: [] });

        set({
            elements: elements.map(el =>
                ids.includes(el.id) ? { ...el, groupId: undefined } : el
            )
        });
    },

    mergeSelectedStands: () => {
        const { elements, selectedIds } = get();
        if (selectedIds.length < 2) return;

        const standsToMerge = elements.filter(el => selectedIds.includes(el.id));

        if (!standsToMerge.every(el => el.type === 'stand')) {
            console.warn("Only stands can be merged");
            return;
        }

        set({ past: [...get().past, elements], future: [] });

        const minX = Math.min(...standsToMerge.map(s => s.x));
        const minY = Math.min(...standsToMerge.map(s => s.y));
        const maxX = Math.max(...standsToMerge.map(s => s.x + s.width));
        const maxY = Math.max(...standsToMerge.map(s => s.y + s.height));

        const newWidth = maxX - minX;
        const newHeight = maxY - minY;

        const newStand: AllocatableUnit = {
            id: uuidv4(),
            type: 'stand',
            x: minX,
            y: minY,
            width: newWidth,
            height: newHeight,
            rotation: 0,
            fill: '#ffffff',
            stroke: '#334155',
            name: standsToMerge.map(s => s.name).join(' + '),
            price: standsToMerge.reduce((sum, s) => sum + s.price, 0),
            metadata: {
                status: 'available',
                mergedFrom: selectedIds,
                amenities: []
            }
        };

        set({
            elements: [
                ...elements.filter(el => !selectedIds.includes(el.id)),
                newStand
            ],
            selectedIds: [newStand.id]
        });
    }
}));
