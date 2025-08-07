// controllers/captchaController.js
const pool = require('../db');

// GET /captcha
exports.getRandomCaptcha = async (req, res) => {
  try {
    const countResult = await pool.query('SELECT COUNT(*) FROM captchas');
    const count = parseInt(countResult.rows[0].count);
    const randomOffset = Math.floor(Math.random() * count);

    const result = await pool.query('SELECT id, question FROM captchas OFFSET $1 LIMIT 1', [randomOffset]);

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /captcha/verify
exports.verifyCaptcha = async (req, res) => {
  const { id, userAnswer } = req.body;

  if (!id || userAnswer === undefined) {
    return res.status(400).json({ success: false, message: 'Missing ID or answer' });
  }

  try {
    const result = await pool.query('SELECT answer FROM captchas WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Captcha not found' });
    }

    const correct = parseFloat(result.rows[0].answer) === parseFloat(userAnswer);
    res.json({ success: correct });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
