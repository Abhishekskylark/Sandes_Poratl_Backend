
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const authRoutes = require("./routes/auth");

const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", authRoutes);

// List of all route files
const routeFiles = [
  "active_user",
  "app_message_activity",
  "country",
  "designation",
  "employee",
  "employee_apps",
  "employee_group_admins",
  "employee_level",
  "employee_messages",
  "employee_migration_status",
  "employee_rejection",
  "file_detail",
  "group",
  "group_member",
  "list_publisher",
  "list_subscriber_users",
  "lists",
  "masters_districts",
  "masters_genders",
  "masters_ministries",
  "masters_ministry_categories",
  "masters_states",
  "message_activity_emp",
  "message_activity_emp_kind",
  "organization",
  "organization_type",
  "organization_unit",
  "portal_metadata",
  "portal_users",
  "registration_activity",
  "users",
  "captcha",
  "stats",
  "userGraph",
  "messageGraph",
  "registrationgraph",
  "activeUserGroup",
  "portal_import_employees_details",
  "audit_employee",
];

// Dynamically load all routes
routeFiles.forEach((route) => {
  app.use(`/${route}`, require(`./routes/${route}`));
});

// Health check route
app.get("/health", (req, res) => {
  res.json({ status: "OK", uptime: process.uptime() });
});

// Error handler (last middleware)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Start server
app.listen(port, () => {
  console.log(`✅ API server running at http://localhost:${port}`);
});
