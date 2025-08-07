const pool = require('../db');

exports.getAll = async (req, res) => {
    try {
        // 🔹 1. Total combined row count from all 5 tables
        const countQuery = `
            SELECT 
              (SELECT COUNT(*) FROM report.message_activity) +
              (SELECT COUNT(*) FROM report.message_activity_app) +
              (SELECT COUNT(*) FROM report.message_activity_emp) +
              (SELECT COUNT(*) FROM report.message_activity_org) +
              (SELECT COUNT(*) FROM report.message_activity_ou) AS total_count
        `;
        const countResult = await pool.query(countQuery);

        // 🔹 2. Optionally get limited rows from any table (for example: main one)
        const dataResult = await pool.query('SELECT * FROM report.message_activity LIMIT 500000');

        res.json({
            totalCount: parseInt(countResult.rows[0].total_count, 10),
            data: dataResult.rows,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


exports.create = async (req, res) => {
    try {
        // customize based on schema if needed
        const result = await pool.query('INSERT INTO "report"."app_message_activity" DEFAULT VALUES RETURNING *');
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
