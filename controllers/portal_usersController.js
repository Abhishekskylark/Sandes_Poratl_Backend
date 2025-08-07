// const pool = require('../db');

// exports.getAll = async (req, res) => {
//   try {
//     const result = await pool.query('SELECT * FROM "gim"."portal_users"LIMIT 10000');
//     res.json(result.rows);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// exports.create = async (req, res) => {
//   try {
//     // customize based on schema if needed
//     const result = await pool.query('INSERT INTO "gim"."portal_users" DEFAULT VALUES RETURNING *');
//     res.status(201).json(result.rows[0]);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };




const pool = require('../db');

// GET all
// exports.getAll = async (req, res) => {
//   try {
//     const result = await pool.query('SELECT * FROM "gim"."portal_users" LIMIT 50000');
//     res.json(result.rows);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

exports.getAll = async (req, res) => {
  const { gu_id } = req.query;

  try {
    if (gu_id) {
      // Mobile number ke basis par data fetch karo
      const result = await pool.query(
        'SELECT * FROM gim."portal_users" WHERE gu_id = $1',
        [gu_id]
      );
      res.json(result.rows);
    } else {
      // Agar mobile_no nahi diya gaya, to default 40,000 records
      const result = await pool.query('SELECT * FROM gim."portal_users"');
      res.json(result.rows);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// CREATE
exports.create = async (req, res) => {
  try {
    // Example: You should customize column names and values as per actual schema
    const { username, email, role } = req.body;

    const result = await pool.query(
      `INSERT INTO "gim"."portal_users" (username, email, role)
       VALUES ($1, $2, $3) RETURNING *`,
      [username, email, role]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE
exports.update = async (req, res) => {
  const { id } = req.params;
  const { username, email, role } = req.body;

  try {
    const result = await pool.query(
      `UPDATE "gim"."portal_users"
       SET username = $1, email = $2, role = $3
       WHERE id = $4 RETURNING *`,
      [username, email, role, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
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
      `DELETE FROM "gim"."portal_users" WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
