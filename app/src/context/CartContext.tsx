import { createContext, useState, useEffect } from "react";
import type { Menu, Bill } from '../../../share/details';

type CartContextType = {
    menus: Menu[];
    tempOrders: Record<number, number>;
    currentSessionId: number | null;
    totalBill: Bill[];

    updateMenus: (menu: Menu[]) => void;
    updateTotalBill: (bill: Bill) => void;
    updateSessionId: (sessionId: number | null) => void;
    updateOrderQty: (productId: number, delta: number) => void;
    resetTempOrders: () => void;
};

export const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {

    const [menus, setMenus] = useState<Menu[]>([]);
    const [totalBill, setTotalBill] = useState<Bill[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
    const [tempOrders, setTempOrders] = useState<Record<number, number>>({});

    useEffect(() => {
        console.log("currentSessionId : ", currentSessionId);
        console.log("totalBill : ", totalBill);
    }, [totalBill, currentSessionId]);

    const updateMenus = (menu: Menu[]) => { setMenus(menu); };

    const updateSessionId = (sessionId: number | null) => {
        setCurrentSessionId(sessionId);
        setTotalBill([]);
        setTempOrders({});
    };

    const resetTempOrders = () => setTempOrders({});

    const updateOrderQty = (productId: number, delta: number) => {
        setTempOrders((prev) => {
            const currentQty = prev[productId] || 0;
            const newQty = currentQty + delta;

            if (newQty <= 0) {
                const updated = { ...prev };
                delete updated[productId];
                return updated;
            }

            return {
                ...prev,
                [productId]: newQty,
            };
        });
    };

    const updateTotalBill = (bill: Bill) => { setTotalBill((prev) => [...prev, bill]); };

    return (
        <CartContext.Provider
            value={{
                menus, currentSessionId, totalBill, tempOrders,
                updateMenus, updateTotalBill, updateSessionId, updateOrderQty, resetTempOrders,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}