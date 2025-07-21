// const pool = require('../db');

// exports.getAll = async (req, res) => {
//   try {
//     const result = await pool.query('SELECT * FROM "gim"."designation"');
//     res.json(result.rows);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// exports.create = async (req, res) => {
//   try {
//     // customize based on schema if needed
//     const result = await pool.query('INSERT INTO "gim"."designation" DEFAULT VALUES RETURNING *');
//     res.status(201).json(result.rows[0]);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };



const pool = require('../db');

// GET all
exports.getAll = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "gim"."designation"');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE
exports.create = async (req, res) => {
  try {
    const { title, code } = req.body; // adjust fields according to your schema
    const result = await pool.query(
      `INSERT INTO "gim"."designation" (title, code)
       VALUES ($1, $2) RETURNING *`,
      [title, code]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE
exports.update = async (req, res) => {
  const { id } = req.params;
  const { title, code } = req.body;

  try {
    const result = await pool.query(
      `UPDATE "gim"."designation"
       SET title = $1, code = $2
       WHERE id = $3 RETURNING *`,
      [title, code, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Designation not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE
exports.remove = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM "gim"."designation" WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Designation not found' });
    }

    res.json({ message: 'Designation deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
