import { useEffect, useState } from "react";
import { getOrderBySessionId, getCustomerNumBySessionId } from '../../api/fetchdata'
import { useCartContext } from "../../hook/use-cart-context";

interface OrderItem {
    product_name: string;
    category: string;
    quantity: number;
    unit_price: number;
}

interface Bill {
    customer_count: number;
    play_price: number;
    order_list: string[];
    order_price: number;
    total_price: number;
}

export function OrderDetailModeList() {

    const [orderDetail, setOrderDetail] = useState<OrderItem[]>([]);

    const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
    const [selectedCustomers, setSelectedCustomers] = useState<number[]>([]);

    const [billedOrders, setBilledOrders] = useState<number[]>([]);
    const [billedCustomers, setBilledCustomers] = useState<number[]>([]);

    const [customerCount, setCustomerCount] = useState<number>(1);
    const [playPrice, setPlayPrice] = useState<number>(0);

    const [bill, setBill] = useState<Bill | null>(null);
    const [totalBill, setTotalBill] = useState<Bill[]>([]);

    const { currentSessionId } = useCartContext();

    // 1. useEffect ตัวที่ 1: ยิง API ครั้งเดียวเมื่อเปลี่ยน Session (ไม่เกี่ยวกับ checkbox)
    useEffect(() => {
        const fetchSessionData = async () => {
            if (!currentSessionId) return;

            try {
                const [orderRes, customerRes] = await Promise.all([
                    getOrderBySessionId(currentSessionId).catch(() => ({ data: [] })),
                    getCustomerNumBySessionId(currentSessionId).catch(() => ({ data: [] }))
                ]);

                const orders: OrderItem[] = orderRes?.data || [];
                const expandedOrders = orders.flatMap((item: OrderItem) =>
                    Array.from({ length: item.quantity }, () => ({
                        ...item,
                        quantity: 1,
                        unit_price: Number(item.unit_price)
                    }))
                );

                setOrderDetail(expandedOrders);

                const customerData = customerRes?.data?.[0];
                if (customerData) {
                    const count = customerData.customer_count ?? 1;
                    setCustomerCount(count);

                    const basePlayPrice = Number(customerData.play_price ?? 0);
                    const rawStartTime = customerData.start_time;
                    const startTime = rawStartTime ? new Date(rawStartTime).getTime() : 0;
                    const duration = Math.max(0, Date.now() - startTime);

                    const seconds = Math.floor(duration / 1000);
                    const minutes = Math.floor(seconds / 60);
                    const hours = Math.floor(minutes / 60);

                    let playTime = hours;
                    if (minutes % 60 > 15) playTime += 1;
                    if (duration > 0 && playTime === 0) playTime = 1;

                    setPlayPrice(basePlayPrice * playTime)
                }

            } catch (error) {
                console.error('Error fetching session data:', error);
            }
        };

        fetchSessionData();
    }, [currentSessionId]);

    // 2. useEffect ตัวที่ 2: คำนวณบิลใหม่ทันทีเฉพาะเวลาติ๊กเลือก (ไม่ต้องยิง API)
    useEffect(() => {
        if (selectedCustomers.length === 0 && selectedOrders.length === 0) {
            setBill(null);
            return;
        }

        const totalPlayPrice = selectedCustomers.length * playPrice;
        const selectedItems = selectedOrders.map((index) => orderDetail[index]).filter(Boolean);
        const orderList = selectedItems.map((item) => item.product_name);
        const orderPrice = selectedItems.reduce((sum, item) => sum + (item.unit_price || 0), 0);

        setBill({
            customer_count: selectedCustomers.length,
            play_price: totalPlayPrice,
            order_list: orderList,
            order_price: orderPrice,
            total_price: totalPlayPrice + orderPrice
        });
    }, [selectedCustomers, selectedOrders, playPrice, orderDetail]);

    // 3. สำหรับดู log 
    useEffect(() => {
        console.log("totalBill อัปเดตจริงแล้ว :", totalBill);
    }, [totalBill]);

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

    const handleClickCreateBill = () => {
        if (!bill) return;

        setTotalBill((prev) => [...prev, bill]);

        setBilledCustomers((prev) => [...prev, ...selectedCustomers]);
        setBilledOrders((prev) => [...prev, ...selectedOrders]);

        setSelectedCustomers([]);
        setSelectedOrders([]);
    }

    return (
        <div id="bill-container" className="flex flex-col gap-4">
            <div id="customer-container" className="flex flex-col gap-2 p-2 ">
                {Array.from({ length: customerCount }).map((_, i) => {
                    const customerId = i + 1;
                    const isChecked = selectedCustomers.includes(customerId);
                    const isBilled = billedCustomers.includes(customerId);

                    return (
                        <label
                            key={i}
                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${isBilled
                                ? "border-amber-500 bg-amber-950/30 text-amber-300 font-medium"
                                : isChecked
                                    ? "border-emerald-500 bg-emerald-950/30 text-emerald-300 font-medium"
                                    : "border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800/50"
                                }`}
                        >
                            <input
                                type="checkbox"
                                checked={isChecked}
                                disabled={isBilled}
                                onChange={() => handleToggleSelectCustomer(customerId)}
                                className={`w-5 h-5 accent-green-600 rounded cursor-pointer `}
                            />
                            <span>ลูกค้าคนที่ {customerId} </span>
                            <div className="flex-1 border-b border-dotted border-slate-700 h-full mx-1"></div>
                            <span>{playPrice} </span>
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
                            const isBilled = billedOrders.includes(index);

                            return (
                                <div
                                    key={index}
                                    onClick={() => handleToggleSelectOrder(index)}
                                    className="flex items-center gap-2 text-slate-300 cursor-pointer py-1"
                                >
                                    <div className={`w-4 h-4 rounded-full border shrink-0 transition-colors ${isBilled
                                        ? "bg-amber-500 border-amber-500" // ออกบิลแล้ว = เหลือง
                                        : isSelected
                                            ? "bg-emerald-500 border-emerald-500" // เลือกอยู่ = เขียว
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
            </div>

            <button
                type="button"
                onClick={handleClickCreateBill}
                disabled={!bill}
                className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-slate-950 font-bold py-3.5 rounded-xl text-center text-sm shadow-lg transition-colors flex items-center justify-center gap-2"
            >
                🧾 สร้างบิล QR Code
            </button>
        </div>
    )
}