
// const pool = require('../db');

// // GET all
// exports.getAll = async (req, res) => {
//   try {
//     const countResult = await pool.query('SELECT COUNT(*) FROM "gim"."organization"');
//     const result = await pool.query('SELECT * FROM "gim"."organization"');
//     res.json({
//       totalCount: parseInt(countResult.rows[0].count, 10), // convert string to number
//       data: result.rows,
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // CREATE
// exports.create = async (req, res) => {
//   try {
//     const { name, code } = req.body; // Customize columns
//     const result = await pool.query(
//       `INSERT INTO "gim"."organization" (name, code) VALUES ($1, $2) RETURNING *`,
//       [name, code]
//     );
//     res.status(201).json(result.rows[0]);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


// exports.update = async (req, res) => {
//   const { gu_id } = req.params;

//   const {
//     organization_code,
//     organization_type_id,
//     o_name,
//     is_o_visibility,
//     is_public_visibility,
//     vhost_id // ✅ Yeh chahiye
//   } = req.body;

//   try {

//     const result = await pool.query(
//       `UPDATE "gim"."organization"
//    SET
//      organization_code = $1,
//      organization_type_id = $2,
//      o_name = $3,
//      is_o_visibility = $4,
//      is_public_visibility = $5,
//      vhost_id = $6
//    WHERE gu_id = $7
//    RETURNING *`,
//       [
//         organization_code,
//         organization_type_id,
//         o_name,
//         is_o_visibility,
//         is_public_visibility,
//         parseInt(vhost_id) || null,
//         gu_id
//       ]
//     );


//     if (result.rowCount === 0) {
//       return res.status(404).json({ error: 'Organization not found' });
//     }

//     res.json({
//       message: 'Organization updated successfully ✅',
//       data: result.rows[0]
//     });
//   } catch (err) {
//     console.error('Update error:', err);
//     res.status(500).json({ error: err.message });
//   }
// };


// exports.remove = async (req, res) => {
//   const { gu_id } = req.params;

//   try {
//     // Step 1: Get organization.id from gu_id
//     const orgResult = await pool.query(
//       `SELECT id FROM "gim"."organization" WHERE gu_id = $1`,
//       [gu_id]
//     );

//     if (orgResult.rowCount === 0) {
//       return res.status(404).json({ error: 'Organization not found' });
//     }

//     const orgId = orgResult.rows[0].id;

//     // Step 2: Get all designation_codes from that organization
//     const desigResult = await pool.query(
//       `SELECT designation_code FROM "gim"."designation" WHERE organization_id = $1`,
//       [orgId]
//     );

//     const designationCodes = desigResult.rows.map(row => row.designation_code);

//     // 👇 Type safety: Cast all to string (if designation_code is text) or to int (if integer)
//     const castedCodes = designationCodes.map(code => String(code)); // or Number(code) if designation_code is integer

//     // Step 3: Delete employees with matching designation_code
//     if (castedCodes.length > 0) {
//       await pool.query(
//         `DELETE FROM "gim"."employee" WHERE designation_code = ANY($1::text[])`, // 👈 use text[] or int[] based on column type
//         [castedCodes]
//       );
//     }

//     // Step 4: Delete designations
//     await pool.query(
//       `DELETE FROM "gim"."designation" WHERE organization_id = $1`,
//       [orgId]
//     );

//     // Step 5: Delete the organization
//     await pool.query(
//       `DELETE FROM "gim"."organization" WHERE gu_id = $1`,
//       [gu_id]
//     );

//     res.json({
//       message: 'Organization and related data deleted successfully',
//       gu_id,
//       orgId
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// };



const pool = require("../db");
const { v4: uuidv4 } = require("uuid");

// Utility: get loggedUser roles
function getRoleConditions(user) {
  if (user.roles.includes(1)) { // super-admin
    return { orgId: 0, ministryId: 0 };
  } else if (user.roles.includes(2)) { // ministry-admin
    return { orgId: 0, ministryId: user.ministryId };
  } else if (user.roles.includes(3)) { // o-admin
    return { orgId: user.organizationId, ministryId: 0 };
  }
  return { orgId: 0, ministryId: 0 };
}

