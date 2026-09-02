import { useState, useEffect } from "react";
import type { Table, SidebarMode } from '../../../../share/details'
import { SideBar } from "../../components/SideBar";
import { getMenus, getTables, createSessions, closedSession } from "../../api/fetchdata"
import { useCartContext } from "../../hook/use-cart-context";

export function HomePage() {
    const [tables, setTables] = useState<Table[]>([]);
    const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
    const [tempCustomerCount, setTempCustomerCount] = useState<number>(1);
    const [openSideBar, setOpenSideBar] = useState(false);
    const [sidebarMode, setSidebarMode] = useState<SidebarMode>(null);

    const selectedTable = tables.find(t => t.table_id === selectedTableId) || null;

    const { updateMenus, updateSessionId, currentSessionId } = useCartContext()

    useEffect(() => {
        handleGetTables();
    }, []);


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
        setSidebarMode(null);
        setOpenSideBar(false);
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
                const newSessionId = res.response.data.newSession.session_id;
                const startTime = getCurrentTimeString();

                updateSessionId(newSessionId)

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

    const handleCloseSession = async () => {
        if (!currentSessionId || !selectedTableId) return;

        console.log("selectedTableId : ", selectedTableId)
        console.log("currentSessionId : ", currentSessionId)
        console.log("selectedTable : ", selectedTable)

        try {
            const res = await closedSession(currentSessionId)
            if (res.success && res.response?.status === "success") {
                setTables(prev => prev.map(t => {
                    if (t.table_id === selectedTableId) {
                        return {
                            ...t,
                            status: "available",
                            startTime: null,
                            customerCount: 0,
                            sessionId: null
                        };
                    }
                    return t;
                }));

                updateSessionId(null);
                setTempCustomerCount(1);
                setSelectedTableId(null);

                console.log("ปิดเซสชันสำเร็จ:", res.response.message);
            }

        } catch (error) {
            console.error("Error in handleCloseSession:", error);
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
                                    onClick={() => {
                                        setSelectedTableId(table.table_id);
                                        if (table.status === "occupied") {
                                            updateSessionId(table.sessionId ? table.sessionId : 0);
                                            // console.log("sessionId : ", table.sessionId);
                                            // console.log(" currentSessionId : ", currentSessionId);
                                        }
                                    }}
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
                        <div className="flex-1 flex flex-col h-full">
                            {/* หัวข้อรายละเอียดโต๊ะ */}
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

                            {selectedTable.status === "occupied" ? (
                                <div className="flex-1 flex flex-col justify-between">
                                    {/* เมนูปุ่มกดส่วนบน */}
                                    <div className="flex flex-col gap-3">
                                        <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 flex flex-col items-center">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">เวลาเริ่มเปิดโต๊ะ</label>
                                            <div className="flex items-center gap-4">
                                                <span className="text-xl font-mono font-bold text-amber-400 text-center">
                                                    {selectedTable.startTime || "-"}
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleOpenSidebar('customer')}
                                            className="w-full py-3 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-all uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10"
                                        >
                                            👥 เพิ่ม-ลด จำนวนลูกค้า
                                        </button>
                                        <button
                                            onClick={() => {
                                                handleGetMenus();
                                                handleOpenSidebar('Food');
                                            }}
                                            className="w-full py-3 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-all uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10"
                                        >
                                            🍔 เปิดเมนูสั่งอาหาร
                                        </button>
                                        <button
                                            onClick={() => {
                                                handleGetMenus();
                                                handleOpenSidebar('Drink')
                                            }}
                                            className="w-full py-3 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-all uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10"
                                        >
                                            🥤 สั่งเครื่องดื่ม
                                        </button>
                                    </div>

                                    {/* ส่วนสรุปค่าใช้จ่ายและปุ่มปิดโต๊ะ ดันลงล่างสุดด้วย mt-auto */}
                                    <div className="mt-auto pt-6">
                                        <div className="flex flex-col gap-2">
                                            <button
                                                onClick={() => handleOpenSidebar('Order')}
                                                className="w-full bg-gradient-to-r from-emerald-500 to-yellow-500 hover:from-emerald-700 hover:to-yellow-700 disabled:from-slate-800 disabled:to-slate-800 text-slate-950 font-bold py-3.5 rounded-2xl text-center flex justify-center items-center gap-2 transition-all shadow-lg shadow-emerald-500/10 text-sm"
                                            >
                                                🧾 ดูรายการทั้งหมด & เช็คบิล
                                            </button>

                                            <button
                                                onClick={handleCloseSession}
                                                className="w-full py-2 rounded-xl text-[14px] font-bold bg-transition hover:bg-rose-700 text-white border border-rose-500/20 transition-all uppercase tracking-wider"
                                            >
                                                ❌ ปิดโต๊ะ / ยกเลิกโต๊ะ
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={handleOpenSession}
                                    className="w-full py-3 rounded-xl text-xs font-bold my-auto bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all uppercase tracking-wider"
                                >
                                    ➕ เปิดโต๊ะ
                                </button>
                            )}
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
                isOpen={openSideBar}
                mode={sidebarMode}
                onClose={handleCloseSidebar}
            />
        </div>
    )
}