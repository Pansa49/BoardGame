import { useState, useEffect } from "react";
import type { Table, SidebarMode } from '../../../../share/details'
import { SideBar } from "../../components/SideBar";
import { getMenus, getTables, createSessions, closedSession } from "../../api/fetchdata"
import { useCartContext } from "../../hook/use-cart-context";

const HOURLY_RATE_PER_PERSON = 50;

export function HomePage() {
    const [tables, setTables] = useState<Table[]>([]);
    const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
    const [tempCustomerCount, setTempCustomerCount] = useState<number>(1);
    const [openSideBar, setOpenSideBar] = useState(false);
    const [sidebarMode, setSidebarMode] = useState<SidebarMode>(null);
    const [currentSessionId, setCurrentSessionId] = useState<number>(0);

    const selectedTable = tables.find(t => t.table_id === selectedTableId) || null;

    const { updateMenus } = useCartContext()

    useEffect(() => {
        handleGetTables();
    }, []);

    const calculateTimePlayTotal = () => {
        if (!selectedTable || selectedTable.status === "available") return 0;
        const ppl = selectedTable.customerCount || 0;
        return ppl * HOURLY_RATE_PER_PERSON;
    };

    const getCurrentTimeString = () => {
        const currentTimeString = new Date().toLocaleTimeString('th-TH', {
            hour: '2-digit',
            minute: '2-digit'
        });

        return currentTimeString; // ผลลัพธ์จะได้เช่น "14:30"
    };

    const handleOpenSidebar = (mode: SidebarMode) => {
        setSidebarMode(mode);
        setOpenSideBar(true);
    };

    const handleCloseSidebar = () => {
        setOpenSideBar(false);
        setSidebarMode(null);
    };

    const handleGetMenus = async () => {
        try {
            const res = await getMenus();
            const menu = res.data;
            updateMenus(menu);

        } catch (error) {
            console.log("get menus error or something error")
        }
    }

    const handleGetTables = async () => {
        try {
            const res = await getTables();
            const tables = res.data;

            setTables(tables);
            // updatedTables(tables);

            if (tables.length > 0 && !selectedTableId) {
                setSelectedTableId(tables[0].table_id);
            }
        } catch (error) {
            console.log("get tables error or something error")
        }
    }

    const handleOpenSession = async () => {
        if (!selectedTableId) return;

        const customerCount = tempCustomerCount || 1; //default =1

        try {
            const res = await createSessions(selectedTableId, customerCount)

            if (res.success && res.response) {
                const newSessionId = res.response.session_id;
                const startTime = getCurrentTimeString();

                setCurrentSessionId(res.response.data.newSession.session_id)

                setTables(prev => prev.map(t => {
                    if (t.table_id === selectedTableId) {
                        return {
                            ...t,
                            status: "occupied",
                            startTime: startTime,
                            customerCount: customerCount,
                            sessionId: newSessionId
                        };
                    }
                    return t;
                }));
                setTempCustomerCount(1);
                console.log(res.response.message)
            } else {
                console.error("Failed to create session:", res.error);
                alert("ไม่สามารถเปิดโต๊ะได้ กรุณาลองใหม่อีกครั้ง");
            }

        } catch (error) {
            console.error("Error in handleOpenTable:", error);
        }
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col overflow-x-hidden">

            {/* --- MAIN CONTENT --- */}
            <main className="flex-1 flex flex-col lg:flex-row p-6 gap-6 w-full mx-auto">

                {/* --- ฝั่งซ้าย --- */}
                <section className="flex-1 bg-slate-900/40 border border-slate-800 rounded-3xl p-6 flex flex-col">
                    <div className="flex-1 flex flex-col">

                        {/*-- หัวข้อ --*/}
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-extrabold text-white">ผังโต๊ะของร้าน</h2>
                                <p className="text-sm text-slate-400">เลือกโต๊ะที่ต้องการ เพื่อดำเนินการด้านขวา</p>
                            </div>
                            <div className="flex gap-4 text-xs font-semibold">
                                <span className="flex items-center gap-1.5">
                                    <span className="w-3.5 h-3.5 bg-emerald-500 rounded-full inline-block border border-emerald-400/50"></span>
                                    โต๊ะว่าง</span>
                                <span className="flex items-center gap-1.5">
                                    <span className="w-3.5 h-3.5 bg-rose-500 rounded-full inline-block border border-rose-400/50"></span>
                                    มีลูกค้าเล่นอยู่</span>
                            </div>
                        </div>

                        {/*-- โต๊ะทั้งหมด --*/}
                        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 overflow-y-auto max-h-[60vh] pr-2">
                            {tables.map((table) => (

                                <button
                                    key={table.table_id}
                                    onClick={() => setSelectedTableId(table.table_id)}
                                    className={`relative rounded-2xl border-2 p-5 flex flex-col items-center justify-between aspect-square transition-all duration-300
        hover:border-yellow-400 hover:shadow-lg hover:shadow-yellow-400/20
        ${selectedTableId === table.table_id ? 'ring-4 ring-amber-500/40 border-amber-400' : 'border-slate-800'}
        ${table.status === "occupied"
                                            ? "bg-gradient-to-br from-rose-950/80 to-rose-900/40"
                                            : "bg-gradient-to-br from-slate-900 to-slate-800/50"
                                        }`}
                                >
                                    <div className="flex justify-between w-full">
                                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-950/80 text-slate-300 border border-slate-800">
                                            T-{table.table_number}
                                        </span>
                                        <span className={`w-3.5 h-3.5 rounded-full border ${table.status === "occupied" ? "bg-rose-500 border-rose-400" : "bg-emerald-500 border-emerald-400"}`}></span>
                                    </div>

                                    <div className="text-center my-auto">
                                        <div className="text-5xl mb-1">
                                            {table.status === "occupied" ? "🎲" : "🛋️"}
                                        </div>
                                        <p className="text-sm font-bold text-slate-200">โต๊ะ {table.table_number}</p>
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
                                        <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 flex flex-col items-center">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">เวลาเริ่มเปิดโต๊ะ</label>
                                            <div className="flex items-center gap-4">

                                                <span className="text-xl font-mono font-bold text-amber-400 text-center">
                                                    {selectedTable.startTime || "-"}
                                                </span>

                                                <span className="text-xl font-mono font-bold text-amber-400 text-center">
                                                    asdasd
                                                </span>

                                            </div>
                                        </div>

                                        {/* ปุ่มสั่งอาหารแบบ Drawer สไลด์ (แสดงเมื่อจองแล้วเท่านั้น) */}
                                        <button
                                            onClick={() => {
                                                handleOpenSidebar('customer')
                                            }}
                                            className="w-full py-3 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-all uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10"
                                        >
                                            👥 เพิ่ม-ลด จำนวนลูกค้า
                                        </button>
                                        <button
                                            onClick={() => {
                                                handleGetMenus()
                                                handleOpenSidebar('Food')
                                            }}
                                            className="w-full py-3 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-all uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10"
                                        >
                                            🍔 เปิดเมนูสั่งอาหาร
                                        </button>
                                        <button
                                            onClick={() => {
                                                handleOpenSidebar('Drink')
                                            }}
                                            className="w-full py-3 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-all uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10"
                                        >
                                            🥤 สั่งเครื่องดื่ม
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => {
                                            handleOpenSession();
                                        }}
                                        className="w-full py-3 rounded-xl text-xs font-bold mb-6 bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all uppercase tracking-wider"
                                    >
                                        ➕ เปิดโต๊ะจองใหม่ (ระบุจำนวนคน)
                                    </button>
                                )}
                            </div>

                            <div>
                                {/* รายการสรุปค่าใช้จ่าย */}
                                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col gap-2 mb-4">
                                    <div className="flex justify-between text-xs text-slate-400">
                                        <span>ค่าเครื่องดื่ม & อาหาร</span>
                                        <span className="font-bold text-slate-200">{"calculateFoodTotal()"} บาท</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-slate-400">
                                        <span>
                                            ค่าชั่วโมงบอร์ดเกม ({selectedTable.customerCount || 0} คน x 50.-)
                                        </span>
                                        <span className="font-bold text-slate-200">{calculateTimePlayTotal()} บาท</span>
                                    </div>
                                    <div className="border-t border-slate-800 my-1 pt-2 flex justify-between text-sm font-extrabold text-white">
                                        <span>ยอดรวมค่าโต๊ะทั้งหมด</span>
                                        <span className="text-amber-400">
                                            {"calculateFoodTotal()" + calculateTimePlayTotal()} บาท
                                        </span>
                                    </div>
                                </div>

                                {/* ปุ่มเคลียร์โต๊ะ / เช็คบิล */}
                                <div className="flex flex-col gap-2">
                                    <button
                                        disabled={selectedTable.status === "available"}
                                        onClick={() => {
                                            //handleClearTable(selectedTable.table_id)
                                        }}
                                        className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 disabled:from-slate-800 disabled:to-slate-800 text-slate-950 font-bold py-3.5 rounded-2xl text-center flex justify-center items-center gap-2 transition-all shadow-lg shadow-amber-500/10 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                    >
                                        🧾 เช็คบิลอาหาร & ปิดโต๊ะ
                                    </button>
                                    {selectedTable.status === "occupied" && (
                                        <button
                                            onClick={() => {
                                                //handleClearTable(selectedTable.table_id)
                                            }}
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

            <SideBar
                sessionId={currentSessionId}
                isOpen={openSideBar}
                mode={sidebarMode}
                onClose={handleCloseSidebar}
            />
        </div>
    )
}