// ----------------------------- INDEX -----------------------------
exports.index = async (req, res) => {
  const user = req.user || { roles: [] };
  let dfConfig = [];

  if (!user.roles.includes(4)) { // ou-admin
    if (user.roles.includes(1)) { // super-admin
      dfConfig = [
        { field_alias: "organization_type", display_text: "Organization Type", operator_type: ["ILIKE", "="], input_type: "text" },
        { field_alias: "organization_code", display_text: "Organization Code", operator_type: ["ILIKE", "="], input_type: "text" },
        { field_alias: "organization_name", display_text: "Organization", operator_type: ["=", "ILIKE"], input_type: "codefinder", input_schema: "Organization" },
        { field_alias: "ministry", display_text: "Ministry", operator_type: ["=", "ILIKE"], input_type: "codefinder", input_schema: "Ministry" },
      ];
    } else {
      dfConfig = [
        { field_alias: "organization_type", display_text: "Organization Type", operator_type: ["ILIKE", "="], input_type: "text" },
        { field_alias: "organization_code", display_text: "Organization Code", operator_type: ["ILIKE", "="], input_type: "text" },
        { field_alias: "organization_name", display_text: "Organization", operator_type: ["=", "ILIKE"], input_type: "codefinder", input_schema: "Organization" },
      ];
    }
  }

  res.json({ dfConfig });
};

