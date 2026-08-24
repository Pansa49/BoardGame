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
    order: string | null;
    price: number;
    total_price: number;
}

export function OrderDetailModeList() {

    const [orderDetail, setOrderDetail] = useState<OrderItem[]>([]);
    const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
    const [selectedCustomers, setSelectedCustomers] = useState<number[]>([]);
    const [customerCount, setCustomerCount] = useState<number>(1);
    const [totalPrice, setTotalPrice] = useState<number>(0);
    const [bill, setBill] = useState<Bill[]>([]);

    const { currentSessionId } = useCartContext();

    useEffect(() => {
        const fetchSessionData = async () => {
            if (!currentSessionId) return;

            try {
                // ยิง API พร้อมกัน 2 ตัว
                const [orderRes, customerRes] = await Promise.all([
                    getOrderBySessionId(currentSessionId).catch(() => ({ data: [] })),
                    getCustomerNumBySessionId(currentSessionId).catch(() => ({ data: [] }))
                ]);

                const customerData = customerRes?.data?.[0];

                if (customerData) {
                    const count = customerData.customer_count ?? 1;
                    const playPrice = Number(customerData.play_price ?? 0);
                    const startTime = customerData.start_time ?? 0;
                    const endTime = customerData.end_time ?? 0;

                    const duration = Math.max(0, endTime - startTime);
                    const total = count * playPrice * duration;

                    console.log("startTime : ", startTime)
                    console.log("endTime : ", endTime)

                    console.log("count : ", count)
                    console.log("playPrice : ", playPrice)
                    console.log("duration : ", duration)

                    console.log("total : ", total)

                    setCustomerCount(count);
                    setTotalPrice(total);
                }

                setOrderDetail(orderRes?.data || []);

            } catch (error) {
                console.error('Error fetching session data:', error);
            }
        };

        fetchSessionData();
    }, [currentSessionId]);

    useEffect(() => {
        if (selectedCustomers.length === 0) {
            setBill([]);
            return;
        }

        const activeCustomerCount = selectedCustomers.length;

        if (selectedOrders.length === 0) {
            setBill([
                {
                    customer_count: activeCustomerCount,
                    play_price: totalPrice,
                    order: null,
                    price: 0,
                    total_price: 0
                }
            ]);
            return;
        }

        const selectedItems = selectedOrders.map((index) => orderDetail[index]).filter(Boolean);

        const grandTotalSelected = selectedItems.reduce(
            (sum, item) => sum + (item.unit_price || 0) * item.quantity, 0
        );

        const calculatedBill: Bill[] = selectedItems.map((item) => ({
            customer_count: activeCustomerCount,
            play_price: totalPrice,
            order: item.product_name,
            price: (item.unit_price || 0) * item.quantity,
            total_price: grandTotalSelected
        }));

        setBill(calculatedBill);
    }, [selectedOrders, selectedCustomers, orderDetail]);

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

    const handleClickCreateBill = async () => {
        // console.log("State customer:", selectedCustomers);
        console.log("bill :", bill);
    }


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
            </div>

            <button
                type="button"
                onClick={handleClickCreateBill}
                disabled={bill.length === 0}
                className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-slate-950 font-bold py-3.5 rounded-xl text-center text-sm shadow-lg transition-colors flex items-center justify-center gap-2"
            >
                🧾 สร้างบิล QR Code
            </button>
        </div>
    )
}