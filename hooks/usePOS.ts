import { useState, useMemo } from 'react';
import { Event } from "@/types/event";
import { toast } from "react-toastify";
import { posService } from "@/services/posService";
import { POSAttendee, POSSaleData } from "@/types/pos";

export const usePOS = (user: any, selectedEvent: Event | null) => {
    const [cart, setCart] = useState<{ [key: string]: number }>({});
    const [mainAttendee, setMainAttendee] = useState<POSAttendee>({
        name: "",
        email: "",
        phone: "",
        idNumber: "",
        idType: 'CC'
    });
    const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
    const [cashReceived, setCashReceived] = useState<string>("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [lastSaleData, setLastSaleData] = useState<POSSaleData | null>(null);
    const [isSearchingContact, setIsSearchingContact] = useState(false);

    // Calculate Sold By Zone (Memoized)
    const soldByZone = useMemo(() => {
        if (selectedEvent?.stats?.soldByZone) {
            return selectedEvent.stats.soldByZone;
        }
        const sold: { [key: string]: number } = {};
        if (selectedEvent?.distribution?.uploadedGuests) {
            selectedEvent.distribution.uploadedGuests.forEach(guest => {
                if (guest.Status !== 'cancelled' && guest.Status !== 'deleted') {
                    sold[guest.Zone] = (sold[guest.Zone] || 0) + 1;
                }
            });
        }
        return sold;
    }, [selectedEvent]);

    // Cart Actions
    const handleAddToCart = (zoneName: string, delta: number) => {
        const current = cart[zoneName] || 0;
        const newValue = Math.max(0, current + delta);

        if (delta > 0) {
            const zone = selectedEvent?.venue?.zones.find(z => z.name === zoneName);
            if (zone) {
                const sold = soldByZone[zoneName] || 0;
                const remaining = zone.capacity - sold;
                if (newValue > remaining) {
                    toast.error(`Solo quedan ${remaining} entradas en esta zona`);
                    return;
                }
            }
        }

        setCart(prev => {
            const newCart = { ...prev, [zoneName]: newValue };
            if (newValue === 0) delete newCart[zoneName];
            return newCart;
        });
    };

    const handleClearCart = () => setCart({});

    // Totals
    const totalAmount = useMemo(() => {
        return Object.entries(cart).reduce((sum, [zoneName, qty]) => {
            const zone = selectedEvent?.venue?.zones.find(z => z.name === zoneName);
            return sum + (zone ? zone.price * qty : 0);
        }, 0);
    }, [cart, selectedEvent]);

    const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);

    // Sale Processing
    const processSale = async (onSuccess: () => void) => {
        if (!selectedEvent || !user) return;
        setIsProcessing(true);

        try {
            const { contactId, allProcessedAttendees } = await posService.processSale(
                selectedEvent,
                cart,
                mainAttendee,
                paymentMethod!,
                totalAmount,
                user
            );

            const saleData: POSSaleData = {
                event: selectedEvent,
                cart,
                total: totalAmount,
                date: new Date().toLocaleString(),
                attendees: allProcessedAttendees,
                paymentMethod: paymentMethod as any,
                cashReceived,
                change: (parseFloat(cashReceived) || 0) - totalAmount,
                contactId: contactId || undefined
            };
            setLastSaleData(saleData);
            toast.success("¡Venta completada exitosamente!");
            onSuccess();

        } catch (error: any) {
            console.error("Error completing sale:", error);
            toast.error(error.message || "Error al procesar la venta");
        } finally {
            setIsProcessing(false);
        }
    };

    const resetSale = () => {
        setCart({});
        setMainAttendee({ name: "", email: "", phone: "", idNumber: "", idType: 'CC' });
        setPaymentMethod(null);
        setLastSaleData(null);
        setCashReceived("");
    };

    return {
        cart,
        setCart,
        mainAttendee,
        setMainAttendee,
        paymentMethod,
        setPaymentMethod,
        cashReceived,
        setCashReceived,
        isProcessing,
        lastSaleData,
        soldByZone,
        handleAddToCart,
        handleClearCart,
        totalAmount,
        totalItems,
        processSale,
        resetSale,
        isSearchingContact,
        setIsSearchingContact
    };
};
