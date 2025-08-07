// const pool = require('../db');

// exports.getAll = async (req, res) => {
//   try {
//     const result = await pool.query('SELECT * FROM "gim"."list_publisher"');
//     res.json(result.rows);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// exports.create = async (req, res) => {
//   try {
//     // customize based on schema if needed
//     const result = await pool.query('INSERT INTO "gim"."list_publisher" DEFAULT VALUES RETURNING *');
//     res.status(201).json(result.rows[0]);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


const pool = require('../db');

exports.getAll = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "gim"."list_publishers"');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    // Customize according to actual columns
    const result = await pool.query('INSERT INTO "gim"."list_publishers" DEFAULT VALUES RETURNING *');
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
