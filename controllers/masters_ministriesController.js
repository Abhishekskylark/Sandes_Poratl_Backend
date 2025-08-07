
const pool = require('../db');

exports.getAll = async (req, res) => {
    try {
        const id = req.params.id;

        if (id) {
            // agar id diya gaya ho
            const result = await pool.query(
                'SELECT * FROM "gim"."masters_ministries" WHERE id = $1',
                [id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'No record found for this id' });
            }

            return res.json(result.rows[0]);
        } else {
            // agar id nahi diya gaya ho
            const result = await pool.query(
                'SELECT * FROM "gim"."masters_ministries" ORDER BY id'
            );
            return res.json(result.rows);
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


exports.create = async (req, res) => {
    try {
        // customize based on schema if needed
        const result = await pool.query('INSERT INTO "gim"."masters_ministries" DEFAULT VALUES RETURNING *');
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
