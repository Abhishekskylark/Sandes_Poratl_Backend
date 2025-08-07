// seedCaptcha.js
const pool = require('../db');

const operations = ['+', '-', '*', '/'];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateCaptcha() {
  const a = getRandomInt(1, 50);
  const b = getRandomInt(1, 50);
  const op = operations[Math.floor(Math.random() * operations.length)];

  let question = `${a} ${op} ${b}`;
  let answer;

  switch (op) {
    case '+':
      answer = a + b;
      break;
    case '-':
      answer = a - b;
      break;
    case '*':
      answer = a * b;
      break;
    case '/':
      // Ensure divisible — no decimal answer
      if (a % b !== 0) {
        return generateCaptcha(); // Retry
      }
      answer = a / b;
      break;
  }

  return { question, answer };
}

async function seedCaptcha() {
  try {
    await pool.query('CREATE TABLE IF NOT EXISTS captchas (id SERIAL PRIMARY KEY, question TEXT NOT NULL, answer INTEGER NOT NULL)');

    await pool.query('DELETE FROM captchas');

    const insertPromises = [];

    for (let i = 0; i < 100; i++) {
      const { question, answer } = generateCaptcha();
      insertPromises.push(pool.query('INSERT INTO captchas (question, answer) VALUES ($1, $2)', [question, answer]));
    }

    await Promise.all(insertPromises);
    console.log('✅ 100 integer-only captchas inserted');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedCaptcha();
