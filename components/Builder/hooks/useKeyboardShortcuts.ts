import { useEffect } from 'react';
import { useVenueBuilderStore } from '@/store/venueBuilderStore';

export const useKeyboardShortcuts = () => {
    // @ts-ignore - new actions
    const {
        removeElements,
        selectedIds,
        undo,
        redo,
        copyElements,
        pasteElements,
        updateElement,
        elements
    } = useVenueBuilderStore();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if typing in an input
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
                return;
            }

            // Delete / Backspace
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (selectedIds.length > 0) {
                    e.preventDefault();
                    removeElements(selectedIds);
                }
            }

            // Undo (Ctrl+Z)
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                undo();
            }

            // Redo (Ctrl+Y or Ctrl+Shift+Z)
            if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
                e.preventDefault();
                redo();
            }

            // Copy (Ctrl+C)
            if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
                e.preventDefault();
                copyElements();
            }

            // Paste (Ctrl+V)
            if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
                e.preventDefault();
                pasteElements();
            }

            // Arrow Keys (Nudge)
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                if (selectedIds.length > 0) {
                    e.preventDefault();
                    const step = e.shiftKey ? 10 : 1; // Shift for larger steps

                    selectedIds.forEach((id: string) => {
                        const element = elements.find((el: any) => el.id === id);
                        if (element) {
                            let updates = {};
                            switch (e.key) {
                                case 'ArrowUp': updates = { y: element.y - step }; break;
                                case 'ArrowDown': updates = { y: element.y + step }; break;
                                case 'ArrowLeft': updates = { x: element.x - step }; break;
                                case 'ArrowRight': updates = { x: element.x + step }; break;
                            }
                            updateElement(id, updates);
                        }
                    });
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedIds, elements, removeElements, undo, redo, copyElements, pasteElements, updateElement]);
};
