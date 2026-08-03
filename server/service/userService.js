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

    const { session_id, product_id, quantity, unit_price } = req.body;

    if (!session_id || !product_id || !quantity || !unit_price) {
        return res.status(400).json({
            status: "error",
            message: "Missing required fields (session_id, product_id, quantity, unit_price)"
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

        await client.query(
            itemSql,
            [newOrderId, product_id, quantity, unit_price]
        );

        // ยืนยันการบันทึกข้อมูลทั้งหมดลง Database
        await client.query('COMMIT');

        // 4. ส่ง Response ตอบกลับ
        res.status(201).json({
            status: "success",
            message: "Add All Orders successfully",
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
           INSERT INTO sessions (table_id, customer_count) 
            VALUES ($1, $2) 
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