// ----------------------------- LIST -----------------------------
exports.list = async (req, res) => {
  try {
    const user = req.user || { roles: [] };

    const filters = req.body.custom_filter_param || req.query.custom_filter_param;
    const dynamicFilters = filters ? JSON.parse(Buffer.from(filters, "base64").toString("utf8")) : null;

    const query = await processQry(user, dynamicFilters);
    const { rows } = await pool.query(query.text, query.params);

    // pagination manual
    const page = parseInt(req.query.page || "1", 10);
    const pageSize = 2000000;
    const start = (page - 1) * pageSize;
    const paginated = rows.slice(start, start + pageSize);

    res.json({
      pagination: {
        total: rows.length,
        page,
        pageSize,
        data: paginated,
      },
    });
  } catch (err) {
    console.error("list error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ----------------------------- CREATE -----------------------------
exports.insert = async (req, res) => {
  try {
    const {
      organization_code,
      organization_type_id,
      o_name,
      vhost_id,
      is_o_visibility,
      is_public_visibility,
    } = req.body;

    const user = req.user || { roles: [] };

    let ministryId = user.roles.includes(1)
      ? req.body.ministryId
      : user.ministryId;

    // generate UUID
    const guId = uuidv4();

    const result = await pool.query(
      `INSERT INTO "gim"."organization" 
        (organization_code, organization_type_id, o_name, ministry_id, vhost_id, is_o_visibility, is_public_visibility, gu_id) 
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [
        organization_code,
        organization_type_id,
        o_name,
        ministryId,
        vhost_id,
        is_o_visibility,
        is_public_visibility,
        guId, // 👈 yahan correct variable pass karo
      ]
    );

    res.json({
      status: "success",
      message: "Saved Successfully",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("insert error:", err);
    res
      .status(500)
      .json({ status: "error", error: err.message });
  }
};


// ----------------------------- UPDATE -----------------------------

exports.update = async (req, res) => {
  const { gu_id } = req.params;
  const {
    organization_code,
    organization_type_id,
    o_name,
    is_o_visibility,
    is_public_visibility,
    vhost_id
  } = req.body;

  const user = req.user || { roles: [] };

  try {
    let ministryId;
    if (user.roles.includes(1)) {
      ministryId = req.body.ministryId;
    } else {
      ministryId = user.ministryId;
    }

    const result = await pool.query(
      `UPDATE gim.organization
       SET organization_code = $1,
           organization_type_id = $2,
           o_name = $3,
           is_o_visibility = $4,
           is_public_visibility = $5,
           vhost_id = $6,
           ministry_id = $7
       WHERE gu_id = $8
       RETURNING *`,
      [
        organization_code,
        organization_type_id,
        o_name,
        is_o_visibility,
        is_public_visibility,
        vhost_id,
        ministryId,
        gu_id
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        status: "error",
        message: "Organization not found"
      });
    }

    res.json({
      status: "success",
      message: "Organization updated successfully",
      data: result.rows[0]
    });
  } catch (err) {
    console.error("update error:", err);
    res.status(500).json({
      status: "error",
      message: err.message
    });
  }
};



// ----------------------------- DELETE -----------------------------
// DELETE /organization/:gu_id
exports.deleteConfirm = async (req, res) => {
  const { gu_id } = req.params;
  try {
    // Check if organization exists
    const orgRes = await pool.query(`SELECT * FROM "gim"."organization" WHERE gu_id=$1`, [gu_id]);
    if (orgRes.rowCount === 0) 
      return res.status(404).json({ status: "error", message: "Organization not found" });

    const org = orgRes.rows[0];

    // Check if any organization units are assigned
    const countRes = await pool.query(
      `SELECT COUNT(*) FROM "gim"."organization_unit" WHERE organization_id=$1`,
      [org.id]
    );

    if (parseInt(countRes.rows[0].count, 10) > 0) {
      return res.json({ status: "error", message: "Action unsuccessful, Organization Units are already assigned" });
    }

    // Delete the organization
    await pool.query(`DELETE FROM "gim"."organization" WHERE gu_id=$1`, [gu_id]);

    res.json({ status: "success", message: "Organization deleted successfully" });
  } catch (err) {
    console.error("delete error:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

// ----------------------------- GET OS BY MINISTRY -----------------------------
exports.getOsByMinistry = async (req, res) => {
  const { mVal } = req.body;
  try {
    const { rows } = await pool.query(`SELECT id, o_name FROM "gim"."organization" WHERE ministry_id=$1`, [mVal]);
    const result = {};
    rows.forEach(r => result[r.id] = r.o_name);
    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ----------------------------- GET DDD BY ORG -----------------------------
exports.getDDDByOrganization = async (req, res) => {
  const { oVal } = req.body;
  try {
    const ouRes = await pool.query(`SELECT id, ou_name FROM "gim"."organization_unit" WHERE organization_id=$1`, [oVal]);
    const dgRes = await pool.query(`SELECT id, designation_name FROM "gim"."designation" WHERE organization_id=$1`, [oVal]);
    const lvRes = await pool.query(`SELECT id, employee_level_name FROM "gim"."employee_level" WHERE organization_id=$1`, [oVal]);

    const ou = {}; ouRes.rows.forEach(r => ou[r.id] = r.ou_name);
    const dg = {}; dgRes.rows.forEach(r => dg[r.id] = r.designation_name);
    const lv = {}; lvRes.rows.forEach(r => lv[r.id] = r.employee_level_name);

    res.json({ ou, dg, lv });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ----------------------------- GET ORGS BY MINISTRY -----------------------------
exports.getOrganizations = async (req, res) => {
  const { ministryId } = req.body;
  const user = req.user || { roles: [] };
  try {
    let query = `SELECT id, o_name FROM "gim"."organization" WHERE ministry_id=$1`;
    let params = [ministryId];

    if (!user.roles.includes(1) && !user.roles.includes(2)) {
      query += ` AND id=$2`;
      params.push(user.organizationId);
    }

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ----------------------------- LIST OF ORGS -----------------------------
exports.listOfOrganizations = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT gu_id
      FROM gim.organization o
      INNER JOIN (
        SELECT org_id, SUM(reg_count)
        FROM report.registration_activity_org
        GROUP BY org_id HAVING SUM(reg_count) > 0
      ) r ON o.id=r.org_id
    `);
    const list = rows.map(r => r.gu_id).join("\n");
    res.send(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ----------------------------- EMAIL MSGS ORGWISE -----------------------------
exports.emailTotalMessagesOrganizationWise = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT mo.o_name AS organization, 
             COALESCE(etc.onboarded_count,0) AS onboarded_count,
             COALESCE(etc.registered_count,0) AS registered_count,
             COALESCE(d.group_count,0) AS group_count,
             COALESCE(d.active_users,0) AS active_users,
             COALESCE(d.total_messages,0) AS total_messages,
             COALESCE(td.today_messages,0) AS today_messages,
             td.update_time
      FROM gim.organization mo
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ----------------------------- PROCESS QRY (dynamic filters) -----------------------------
async function processQry(user, dynamicFilters = null) {
  const { orgId, ministryId } = getRoleConditions(user);

  let text = `
    SELECT o.id,o.gu_id,o.o_name,o.organization_code,o.vhost,
           ot.description as organizationType,
           mm.ministry_code as ministryCode
    FROM gim.organization o
    LEFT JOIN gim.organization_type ot ON o.organization_type_id=ot.code
    LEFT JOIN gim.masters_ministries mm ON o.ministry_id=mm.id
    WHERE ($1=0 OR o.ministry_id=$1)
  `;
  let params = [ministryId];

  if (user.roles.includes(3)) { // o-admin
    text += ` AND ($2=0 OR o.id=$2)`;
    params.push(orgId);
  }

  if (dynamicFilters) {
    let i = params.length + 1;
    for (const [k, v] of Object.entries(dynamicFilters)) {
      if (v.operator === "ILIKE") {
        text += ` AND ${k} ILIKE $${i}`;
        params.push(`%${v.fvalue.trim()}%`);
      } else {
        text += ` AND ${k} ${v.operator} $${i}`;
        params.push(v.fvalue.trim());
      }
      i++;
    }
  }

  text += ` ORDER BY o.id`;

  return { text, params };
}
