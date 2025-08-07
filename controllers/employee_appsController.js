const pool = require('../db');

exports.getAll = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "gim"."employee"_apps LIMIT 10000');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    // customize based on schema if needed
    const result = await pool.query('INSERT INTO "gim"."employee"_apps DEFAULT VALUES RETURNING *');
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
