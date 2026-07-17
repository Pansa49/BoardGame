import { useState } from "react";

export function Header() {
    const [activeTab, setActiveTab] = useState<"tables" | "customers">("tables");

    return (
        <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur px-8 py-4 flex justify-between items-center sticky top-0 z-10">
            <div className="flex items-center gap-3">
                <span className="text-3xl">🎲</span>
                <div>
                    <h1 className="text-xl font-bold tracking-wider text-amber-400 uppercase">Dice & Drinks</h1>
                    <p className="text-xs text-slate-400">บอร์ดเกมคาเฟ่ แดชบอร์ดจัดการร้าน</p>
                </div>
            </div>

            <div className="flex gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                <button
                    onClick={() => setActiveTab("tables")}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "tables" ? "bg-amber-500 text-slate-950 shadow-lg" : "text-slate-400 hover:text-white"}`}
                >
                    🗺️ แผนผังโต๊ะ & สั่งอาหาร
                </button>
                <button
                    onClick={() => setActiveTab("customers")}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "customers" ? "bg-amber-500 text-slate-950 shadow-lg" : "text-slate-400 hover:text-white"}`}
                >
                    👥 ฐานข้อมูลลูกค้า
                </button>
            </div>
        </header>
    )
}