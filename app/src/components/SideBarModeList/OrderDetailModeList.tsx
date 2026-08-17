import { useEffect, useState } from "react";
import { getOrderBySessionId } from '../../api/fetchdata'
import { useCartContext } from "../../hook/use-cart-context";

interface OrderItem {
    product_name: string;
    category: string;
    quantity: number;
    unit_price: number;
}

export function OrderDetailModeList() {

    const [orderDetail, setOrderDetail] = useState<OrderItem[]>([]);
    const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
    const { currentSessionId } = useCartContext();

    useEffect(() => {
        const getOrderDetails = async () => {
            try {
                if (!currentSessionId) return;
                const response = await getOrderBySessionId(currentSessionId)
                setOrderDetail(response.data);
                console.log('OrderDetail : ', response.data);
            } catch (error) {
                console.error('Error:', error);
            }
        }

        if (currentSessionId) {
            getOrderDetails();
        }
    }, [currentSessionId]);

    const handleToggleSelect = (index: number) => {
        setSelectedIndices((prev) =>
            prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
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
        return selectedIndices.reduce((total, index) => {
            const item = orderDetail[index];
            return total + (item ? (item.unit_price || 0) * item.quantity : 0);
        }, 0);
    };

    return (


        <div id="bill-container">
            <div id="order-container"
                className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col gap-2 mb-4">
                <div className="flex flex-col justify-between text-xs text-slate-400">
                    <div className="flex flex-col gap-1 text-xs">
                        {orderDetail.map((item, index) => {
                            const isSelected = selectedIndices.includes(index);

                            return (
                                <div
                                    key={index}
                                    onClick={() => handleToggleSelect(index)}
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
                    {selectedIndices.length > 0 && (
                        <div className="flex justify-between text-xs text-emerald-400">
                            <span>ยอดรวมที่เลือก ({selectedIndices.length} รายการ)</span>
                            <span>{calSelectedTotalPrice()} บาท</span>
                        </div>
                    )}

                    <div className="flex justify-between">
                        <span>ยอดรวม</span>
                        <span className="text-amber-400">
                            {calTotalPrice()} บาท
                        </span>
                    </div>
                </div>
            </div>

            <div id="customer-container">

            </div>
        </div>
    )
}