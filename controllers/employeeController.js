const pool = require('../db');

// exports.getAll = async (req, res) => {
//   try {
//     // const result = await pool.query('SELECT * FROM "gim"."employee"');
//     const result = await pool.query('SELECT * FROM gim."employee" LIMIT 40000');
//     res.json(result.rows);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

exports.getAll = async (req, res) => {
  const { mobile_no } = req.query;

  try {
    if (mobile_no) {
      // Mobile number ke basis par data fetch karo
      const result = await pool.query(
        'SELECT * FROM gim."employee" WHERE mobile_no = $1',
        [mobile_no]
      );
      res.json(result.rows);
    } else {
      // Agar mobile_no nahi diya gaya, to default 40,000 records
      const result = await pool.query('SELECT * FROM gim."employee"');
      res.json(result.rows);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.create = async (req, res) => {
  try {
    // customize based on schema if needed
    const result = await pool.query('INSERT INTO "gim"."employee" DEFAULT VALUES RETURNING *');
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
