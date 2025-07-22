
const pool = require('../db');

// exports.getByCode = async (req, res) => {
//     try {
//         const { code } = req.params;

//         const result = await pool.query(
//             'SELECT * FROM "gim"."organization_type" WHERE code = $1',
//             [code]
//         );

//         if (result.rows.length === 0) {
//             return res.status(404).json({ message: 'No record found for this code' });
//         }

//         res.json(result.rows[0]); // ek hi record milega
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };



exports.getOrganizationTypes = async (req, res) => {
    try {
        const { code } = req.params;

        if (code) {
            // agar code diya gaya ho
            const result = await pool.query(
                'SELECT * FROM "gim"."organization_type" WHERE code = $1',
                [code]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'No record found for this code' });
            }

            return res.json(result.rows[0]);
        } else {
            // agar code nahi diya gaya ho
            const result = await pool.query(
                'SELECT * FROM "gim"."organization_type" ORDER BY code'
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
        const result = await pool.query('INSERT INTO "gim"."organization_type" DEFAULT VALUES RETURNING *');
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
