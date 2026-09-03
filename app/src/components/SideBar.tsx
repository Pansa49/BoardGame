import { useCartContext } from "../hook/use-cart-context";
import { type SideBarProps } from "../../../share/details";
import { MenuModeList } from './SideBarModeList/MenuModeList';
import { OrderDetailModeList } from "./SideBarModeList/OrderDetailModeList";
import { CustomerModeList } from "./SideBarModeList/CustomerModeList";
import { BillModelist } from "./SideBarModeList/BillModeList";

export function SideBar({ isOpen, mode, onClose }: SideBarProps) {
    const { menus, tempOrders, updateOrderQty } = useCartContext();

    if (!isOpen || !mode) return null;

    return (
        <div id="sidebar-container">
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
                        <div className="flex overflow-y-auto pr-1 flex-col gap-2.5 mb-4">
                            {mode}
                        </div>
                        <div className="flex-1 overflow-y-auto pr-1 mb-4">

                            {/* Switch Render ตาม Mode */}
                            {mode === 'customer' && (
                                <CustomerModeList />
                            )}

                            {(mode === 'Food' || mode === 'Drink') && (
                                < MenuModeList
                                    mode={mode}
                                    menus={menus}
                                    tempOrders={tempOrders}
                                    onUpdateOrderQty={updateOrderQty}
                                    onSuccess={() => {
                                        // สิ่งที่จะให้เกิดขึ้นหลังกดสั่งอาหารสำเร็จ
                                        // เคลียร์ตะกร้าสินค้า
                                        // ปิดแถบเมนู
                                    }}
                                />
                            )}

                            {(mode === 'Order') && (
                                < OrderDetailModeList
                                />
                            )}

                            {(mode === 'Bill') && (
                                < BillModelist />
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}