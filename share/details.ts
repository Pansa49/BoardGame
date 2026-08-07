export interface Table {
    id: number;
    name: string;
    status: "available" | "occupied";
    startTime?: string;
    customerCount?: number;
}

export interface FoodItem {
    id: string;
    name: string;
    price: number;
    emoji: string;
}

export interface Customer {
    id: string;
    name: string;
    tier: "Gold" | "Silver" | "Regular";
    favoriteGame: string;
    points: number;
    status: "เล่นอยู่" | "กลับแล้ว";
}

export interface Menu {
    product_id: number;
    name: string;
    category: string;
    price: number;
}

export interface Table {
    table_id: number;
    table_number: string;
    capacity: number;
}

export type MenuModeListProps = {
    sessionId: number;
    mode: 'Food' | 'Drink';
    menus: Menu[];
    tempOrders: Record<number, number>;
    onUpdateOrderQty?: (productId: number, delta: number) => void;
    onSuccess?: () => void;
}

export type OrderItemPayload = {
    product_id: number;
    quantity: number;
    unit_price: number;
}

export type SidebarMode = 'customer' | 'Food' | 'Drink' | 'Order' | 'Bill' | null;

export type SideBarProps = {
    sessionId: number;
    isOpen: boolean;
    mode: SidebarMode;
    onClose: () => void;
};