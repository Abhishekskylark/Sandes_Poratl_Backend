// const pool = require('../db');

// exports.getAll = async (req, res) => {
//   try {
//     const { state_code } = req.params;

//     let result;
//     if (state_code) {
//       result = await pool.query(
//         'SELECT * FROM "gim"."masters_districts" WHERE state_code = $1',
//         [state_code]
//       );
//     } else {
//       result = await pool.query('SELECT * FROM "gim"."masters_districts"');
//     }

//     res.json(result.rows);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


// exports.create = async (req, res) => {
//   try {
//     // customize based on schema if needed
//     const result = await pool.query('INSERT INTO "gim"."masters_districts" DEFAULT VALUES RETURNING *');
//     res.status(201).json(result.rows[0]);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };



const pool = require('../db');

exports.getAll = async (req, res) => {
  try {
    const { state_id } = req.query; // <-- Use query parameter

    let result;
    if (state_id) {
      result = await pool.query(
        'SELECT * FROM "gim"."masters_districts" WHERE state_id = $1',
        [state_id]
      );
    } else {
      result = await pool.query('SELECT * FROM "gim"."masters_districts"');
    }

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    // Customize this based on your actual table schema if needed
    const result = await pool.query(
      'INSERT INTO "gim"."masters_districts" DEFAULT VALUES RETURNING *'
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
