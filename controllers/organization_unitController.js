
const pool = require('../db');
const { v4: uuidv4 } = require('uuid');

// --------------------------------------------------
// Helpers
// --------------------------------------------------

// const isNullishOrEmpty = v => v === undefined || v === null || (typeof v === 'string' && v.trim() === '');
// const toIntOrNull = v => (v === undefined || v === null || v === '' ? null : parseInt(v, 10));
// const toBool = v => {
//   if (typeof v === 'boolean') return v;
//   if (typeof v === 'string') return v.toLowerCase() === 'true' || v === '1';
//   if (typeof v === 'number') return v === 1;
//   return false;
// };

function hasAnyRole(user, roles = []) {
  if (!user || !Array.isArray(user.roles)) return false;
  return roles.some(r => user.roles.includes(r));
}

function requireRoles(req, res, roles = []) {
  const ok = hasAnyRole(req.user, roles);
  if (!ok) {
    res.status(403).json({ status: 'error', message: 'Access denied' });
  }
  return ok;
}

// 🔹 Testing: Always set fake super admin
function injectFakeSuperAdmin(req) {
  req.user = { roles: ['ROLE_SUPER_ADMIN'], ouId: null, organizationId: null };
}

// --------------------------------------------------
// GET
// --------------------------------------------------
exports.getAll = async (req, res) => {
  injectFakeSuperAdmin(req);
  if (!requireRoles(req, res, [
    'ROLE_SUPER_ADMIN', 'ROLE_SUPERVISOR', 'ROLE_MINISTRY_ADMIN', 'ROLE_O_ADMIN', 'ROLE_OU_ADMIN'
  ])) return;

  try {
    const result = await pool.query(`
      SELECT * FROM gim.organization_unit ORDER BY ou_id ASC
    `);
    res.json({ status: 'success', data: result.rows });
  } catch (err) {
    console.error('Error fetching organization units:', err);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

// --------------------------------------------------
// CREATE
// --------------------------------------------------

exports.create = async (req, res) => {
  try {
    const {
      ou_name,
      parent_ou,
      ou_type,
      organization_id,
      state_id,
      district_id,
      ou_address,
      pin_code,
      landline,
      website,
      is_published,
      sort_order,
      ou_code,
      is_offboarders
    } = req.body;

    // Generate UUID for gu_id
    const gu_id = uuidv4();

    // Validate parent_ou exists or set null
    let parentOuFinal = parent_ou || null;
    if (parent_ou) {
      const checkParent = await pool.query(
        `SELECT 1 FROM gim.organization_unit WHERE ou_id = $1`,
        [parent_ou]
      );
      if (checkParent.rows.length === 0) {
        parentOuFinal = null;
      }
    }

    // Convert empty strings to null for integer fields
    const orgId = organization_id || null;
    const stateId = state_id || null;
    const districtId = district_id || null;
    const insertMetadataId = null; // Agar insert_metadata_id automatic nahi hai
    const updateMetadataId = null; // Agar update_metadata_id automatic nahi hai

    const insertQuery = `
      INSERT INTO gim.organization_unit
      (ou_name, parent_ou, ou_type, organization_id, state_id, district_id, insert_metadata_id, update_metadata_id, ou_address, pin_code, landline, website, is_published, sort_order, ou_code, gu_id, is_offboarders)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *;
    `;

    const values = [
      ou_name,
      parentOuFinal,
      ou_type,
      orgId,
      stateId,
      districtId,
      insertMetadataId,
      updateMetadataId,
      ou_address,
      pin_code,
      landline,
      website,
      is_published,
      sort_order,
      ou_code,
      gu_id,
      is_offboarders
    ];

    const result = await pool.query(insertQuery, values);
    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error("Error creating organization unit:", err);
    res.status(500).json({ error: err.message });
  }
};
/**
 * UPDATE Organization Unit
 */
// exports.update = async (req, res) => {
//   try {
//     const ouIdParam = toIntOrNull(req.params.id);
//     if (!ouIdParam) {
//       return res.status(400).json({
//         status: "error",
//         message: "Invalid OU ID"
//       });
//     }

//     let {
//       parent_ou,
//       ou_name,
//       ou_type,
//       organization_id,
//       state_id,
//       district_id,
//       ou_address,
//       ou_code,
//       pin_code,
//       landline,
//       website
//     } = req.body;

//     // Convert integer fields
//     parent_ou = toIntOrNull(parent_ou);
//     organization_id = toIntOrNull(organization_id) || req.user?.organizationId || 1;
//     state_id = toIntOrNull(state_id);
//     district_id = toIntOrNull(district_id);
//     pin_code = toIntOrNull(pin_code);

//     // Parent check
//     let parentOuFinal = parent_ou || null;
//     if (parent_ou) {
//       const checkParent = await pool.query(
//         `SELECT 1 FROM gim.organization_unit WHERE ou_id = $1`,
//         [parent_ou]
//       );
//       if (checkParent.rows.length === 0) {
//         return res.status(400).json({ error: 'Parent OU does not exist' });
//       }
//     }

//     const updateQuery = `
//       UPDATE gim.organization_unit
//       SET parent_ou = $1,
//           ou_name = $2,
//           ou_type = $3,
//           organization_id = $4,
//           state_id = $5,
//           district_id = $6,
//           ou_address = $7,
//           ou_code = $8,
//           pin_code = $9,
//           landline = $10,
//           website = $11
//       WHERE ou_id = $12
//       RETURNING *
//     `;

//     const values = [
//       parent_ou, ou_name, ou_type, organization_id,
//       state_id, district_id, ou_address || null, ou_code || null, pin_code,
//       landline || null, website || null,
//       ouIdParam
//     ];

//     const { rows } = await pool.query(updateQuery, values);

//     if (rows.length === 0) {
//       return res.status(404).json({
//         status: "error",
//         message: "Organization unit not found"
//       });
//     }

//     res.status(200).json({
//       status: "success",
//       data: rows[0]
//     });

//   } catch (error) {
//     console.error("Error updating organization unit:", error);
//     res.status(500).json({
//       status: "error",
//       message: "Internal server error"
//     });
//   }
// };

// --------------------------------------------------
// UPDATE
// --------------------------------------------------


exports.update = async (req, res) => {
  injectFakeSuperAdmin(req);
  if (!requireRoles(req, res, [
    'ROLE_SUPER_ADMIN', 'ROLE_MINISTRY_ADMIN', 'ROLE_O_ADMIN', 'ROLE_OU_ADMIN'
  ])) return;

  try {
    const { gu_id } = req.params;
    const existing = await pool.query(
      'SELECT * FROM gim.organization_unit WHERE gu_id = $1',
      [gu_id]
    );
    if (!existing.rows.length) {
      return res.status(404).json({ status: 'error', message: 'Organization Unit not found' });
    }
    const old = existing.rows[0];

    let updated = { ...old, ...req.body };

    if (!updated.organization_id) {
      updated.organization_id = req.user?.organizationId || 1;
    }

    if (hasAnyRole(req.user, ['ROLE_OU_ADMIN']) && req.user?.ouId) {
      updated.parent_ou = req.user.ouId;
    }
    if (hasAnyRole(req.user, ['ROLE_O_ADMIN', 'ROLE_OU_ADMIN']) && req.user?.organizationId) {
      updated.organization_id = req.user.organizationId;
    }

    let final_ou_code = updated.ou_code;
    if (updated.parent_ou && updated.ou_code) {
      const parent = await pool.query(
        'SELECT ou_code FROM gim.organization_unit WHERE ou_id = $1',
        [updated.parent_ou]
      );
      const parentCode = parent.rows[0]?.ou_code;
      if (parentCode) final_ou_code = `${parentCode}-${updated.ou_code}`;
    }

    const result = await pool.query(`
      UPDATE gim.organization_unit
      SET ou_name=$1, parent_ou=$2, ou_type=$3, organization_id=$4,
          state_id=$5, district_id=$6, insert_metadata_id=$7, update_metadata_id=$8,
          ou_address=$9, pin_code=$10, landline=$11, website=$12, is_published=$13,
          sort_order=$14, ou_code=$15, is_offboarders=$16
      WHERE gu_id=$17
      RETURNING *
    `, [
      updated.ou_name,
      updated.parent_ou || null,
      updated.ou_type,
      updated.organization_id,
      updated.state_id || null,
      updated.district_id || null,
      updated.insert_metadata_id ?? null,
      updated.update_metadata_id ?? null,
      updated.ou_address || null,
      updated.pin_code || null,
      updated.landline || null,
      updated.website || null,
      !!updated.is_published,
      updated.sort_order || 0,
      final_ou_code,
      !!updated.is_offboarders,
      gu_id
    ]);

    res.json({ status: 'success', data: result.rows[0], message: 'Updation successful' });
  } catch (err) {
    console.error('Error updating organization unit:', err);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

// --------------------------------------------------
// DELETE
// --------------------------------------------------
// Delete Organization Unit API
// organization_unitController.js

exports.remove = async (req, res) => {
  injectFakeSuperAdmin(req);

  if (!requireRoles(req, res, [
    'ROLE_SUPER_ADMIN', 'ROLE_MINISTRY_ADMIN', 'ROLE_O_ADMIN', 'ROLE_OU_ADMIN'
  ])) return;

  try {
    const { id: gu_id } = req.params; // UUID from frontend

    // Get ou_id from gu_id
    const ouResult = await pool.query(
      'SELECT ou_id FROM gim.organization_unit WHERE gu_id = $1',
      [gu_id]
    );

    if (ouResult.rowCount === 0) {
      return res.status(404).json({ status: 'error', message: 'Organization Unit not found' });
    }

    const ou_id = ouResult.rows[0].ou_id;

    // Check if employees exist in this OU
    const empCount = await pool.query(
      'SELECT COUNT(*)::int AS cnt FROM gim.employee WHERE ou_id = $1',
      [ou_id]
    );

    if (empCount.rows[0]?.cnt > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Action unsuccessful, Members are already assigned to this organization unit'
      });
    }

    // Check for child OUs
    const childCount = await pool.query(
      'SELECT COUNT(*)::int AS cnt FROM gim.organization_unit WHERE parent_ou = $1',
      [ou_id]
    );

    if (childCount.rows[0]?.cnt > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Action unsuccessful, Child organization units exist under this unit'
      });
    }

    // Delete OU
    const del = await pool.query(
      'DELETE FROM gim.organization_unit WHERE gu_id = $1 RETURNING gu_id',
      [gu_id]
    );

    if (del.rowCount === 0) {
      return res.status(404).json({ status: 'error', message: 'Organization Unit not found' });
    }

    res.json({ status: 'success', message: 'Deletion successful' });
  } catch (err) {
    console.error('Error deleting organization unit:', err);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};


