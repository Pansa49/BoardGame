export interface Table {
    id: number;
    name: string;
    status: "available" | "occupied";
    startTime?: string | null;
    customerCount?: number;
    sessionId?: number | null;
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
    mode: 'Menu';
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

export type SidebarMode = 'Menu' | 'customer' | 'Order' | 'Bill' | null;

export type SideBarProps = {
    isOpen: boolean;
    mode: SidebarMode;
    onClose: () => void;
};

export interface OrderItem {
    product_id: number;
    product_name: string;
    category: string;
    quantity: number;
    unit_price: number;
}

export interface Bill {
    customer_count: number;
    play_price: number;
    order_list: string[];
    order_price: number;
    total_price: number;
}

export interface FinalBill {
    session_id: number;
    total_play: number;
    total_order: number;
    grand_total: number;
    payment_time: Date;
}

export interface HomeLoaderData {
    loaderTables: Table[];
    loaderMenus: Menu[];
}
