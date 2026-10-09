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
        const valueStrings = items.map((item, index) => {
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
            message: "Missing required fields (session_id)"
        });
    }

    try {
        const sql = `
            SELECT 
                p.product_id As product_id,
                p.name AS product_name,
                p.category,
                SUM(oi.quantity)::INT AS quantity,
                oi.unit_price
            FROM orders o
            JOIN order_items oi ON o.order_id = oi.order_id
            JOIN products p ON oi.product_id = p.product_id
            WHERE o.session_id = $1
            GROUP BY p.product_id, p.name, p.category, oi.unit_price;
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
    const { session_id, customer_pay_count, selectedProducts } = req.body;

    if (!session_id || customer_pay_count === undefined) {
        return res.status(400).json({
            status: "error",
            message: "Missing required fields (session_id or customer_pay_count)"
        });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const productsList = Array.isArray(selectedProducts) ? selectedProducts : [];
        let calculatedOrderPrice = 0;

        // 1. คำนวณราคาสินค้าที่เลือกจาก DB โดยตรง
        if (productsList.length > 0) {
            const productIds = productsList.map(item => item.product_id);
            const priceRes = await client.query(
                `SELECT product_id, price FROM products WHERE product_id = ANY($1::INT[])`,
                [productIds]
            );

            const priceMap = new Map(priceRes.rows.map(row => [row.product_id, Number(row.price)]));

            calculatedOrderPrice = productsList.reduce((sum, item) => {
                const price = priceMap.get(item.product_id) || 0;
                return sum + (price * Number(item.quantity || 1));
            }, 0);
        }

        // 2. สร้าง Bill และคำนวณค่าเล่นตามเวลา (play price) + รวมราคาทั้งหมดใน Query เดียว
        const createBillSql = `
            WITH session_info AS (
                SELECT 
                    GREATEST(0, EXTRACT(EPOCH FROM (COALESCE(end_time, NOW()) - start_time)) / 60) AS total_minutes
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
                $2 * (SELECT rate_per_person FROM calc_play),
                $3,
                ($2 * (SELECT rate_per_person FROM calc_play)) + $3,
                NOW(),
                $2
            )
            RETURNING *;
        `;

        const billRes = await client.query(createBillSql, [session_id, customer_pay_count, calculatedOrderPrice]);
        const createdBill = billRes.rows[0];

        // 3. บันทึกรายการสินค้าลง bill_items
        let insertedItems = [];
        if (productsList.length > 0) {
            const pIds = productsList.map(item => item.product_id);
            const insertItemSql = `
                INSERT INTO bill_items (bill_id, order_item_id, created_at)
                SELECT 
                    $1::INT AS bill_id,
                    oi.item_id AS order_item_id,
                    NOW() AS created_at
                FROM order_items oi
                JOIN orders o ON oi.order_id = o.order_id
                WHERE o.session_id = $2::INT
                  AND oi.product_id = ANY($3::INT[])
                RETURNING *;
            `;
            const itemsRes = await client.query(insertItemSql, [createdBill.bill_id, session_id, pIds]);
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