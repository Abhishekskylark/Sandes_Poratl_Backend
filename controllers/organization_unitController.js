// const pool = require('../db');

// exports.getAll = async (req, res) => {
//   try {
//     const result = await pool.query('SELECT * FROM "gim"."organization"_unit');
//     res.json(result.rows);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// exports.create = async (req, res) => {
//   try {
//     // customize based on schema if needed
//     const result = await pool.query('INSERT INTO "gim"."organization"_unit DEFAULT VALUES RETURNING *');
//     res.status(201).json(result.rows[0]);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };




const pool = require('../db');

// GET all
exports.getAll = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "gim"."organization_unit"');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE
exports.create = async (req, res) => {
  try {
    const { name, code, organization_id } = req.body; // adjust fields as needed
    const result = await pool.query(
      `INSERT INTO "gim"."organization_unit" (name, code, organization_id)
       VALUES ($1, $2, $3) RETURNING *`,
      [name, code, organization_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE
exports.update = async (req, res) => {
  const { id } = req.params;
  const { name, code, organization_id } = req.body;

  try {
    const result = await pool.query(
      `UPDATE "gim"."organization_unit"
       SET name = $1, code = $2, organization_id = $3
       WHERE id = $4 RETURNING *`,
      [name, code, organization_id, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Unit not found' });
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
      `DELETE FROM "gim"."organization_unit" WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Unit not found' });
    }

    res.json({ message: 'Unit deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
