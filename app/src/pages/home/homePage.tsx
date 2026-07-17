import { useState } from "react";
import type { Table, FoodItem, Customer } from '../../../../share/details'

const FOOD_MENU: FoodItem[] = [
    { id: "f1", name: "เฟรนช์ฟรายส์ร้อนๆ", price: 89, emoji: "🍟" },
    { id: "f2", name: "นักเก็ตไก่ซอสบาร์บีคิว", price: 99, emoji: "🍗" },
    { id: "f3", name: "โค้กเย็นเจี๊ยบ", price: 29, emoji: "🥤" },
    { id: "f4", name: "ชาเขียวมัทฉะลาเต้", price: 65, emoji: "🍵" },
    { id: "f5", name: "ป๊อปคอร์นชีส", price: 59, emoji: "🍿" },
];

const MOCK_CUSTOMERS: Customer[] = [
    { id: "C001", name: "คุณสมชาย สายบลัฟ", tier: "Gold", favoriteGame: "Avalon / Werewolf", points: 450, status: "เล่นอยู่" },
    { id: "C002", name: "คุณก้อย ขาจั่ว", tier: "Silver", favoriteGame: "Exploding Kittens", points: 210, status: "เล่นอยู่" },
    { id: "C003", name: "คุณแบงค์ นักวางแผน", tier: "Gold", favoriteGame: "Catan", points: 890, status: "กลับแล้ว" },
    { id: "C004", name: "คุณหวาน มินิมอล", tier: "Regular", favoriteGame: "Dixit", points: 90, status: "กลับแล้ว" },
];

const HOURLY_RATE_PER_PERSON = 50;

