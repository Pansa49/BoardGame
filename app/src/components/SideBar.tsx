import { useCartContext } from "../hook/use-cart-context";
import { MenuModeList } from './SideBarModeList/MenuModeList';

export type SidebarMode = 'customer' | 'Food' | 'Drink' | null;

type Props = {
    isOpen: boolean;
    mode: SidebarMode;
    onClose: () => void;
};

export function SideBar({ isOpen, mode, onClose }: Props) {
    const { menus, tempOrders, updateOrderQty } = useCartContext();
    console.log({
        mode: mode,
        menus: menus,
        tempOrders: tempOrders,
        updateOrderQty: updateOrderQty
    })

    if (!isOpen || !mode) return null;

    return (
        <div id="sidebar-container">
            {isOpen && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
                        onClick={onClose}
                    />

                    <div className="relative w-full max-w-md h-full bg-slate-900 border-l border-slate-800 p-6 flex flex-col justify-between shadow-2xl animate-[slideIn_0.3s_ease-out]">
                        <div className="flex flex-col h-full min-h-0">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">🍔</span>
                                    {/* <h3 className="text-xl font-extrabold text-white">สั่งอาหาร โต๊ะ {selectedTable?.name}</h3> */}
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* รายการเมนูอาหารที่มีในร้าน */}
                            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2.5 mb-4">
                                {mode}
                            </div>
                            <div className="flex-1 overflow-y-auto pr-1 mb-4">

                                {/* Switch Render ตาม Mode */}
                                {mode === 'customer' && (
                                    <div>{/* เรียกใช้ <CustomerModeList /> หรือ UI ปรับจำนวนคน */}</div>
                                )}

                                {(mode === 'Food' || mode === 'Drink') && (
                                    <MenuModeList
                                        mode={mode}
                                        menus={menus}
                                        tempOrders={tempOrders}
                                        onUpdateOrderQty={updateOrderQty}
                                    />
                                )}

                            </div>
                        </div>

                        {/* ส่วนสรุปราคาของออเดอร์ใน Drawer */}
                        <div className="border-t border-slate-800 pt-4 bg-slate-900">
                            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 mb-4 flex justify-between items-center">
                                <span className="text-xs text-slate-400">รวมค่าอาหารของโต๊ะนี้:</span>
                                {/* <span className="text-lg font-bold text-amber-400">{calculateFoodTotal()} บาท</span> */}
                            </div>
                            <button
                                onClick={onClose}
                                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl text-center text-sm shadow-lg transition-colors"
                            >
                                เสร็จสิ้น / บันทึกรายการ
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}