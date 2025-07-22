const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); 

const app = express();
const port = 8000;

app.use(cors());

app.use(bodyParser.json());

const routeFiles = [
  'country',
  'masters_states',
  'masters_districts',
  'organization',
  'employee_level',
  'portal_users',
  'employee',
  'employee_group_admins',
  'employee_rejection',
  'group_member',
  'employee_messages',
  'group',
  'portal_metadata',
  'organization_unit',
  'designation',
  'file_detail',
  'masters_genders',
  'employee_apps',
  'employee_migration_status',
  'list_publisher',
  'list_subscriber_users',
  'lists',
  'message_activity_emp',
  'message_activity_emp_kind',
  'masters_ministry_categories',
  'masters_ministries',
  'organization_type',
  'users',
  'active_user',
  'app_message_activity',
  'registration_activity'
];

routeFiles.forEach(route => {
  app.use(`/${route}`, require(`./routes/${route}`));
});

app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`);
});
