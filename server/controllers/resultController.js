const { executeSql } = require('../mysql');
const redisClient = require('../redis');

exports.submitVote = async (req, res) => {
  const { user_id, vote_id, vote_time, options } = req.body;

  try {
    const results = await executeSql(
      'INSERT INTO results (user_id, vote_id, vote_time) VALUES (?, ?, ?)',
      [user_id, vote_id, vote_time]
    );
    const result_id = results.insertId;

    for (const option of options) {
      await executeSql(
        'INSERT INTO result_details (result_id, option_id) VALUES (?, ?)',
        [result_id, option.option_id]
      );

      // Increment the vote count in Redis
      redisClient.hincrby(`vote:${vote_id}`, `option:${option.option_id}`, 1);
    }

    res.status(201).send({ result_id });
  } catch (err) {
    res.status(500).send(err);
  }
};

exports.getResultsByVoteId = async (req, res) => {
  const { vote_id } = req.params;

  try {
    redisClient.hgetall(`vote:${vote_id}`, (err, results) => {
      if (err) return res.status(500).send(err);
      res.status(200).send(results);
    });
  } catch (err) {
    res.status(500).send(err);
  }
};
