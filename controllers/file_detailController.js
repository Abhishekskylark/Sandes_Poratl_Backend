// const pool = require('../db');

// exports.getAll = async (req, res) => {
//   try {
//     const result = await pool.query('SELECT * FROM "gim"."file_detail"');
//     res.json(result.rows);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// exports.create = async (req, res) => {
//   try {
//     // customize based on schema if needed
//     const result = await pool.query('INSERT INTO "gim"."file_detail" DEFAULT VALUES RETURNING *');
//     res.status(201).json(result.rows[0]);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


const pool = require('../db');

// Get all file_details (limited + safe preview)
exports.getAll = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        file_type_code,
        file_hash,
        LEFT(encode(file_data, 'base64'), 500) AS file_data_preview,
        LEFT(encode(thumbnail, 'base64'), 200) AS thumbnail_preview,
        content_type_code,
        created_date
      FROM gim.file_detail
      LIMIT 50
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create new file_detail
exports.create = async (req, res) => {
  const {
    file_type_code,
    file_hash,
    file_data,      // base64 string expected
    thumbnail,      // base64 string expected
    content_type_code
  } = req.body;

  try {
    const result = await pool.query(
      `
      INSERT INTO gim.file_detail (
        file_type_code, file_hash, file_data, thumbnail, content_type_code, created_date
      ) VALUES (
        $1, $2, decode($3, 'base64'), decode($4, 'base64'), $5, NOW()
      ) RETURNING id
      `,
      [file_type_code, file_hash, file_data, thumbnail, content_type_code]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
