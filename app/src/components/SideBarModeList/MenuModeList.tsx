
import type { Menu } from '../../../../share/details'

type MenuModeListProps = {
    mode: 'Food' | 'Drink';
    menus: Menu[];
    tempOrders: Record<number, number>;
    onUpdateOrderQty?: (productId: number, delta: number) => void;
};

export function MenuModeList({ mode, menus, tempOrders, onUpdateOrderQty }: MenuModeListProps) {
    // กรองข้อมูลตาม mode
    const filteredMenus = menus.filter((item) => {
        if (mode === 'Drink') {
            return item.category === 'Drink';
        }
        if (mode === 'Food') {
            return item.category === 'Food';
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
        <div id='menu-container'
            className="flex flex-col h-ful gap-2.5">
            <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 pr-1">
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
                                        {parseFloat(String(item.price))} บาท
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

            <div className='flex flex-col mt-auto pt-2'>
                <div className="border-t border-slate-800 pt-4 bg-slate-900">
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 mb-4 flex justify-between items-center">
                        <span className="text-xs text-slate-400">รวมค่าอาหารของโต๊ะนี้:</span>
                        {/* <span className="text-lg font-bold text-amber-400">{calculateFoodTotal()} บาท</span> */}
                    </div>
                    <button
                        // onClick={onClose}
                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl text-center text-sm shadow-lg transition-colors"
                    >
                        เสร็จสิ้น / บันทึกรายการ
                    </button>
                </div>
            </div>
        </div>
    );
}