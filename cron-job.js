const cron = require('node-cron');
const { fetchAndSaveUser_Garph } = require('./controllers/userGraphController');
const { fetchAndSaveRegistration_Garph } = require('./controllers/registrationgraphController');
const { fetchAndSaveMessage_Garph } = require('./controllers/messageGraphController');
const { fetchAndSaveActiveUser_Garph } = require('./controllers/activeUserGroupController');

// Run daily at 2:19 PM
cron.schedule('21 17 * * *', () => {
  console.log('⏰ Running cron job for stats update at 2:19 PM...');
  fetchAndSaveUser_Garph();
  fetchAndSaveRegistration_Garph();
  fetchAndSaveMessage_Garph();
  fetchAndSaveActiveUser_Garph();
});

// Optional: also run once immediately when starting the script
fetchAndSaveUser_Garph();
fetchAndSaveRegistration_Garph();
fetchAndSaveMessage_Garph();
fetchAndSaveActiveUser_Garph();
