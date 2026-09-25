import { useState } from 'react';
import type { MenuModeListProps, OrderItemPayload } from '../../../../share/details';
import { createOrders } from '../../api/fetchdata';
import { useCartContext } from '../../hook/use-cart-context';

export function MenuModeList({ mode, menus, tempOrders, onUpdateOrderQty, onSuccess, }: MenuModeListProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { resetTempOrders, currentSessionId } = useCartContext();

    // 1. กรองเมนูตาม Mode (Food/Drink)
    const filteredMenus = mode === 'Menu' ? menus : [];

    // 2. คำนวณราคารวมของหมวดนี้
    const totalAmount = filteredMenus.reduce((sum, item) => {
        const qty = tempOrders[item.product_id] || 0;
        return sum + qty * Number(item.price);
    }, 0);

    // 3. fn บันทึกรายการสั่งซื้อลง DB
    const handleSubmitOrders = async () => {
        // 1. แปลงรายการสินค้าที่เลือก (qty > 0) ให้เป็น Array ตามที่ Backend ต้องการ
        const orderItems: OrderItemPayload[] = filteredMenus
            .filter((item) => (tempOrders[item.product_id] || 0) > 0)
            .map((item) => ({
                product_id: item.product_id,
                quantity: tempOrders[item.product_id],
                unit_price: Number(item.price),
            }));

        setIsLoading(true);

        try {
            // 2. ยิง API เพียงครั้งเดียว ส่ง session_id และ array ของสินค้าทั้งหมดไปพร้อมกัน
            if (!currentSessionId) {
                alert("ไม่พบข้อมูลเซสชัน กรุณาเลือกโต๊ะใหม่อีกครั้ง");
                return
            }
            const res = await createOrders(currentSessionId, orderItems);

            if (res.success) {
                resetTempOrders();
                onSuccess?.();
            }

        } catch (error) {
            console.error('Submit Orders Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const MenuItem = (category: string, textColor: string) => {
        return (
            <div>
                {filteredMenus.filter((item) => item.category === category).map((item) => {
                    const qty = tempOrders[item.product_id] || 0;
                    return (
                        <div
                            key={item.product_id}
                            className="flex justify-between items-center bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl hover:border-slate-700 transition-all shadow-sm"
                        >
                            {/* ฝั่งซ้าย: ชื่อ ราคา */}
                            <div className="flex flex-col gap-0.5">
                                <span className="text-sm font-bold text-slate-100">
                                    {item.name}
                                </span>
                                <span className={`text-left self-start text-xs text-${textColor} font-mono font-semibold`}>
                                    {Number(item.price).toLocaleString()} บาท
                                </span>
                            </div>

                            {/* ฝั่งขวา: ปุ่มบวกลบ */}
                            <div className="flex items-center gap-2">
                                {qty > 0 && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => onUpdateOrderQty?.(item.product_id, -1)}
                                            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center text-sm border border-slate-700 active:scale-95 transition-all"
                                        >
                                            -
                                        </button>
                                        <span className={`text-sm font-bold font-mono text-${textColor} min-w-[18px] text-center`}>
                                            {qty}
                                        </span>
                                    </>
                                )}
                                <button
                                    type="button"
                                    onClick={() => onUpdateOrderQty?.(item.product_id, 1)}
                                    className={`w-7 h-7 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center justify-center text-sm shadow-md active:scale-95 transition-all`}
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        )
    }

    if (filteredMenus.length === 0) {
        return (
            <div className="text-center text-slate-500 py-12 text-sm">
                ไม่มีรายการเมนูในหมวดนี้
            </div>
        );
    }

    return (
        <div id="menu-container" className="flex flex-col h-full gap-2.5">
            <div className="flex-1 overflow-y-auto flex flex-col gap-5 pr-1">

                {/* ================= 1. หมวดหมู่ Food ================= */}
                {filteredMenus.some(item => item.category === 'Food') && (
                    <div className="flex flex-col gap-2.5">
                        <div className="flex items-center gap-2 sticky top-0 backdrop-blur-md py-1.5 z-10 border-b border-slate-800">
                            <span className="text-base">🍔</span>
                            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider">Food</h3>
                        </div>
                        {MenuItem("Food", "amber-400")}
                    </div>
                )}

                {/* ================= 2. หมวดหมู่ Drink ================= */}
                {filteredMenus.some(item => item.category === 'Drink') && (
                    <div className="flex flex-col gap-2.5">
                        <div className="flex items-center gap-2 sticky top-0 backdrop-blur-md py-1.5 z-10 border-b border-slate-800">
                            <span className="text-base">🥤</span>
                            <h3 className="text-sm font-bold text-sky-600 uppercase tracking-wider">Drink</h3>
                        </div>
                        {MenuItem("Drink", "sky-600")}
                    </div>
                )}

            </div>

            {/* ส่วนสรุปราคารวมและปุ่มบันทึก */}
            <div className="flex flex-col mt-auto pt-2">
                <div className="border-t border-slate-800 pt-4 bg-slate-900">
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 mb-4 flex justify-between items-center">
                        <span className="text-xs text-slate-400">รวมค่าอาหารของหมวดนี้:</span>
                        <span className="text-lg font-bold text-amber-400">
                            {totalAmount.toLocaleString()} บาท
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={handleSubmitOrders}
                        disabled={isLoading || totalAmount === 0}
                        className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-slate-950 font-bold py-3.5 rounded-xl text-center text-sm shadow-lg transition-colors flex items-center justify-center gap-2"
                    >
                        {isLoading ? 'กำลังบันทึกรายการ...' : 'เสร็จสิ้น / บันทึกรายการ'}
                    </button>
                </div>
            </div>
        </div>
    );
}