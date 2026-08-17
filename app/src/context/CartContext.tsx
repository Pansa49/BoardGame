import { createContext, useState } from "react";
import type { Menu } from '../../../share/details'

type CartContextType = {
    menus: Menu[];
    tempOrders: Record<number, number>;
    currentSessionId: number | null;

    // fn
    updateMenus: (menu: Menu[]) => void;
    updateSessionId: (sessionId: number | null) => void;
    updateOrderQty: (productId: number, delta: number) => void;
    resetTempOrders: () => void;
};

export const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {

    const [menus, setMenus] = useState<Menu[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<number | null>(0);

    /* State สำหรับเก็บจำนวนสินค้าชั่วคราว ย่อจาก = useState<{ [key: number]: number }>({});*/
    const [tempOrders, setTempOrders] = useState<Record<number, number>>({})

    const updateMenus = (menu: Menu[]) => {
        setMenus(menu)
    }

    const updateSessionId = (sessionId: number | null) => {
        setCurrentSessionId(sessionId);
    }

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

    const resetTempOrders = () => setTempOrders({});

    return (
        <CartContext.Provider
            value={{
                menus, currentSessionId,
                updateMenus, updateSessionId, tempOrders, updateOrderQty, resetTempOrders,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}