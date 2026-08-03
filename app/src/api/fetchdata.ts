
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

export async function createOrders(session_id: number, product_id: number, quantity: number, unit_price: number,) {
    try {
        const data = await fetch(`${local_api_url}/order`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                session_id: session_id,
                product_id: product_id,
                quantity: quantity,
                unit_price: unit_price
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
