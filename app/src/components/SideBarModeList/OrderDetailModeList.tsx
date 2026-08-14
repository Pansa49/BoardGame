import { useEffect, useState } from "react";
import { getOrderBySessionId } from '../../api/fetchdata'

interface OrderItem {
    product_name: string;
    category: string;
    quantity: number;
    unit_price: number;
}

export function OrderDetailModeList({ sessionId }: { sessionId: number }) {

    const [orderDetail, setOrderDetail] = useState<OrderItem[]>([]);

    useEffect(() => {
        const getOrderDetails = async () => {
            try {
                const response = await getOrderBySessionId(sessionId)
                setOrderDetail(response.data);
                console.log('OrderDetail : ', response.data);
            } catch (error) {
                console.error('Error:', error);
            }
        }

        if (sessionId) {
            getOrderDetails();
        }
    }, []);

    const calTotalPrice = () => {
        let total = 0;
        orderDetail.forEach((item) => {
            const price = item.unit_price || 0;
            total += price * item.quantity;
        });

        return total;
    }
    return (
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col gap-2 mb-4">
            <div className="flex flex-col justify-between text-xs text-slate-400">
                <div className="flex flex-col gap-1 text-xs">
                    {orderDetail.map((item, index) => (
                        <div key={index} className="flex items-baseline gap-2 text-slate-300">
                            <span className="font-medium text-slate-200">
                                {item.product_name}
                            </span>
                            <span className="text-slate-500 text-[10px]">
                                x{item.quantity}
                            </span>

                            {/* เส้นจุดเชื่อม */}
                            <div className="flex-1 border-b border-dotted border-slate-700 h-full mx-1"></div>

                            <span className="font-mono font-semibold text-emerald-400 shrink-0">
                                {item.unit_price}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="border-t border-slate-800 my-1 pt-2 flex justify-between text-sm font-extrabold text-white">
                <span>ยอดรวม</span>
                <span className="text-amber-400">
                    {calTotalPrice()} บาท
                </span>
            </div>
        </div>
    )
}
