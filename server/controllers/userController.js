const { executeSql } = require('../utils/mysql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 8);

  try {
    const results = await executeSql('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
    res.status(201).send({ user_id: results.insertId, username });
  } catch (err) {
    res.status(500).send({ message: '注册失败', error: err.message });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const results = await executeSql('SELECT * FROM users WHERE username = ?', [username]);
    if (results.length === 0) return res.status(404).send('User not found');

    const user = results[0];
    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) return res.status(401).send('Invalid password');

    // 登录成功，生成 JWT
    const token = jwt.sign({ id: user.user_id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.status(200).send({ token, user_id: user.user_id, username: user.username });
  } catch (err) {
    res.status(500).send({ message: '登录失败', error: err.message });
  }
};
