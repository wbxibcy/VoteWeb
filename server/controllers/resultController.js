const { v4: uuidv4 } = require('uuid');
const redisClient = require('../utils/redis');
redisClient.connect();

exports.submitVote = async (req, res) => {
  const { user_id, vote_id, options } = req.body;

  try {
    const vote_time = new Date().toISOString();
    const result_id = uuidv4();
    redisClient.hSet(`vote:${vote_id}:results`, result_id, JSON.stringify({ user_id, vote_time, options }));

    for (const option of options) {
      console.log(option);
      redisClient.hIncrBy(`vote:${vote_id}`, `option:${option.option_id}`, 1);
    }

    res.status(201).send({ result_id });
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};

exports.getResultsByVoteId = async (req, res) => {
  const { vote_id } = req.params;

  try {
    const voteResults = await redisClient.hGetAll(`vote:${vote_id}`);

    const formattedResults = Object.entries(voteResults).map(([option, count]) => ({
      option_id: option.replace('option:', ''),
      count: parseInt(count)
    }));

    // 输出格式化后的结果
    console.log(formattedResults);
    res.status(200).send(formattedResults);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};
