import { useEffect, useState } from "react";
import { getOrderBySessionId, getCustomerNumBySessionId } from '../../api/fetchdata'
import { useCartContext } from "../../hook/use-cart-context";

interface OrderItem {
    product_name: string;
    category: string;
    quantity: number;
    unit_price: number;
}

export function OrderDetailModeList() {

    const [orderDetail, setOrderDetail] = useState<OrderItem[]>([]);
    const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
    const [selectedCustomers, setSelectedCustomers] = useState<number[]>([]);
    const [customerCount, setCustomerCount] = useState<number>(1); // 🟢 เพิ่มใหม่: จำนวนลูกค้า (เริ่มต้นที่ 1 คน)
    const { currentSessionId } = useCartContext();

    useEffect(() => {
        const fetchSessionData = async () => {
            if (!currentSessionId) return;

            try {
                // ยิง API พร้อมกัน 2 ตัว
                const [orderRes, customerRes] = await Promise.all([
                    getOrderBySessionId(currentSessionId),
                    getCustomerNumBySessionId(currentSessionId)
                ]);

                const count = customerRes.data?.[0]?.customer_count ?? 1;

                setOrderDetail(orderRes.data);
                setCustomerCount(count);

                console.log(orderRes.data);
                console.log(count)
            } catch (error) {
                console.error('Error fetching session data:', error);
            }
        };

        fetchSessionData();
    }, [currentSessionId]);

    const handleToggleSelectOrder = (index: number) => {
        setSelectedOrders((prev) =>
            prev.includes(index)
                ? prev.filter((i) => i !== index)
                : [...prev, index]
        );
    };

    const handleToggleSelectCustomer = (id: number) => {
        setSelectedCustomers((prev) =>
            prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id]
        );
    };

    const calTotalPrice = () => {
        let total = 0;
        orderDetail.forEach((item) => {
            const price = item.unit_price || 0;
            total += price * item.quantity;
        });

        return total;
    }

    const calSelectedTotalPrice = () => {
        return selectedOrders.reduce((total, index) => {
            const item = orderDetail[index];
            return total + (item ? (item.unit_price || 0) * item.quantity : 0);
        }, 0);
    };

    // 🟢 เพิ่มใหม่: คำนวณยอดหารต่อคน (ถ้ามีการเลือกรายการจะใช้อยอดรายการที่เลือก ถ้าไม่มีจะใช้อยอดรวมทั้งหมด)
    const activeTotal = selectedOrders.length > 0 ? calSelectedTotalPrice() : calTotalPrice();

    // 🟢 คำนวณจำนวนคนที่หาร (เลือกรายคน หรือ จำนวนคนทั้งหมด)
    const activeCustomerCount = selectedCustomers.length > 0 ? selectedCustomers.length : customerCount;

    // 🟢 คำนวณยอดที่ต้องจ่ายต่อคน
    const pricePerPerson = activeCustomerCount > 0 ? (activeTotal / activeCustomerCount).toFixed(2) : "0.00";

    return (
        <div id="bill-container" className="flex flex-col gap-4">
            <div id="customer-container" className="flex flex-col gap-2 p-2 ">
                {Array.from({ length: customerCount }).map((_, i) => {
                    const customerId = i + 1;
                    const isChecked = selectedCustomers.includes(customerId);

                    return (
                        <label
                            key={i}
                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${isChecked
                                ? "border-emerald-500 bg-emerald-950/30 text-emerald-300 font-medium"
                                : "border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800/50"
                                }`}
                        >
                            <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleSelectCustomer(customerId)}
                                className="w-5 h-5 accent-green-600 rounded cursor-pointer"
                            />
                            <span>ลูกค้าคนที่ {customerId}</span>
                        </label>
                    );
                })}
            </div>

            <div id="order-container"
                className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col gap-2 mb-4">
                <div className="flex flex-col justify-between text-xs text-slate-400">
                    <div className="flex flex-col gap-1 text-xs">

                        {orderDetail.map((item, index) => {

                            const isSelected = selectedOrders.includes(index);
                            return (
                                <div
                                    key={index}
                                    onClick={() => handleToggleSelectOrder(index)}
                                    className="flex items-center gap-2 text-slate-300 cursor-pointer py-1"
                                >
                                    <div className={`w-4 h-4 rounded-full border shrink-0 transition-colors ${isSelected
                                        ? "bg-emerald-500 border-emerald-500"
                                        : "border-slate-600 bg-slate-900"
                                        }`} />

                                    <span className="font-medium text-slate-200">
                                        {item.product_name}
                                    </span>
                                    <span className="text-emerald-500 text-[15px]">
                                        x{item.quantity}
                                    </span>

                                    {/* เส้นจุดเชื่อม */}
                                    <div className="flex-1 border-b border-dotted border-slate-700 h-full mx-1"></div>

                                    <span className="font-mono font-semibold text-emerald-400 shrink-0">
                                        {item.unit_price * item.quantity}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="border-t border-slate-800 my-1 pt-2 flex flex-col gap-1 text-sm font-extrabold text-white">
                    {selectedOrders.length > 0 && (
                        <div className="flex justify-between text-xs text-emerald-400">
                            <span>ยอดรวมที่เลือก ({selectedOrders.length} รายการ)</span>
                            <span>{calSelectedTotalPrice()} บาท</span>
                        </div>
                    )}

                    <div className="flex justify-between">
                        <span>ยอดรวมทั้งหมด</span>
                        <span className="text-amber-400">
                            {calTotalPrice()} บาท
                        </span>
                    </div>
                </div>
            </div>

            <div className="bg-emerald-950/40 border border-emerald-800/50 p-4 rounded-xl flex justify-between items-center text-emerald-300">
                <div>
                    <div className="text-xs text-emerald-400/80">ยอดหารต่อคน ({activeCustomerCount} คน)</div>
                    <div className="text-2xl font-bold font-mono text-emerald-400">

                        {pricePerPerson} ฿
                    </div>
                </div>
            </div>

        </div>
    )
}