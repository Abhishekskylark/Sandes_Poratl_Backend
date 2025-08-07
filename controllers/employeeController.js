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
      // Fetch by mobile number
      const result = await pool.query(
        'SELECT * FROM gim."employee" WHERE mobile_no = $1',
        [mobile_no]
      );
      res.json(result.rows);
    } else {
      // Limit default records to prevent overloading
      const result = await pool.query(
        'SELECT * FROM gim."employee" LIMIT 1000'
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
    const result = await pool.query('INSERT INTO "gim"."employee" DEFAULT VALUES RETURNING *');
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