export function HomePage() {
    const [activeTab, setActiveTab] = useState<"tables" | "customers">("tables");
    const [tables, setTables] = useState<Table[]>([
        { id: 1, name: "1", status: "occupied", startTime: "12:30", customerCount: 4 },
        { id: 2, name: "2", status: "available" },
        { id: 3, name: "3", status: "occupied", startTime: "14:15", customerCount: 2 },
        { id: 4, name: "4", status: "available" },
        { id: 5, name: "5", status: "available" },
        { id: 6, name: "6", status: "available" },
        { id: 7, name: "7", status: "available" },
        { id: 8, name: "8", status: "available" },
    ]);
    const [selectedTableId, setSelectedTableId] = useState<number | null>(1);

    const [isBookingDrawerOpen, setIsBookingDrawerOpen] = useState(false);
    const [isMenuDrawerOpen, setIsMenuDrawerOpen] = useState(false); // แถบสไลด์เมนูอาหาร
    const [tempCustomerCount, setTempCustomerCount] = useState<number>(1);

    const [orders, setOrders] = useState<Record<number, Record<string, number>>>({
        1: { "f1": 1, "f3": 4 },
        3: { "f2": 2, "f4": 1 },
    });

    const selectedTable = tables.find(t => t.id === selectedTableId) || null;
    const currentTableOrders = selectedTableId ? (orders[selectedTableId] || {}) : {};

    const handleOpenBookingDrawer = () => {
        setTempCustomerCount(1);
        setIsBookingDrawerOpen(true);
    };

    const handleConfirmBooking = () => {
        if (!selectedTableId) return;
        setTables(prev => prev.map(t => {
            if (t.id === selectedTableId) {
                return {
                    ...t,
                    status: "occupied",
                    startTime: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
                    customerCount: tempCustomerCount
                };
            }
            return t;
        }));
        setIsBookingDrawerOpen(false);
    };

    const handleUpdateCustomerCount = (count: number) => {
        if (!selectedTableId) return;
        setTables(prev => prev.map(t => {
            if (t.id === selectedTableId) {
                return { ...t, customerCount: count };
            }
            return t;
        }));
    };

    const handleClearTable = (tableId: number) => {
        setTables(prev => prev.map(t => {
            if (t.id === tableId) {
                return { ...t, status: "available", startTime: undefined, customerCount: undefined };
            }
            return t;
        }));
        setOrders(prev => {
            const newOrders = { ...prev };
            delete newOrders[tableId];
            return newOrders;
        });
    };

    const handleAddFood = (foodId: string) => {
        if (!selectedTableId) return;
        setOrders(prev => {
            const tableOrder = prev[selectedTableId] || {};
            return {
                ...prev,
                [selectedTableId]: {
                    ...tableOrder,
                    [foodId]: (tableOrder[foodId] || 0) + 1
                }
            };
        });
    };

    const handleRemoveFood = (foodId: string) => {
        if (!selectedTableId) return;
        setOrders(prev => {
            const tableOrder = prev[selectedTableId] || {};
            const newQty = (tableOrder[foodId] || 0) - 1;
            const updatedTableOrder = { ...tableOrder };

            if (newQty <= 0) {
                delete updatedTableOrder[foodId];
            } else {
                updatedTableOrder[foodId] = newQty;
            }

            return { ...prev, [selectedTableId]: updatedTableOrder };
        });
    };

    const calculateFoodTotal = () => {
        return Object.entries(currentTableOrders).reduce((sum, [foodId, qty]) => {
            const food = FOOD_MENU.find(f => f.id === foodId);
            return sum + (food ? food.price * qty : 0);
        }, 0);
    };

    const calculateTimePlayTotal = () => {
        if (!selectedTable || selectedTable.status === "available") return 0;
        const ppl = selectedTable.customerCount || 0;
        return ppl * HOURLY_RATE_PER_PERSON;
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col overflow-x-hidden">

            {/* --- MAIN CONTENT --- */}
            <main className="flex-1 flex flex-col lg:flex-row p-6 gap-6 w-full mx-auto">

                {/* --- ฝั่งซ้าย --- */}
                <section className="flex-1 bg-slate-900/40 border border-slate-800 rounded-3xl p-6 flex flex-col">
                    {activeTab === "tables" ? (
                        <div className="flex-1 flex flex-col">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-2xl font-extrabold text-white">ผังโต๊ะของร้าน</h2>
                                    <p className="text-sm text-slate-400">เลือกโต๊ะที่ต้องการ เพื่อดำเนินการด้านขวา</p>
                                </div>
                                <div className="flex gap-4 text-xs font-semibold">
                                    <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 bg-emerald-500 rounded-full inline-block border border-emerald-400/50"></span> โต๊ะว่าง</span>
                                    <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 bg-rose-500 rounded-full inline-block border border-rose-400/50"></span> มีลูกค้าเล่นอยู่</span>
                                </div>
                            </div>

                            <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 overflow-y-auto max-h-[60vh] pr-2">
                                {tables.map((table) => (
                                    <button
                                        key={table.id}
                                        onClick={() => setSelectedTableId(table.id)}
                                        className={`relative rounded-2xl border-2 p-5 flex flex-col items-center justify-between aspect-square transition-all duration-300
                                            ${selectedTableId === table.id ? 'ring-4 ring-amber-500/40 border-amber-400' : 'border-slate-800'}
                                            ${table.status === "occupied"
                                                ? "bg-gradient-to-br from-rose-950/80 to-rose-900/40 hover:from-rose-900"
                                                : "bg-gradient-to-br from-slate-900 to-slate-800/50 hover:from-slate-800"
                                            }`}
                                    >
                                        <div className="flex justify-between w-full">
                                            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-950/80 text-slate-300 border border-slate-800">
                                                T-{table.name}
                                            </span>
                                            <span className={`w-3.5 h-3.5 rounded-full border ${table.status === "occupied" ? "bg-rose-500 border-rose-400" : "bg-emerald-500 border-emerald-400"}`}></span>
                                        </div>

                                        <div className="text-center my-auto">
                                            <div className="text-5xl mb-1">
                                                {table.status === "occupied" ? "🎲" : "🛋️"}
                                            </div>
                                            <p className="text-sm font-bold text-slate-200">โต๊ะ {table.name}</p>
                                        </div>

                                        <div className="w-full text-center">
                                            {table.status === "occupied" ? (
                                                <div className="flex flex-col gap-1 items-center justify-center">
                                                    <span className="text-[10px] bg-slate-950 text-rose-400 px-2 py-0.5 rounded border border-rose-500/30">
                                                        ลูกค้า {table.customerCount} คน
                                                    </span>
                                                    <span className="text-[10px] text-slate-400">
                                                        เริ่มเล่น: {table.startTime} น.
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] text-emerald-400 font-medium">
                                                    ว่าง / จองได้
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
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
                                                        ${customer.tier === "Silver" ? "bg-slate-300/10 text-slate-300 border border-slate-300/20" : ""}
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
                    )}
                </section>

                {/* --- ฝั่งขวา (ควบคุมคำสั่ง รายอาหาร เช็คบิล) --- */}
                <aside className="w-full lg:w-[380px] bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-2xl">
                    {selectedTable ? (
                        <div className="flex-1 flex flex-col h-full justify-between">
                            <div>
                                <div className="border-b border-slate-800 pb-4 mb-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="text-lg font-extrabold text-white">รายละเอียด โต๊ะ {selectedTable.name}</h3>
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border 
                                            ${selectedTable.status === "occupied" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"}`}>
                                            {selectedTable.status === "occupied" ? `🔴 เล่นอยู่ (${selectedTable.customerCount} คน)` : "🟢 โต๊ะว่าง"}
                                        </span>
                                    </div>
                                    {selectedTable.status === "occupied" ? (
                                        <p className="text-xs text-slate-400">เริ่มนับชั่วโมงเล่นตั้งแต่เวลา <span className="text-rose-400 font-bold">{selectedTable.startTime} น.</span></p>
                                    ) : (
                                        <p className="text-xs text-slate-400">กรุณากดปุ่มเพื่อเปิดจองและใส่จำนวนลูกค้า</p>
                                    )}
                                </div>

                                {/* ส่วนการจอง: ปรับปุ่มให้แสดงผลตามเงื่อนไขการจอง */}
                                {selectedTable.status === "occupied" ? (
                                    <div className="flex flex-col gap-3 mb-6">
                                        {/* ปุ่มเพิ่ม/ลดคน (แสดงเมื่อจองแล้วเท่านั้น) */}
                                        <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 flex flex-col items-center">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">ปรับจำนวนคนนั่งโต๊ะ</label>
                                            <div className="flex items-center gap-4">
                                                <button
                                                    disabled={(selectedTable.customerCount || 1) <= 1}
                                                    onClick={() => handleUpdateCustomerCount((selectedTable.customerCount || 1) - 1)}
                                                    className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 transition-all disabled:opacity-30"
                                                >
                                                    ➖
                                                </button>
                                                <span className="text-xl font-mono font-bold text-amber-400 w-8 text-center">
                                                    {selectedTable.customerCount}
                                                </span>
                                                <button
                                                    onClick={() => handleUpdateCustomerCount((selectedTable.customerCount || 1) + 1)}
                                                    className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 transition-all"
                                                >
                                                    ➕
                                                </button>
                                            </div>
                                        </div>

                                        {/* ปุ่มสั่งอาหารแบบ Drawer สไลด์ (แสดงเมื่อจองแล้วเท่านั้น) */}
                                        <button
                                            onClick={() => setIsMenuDrawerOpen(true)}
                                            className="w-full py-3 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-all uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10"
                                        >
                                            🍔 เปิดเมนูสั่งอาหาร / เครื่องดื่ม
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleOpenBookingDrawer}
                                        className="w-full py-3 rounded-xl text-xs font-bold mb-6 bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all uppercase tracking-wider"
                                    >
                                        ➕ เปิดโต๊ะจองใหม่ (ระบุจำนวนคน)
                                    </button>
                                )}

                                {/* รายการออเดอร์ปัจจุบันที่สั่งไปแล้วของโต๊ะนี้ */}
                                {selectedTable.status === "occupied" && Object.keys(currentTableOrders).length > 0 && (
                                    <div className="mb-4">
                                        <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-2">📋 รายการที่สั่งแล้ว</h4>
                                        <div className="max-h-[120px] overflow-y-auto flex flex-col gap-1.5 pr-1">
                                            {Object.entries(currentTableOrders).map(([foodId, qty]) => {
                                                const food = FOOD_MENU.find(f => f.id === foodId);
                                                if (!food) return null;
                                                return (
                                                    <div key={foodId} className="flex justify-between items-center text-xs bg-slate-950/60 border border-slate-800/40 p-2 rounded-lg">
                                                        <span className="text-slate-200">{food.emoji} {food.name}</span>
                                                        <span className="font-mono text-amber-500 font-bold">x{qty}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                {/* รายการสรุปค่าใช้จ่าย */}
                                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col gap-2 mb-4">
                                    <div className="flex justify-between text-xs text-slate-400">
                                        <span>ค่าเครื่องดื่ม & อาหาร</span>
                                        <span className="font-bold text-slate-200">{calculateFoodTotal()} บาท</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-slate-400">
                                        <span>
                                            ค่าชั่วโมงบอร์ดเกม ({selectedTable.customerCount || 0} คน x 50.-)
                                        </span>
                                        <span className="font-bold text-slate-200">{calculateTimePlayTotal()} บาท</span>
                                    </div>
                                    <div className="border-t border-slate-800 my-1 pt-2 flex justify-between text-sm font-extrabold text-white">
                                        <span>ยอดรวมค่าโต๊ะทั้งหมด</span>
                                        <span className="text-amber-400">{calculateFoodTotal() + calculateTimePlayTotal()} บาท</span>
                                    </div>
                                </div>

                                {/* ปุ่มเคลียร์โต๊ะ / เช็คบิล */}
                                <div className="flex flex-col gap-2">
                                    <button
                                        disabled={selectedTable.status === "available"}
                                        onClick={() => handleClearTable(selectedTable.id)}
                                        className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 disabled:from-slate-800 disabled:to-slate-800 text-slate-950 font-bold py-3.5 rounded-2xl text-center flex justify-center items-center gap-2 transition-all shadow-lg shadow-amber-500/10 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                    >
                                        🧾 เช็คบิลอาหาร & ปิดโต๊ะ
                                    </button>
                                    {selectedTable.status === "occupied" && (
                                        <button
                                            onClick={() => handleClearTable(selectedTable.id)}
                                            className="w-full py-2 rounded-xl text-[10px] font-bold bg-transparent text-rose-400 hover:text-rose-300 border border-rose-500/20 hover:border-rose-500/40 transition-all uppercase tracking-wider"
                                        >
                                            ❌ ยกเลิกการจองโต๊ะนี้
                                        </button>
                                    )}
                                </div>
                            </div>

                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-20">
                            <span className="text-5xl mb-4">👈</span>
                            <h3 className="text-lg font-bold">ยังไม่ได้เลือกโต๊ะ</h3>
                            <p className="text-xs">กรุณากดเลือกโต๊ะทางด้านซ้ายเพื่อเปิดเมนูจัดการ</p>
                        </div>
                    )}
                </aside>
            </main>

            {/* --- SLIDE-OVER DRAWER ระบุจำนวนลูกค้า (เฉพาะตอนเปิดโต๊ะใหม่) --- */}
            {isBookingDrawerOpen && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
                        onClick={() => setIsBookingDrawerOpen(false)}
                    />

                    <div className="relative w-full max-w-md h-full bg-slate-900 border-l border-slate-800 p-6 flex flex-col justify-between shadow-2xl animate-[slideIn_0.3s_ease-out]">
                        <div>
                            <div className="flex justify-between items-center mb-8">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">👥</span>
                                    <h3 className="text-xl font-extrabold text-white">เปิดจอง โต๊ะ {selectedTable?.name}</h3>
                                </div>
                                <button
                                    onClick={() => setIsBookingDrawerOpen(false)}
                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="bg-slate-950 border border-slate-800/60 rounded-2xl p-4 mb-6">
                                <p className="text-xs text-slate-400">
                                    💰 อัตราค่าบริการรายคน: <span className="text-amber-400 font-bold">50 บาท / ชั่วโมง</span>
                                </p>
                            </div>

                            <div className="flex flex-col items-center justify-center py-8 bg-slate-950/40 border border-slate-800 rounded-2xl">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">จำนวนลูกค้าเริ่มต้น</label>
                                <div className="flex items-center gap-6">
                                    <button
                                        disabled={tempCustomerCount <= 1}
                                        onClick={() => setTempCustomerCount(p => p - 1)}
                                        className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500 text-lg font-bold text-slate-200 transition-all disabled:opacity-30 flex items-center justify-center active:scale-95"
                                    >
                                        ➖
                                    </button>
                                    <span className="text-5xl font-mono font-bold text-amber-400 w-20 text-center">
                                        {tempCustomerCount}
                                    </span>
                                    <button
                                        onClick={() => setTempCustomerCount(p => p + 1)}
                                        className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500 text-lg font-bold text-slate-200 transition-all flex items-center justify-center active:scale-95"
                                    >
                                        ➕
                                    </button>
                                </div>
                                <span className="text-xs font-bold text-slate-500 mt-2">({tempCustomerCount} คน)</span>
                            </div>
                        </div>

                        <div className="flex gap-3 border-t border-slate-800 pt-4">
                            <button
                                onClick={() => setIsBookingDrawerOpen(false)}
                                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3.5 rounded-xl text-sm transition-colors"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={handleConfirmBooking}
                                className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3.5 rounded-xl text-sm shadow-lg shadow-amber-500/20 transition-colors"
                            >
                                ยืนยันเปิดโต๊ะ
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- SLIDE-OVER DRAWER สำหรับสั่งอาหาร (เปิดจากแถบขวาเมื่อโต๊ะถูกใช้งานอยู่) --- */}
            {isMenuDrawerOpen && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
                        onClick={() => setIsMenuDrawerOpen(false)}
                    />

                    <div className="relative w-full max-w-md h-full bg-slate-900 border-l border-slate-800 p-6 flex flex-col justify-between shadow-2xl animate-[slideIn_0.3s_ease-out]">
                        <div className="flex flex-col h-full min-h-0">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">🍔</span>
                                    <h3 className="text-xl font-extrabold text-white">สั่งอาหาร โต๊ะ {selectedTable?.name}</h3>
                                </div>
                                <button
                                    onClick={() => setIsMenuDrawerOpen(false)}
                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* รายการเมนูอาหารที่มีในร้าน */}
                            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2.5 mb-4">
                                {FOOD_MENU.map((food) => {
                                    const qty = currentTableOrders[food.id] || 0;
                                    return (
                                        <div key={food.id} className="flex justify-between items-center bg-slate-950 p-3 rounded-2xl border border-slate-800/60">
                                            <div className="flex items-center gap-3">
                                                <span className="text-3xl">{food.emoji}</span>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-200">{food.name}</p>
                                                    <p className="text-xs text-amber-500">{food.price} บาท</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                                                <button
                                                    disabled={qty === 0}
                                                    onClick={() => handleRemoveFood(food.id)}
                                                    className="text-sm text-slate-400 hover:text-rose-400 disabled:opacity-30 active:scale-90 transition-transform"
                                                >
                                                    ➖
                                                </button>
                                                <span className="text-sm font-mono font-bold text-white w-5 text-center">{qty}</span>
                                                <button
                                                    onClick={() => handleAddFood(food.id)}
                                                    className="text-sm text-slate-400 hover:text-emerald-400 active:scale-90 transition-transform"
                                                >
                                                    ➕
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ส่วนสรุปราคาของออเดอร์ใน Drawer */}
                        <div className="border-t border-slate-800 pt-4 bg-slate-900">
                            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 mb-4 flex justify-between items-center">
                                <span className="text-xs text-slate-400">รวมค่าอาหารของโต๊ะนี้:</span>
                                <span className="text-lg font-bold text-amber-400">{calculateFoodTotal()} บาท</span>
                            </div>
                            <button
                                onClick={() => setIsMenuDrawerOpen(false)}
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