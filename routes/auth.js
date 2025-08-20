

// routes/auth.js
const express = require("express");
const router = express.Router();
const pool = require("../db");

// 🔐 LOGIN API
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // 👉 Dummy password check (replace later with bcrypt)
    if (password !== "12345") {
      return res.status(400).json({ message: "Invalid password" });
    }

    // ✅ Fetch user from DB
    const result = await pool.query(
      `SELECT 
        id, username, email, roles, mobile_number, full_name
       FROM gim.portal_users 
       WHERE username = $1`,
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    let user = result.rows[0];

    // 🔑 Keycloak token
    const tokenRes = await fetch(
      "http://localhost:8080/realms/sandes_new/protocol/openid-connect/token",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: "sandes_new",
          client_secret: "P34vdWuXfQU8xzXTtwThhtRcimXY2n1N",
        }),
      }
    );

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) {
      return res.status(500).json({ message: "Failed to get Keycloak token" });
    }

    return res.json({
      user,
      token: tokenData.access_token,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
