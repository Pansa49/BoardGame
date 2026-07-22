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
    product_id: string;
    name: string;
    category: string;
    price: number;
}   