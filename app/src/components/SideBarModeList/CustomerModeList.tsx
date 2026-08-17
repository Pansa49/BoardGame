import { useState } from "react";

interface CustomerModeListProps {
    pricePerPerson?: number; // ราคาต่อหัว (เช่น 100 บาท)
    onCustomerCountChange?: (count: number) => void;
}

export function CustomerModeList({
    pricePerPerson = 100,
    onCustomerCountChange
}: CustomerModeListProps) {
    const [customerCount, setCustomerCount] = useState<number>(1);

    const handleUpdateCustomer = (delta: number) => {
        const newCount = Math.max(1, customerCount + delta); // ไม่ให้ต่ำกว่า 1 คน
        setCustomerCount(newCount);
        onCustomerCountChange?.(newCount);
    };

    const totalPlayPrice = customerCount * pricePerPerson;

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

            {/* 2. แถบสีเหลืองสรุปราคา (แสดงผลเมื่อมีการระบุจำนวนลูกค้า) */}
            <div className="flex items-center justify-between px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg animate-fade-in">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <span className="text-xs font-medium text-amber-300">
                        ค่าเล่น ({customerCount} ท่าน × ฿{pricePerPerson}):
                    </span>
                </div>
                <span className="text-sm font-bold font-mono text-amber-400">
                    ฿{totalPlayPrice.toLocaleString()}
                </span>
            </div>

        </div>
    );
}