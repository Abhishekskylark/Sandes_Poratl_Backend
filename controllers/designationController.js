// // const pool = require('../db');

// // exports.getAll = async (req, res) => {
// //   try {
// //     const result = await pool.query('SELECT * FROM "gim"."designation"');
// //     res.json(result.rows);
// //   } catch (err) {
// //     res.status(500).json({ error: err.message });
// //   }
// // };

// // exports.create = async (req, res) => {
// //   try {
// //     // customize based on schema if needed
// //     const result = await pool.query('INSERT INTO "gim"."designation" DEFAULT VALUES RETURNING *');
// //     res.status(201).json(result.rows[0]);
// //   } catch (err) {
// //     res.status(500).json({ error: err.message });
// //   }
// // };



// const pool = require('../db');

// // GET all
// exports.getAll = async (req, res) => {
//   try {
//     const result = await pool.query('SELECT * FROM "gim"."designation"');
//     res.json(result.rows);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // CREATE
// exports.create = async (req, res) => {
//   try {
//     const { title, code } = req.body; // adjust fields according to your schema
//     const result = await pool.query(
//       `INSERT INTO "gim"."designation" (title, code)
//        VALUES ($1, $2) RETURNING *`,
//       [title, code]
//     );
//     res.status(201).json(result.rows[0]);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // UPDATE
// exports.update = async (req, res) => {
//   const { id } = req.params;
//   const { title, code } = req.body;

//   try {
//     const result = await pool.query(
//       `UPDATE "gim"."designation"
//        SET title = $1, code = $2
//        WHERE id = $3 RETURNING *`,
//       [title, code, id]
//     );

//     if (result.rowCount === 0) {
//       return res.status(404).json({ error: 'Designation not found' });
//     }

//     res.json(result.rows[0]);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // DELETE
// exports.remove = async (req, res) => {
//   const { id } = req.params;

//   try {
//     const result = await pool.query(
//       `DELETE FROM "gim"."designation" WHERE id = $1 RETURNING *`,
//       [id]
//     );

//     if (result.rowCount === 0) {
//       return res.status(404).json({ error: 'Designation not found' });
//     }

//     res.json({ message: 'Designation deleted successfully' });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };














const pool = require('../db');
const { v4: uuidv4 } = require('uuid');

// GET /portal/dsg - render config (like index in Symfony)
exports.getConfig = async (req, res) => {
  try {
    const loggedUser = req.user; // assume middleware sets req.user with roles
    let dfConfig;

    if (loggedUser.roles.includes('ROLE_SUPER_ADMIN') || loggedUser.roles.includes('ROLE_MINISTRY_ADMIN')) {
      dfConfig = [
        { field_alias: "designation_name", display_text: "Designation", operator_type: ['ILIKE', '='], input_type: "text", input_schema: '' },
        { field_alias: "organization_name", display_text: "Organization", operator_type: ['=', 'ILIKE'], input_type: "codefinder", input_schema: 'Organization' }
      ];
    } else {
      dfConfig = [
        { field_alias: "designation_name", display_text: "Designation", operator_type: ['ILIKE', '='], input_type: "text", input_schema: '' }
      ];
    }

    res.json({ dfConfig });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /portal/dsg/list - list with filters
exports.list = async (req, res) => {
  try {
    let filters = req.body.custom_filter_param || req.query.custom_filter_param || null;
    let dynamicFilters = filters ? JSON.parse(Buffer.from(filters, 'base64').toString('utf8')) : null;

    let query = `
      SELECT 
        d.designation_name, 
        d.designation_code, 
        d.gu_id AS designation_gu_id,
        o.o_name AS organization_name, 
        m.ministry_name
      FROM gim.designation d
      LEFT JOIN gim.organization o ON o.id = d.organization_id
      LEFT JOIN gim.masters_ministries m ON o.ministry_id = m.id
      WHERE 1=1
    `;

    let params = [];
    let i = 1;

    if (dynamicFilters) {
      for (const key in dynamicFilters) {
        const filter = dynamicFilters[key];
        if (filter.operator === 'ILIKE') {
          query += ` AND ${key} ILIKE $${i}`;
          params.push(`%${filter.fvalue.trim()}%`);
        } else {
          query += ` AND ${key} ${filter.operator} $${i}`;
          params.push(filter.fvalue.trim());
        }
        i++;
      }
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { designation_name, organization_id } = req.body;
    const newGuId = uuidv4();

    const result = await pool.query(
      `INSERT INTO gim.designation (gu_id, designation_code, designation_name, organization_id)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [newGuId, newGuId, designation_name, organization_id || null]
    );

    res.status(201).json({ status: 'success', message: 'Saved Successfully', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// PUT /portal/dsg/:gu_id - update designation
exports.update = async (req, res) => {
  try {
    const { gu_id } = req.params;
    const { designation_name, organization_id } = req.body;

    const result = await pool.query(
      `UPDATE gim.designation
       SET designation_name = $1, organization_id = $2
       WHERE gu_id = $3 RETURNING *`,
      [designation_name, organization_id || null, gu_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ status: 'error', message: 'Designation not found' });
    }

    res.json({ status: 'success', message: 'Updation successful', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// DELETE /portal/dsg/:gu_id - delete designation
exports.remove = async (req, res) => {
  try {
    const { gu_id } = req.params;

    // Check if any employees are assigned
    const check = await pool.query(
      `SELECT COUNT(*) FROM gim.employee WHERE designation_id = (SELECT id FROM gim.designation WHERE gu_id = $1)`,
      [gu_id]
    );

    if (parseInt(check.rows[0].count) > 0) {
      return res.status(400).json({ status: 'error', message: 'Members are already assigned to this designation' });
    }

    const result = await pool.query(
      `DELETE FROM gim.designation WHERE gu_id = $1 RETURNING *`,
      [gu_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ status: 'error', message: 'Designation not found' });
    }

    res.json({ status: 'success', message: 'Action successful' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};