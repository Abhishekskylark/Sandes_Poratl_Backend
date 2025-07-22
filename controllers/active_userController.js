const pool = require('../db');

exports.getAll = async (req, res) => {
    try {
        // 🔹 1. Get total count of rows (without LIMIT)
        const countResult = await pool.query('SELECT COUNT(*) FROM "report"."active_user_log"');

        // 🔹 2. Get limited rows (for frontend display)
        const dataResult = await pool.query('SELECT * FROM "report"."active_user_log" LIMIT 500000');

        res.json({
            totalCount: parseInt(countResult.rows[0].count, 10), // convert string to number
            data: dataResult.rows,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


exports.create = async (req, res) => {
    try {
        // customize based on schema if needed
        const result = await pool.query('INSERT INTO "report"."active_user_log" DEFAULT VALUES RETURNING *');
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
