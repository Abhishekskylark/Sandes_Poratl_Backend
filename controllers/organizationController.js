
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
// exports.remove = async (req, res) => {
//   const { gu_id } = req.params; // ✅ ye sahi hai

//   try {
//     const result = await pool.query(
//       `DELETE FROM "gim"."organization" WHERE gu_id = $1 RETURNING *`,
//       [gu_id]
//     );

//     if (result.rowCount === 0) {
//       return res.status(404).json({ error: 'Organization not found' });
//     }

//     res.json({ message: 'Organization deleted successfully' });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


exports.remove = async (req, res) => {
  const { gu_id } = req.params;

  try {
    // Step 1: Get organization.id from gu_id
    const orgResult = await pool.query(
      `SELECT id FROM "gim"."organization" WHERE gu_id = $1`,
      [gu_id]
    );

    if (orgResult.rowCount === 0) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    const orgId = orgResult.rows[0].id;

    // Step 2: Get all designation_codes from that organization
    const desigResult = await pool.query(
      `SELECT designation_code FROM "gim"."designation" WHERE organization_id = $1`,
      [orgId]
    );

    const designationCodes = desigResult.rows.map(row => row.designation_code);

    // 👇 Type safety: Cast all to string (if designation_code is text) or to int (if integer)
    const castedCodes = designationCodes.map(code => String(code)); // or Number(code) if designation_code is integer

    // Step 3: Delete employees with matching designation_code
    if (castedCodes.length > 0) {
      await pool.query(
        `DELETE FROM "gim"."employee" WHERE designation_code = ANY($1::text[])`, // 👈 use text[] or int[] based on column type
        [castedCodes]
      );
    }

    // Step 4: Delete designations
    await pool.query(
      `DELETE FROM "gim"."designation" WHERE organization_id = $1`,
      [orgId]
    );

    // Step 5: Delete the organization
    await pool.query(
      `DELETE FROM "gim"."organization" WHERE gu_id = $1`,
      [gu_id]
    );

    res.json({
      message: 'Organization and related data deleted successfully',
      gu_id,
      orgId
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
