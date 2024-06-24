const { executeSql } = require('../utils/mysql');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 8);
    console.log("register")

      try {
        const results = await executeSql('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
        res.status(201).send({ user_id: results.insertId, username });
      } catch (err) {
        res.status(500).send(err);
      }
};

exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        console.log("login...")
        const results = await executeSql('SELECT * FROM users WHERE username = ?', [username]);
        if (results.length === 0) return res.status(404).send('User not found');

        const user = results[0];
        const passwordIsValid = bcrypt.compareSync(password, user.password);
        if (!passwordIsValid) return res.status(401).send('Invalid password');

        res.status(200).send({ user_id: user.user_id, username: user.username });
    } catch (err) {
        res.status(500).send(err);
    }
};
