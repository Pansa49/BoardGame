import { createContext, useState } from "react";
import type { Menu } from '../../../share/details'

type CartContextType = {
    menus: Menu[];
    updateMenus: (menu: Menu) => void;
};

export const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [menus, setMenus] = useState<Menu[]>([]);

    const updateMenus = (menu: Menu) => {
        setMenus((prev) => [...prev, menu])
        console.log({
            show: menu
        })
    }

    return (
        <CartContext.Provider
            value={{
                menus,
                updateMenus,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}