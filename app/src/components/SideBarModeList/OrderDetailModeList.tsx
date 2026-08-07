export function OrderDetail({ sessionId }: { sessionId: number }) {
    return (
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col gap-2 mb-4">
            <div className="flex justify-between text-xs text-slate-400">
                <span>ค่าเครื่องดื่ม & อาหาร</span>
                <span className="font-bold text-slate-200">999 บาท</span>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
                <span>
                    ค่าชั่วโมงบอร์ดเกม ({9999} คน x 50.-)
                </span>
                <span className="font-bold text-slate-200">999 บาท</span>
            </div>
            <div className="border-t border-slate-800 my-1 pt-2 flex justify-between text-sm font-extrabold text-white">
                <span>ยอดรวม</span>
                <span className="text-amber-400">
                    {9999} บาท
                </span>
            </div>
        </div>
    )
}
