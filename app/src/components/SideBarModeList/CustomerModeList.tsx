import { useState } from "react";
import { updateCustomerNumBySessionId } from "../../api/fetchdata";
import { useCartContext } from "../../hook/use-cart-context";

interface CustomerModeListProps {
    onCustomerCountChange?: (count: number) => void;
}

export function CustomerModeList({ onCustomerCountChange }: CustomerModeListProps) {

    const { currentSessionId } = useCartContext();
    const [customerCount, setCustomerCount] = useState<number>(1);

    const handleUpdateCustomer = (delta: number) => {
        const newCount = Math.max(0, customerCount + delta); // ไม่ให้ต่ำกว่า 1 คน
        setCustomerCount(newCount);
        onCustomerCountChange?.(newCount);
    };

    const handleClick = async () => {
        console.log("set customer : ", customerCount)
        if (!currentSessionId) {
            alert("ไม่พบข้อมูลเซสชัน กรุณาเลือกโต๊ะใหม่อีกครั้ง");
            return
        }
        const res = await updateCustomerNumBySessionId(currentSessionId, customerCount)

        if (res.success) {
            setCustomerCount(0);
        }
    }

    return (
        <div className="flex flex-col gap-3 w-full p-3 bg-slate-900 rounded-xl border border-slate-800">

            {/* 1. ส่วนปุ่มปรับจำนวนลูกค้า */}
            <div className="flex justify-between items-center gap-2">
                <span className="text-sm font-semibold text-slate-300">
                    จำนวนลูกค้า
                </span>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => handleUpdateCustomer(-1)}
                        className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center text-sm border border-slate-700 active:scale-95 transition-all"
                    >
                        -
                    </button>

                    <span className="text-base font-bold font-mono text-amber-400 min-w-[24px] text-center">
                        {customerCount}
                    </span>

                    <button
                        type="button"
                        onClick={() => handleUpdateCustomer(1)}
                        className="w-8 h-8 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center justify-center text-sm shadow-md active:scale-95 transition-all"
                    >
                        +
                    </button>
                </div>
            </div>

            <button
                type="button"
                onClick={handleClick}
                disabled={customerCount === 0}
                className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-slate-950 font-bold py-3.5 rounded-xl text-center text-sm shadow-lg transition-colors flex items-center justify-center gap-2"
            >
                บันทึกจำนวนลูกค้า
            </button>
        </div>
    );
}