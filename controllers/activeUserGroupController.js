const fs = require('fs');
const pool = require('../db');
const JSON_PATH = './activeUser.json';

const fetchAndSaveActiveUser_Garph = async () => {
  const client = await pool.connect();

  try {
    const users = await client.query('SELECT * FROM report.active_user_log LIMIT 50000');

    const result = {
      users: users.rows,
    };

    fs.writeFileSync(JSON_PATH, JSON.stringify(result, null, 2));
    console.log('✅ data.json updated with full data');

  } catch (err) {
    console.error('❌ Error in fetchAndSaveActiveUser_Garph:', err);
  } finally {
    client.release();
  }
};

const getStats = (req, res) => {
  fs.readFile(JSON_PATH, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to read data file' });
    }
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  });
};

module.exports = {
  fetchAndSaveActiveUser_Garph,
  getStats
};
