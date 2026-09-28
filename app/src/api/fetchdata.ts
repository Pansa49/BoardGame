import type { OrderItemPayload, Bill } from "../../../share/details"
const local_api_url = "http://localhost:8080/boardgame";

export async function getMenus() {
    const response = await fetch(`${local_api_url}/menu`);

    if (!response.ok) {
        throw new Error(`เกิดข้อผิดพลาดในการดึงข้อมูล: ${response.status}`);
    }

    const data = await response.json();
    return data;
}

export async function getTables() {
    const response = await fetch(`${local_api_url}/table`);

    if (!response.ok) {
        throw new Error(`เกิดข้อผิดพลาดในการดึงข้อมูล: ${response.status}`);
    }

    const data = await response.json();
    return data;
}

export async function createSessions(table_id: number, customer_count: number) {
    try {
        const data = await fetch(`${local_api_url}/session`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                table_id: table_id,
                customer_count: customer_count
            }),
        });

        if (!data.ok) {
            throw new Error(`HTTP error! status: ${data.status}`);
        }

        const response = await data.json();
        return {
            success: true,
            response: response
        };

    } catch (error) {
        console.error("Error creating order:", error);
        return { success: false, error };
    }
}

export async function closedSession(session_id: number) {
    try {
        const data = await fetch(`${local_api_url}/session`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                session_id: session_id
            }),
        });

        if (!data.ok) {
            throw new Error(`HTTP error! status: ${data.status}`);
        }

        const response = await data.json();
        return { success: true, response };

    } catch (error) {
        console.error("Error creating order:", error);
        return { success: false, error };
    }
}

export async function createOrders(session_id: number, items: OrderItemPayload[]) {
    try {
        const payload = {
            session_id: Number(session_id),
            items: items.map(item => ({
                product_id: Number(item.product_id),
                quantity: Number(item.quantity),
                unit_price: Number(item.unit_price)
            }))
        };

        console.log("Sending Payload to Backend:", payload);

        const data = await fetch(`${local_api_url}/order`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });


        const response = await data.json();

        if (!data.ok) {
            // throw new Error(`HTTP error! status: ${data.status}`);
            console.error("Backend Error Response (400 Details):", response);
            return { success: false, response };
        }
        return { success: true, response };

    } catch (error) {
        console.error("Error creating order:", error);
        return { success: false, error };
    }
}

export async function getOrderBySessionId(session_id: number) {
    const response = await fetch(`${local_api_url}/session/${session_id}/orders`);

    if (!response.ok) {
        throw new Error(`เกิดข้อผิดพลาดในการดึงข้อมูล: ${response.status}`);
    }

    const data = await response.json();
    return data;
}

export async function getCustomerNumBySessionId(session_id: number) {
    const response = await fetch(`${local_api_url}/session/${session_id}/customer-count`);

    const data = await response.json();
    return data;
}

export async function updateCustomerNumBySessionId(session_id: number, value: number) {
    try {
        const data = await fetch(`${local_api_url}/session/${session_id}/customer-count`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                customer_count: value
            }),
        });

        if (!data.ok) {
            throw new Error(`HTTP error! status: ${data.status}`);
        }

        const response = await data.json();
        return {
            success: true,
            response: response
        };

    } catch (error) {
        console.error("Error updating customer count:", error);
        return { success: false, error };
    }
}

export async function updateBill(session_id: number, bill: Bill) {
    try {
        const payload = {
            session_id: session_id,
            total_play_price: bill.play_price,
            total_order_price: bill.order_price,
            grand_total: bill.total_price,
        };

        const data = await fetch(`${local_api_url}/bill`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!data.ok) {
            throw new Error(`HTTP error! status: ${data.status}`);
        }

        const response = await data.json();
        return { success: true, response: response };

    } catch (error) {
        console.error("Error creating bill:", error);
        return { success: false, error };
    }
}

export async function updateBillItemBySessionId(session_id: number, selectedCustomer: number, productIds: number[]) {
    try {
        const payload = {
            session_id: session_id,
            customer_pay_count: selectedCustomer,
            product_ids: productIds
        };

        const response = await fetch(`${local_api_url}/bill-item`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return { success: true, data: data };

    } catch (error) {
        console.error("Error creating bill item:", error);
        return { success: false, error };
    }
}