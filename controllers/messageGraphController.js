const fs = require('fs');
const pool = require('../db');
const JSON_PATH = './message.json';

const fetchAndSaveMessage_Garph = async () => {
  const client = await pool.connect();

  try {
   
    // const msg = await client.query('SELECT * FROM report.message_activity LIMIT 50000');
    // const msgApp = await client.query('SELECT * FROM report.message_activity_app LIMIT 50000');
    const msgEmp = await client.query('SELECT * FROM report.message_activity_emp LIMIT 50000');
    // const msgOrg = await client.query('SELECT * FROM report.message_activity_org LIMIT 50000');
    // const msgOu = await client.query('SELECT * FROM report.message_activity_ou LIMIT 50000');

    const result = {
     
      message_data: {
        // message: msg.rows,
        // app: msgApp.rows,
        emp: msgEmp.rows,
        // org: msgOrg.rows,
        // ou: msgOu.rows,
      }
    };

    fs.writeFileSync(JSON_PATH, JSON.stringify(result, null, 2));
    console.log('✅ data.json updated with full data');

  } catch (err) {
    console.error('❌ Error in fetchAndSaveMessage_Garph:', err);
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
  fetchAndSaveMessage_Garph,
  getStats
};
