const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 8000;

app.use(cors());

app.use(bodyParser.json());

const routeFiles = [
  'active_user',
  'app_message_activity',
  'country',
  'designation',
  'employee',
  'employee_apps',
  'employee_group_admins',
  'employee_level',
  'employee_messages',
  'employee_migration_status',
  'employee_rejection',
  'file_detail',
  'group',
  'group_member',
  'list_publisher',
  'list_subscriber_users',
  'lists',
  'masters_districts',
  'masters_genders',
  'masters_ministries',
  'masters_ministry_categories',
  'masters_states',
  'message_activity_emp',
  'message_activity_emp_kind',
  'organization',
  'organization_type',
  'organization_unit',
  'portal_metadata',
  'portal_users',
  'registration_activity',
  'users',

];

routeFiles.forEach(route => {
  app.use(`/${route}`, require(`./routes/${route}`));
});

app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`);
});
