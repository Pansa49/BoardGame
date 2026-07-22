import React from 'react';

// Type ข้อมูลตาม Response จาก API จริงของคุณ
export interface MenuItem {
    product_id: number;
    name: string;
    category: string;
    price: string;
}

type MenuModeListProps = {
    mode: 'food' | 'drink';
    menus: MenuItem[];
    tempOrders: Record<number, number>;
    onUpdateOrderQty?: (productId: number, delta: number) => void;
};

export function MenuModeList({ mode, menus, tempOrders, onUpdateOrderQty, }: MenuModeListProps) {

    // กรองข้อมูลตาม mode
    const filteredMenus = menus.filter((item) => {
        if (mode === 'drink') {
            return item.category === 'Beverage' || item.category === 'Smoothie';
        }
        if (mode === 'food') {
            return item.category === 'Snack' || item.category === 'Food';
        }
        return true;
    });

    if (filteredMenus.length === 0) {
        return (
            <div className="text-center text-slate-500 py-12 text-sm">
                ไม่มีรายการเมนูในหมวดนี้
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2.5">
            {filteredMenus.map((item) => {
                const qty = tempOrders[item.product_id] || 0;

                return (
                    <div
                        key={item.product_id}
                        className="flex justify-between items-center bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl hover:border-slate-700 transition-all shadow-sm"
                    >
                        {/* ฝั่งซ้าย: ชื่อเมนูและราคา */}
                        <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-bold text-slate-100">
                                {item.name}
                            </span>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-amber-400 font-mono font-semibold">
                                    {parseFloat(item.price)} บาท
                                </span>
                                <span className="text-[10px] text-slate-500 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">
                                    {item.category}
                                </span>
                            </div>
                        </div>

                        {/* ฝั่งขวา: ปุ่มบวกลบ */}
                        <div className="flex items-center gap-2">
                            {qty > 0 && (
                                <>
                                    <button
                                        onClick={() => onUpdateOrderQty?.(item.product_id, -1)}
                                        className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center text-sm border border-slate-700 active:scale-95 transition-all"
                                    >
                                        -
                                    </button>
                                    <span className="text-sm font-bold font-mono text-amber-400 min-w-[18px] text-center">
                                        {qty}
                                    </span>
                                </>
                            )}
                            <button
                                onClick={() => onUpdateOrderQty?.(item.product_id, 1)}
                                className="w-7 h-7 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center justify-center text-sm shadow-md active:scale-95 transition-all"
                            >
                                +
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}