
const pool = require('../db');

// GET all
exports.getAll = async (req, res) => {
  try {
    const countResult = await pool.query('SELECT COUNT(*) FROM "gim"."organization"');
    const result = await pool.query('SELECT * FROM "gim"."organization"');
    res.json({
      totalCount: parseInt(countResult.rows[0].count, 10), // convert string to number
      data: result.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE
exports.create = async (req, res) => {
  try {
    const { name, code } = req.body; // Customize columns
    const result = await pool.query(
      `INSERT INTO "gim"."organization" (name, code) VALUES ($1, $2) RETURNING *`,
      [name, code]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.update = async (req, res) => {
  const { gu_id } = req.params;

  const {
    organization_code,
    organization_type_id,
    o_name,
    is_o_visibility,
    is_public_visibility,
    vhost_id // ✅ Yeh chahiye
  } = req.body;

  try {

    const result = await pool.query(
      `UPDATE "gim"."organization"
   SET
     organization_code = $1,
     organization_type_id = $2,
     o_name = $3,
     is_o_visibility = $4,
     is_public_visibility = $5,
     vhost_id = $6
   WHERE gu_id = $7
   RETURNING *`,
      [
        organization_code,
        organization_type_id,
        o_name,
        is_o_visibility,
        is_public_visibility,
        parseInt(vhost_id) || null,
        gu_id
      ]
    );


    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    res.json({
      message: 'Organization updated successfully ✅',
      data: result.rows[0]
    });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: err.message });
  }
};



// DELETE
exports.remove = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM "gim"."organization" WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    res.json({ message: 'Organization deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
