const pool = require('../db/pool');

exports.getMenus = async (req, res) => {
    let sql = 'SELECT * FROM products'
    let result = await pool.query(sql)

    // console.log(result);
    res.status(200).json({ status: "success", message: "Here is all menu", data: result.rows })
}

exports.getStartServer = (req, res) => {
    res.status(200).json({ status: "success", data: " Server Start" })
}

