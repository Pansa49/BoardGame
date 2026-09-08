const pool = require('../db/pool');

exports.getMenus = async (req, res) => {
    let sql = 'SELECT * FROM products'
    let result = await pool.query(sql)

    // console.log(result);
    res.status(200).json({ status: "success", message: "Get All Menu", data: result.rows })
}

exports.getStartServer = (req, res) => {
    res.status(200).json({ status: "success", data: " Server Start" })
}

exports.getTables = async (req, res) => {
    let sql = 'SELECT * FROM tables'
    let result = await pool.query(sql)

    res.status(200).json({ status: "success", message: "Get All Table", data: result.rows })
}

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
        await client.query('BEGIN'); // เริ่ม Transaction

        // 2. INSERT ลงตาราง orders
        const orderSql = `
            INSERT INTO orders (session_id, order_time) 
            VALUES ($1, NOW()) 
            RETURNING order_id
        `;
        const orderRes = await client.query(orderSql, [session_id])
        const newOrderId = orderRes.rows[0].order_id;

        // 3. วนลูป INSERT ลงตาราง order_items
        const itemSql = `
            INSERT INTO order_items (order_id, product_id, quantity, unit_price) 
            VALUES ($1, $2, $3, $4)
        `;

        for (const item of items) {
            await client.query(itemSql, [
                newOrderId,
                item.product_id,
                item.quantity,
                item.unit_price
            ]);
        }

        // ยืนยันการบันทึกข้อมูลทั้งหมดลง Database
        await client.query('COMMIT');

        // 4. ส่ง Response ตอบกลับ
        res.status(201).json({
            status: "success",
            message: "Order created successfully",
            data: { order_id: newOrderId }
        });

    } catch (error) {
        // หากเกิดข้อผิดพลาดให้ Rollback ยกเลิกคำสั่งทั้งหมด
        await client.query('ROLLBACK');
        console.error("Database Order Error:", error);

        res.status(500).json({
            status: "error",
            message: "Failed to add orders",
            error: error.message
        });
    } finally {
        client.release(); // คืน Connection ให้ pool
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

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const createSessionSql = `
           INSERT INTO sessions (table_id, customer_count,play_price) 
            VALUES ($1, $2,50) 
            RETURNING *;
        `;

        const result = await client.query(createSessionSql, [table_id, customer_count]);
        const newSession = result.rows[0];

        await client.query('COMMIT');

        res.status(201).json({
            status: "success",
            message: "Add All Orders successfully",
            data: { newSession }
        });

    } catch (error) {

        await client.query('ROLLBACK');
        console.error("Database Order Error:", error);

        res.status(500).json({
            status: "error",
            message: "Failed to add orders",
            error: error.message
        });
    } finally {
        client.release();
    }
}

exports.closedSession = async (req, res) => {
    const { session_id } = req.body;

    if (!session_id) {
        return res.status(400).json({
            status: "error",
            message: "Missing required fields (session_id)"
        });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // อัปเดต status เป็น 'closed' และลง end_time ปัจจุบัน
        const sql = `
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
        const result = await client.query(sql, [session_id]);

        if (result.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                status: "error",
                message: "Session not found"
            });
        }

        await client.query('COMMIT');

        res.status(200).json({
            status: "success",
            message: "Session closed successfully",
            data: result.rows[0]
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Close Session Error:", error);
        res.status(500).json({
            status: "error",
            message: "Failed to close session",
            error: error.message
        });
    } finally {
        client.release();
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

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // อัปเดต status เป็น 'closed' และลง end_time ปัจจุบัน
        const sql = `
            SELECT 
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

        const result = await client.query(sql, [session_id]);

        if (result.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                status: "error",
                message: "Session not found"
            });
        }

        await client.query('COMMIT');

        res.status(200).json({
            status: "success",
            message: "Get Orders successfully",
            data: result.rows
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Get Orders by Session ID Error:", error);
        res.status(500).json({
            status: "error",
            message: "Failed to cancel session",
            error: error.message
        });
    } finally {
        client.release();
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

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const sql = `
            SELECT customer_count , start_time, end_time, play_price
            FROM sessions 
            WHERE session_id = $1;
        `;

        const result = await client.query(sql, [session_id]);

        if (result.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                status: "error",
                message: "Session not found"
            });
        }

        await client.query('COMMIT');

        res.status(200).json({
            status: "success",
            message: "Get Orders successfully",
            data: result.rows
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Get Orders by Session ID Error:", error);
        res.status(500).json({
            status: "error",
            message: "Failed to cancel session",
            error: error.message
        });
    } finally {
        client.release();
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

        res.status(200).json({
            status: "success",
            message: "Updated customer count successfully",
            data: result.rows
        });

    } catch (error) {
        console.error("Update Customer Count Error:", error);
        res.status(500).json({
            status: "error",
            message: "Failed to update customer count",
            error: error.message
        });
    }
};