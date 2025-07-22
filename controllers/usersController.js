const pool = require('../db');

exports.getAll = async (req, res) => {
  try {
    const countResult = await pool.query('SELECT COUNT(*) FROM "public"."users"');
    const result = await pool.query('SELECT * FROM "public"."users"'); //LIMIT 10000
      res.json({
            totalCount: parseInt(countResult.rows[0].count, 10), // convert string to number
            data: result.rows,
        });
    // res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    // customize based on schema if needed
    const result = await pool.query('INSERT INTO "public"."users" DEFAULT VALUES RETURNING *');
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
