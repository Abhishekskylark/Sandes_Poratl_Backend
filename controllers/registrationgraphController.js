// const fs = require('fs');
// const pool = require('../db');
// const JSON_PATH = './registration.json';

// const fetchAndSaveRegistration_Garph = async () => {
//   const client = await pool.connect();

//   try {
//     // const employee = await client.query('SELECT * FROM audit.employee LIMIT 50000');
//     const regMinistry = await client.query('SELECT * FROM report.registration_activity_ministry LIMIT 50000');
//     const regOrg = await client.query('SELECT * FROM report.registration_activity_org LIMIT 50000');
//     const regOu = await client.query('SELECT * FROM report.registration_activity_ou LIMIT 50000');


//     const result = {
//       registration_data: {
//         // employee: employee.rows,
//         ministry: regMinistry.rows,
//         org: regOrg.rows,
//         ou: regOu.rows,
//       },

//     };

//     fs.writeFileSync(JSON_PATH, JSON.stringify(result, null, 2));
//     console.log('✅ data.json updated with full data');

//   } catch (err) {
//     console.error('❌ Error in fetchAndSaveStats_Garph:', err);
//   } finally {
//     client.release();
//   }
// };

// const getStats = (req, res) => {
//   fs.readFile(JSON_PATH, 'utf8', (err, data) => {
//     if (err) {
//       return res.status(500).json({ error: 'Unable to read data file' });
//     }
//     res.setHeader('Content-Type', 'application/json');
//     res.send(data);
//   });
// };

// module.exports = {
//   fetchAndSaveRegistration_Garph,
//   getStats
// };


const fs = require('fs');
const pool = require('../db');
const JSON_PATH = './registration.json';

const fetchAndSaveRegistration_Garph = async () => {
  const client = await pool.connect();

  try {
    const regMinistry = await client.query('SELECT * FROM report.registration_activity_ministry LIMIT 50000');
    const regOrg = await client.query('SELECT * FROM report.registration_activity_org LIMIT 50000');
    const regOu = await client.query('SELECT * FROM report.registration_activity_ou LIMIT 50000');

    // Teeno ka data ek array me merge kar diya
    const mergedData = [
      ...regMinistry.rows,
      ...regOrg.rows,
      ...regOu.rows
    ];

    const result = {
      registration_data: mergedData
    };

    fs.writeFileSync(JSON_PATH, JSON.stringify(result, null, 2));
    console.log('✅ registration.json updated with merged data');

  } catch (err) {
    console.error('❌ Error in fetchAndSaveRegistration_Garph:', err);
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
  fetchAndSaveRegistration_Garph,
  getStats
};

