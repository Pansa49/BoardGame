const pool = require('../db/pool');

exports.getStartServer = (req, res) => {
    return res.status(200).json({ status: "success", data: "Server Start" })
};

exports.getMenus = async (req, res) => {
    try {
        let sql = 'SELECT * FROM products';
        let result = await pool.query(sql);
        return res.status(200).json({ status: "success", message: "Get All Menu", data: result.rows });
    } catch (error) {
        return res.status(500).json({ status: "error", message: error.message });
    }
};

exports.getTables = async (req, res) => {
    try {
        let sql = 'SELECT * FROM tables';
        let result = await pool.query(sql);
        return res.status(200).json({ status: "success", message: "Get All Table", data: result.rows })
    } catch (error) {
        return res.status(500).json({ status: "error", message: error.message });
    }
};

exports.createOrders = async (req, res) => {
    const { session_id, items } = req.body;

    if (!session_id || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
            status: "error",
            message: "Invalid payload: session_id and non-empty items array are required"
        });
    }

    // [แบบที่ 1] แปลง items ที่ quantity > 1 ให้แตกเป็นแถวละ quantity = 1 อัตโนมัติ
    const expandedItems = [];
    for (const item of items) {
        const qty = parseInt(item.quantity) || 1;
        for (let i = 0; i < qty; i++) {
            expandedItems.push({
                product_id: item.product_id,
                quantity: 1, // บันทึกทีละ 1 เสมอเพื่อให้ง่ายต่อการแยกบิล
                unit_price: item.unit_price
            });
        }
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const orderSql = `
            INSERT INTO orders (session_id, order_time) 
            VALUES ($1, NOW()) 
            RETURNING order_id;
        `;

        const orderRes = await client.query(orderSql, [session_id]);
        const newOrderId = orderRes.rows[0].order_id;

        const values = [];
        const valueStrings = expandedItems.map((item, index) => {
            const baseIndex = index * 4;
            values.push(newOrderId, item.product_id, item.quantity, item.unit_price);
            return `($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4})`;
        });

        const itemSql = `
            INSERT INTO order_items (order_id, product_id, quantity, unit_price) 
            VALUES ${valueStrings.join(', ')};
        `;

        await client.query(itemSql, values);
        await client.query('COMMIT');

        return res.status(201).json({
            status: "success",
            message: "Order created successfully",
            data: { order_id: newOrderId }
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Database Order Error:", error);

        return res.status(500).json({
            status: "error",
            message: "Failed to add orders",
            error: error.message
        });
    } finally {
        client.release();
    }
};

exports.createSessions = async (req, res) => {
    const { table_id, customer_count } = req.body;

    if (!table_id || !customer_count) {
        return res.status(400).json({
            status: "error",
            message: "Missing required fields (table_id, customer_count)"
        });
    }

    try {
        const createSessionSql = `
           INSERT INTO sessions (table_id, customer_count,play_price) 
            VALUES ($1, $2,50) 
            RETURNING *;
        `;

        const result = await pool.query(createSessionSql, [table_id, customer_count]);
        const newSession = result.rows[0];

        return res.status(201).json({
            status: "success",
            message: "Session created successfully",
            data: { newSession }
        });
    } catch (error) {
        console.error("Database Session Error:", error);
        return res.status(500).json({
            status: "error",
            message: "Failed to create session",
            error: error.message
        });
    }
};

exports.closedSession = async (req, res) => {
    const { session_id } = req.body;

    if (!session_id) {
        return res.status(400).json({
            status: "error",
            message: "Missing required fields (session_id)"
        });
    }

    try {
        const updateSessionSql = `
            UPDATE sessions 
            SET 
            end_time = CURRENT_TIMESTAMP ,
            status = CASE 
                WHEN EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - start_time)) < 600 THEN 'cancel'
                ELSE 'closed'
            END
            WHERE session_id = $1 
            RETURNING *;
        `;

        const result = await pool.query(updateSessionSql, [session_id]);

        if (result.rowCount === 0) {
            return res.status(404).json({
                status: "error",
                message: "Session not found"
            });
        }

        return res.status(200).json({
            status: "success",
            message: "Session closed successfully",
            data: result.rows[0]
        });

    } catch (error) {
        console.error("Close Session Error:", error);
        return res.status(500).json({
            status: "error",
            message: "Failed to close session",
            error: error.message
        });
    }
};

exports.getOrdersBySessionId = async (req, res) => {
    const { session_id } = req.params;

    if (!session_id) {
        return res.status(400).json({
            status: "error",
            message: "Missing required field (session_id)"
        });
    }

    try {
        const sql = `
            SELECT 
                oi.item_id AS order_item_id,
                p.product_id,
                p.name AS product_name,
                oi.quantity,
                oi.unit_price,
                o.order_time
            FROM orders o
            JOIN order_items oi ON o.order_id = oi.order_id
            JOIN products p ON oi.product_id = p.product_id
            LEFT JOIN bill_items bi ON oi.item_id = bi.order_item_id
            WHERE o.session_id = $1
              AND bi.bill_item_id IS NULL -- กรองออกเฉพาะรายการที่ชำระเงินแล้ว
            ORDER BY o.order_time ASC, oi.item_id ASC;
        `;

        const result = await pool.query(sql, [session_id]);

        return res.status(200).json({
            status: "success",
            message: "Get Orders successfully",
            data: result.rows
        });

    } catch (error) {
        console.error("Get Orders by Session ID Error:", error);
        return res.status(500).json({
            status: "error",
            message: "Failed to get orders",
            error: error.message
        });
    }
};

exports.getCustomerCountBySessionId = async (req, res) => {
    const { session_id } = req.params;

    if (!session_id) {
        return res.status(400).json({
            status: "error",
            message: "Missing required fields (session_id)"
        });
    }

    try {

        const sql = `
            SELECT customer_count , start_time, end_time, play_price
            FROM sessions 
            WHERE session_id = $1;
        `;

        const result = await pool.query(sql, [session_id]);

        if (result.rowCount === 0) {
            return res.status(404).json({
                status: "error",
                message: "Session not found"
            });
        }

        return res.status(200).json({
            status: "success",
            message: "Get Customer Count successfully",
            data: result.rows
        });

    } catch (error) {
        console.error("Get Customer Count by Session ID Error:", error);
        return res.status(500).json({
            status: "error",
            message: "Failed to get customer count",
            error: error.message
        });
    }
};

exports.updateCustomerCountBySessionId = async (req, res) => {
    const { session_id } = req.params;
    const { customer_count } = req.body;

    if (!session_id || customer_count === undefined) {
        return res.status(400).json({
            status: "error",
            message: "Missing required fields (session_id or customer_count)"
        });
    }

    try {
        const sql = `
            UPDATE sessions 
            SET customer_count = $1 
            WHERE session_id = $2
            RETURNING *;
        `;

        const result = await pool.query(sql, [customer_count, session_id]);

        if (result.rowCount === 0) {
            return res.status(404).json({
                status: "error",
                message: "Session not found"
            });
        }

        return res.status(200).json({
            status: "success",
            message: "Updated customer count successfully",
            data: result.rows
        });

    } catch (error) {
        console.error("Update Customer Count Error:", error);
        return res.status(500).json({
            status: "error",
            message: "Failed to update customer count",
            error: error.message
        });
    }
};

exports.updateBill = async (req, res) => {
    const { session_id, total_play_price, total_order_price, grand_total } = req.body;

    if (!session_id || !total_play_price || !total_order_price || !grand_total) {
        return res.status(400).json({
            status: "error",
            message: "Missing required fields"
        });
    }

    try {
        const sql = `
            INSERT INTO bills (session_id, 
            total_play_price,
            total_order_price,
            grand_total) 
            VALUES ($1, $2,$3,$4) 
            RETURNING *;
        `;

        const result = await pool.query(sql, [
            session_id,
            total_play_price,
            total_order_price,
            grand_total
        ]);

        return res.status(200).json({
            status: "success",
            message: "Create Bill successfully",
            data: result.rows
        });

    } catch (error) {
        console.error("Create Bill Error:", error);
        return res.status(500).json({
            status: "error",
            message: "Failed to create Bill",
            error: error.message
        });
    }
};

exports.createBill = async (req, res) => {
    // 1. แก้ไขการรับค่าให้รองรับทั้ง selected_item_ids และ selectedItemIds
    const { session_id, customer_pay_count, selected_item_ids, selectedItemIds } = req.body;
    const itemIds = Array.isArray(selected_item_ids)
        ? selected_item_ids
        : (Array.isArray(selectedItemIds) ? selectedItemIds : []);

    if (!session_id || customer_pay_count === undefined) {
        return res.status(400).json({
            status: "error",
            message: "Missing required fields (session_id or customer_pay_count)"
        });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // ตรวจสอบ Session
        const sessionCheck = await client.query(
            `SELECT session_id FROM sessions WHERE session_id = $1`,
            [session_id]
        );

        if (sessionCheck.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                status: "error",
                message: "Session not found"
            });
        }

        let calculatedOrderPrice = 0;

        // 2. คำนวณราคาอาหารจากตาราง order_items โดยใช้ item_id (อ้างอิงตาม ER Diagram)[cite: 1]
        if (itemIds.length > 0) {
            const priceRes = await client.query(
                `SELECT SUM(quantity * unit_price) AS total_order_price
                 FROM order_items 
                 WHERE item_id = ANY($1::INT[])`,
                [itemIds]
            );

            calculatedOrderPrice = Number(priceRes.rows[0].total_order_price || 0);
        }

        // 3. คำนวณค่าเล่นบอร์ดเกม + สร้าง Bill ในตาราง bills (เพิ่ม COALESCE ป้องกัน start_time เป็น NULL)
        const createBillSql = `
            WITH session_info AS (
                SELECT 
                    GREATEST(0, COALESCE(EXTRACT(EPOCH FROM (COALESCE(end_time, NOW()) - start_time)) / 60, 0)) AS total_minutes
                FROM sessions 
                WHERE session_id = $1
            ),
            calc_play AS (
                SELECT 
                    CASE 
                        WHEN total_minutes <= 10 THEN 0
                        ELSE CEIL((total_minutes - 10) / 60.0) * 50
                    END AS rate_per_person
                FROM session_info
            )
            INSERT INTO bills (
                session_id, 
                total_play_price, 
                total_order_price, 
                grand_total, 
                payment_time, 
                customer_pay_count
            )
            VALUES (
                $1,
                $2 * COALESCE((SELECT rate_per_person FROM calc_play), 0),
                $3,
                ($2 * COALESCE((SELECT rate_per_person FROM calc_play), 0)) + $3,
                NOW(),
                $2
            )
            RETURNING *;
        `;

        const billRes = await client.query(createBillSql, [session_id, customer_pay_count, calculatedOrderPrice]);
        const createdBill = billRes.rows[0];

        // 4. บันทึกผูก order_item_id ลงตาราง bill_items (เชื่อมกับ item_id ของ order_items)[cite: 1]
        let insertedItems = [];
        if (itemIds.length > 0) {
            const insertItemSql = `
                INSERT INTO bill_items (bill_id, order_item_id, created_at)
                SELECT 
                    $1::INT AS bill_id,
                    unnest($2::INT[]) AS order_item_id,
                    NOW() AS created_at
                RETURNING *;
            `;
            const itemsRes = await client.query(insertItemSql, [createdBill.bill_id, itemIds]);
            insertedItems = itemsRes.rows;
        }

        await client.query('COMMIT');

        return res.status(201).json({
            status: "success",
            message: "Bill created successfully",
            data: {
                bill: createdBill,
                bill_items: insertedItems
            }
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Create Bill Error:", error);
        return res.status(500).json({
            status: "error",
            message: "Failed to create Bill",
            error: error.message
        });
    } finally {
        client.release();
    }
};