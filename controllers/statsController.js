const fs = require('fs');
const pool = require('../db');
const JSON_PATH = './counts.json';

const fetchAndSaveStats = async () => {
  const client = await pool.connect();

  try {
    const userCount = await client.query('SELECT COUNT(*) FROM public.users');
    const orgUnitCount = await client.query('SELECT COUNT(*) FROM gim.organization_unit');

    const registrationCount = await client.query(`
      SELECT
        (SELECT COUNT(*) FROM audit.employee) +
        (SELECT COUNT(*) FROM report.registration_activity_ministry) +
        (SELECT COUNT(*) FROM report.registration_activity_org) +
        (SELECT COUNT(*) FROM report.registration_activity_ou) AS total
    `);

    const messageCount = await client.query(`
      SELECT
        (SELECT COUNT(*) FROM report.message_activity) +
        (SELECT COUNT(*) FROM report.message_activity_app) +
        (SELECT COUNT(*) FROM report.message_activity_emp) +
        (SELECT COUNT(*) FROM report.message_activity_org) +
        (SELECT COUNT(*) FROM report.message_activity_ou) AS total
    `);

    const stats = {
      user_count: parseInt(userCount.rows[0].count),
      organization_unit_count: parseInt(orgUnitCount.rows[0].count),
      registration_related_count: parseInt(registrationCount.rows[0].total),
      message_related_count: parseInt(messageCount.rows[0].total),
    };

    fs.writeFileSync(JSON_PATH, JSON.stringify(stats, null, 2));
    console.log('✅ counts.json updated');

  } catch (err) {
    console.error('❌ Error in fetchAndSaveStats:', err);
  } finally {
    client.release();
  }
};

const getStats = (req, res) => {
  fs.readFile(JSON_PATH, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to read stats file' });
    }
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  });
};

module.exports = {
  fetchAndSaveStats,
  getStats
};
