const { executeSql } = require('../mysql');

exports.createVote = async (req, res) => {
  const { user_id, vote_title, vote_description, start_time, end_time, status, min_votes, max_votes } = req.body;

  try {
    const results = await executeSql(
      'INSERT INTO votes (user_id, vote_title, vote_description, start_time, end_time, status, min_votes, max_votes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [user_id, vote_title, vote_description, start_time, end_time, status, min_votes, max_votes]
    );
    res.status(201).send({ vote_id: results.insertId });
  } catch (err) {
    res.status(500).send(err);
  }
};

exports.getAllVotes = async (req, res) => {
  try {
    const results = await executeSql('SELECT * FROM votes');
    res.status(200).send(results);
  } catch (err) {
    res.status(500).send(err);
  }
};

exports.getVoteById = async (req, res) => {
  const { vote_id } = req.params;

  try {
    const results = await executeSql('SELECT * FROM votes WHERE vote_id = ?', [vote_id]);
    if (results.length === 0) return res.status(404).send('Vote not found');
    res.status(200).send(results[0]);
  } catch (err) {
    res.status(500).send(err);
  }
};

exports.updateVote = async (req, res) => {
  const { vote_id } = req.params;
  const { vote_title, vote_description, start_time, end_time, status, min_votes, max_votes } = req.body;

  try {
    await executeSql(
      'UPDATE votes SET vote_title = ?, vote_description = ?, start_time = ?, end_time = ?, status = ?, min_votes = ?, max_votes = ? WHERE vote_id = ?',
      [vote_title, vote_description, start_time, end_time, status, min_votes, max_votes, vote_id]
    );
    res.status(200).send('Vote updated');
  } catch (err) {
    res.status(500).send(err);
  }
};

exports.deleteVote = async (req, res) => {
  const { vote_id } = req.params;

  try {
    await executeSql('DELETE FROM votes WHERE vote_id = ?', [vote_id]);
    res.status(200).send('Vote deleted');
  } catch (err) {
    res.status(500).send(err);
  }
};
