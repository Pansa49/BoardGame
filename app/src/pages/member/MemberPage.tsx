import type { Customer } from '../../../../share/details'




const MOCK_CUSTOMERS: Customer[] = [
    { id: "C001", name: "คุณก้อย ขาจั่ว", tier: "Gold", favoriteGame: "Avalon / Werewolf", points: 450, status: "เล่นอยู่" },
    { id: "C002", name: "คุณก้อย ขาจั่ว", tier: "Gold", favoriteGame: "Exploding Kittens", points: 210, status: "เล่นอยู่" },
    { id: "C003", name: "คุณก้อย ขาจั่ว", tier: "Gold", favoriteGame: "Catan", points: 890, status: "กลับแล้ว" },
    { id: "C004", name: "คุณก้อย ขาจั่ว", tier: "Regular", favoriteGame: "Dixit", points: 90, status: "กลับแล้ว" },
    { id: "C005", name: "คุณก้อย ขาจั่ว", tier: "Gold", favoriteGame: "Avalon / Werewolf", points: 450, status: "เล่นอยู่" },
    { id: "C006", name: "คุณก้อย ขาจั่ว", tier: "Gold", favoriteGame: "Exploding Kittens", points: 210, status: "เล่นอยู่" },
    { id: "C007", name: "คุณก้อย ขาจั่ว", tier: "Gold", favoriteGame: "Catan", points: 890, status: "กลับแล้ว" },
    { id: "C008", name: "คุณก้อย ขาจั่ว", tier: "Regular", favoriteGame: "Dixit", points: 90, status: "กลับแล้ว" },
    { id: "C009", name: "คุณก้อย ขาจั่ว", tier: "Gold", favoriteGame: "Avalon / Werewolf", points: 450, status: "เล่นอยู่" },
    { id: "C010", name: "คุณก้อย ขาจั่ว", tier: "Gold", favoriteGame: "Exploding Kittens", points: 210, status: "เล่นอยู่" },
    { id: "C011", name: "คุณก้อย ขาจั่ว", tier: "Gold", favoriteGame: "Catan", points: 890, status: "กลับแล้ว" },
    { id: "C012", name: "คุณก้อย ขาจั่ว", tier: "Regular", favoriteGame: "Dixit", points: 90, status: "กลับแล้ว" },
    { id: "C013", name: "คุณก้อย ขาจั่ว", tier: "Gold", favoriteGame: "Avalon / Werewolf", points: 450, status: "เล่นอยู่" },
    { id: "C014", name: "คุณก้อย ขาจั่ว", tier: "Gold", favoriteGame: "Exploding Kittens", points: 210, status: "เล่นอยู่" },
    { id: "C015", name: "คุณก้อย ขาจั่ว", tier: "Gold", favoriteGame: "Catan", points: 890, status: "กลับแล้ว" },
    { id: "C016", name: "คุณก้อย ขาจั่ว", tier: "Regular", favoriteGame: "Dixit", points: 90, status: "กลับแล้ว" },
];

export function MemberPage() {
    return (
        <div className="flex-1 flex flex-col">
            <div className="mb-6">
                <h2 className="text-2xl font-extrabold text-white">รายชื่อลูกค้า & สมาชิก</h2>
                <p className="text-sm text-slate-400">ประวัติและแต้มสะสมของลูกค้าสำหรับสิทธิ์โปรโมชั่น</p>
            </div>

            <div className="flex-1 border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/60">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                            <th className="p-4">รหัสสมาชิก</th>
                            <th className="p-4">ชื่อสมาชิก</th>
                            <th className="p-4">ระดับ (Tier)</th>
                            <th className="p-4">บอร์ดเกมโปรด</th>
                            <th className="p-4">แต้มสะสม</th>
                            <th className="p-4 text-center">สถานะ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50 text-sm">
                        {MOCK_CUSTOMERS.map((customer) => (
                            <tr key={customer.id} className="hover:bg-slate-900/30 transition-colors">
                                <td className="p-4 font-mono text-slate-400">{customer.id}</td>
                                <td className="p-4 font-bold text-white">{customer.name}</td>
                                <td className="p-4">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold
                                                        ${customer.tier === "Gold" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : ""}
                                                        ${customer.tier === "Gold" ? "bg-slate-300/10 text-slate-300 border border-slate-300/20" : ""}
                                                        ${customer.tier === "Regular" ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" : ""}
                                                    `}>
                                        👑 {customer.tier}
                                    </span>
                                </td>
                                <td className="p-4 text-slate-300 italic">{customer.favoriteGame}</td>
                                <td className="p-4 font-bold text-amber-400">{customer.points} pt</td>
                                <td className="p-4 text-center">
                                    <span className={`px-2 py-0.5 rounded text-xs font-semibold
                                                        ${customer.status === "เล่นอยู่" ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-400"}
                                                    `}>
                                        {customer.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}