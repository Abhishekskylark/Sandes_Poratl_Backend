
const pool = require('../db');

exports.getAll = async (req, res) => {
  const { mobile_no } = req.query;

  try {
    if (mobile_no) {
      // Mobile number ke basis par data fetch karo (unique id ke sath)
      const result = await pool.query(
        `SELECT DISTINCT ON (id) * FROM audit."employee" WHERE mobile_no = $1 ORDER BY id ASC LIMIT 50000`,
        [mobile_no]
      );
      res.json(result.rows);
    } else {
      // Default: unique ids only
      const result = await pool.query(
        `SELECT DISTINCT ON (id) * FROM audit."employee" ORDER BY id ASC LIMIT 50000`
      );
      res.json(result.rows);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.create = async (req, res) => {
  try {
    // customize based on schema if needed
    const result = await pool.query('INSERT INTO "audit"."employee" DEFAULT VALUES RETURNING *');
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

